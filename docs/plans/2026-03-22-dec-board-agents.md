# DEC Board Agents — Living Office Integration Plan

> **For Claude Code:** Implement this plan task-by-task on branch `dec/mission-control-integration` in `/home/dozza/openclaw-office`. Commit after every task.

**Goal:** Add 8 DEC Board agents (Chairman, Business Ops, Health, Mental Health, Relationships, Trainer, Admin/Legal, Improvement Suggestion) as permanent lounge residents. When Chairman is queried, ALL 8 walk to the Meeting zone together. Any other single agent is queried, that agent + Chairman walk to Meeting zone. All return to Lounge on completion.

**Architecture:**
- Board agents are registered as static `VisualAgent` entries in `office-store` with zone `lounge`
- A new `BOARD_AGENT_IDS` constant defines the 8 agent IDs
- A new `BOARD_LOUNGE_POSITIONS` constant adds 8 extra sofa seat positions to the Lounge zone
- New WS event types `board_query_start` and `board_query_end` trigger meeting gather/return
- The existing `meeting-manager` + movement system handles the actual walking

**Tech Stack:** TypeScript, React, Zustand/Immer, existing movement-animator, office-store

**Repo:** `/home/dozza/openclaw-office`
**Branch:** `dec/mission-control-integration`

---

## Task 1: Add Board Agent Constants

**Objective:** Define the 8 board agent IDs and their display names in one place.

**Files:**
- Modify: `src/components/living-office/characters/constants.ts`

**Step 1: Add constants at the bottom of the file**

```typescript
// --- DEC Board Agents ---

export const BOARD_AGENT_IDS = [
  "board-chairman",
  "board-biz-ops",
  "board-health",
  "board-mental",
  "board-relations",
  "board-trainer",
  "board-admin",
  "board-improvement",
] as const;

export type BoardAgentId = typeof BOARD_AGENT_IDS[number];

export const BOARD_AGENT_NAMES: Record<BoardAgentId, string> = {
  "board-chairman":    "Chairman",
  "board-biz-ops":    "Business Ops",
  "board-health":     "Health",
  "board-mental":     "Mental Health",
  "board-relations":  "Relationships",
  "board-trainer":    "Trainer",
  "board-admin":      "Admin/Legal",
  "board-improvement":"Improvement",
};

export const isBoardAgent = (id: string): id is BoardAgentId =>
  (BOARD_AGENT_IDS as readonly string[]).includes(id);
```

**Step 2: Add 8 extra lounge sofa positions to `LOUNGE_SOFA_POSITIONS`**

The current array has 11 positions. Append 8 more in a third row at top=890:

```typescript
// append to LOUNGE_SOFA_POSITIONS array (after existing entries):
  { left: 120, top: 890 },
  { left: 290, top: 890 },
  { left: 460, top: 890 },
  { left: 630, top: 890 },
  { left: 800, top: 890 },
  { left: 970, top: 890 },
  { left: 1140, top: 890 },
  { left: 1310, top: 890 },
```

Also extend `POSITION_MAP` with named lounge seats for board agents:

```typescript
// append to POSITION_MAP:
  "board-lounge-0": { left: 156, top: 890 },
  "board-lounge-1": { left: 326, top: 890 },
  "board-lounge-2": { left: 496, top: 890 },
  "board-lounge-3": { left: 666, top: 890 },
  "board-lounge-4": { left: 836, top: 890 },
  "board-lounge-5": { left: 1006, top: 890 },
  "board-lounge-6": { left: 1176, top: 890 },
  "board-lounge-7": { left: 1346, top: 890 },
```

**Step 3: Extend lounge zone height in `config.ts` to accommodate the third row**

File: `src/components/living-office/config.ts`

```typescript
// Change lounge zone height from 230 to 280
lounge: {
  id: "lounge-zone",
  label: "Lounge",
  position: { left: 30, top: 660 },
  size: { width: 1400, height: 280 },  // was 230
},
```

**Step 4: Commit**

```bash
cd /home/dozza/openclaw-office
git add src/components/living-office/characters/constants.ts src/components/living-office/config.ts
git commit -m "feat(dec): add board agent constants and expand lounge zone"
```

