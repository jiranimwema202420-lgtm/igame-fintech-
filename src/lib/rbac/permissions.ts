export const PERMISSIONS = {
  // Role administration
  ROLES_MANAGE: "roles.manage",

  // System administration
  SYSTEM_MANAGE: "system.manage",

  // Users
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",

  // Profiles
  PROFILES_VIEW: "profiles.view",
  PROFILES_MANAGE: "profiles.manage",
  PROFILES_SELF: "profiles.self",

  // Wagers
  WAGERS_VIEW: "wagers.view",
  WAGERS_MANAGE: "wagers.manage",
  WAGERS_UPDATE: "wagers.update",
  WAGERS_SELF: "wagers.self",

  // Orders
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",
  ORDERS_UPDATE: "orders.update",
  ORDERS_SELF: "orders.self",

  // Wallets
  WALLETS_VIEW: "wallets.view",
  WALLETS_MANAGE: "wallets.manage",

  // Reports
  REPORTS_VIEW: "reports.view",

  // Compliance
  COMPLIANCE_VIEW: "compliance.view",
  COMPLIANCE_MANAGE: "compliance.manage",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",

  // Audit
  AUDIT_VIEW: "audit.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
