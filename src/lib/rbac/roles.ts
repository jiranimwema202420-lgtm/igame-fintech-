export const ROLES = [
  "super_admin",
  "admin",
  "manager",
  "staff",
  "compliance",
  "analyst",
  "player",
] as const;

export type AppRole = (typeof ROLES)[number];

export const DEFAULT_ROLE: AppRole = "player";

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && ROLES.includes(value as AppRole);
}