---

## Task 2: Seed Board Agents as Static VisualAgents

**Objective:** Register the 8 board agents as permanent idle agents in the office store on initialisation.

**Files:**
- Modify: `src/store/office-store.ts`

**Step 1: Find the store initialisation / `initAgents` or `resetAgents` logic**

Look for where `VisualAgent` entries are seeded (search for `VisualAgent` or `agents:` in the store). Board agents are static — they don't come from the WS gateway, they're always present.

**Step 2: Add `seedBoardAgents` helper near the top of the store file**

```typescript
import { BOARD_AGENT_IDS, BOARD_AGENT_NAMES, BoardAgentId } from "@/components/living-office/characters/constants";

function makeBoardAgent(id: BoardAgentId, seatIndex: number): VisualAgent {
  return {
    id,
    name: BOARD_AGENT_NAMES[id],
    role: "board",
    status: "idle",
    zone: "lounge",
    position: POSITION_MAP[`board-lounge-${seatIndex}`] ?? { left: 730, top: 890 },
    homePosition: POSITION_MAP[`board-lounge-${seatIndex}`] ?? { left: 730, top: 890 },
    isStatic: true,   // won't be removed by gateway cleanup
    model: "claude-sonnet-4-5",
  };
}

export const INITIAL_BOARD_AGENTS: VisualAgent[] = BOARD_AGENT_IDS.map((id, i) =>
  makeBoardAgent(id, i)
);
```

**Step 3: In the store's initial state or `init` action, merge board agents**

Find where the store initialises `agents` (likely `agents: new Map()` or similar). After the map is created, seed the board agents:

```typescript
// In the initial state or init action:
for (const agent of INITIAL_BOARD_AGENTS) {
  state.agents.set(agent.id, agent);
}
```

**Step 4: Prevent board agents from being removed by normal agent cleanup logic**

Find any `removeAgent` or agent expiry logic and add a guard:

```typescript
// Before removing an agent, check:
if (isBoardAgent(agentId)) return; // board agents are permanent
```

**Step 5: Commit**

```bash
git add src/store/office-store.ts
git commit -m "feat(dec): seed board agents as permanent lounge residents"
```

---

## Task 3: Board Meeting Walk Event Handling

**Objective:** Handle `board_query_start` and `board_query_end` WS events to move agents to/from Meeting zone.

**Files:**
- Modify: `src/gateway/event-parser.ts` (or wherever WS events are dispatched to the store)
- Modify: `src/store/office-store.ts`

**Step 1: Add the new event types to `src/gateway/types.ts`**

```typescript
// Add to GatewayEventFrame variants or a union type:
export interface BoardQueryStartEvent {
  type: "board_query_start";
  agent_id: string;   // the specific agent queried (or "board-chairman" for all)
}

export interface BoardQueryEndEvent {
  type: "board_query_end";
  agent_id: string;
}
```

**Step 2: Handle in the office store — add `boardQueryStart` action**

Logic:
- If `agent_id === "board-chairman"` → move ALL 8 board agents to meeting zone seats
- Otherwise → move queried agent + chairman to meeting zone

Meeting zone target positions (spread agents around the meeting table in the Project zone area — use the existing meeting zone center coordinates):

```typescript
const BOARD_MEETING_SEATS: Position2D[] = [
  { left: 1100, top: 370 },
  { left: 1160, top: 340 },
  { left: 1240, top: 330 },
  { left: 1320, top: 340 },
  { left: 1380, top: 370 },
  { left: 1380, top: 430 },
  { left: 1320, top: 460 },
  { left: 1160, top: 460 },
];
```

Action:

