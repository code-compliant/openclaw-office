// Agent 角色系统常量——尺寸、颜色、坐标映射

// --- 角色尺寸 ---

export const CHARACTER_SIZE = 40;
export const HEAD_SIZE = 16;
export const BODY_SIZE = 24;
export const BODY_RADIUS = 12;
export const EYE_SIZE = 3;
export const EYE_SPACING = 5;
export const ARM_WIDTH = 4;
export const ARM_HEIGHT = 10;

// --- 颜色 ---

export const SKIN_COLOR = "#ffd8b4";
export const EYE_COLOR = "#2c3e50";
export const SHADOW_COLOR = "rgba(0, 0, 0, 0.35)";
export const TAG_BG = "rgba(11, 18, 32, 0.75)";
export const TAG_COLOR = "#e8f1ff";

// 每个 Agent 的个性化衣服颜色（按 agentId hash 取色）
export const AGENT_COLORS: Array<[string, string]> = [
  ["#7dd5ff", "#5c8dff"], // 蓝
  ["#ff9a76", "#e85d4a"], // 橙红
  ["#a78bfa", "#7c3aed"], // 紫
  ["#34d399", "#059669"], // 绿
  ["#fbbf24", "#d97706"], // 金
  ["#f472b6", "#db2777"], // 粉
  ["#67e8f9", "#06b6d4"], // 青
  ["#fb923c", "#ea580c"], // 橘
];

export function getAgentColor(agentId: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = (hash * 31 + agentId.charCodeAt(i)) | 0;
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}

// --- Idle 行为参数 ---

export const IDLE_WANDER_RADIUS = 18;
export const IDLE_WANDER_INTERVAL_MIN = 3000;
export const IDLE_WANDER_INTERVAL_MAX = 8000;
export const IDLE_GAZE_INTERVAL_MIN = 2000;
export const IDLE_GAZE_INTERVAL_MAX = 5000;
export const IDLE_WANDER_DURATION = 1200;

// --- 角色在等距空间中的浮起高度 ---

export const CHARACTER_Z = 18;

// --- Agent 初始工位坐标映射 ---
// 基于 config.ts 中 DESK_CONFIGS 的 position，角色偏移到桌面上方

const DESK_CHAR_OFFSET_X = 64;
const DESK_CHAR_OFFSET_Y = -8;

export interface Position2D {
  left: number;
  top: number;
}

export const AGENT_HOME_POSITIONS: Record<string, Position2D> = {
  "desk-gm": { left: 110 + DESK_CHAR_OFFSET_X, top: 360 + DESK_CHAR_OFFSET_Y },
  "desk-sales": { left: 330 + DESK_CHAR_OFFSET_X, top: 360 + DESK_CHAR_OFFSET_Y },
  "desk-ops": { left: 550 + DESK_CHAR_OFFSET_X, top: 360 + DESK_CHAR_OFFSET_Y },
  "desk-fin": { left: 770 + DESK_CHAR_OFFSET_X, top: 360 + DESK_CHAR_OFFSET_Y },
  "desk-it": { left: 440 + DESK_CHAR_OFFSET_X, top: 500 + DESK_CHAR_OFFSET_Y },
};

// --- 区域目标坐标映射 ---

export const POSITION_MAP: Record<string, Position2D> = {
  ...AGENT_HOME_POSITIONS,
  gateway: { left: 250, top: 145 },
  ops: { left: 760, top: 145 },
  cron: { left: 1240, top: 145 },
  project: { left: 1240, top: 405 },
  memory: { left: 1240, top: 590 },
  lounge: { left: 730, top: 770 },
  whiteboard: { left: 760, top: 145 },
  "board-lounge-0": { left: 156, top: 890 },
  "board-lounge-1": { left: 326, top: 890 },
  "board-lounge-2": { left: 496, top: 890 },
  "board-lounge-3": { left: 666, top: 890 },
  "board-lounge-4": { left: 836, top: 890 },
  "board-lounge-5": { left: 1006, top: 890 },
  "board-lounge-6": { left: 1176, top: 890 },
  "board-lounge-7": { left: 1346, top: 890 },
};

// --- 项目室 Sub-agent 坐标位 ---

export const SUB_AGENT_SLOTS: Position2D[] = [
  { left: 1140, top: 370 },
  { left: 1240, top: 430 },
  { left: 1340, top: 370 },
];

// --- Lounge 沙发坐标位 ---

export const LOUNGE_SOFA_POSITIONS: Position2D[] = [
  { left: 120, top: 730 },
  { left: 340, top: 730 },
  { left: 560, top: 730 },
  { left: 780, top: 730 },
  { left: 1000, top: 730 },
  { left: 1220, top: 730 },
  { left: 230, top: 810 },
  { left: 450, top: 810 },
  { left: 670, top: 810 },
  { left: 890, top: 810 },
  { left: 1110, top: 810 },
  { left: 120, top: 890 },
  { left: 290, top: 890 },
  { left: 460, top: 890 },
  { left: 630, top: 890 },
  { left: 800, top: 890 },
  { left: 970, top: 890 },
  { left: 1140, top: 890 },
  { left: 1310, top: 890 },
];

export const MAX_SUB_AGENTS = 3;

// --- 移动动画参数 ---

export const MOVE_DURATION_MS = 900;
export const MOVE_EASING = "cubic-bezier(.25, .9, .2, 1)";
export const WALK_BOB_DURATION = "0.5s";

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

export type BoardAgentId = (typeof BOARD_AGENT_IDS)[number];

export const BOARD_AGENT_NAMES: Record<BoardAgentId, string> = {
  "board-chairman": "Chairman",
  "board-biz-ops": "Business Ops",
  "board-health": "Health",
  "board-mental": "Mental Health",
  "board-relations": "Relationships",
  "board-trainer": "Trainer",
  "board-admin": "Admin/Legal",
  "board-improvement": "Improvement",
};

export const isBoardAgent = (id: string): id is BoardAgentId =>
  (BOARD_AGENT_IDS as readonly string[]).includes(id);

// Board meeting seats (canvas coordinates 1600×920)
export const BOARD_MEETING_SEATS: Position2D[] = [
  { left: 1100, top: 370 },
  { left: 1160, top: 340 },
  { left: 1240, top: 330 },
  { left: 1320, top: 340 },
  { left: 1380, top: 370 },
  { left: 1380, top: 430 },
  { left: 1320, top: 460 },
  { left: 1160, top: 460 },
];
