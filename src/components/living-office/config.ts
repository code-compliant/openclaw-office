import type { DeskConfig, ZoneConfig } from "./types";

export const CANVAS_W = 1600;
export const CANVAS_H = 920;

export const ZONE_CONFIGS: Record<string, ZoneConfig> = {
  gateway: {
    id: "gateway-zone",
    label: "Gateway Hall",
    position: { left: 30, top: 20 },
    size: { width: 440, height: 250 },
  },
  ops: {
    id: "ops-zone",
    label: "Operations Board",
    position: { left: 490, top: 20 },
    size: { width: 540, height: 250 },
  },
  cron: {
    id: "cron-zone",
    label: "Cron Broadcast",
    position: { left: 1050, top: 20 },
    size: { width: 380, height: 250 },
  },
  staff: {
    id: "staff-zone",
    label: "Staff Floor",
    position: { left: 30, top: 290 },
    size: { width: 1000, height: 350 },
  },
  lounge: {
    id: "lounge-zone",
    label: "Lounge",
    position: { left: 30, top: 660 },
    size: { width: 1400, height: 280 },
  },
  project: {
    id: "project-zone",
    label: "Project Room",
    position: { left: 1050, top: 290 },
    size: { width: 380, height: 230 },
  },
  memory: {
    id: "memory-zone",
    label: "Memory Wall",
    position: { left: 1050, top: 540 },
    size: { width: 380, height: 100 },
  },
};

export const DESK_CONFIGS: DeskConfig[] = [
  {
    id: "desk-gm",
    agentName: "General Manager",
    role: "orchestrator",
    position: { left: 110, top: 360 },
  },
  {
    id: "desk-sales",
    agentName: "Sales Agent",
    role: "discovery",
    position: { left: 330, top: 360 },
  },
  {
    id: "desk-ops",
    agentName: "Ops Agent",
    role: "execution",
    position: { left: 550, top: 360 },
  },
  {
    id: "desk-fin",
    agentName: "Finance Agent",
    role: "payment",
    position: { left: 770, top: 360 },
  },
  {
    id: "desk-it",
    agentName: "IT Agent",
    role: "tooling",
    position: { left: 440, top: 500 },
  },
];