```typescript
boardQueryStart: (agentId: string) => {
  set((state) => {
    const toMove = agentId === "board-chairman"
      ? [...BOARD_AGENT_IDS]
      : ["board-chairman", agentId as BoardAgentId];

    toMove.forEach((id, i) => {
      const agent = state.agents.get(id);
      if (!agent) return;
      const target = BOARD_MEETING_SEATS[i] ?? BOARD_MEETING_SEATS[0];
      agent.zone = "project";
      agent.status = "thinking";
      agent.position = target;
    });
  });
},

boardQueryEnd: (agentId: string) => {
  set((state) => {
    const toReturn = agentId === "board-chairman"
      ? [...BOARD_AGENT_IDS]
      : ["board-chairman", agentId as BoardAgentId];

    toReturn.forEach((id, i) => {
      const agent = state.agents.get(id);
      if (!agent) return;
      agent.zone = "lounge";
      agent.status = "idle";
      agent.position = agent.homePosition ?? POSITION_MAP[`board-lounge-${BOARD_AGENT_IDS.indexOf(id as BoardAgentId)}`];
    });
  });
},
```

**Step 3: Wire events in the WS message handler**

Find where incoming WS messages are dispatched (likely in `office-store.ts` `handleGatewayEvent` or equivalent). Add:

```typescript
case "board_query_start":
  get().boardQueryStart(payload.agent_id);
  break;
case "board_query_end":
  get().boardQueryEnd(payload.agent_id);
  break;
```

**Step 4: Commit**

```bash
git add src/gateway/types.ts src/store/office-store.ts
git commit -m "feat(dec): handle board_query_start/end events — agents walk to meeting zone"
```

---

## Task 4: Render Board Agents in LivingOfficeView

**Objective:** Board agents appear as `AgentCharacter2D5` components in the canvas — same as staff agents.

**Files:**
- Modify: `src/components/living-office/LivingOfficeView.tsx`

**Step 1: Import board constants**

```typescript
import { BOARD_AGENT_IDS, isBoardAgent } from "./characters/constants";
```

**Step 2: Derive board agent projections**

Board agents live in `office-store.agents` already (seeded in Task 2). The existing `useProjectionStore` should pick them up automatically if they're in the store. Verify this by checking what feeds `useProjectionStore`.

If projections are derived from the office store, no extra code is needed — they'll render automatically via the existing `AgentCharacter2D5` map.

If not, add a derived selector:

```typescript
const boardAgents = useOfficeStore((s) =>
  BOARD_AGENT_IDS.map((id) => s.agents.get(id)).filter(Boolean)
);
```

**Step 3: Render board agents explicitly if not auto-rendered**

Below the existing staff agent render block:

```tsx
{/* Board agents — lounge residents */}
{boardAgents.map((agent) => (
  <AgentCharacter2D5
    key={agent!.id}
    agent={agent!}
    isSelected={selectedAgentId === agent!.id}
    onClick={() => setSelectedAgentId(agent!.id)}
  />
))}
```

**Step 4: Commit**

```bash
git add src/components/living-office/LivingOfficeView.tsx
git commit -m "feat(dec): render board agents as AgentCharacter2D5 in living office"
```

---

## Task 5: Verify Build & Smoke Test

**Objective:** Confirm the app builds without errors.

**Step 1: Install deps if needed**

```bash
cd /home/dozza/openclaw-office
pnpm install
```

**Step 2: Type check**

```bash
pnpm typecheck
```

Fix any type errors. Common issues:
- `isStatic` field not on `VisualAgent` type — add it to `src/gateway/types.ts`
- `BoardAgentId` not assignable to `string` — use `as string` cast where needed

**Step 3: Run tests**

```bash
pnpm test
```

Fix any broken tests. The meeting-manager and office-store tests are most likely to be affected.

**Step 4: Build**

```bash
pnpm build
```

Expected: `dist/` created with no errors.

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix(dec): resolve type errors and build for board agent integration"
git push origin dec/mission-control-integration
```

---

## Verification

After all tasks complete:

1. `pnpm dev` → open browser → Living Office view
2. 8 board agent avatars visible in the Lounge zone (bottom row of sofas)
3. Trigger a test event via browser console:
   ```js
   window.__officeStore?.getState().boardQueryStart("board-health")
   ```
   Expected: board-health + board-chairman walk to Meeting zone
4. Trigger end:
   ```js
   window.__officeStore?.getState().boardQueryEnd("board-health")
   ```
   Expected: both return to Lounge

Done.
