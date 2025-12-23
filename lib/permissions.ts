// Admin Role Hierarchy and Permission System

export const AdminRole = {
  SUPER_ADMIN: 'SuperAdmin',
  MODERATOR: 'Moderator',
  SUPPORT: 'Support',
} as const

export type AdminRoleType = typeof AdminRole[keyof typeof AdminRole]

// Permission Definitions
export const Permissions = {
  // User Management
  VIEW_USERS: 'view_users',
  BAN_USERS: 'ban_users',
  DELETE_USERS: 'delete_users',
  PROMOTE_USERS: 'promote_users',
  RESET_PASSWORDS: 'reset_passwords',
  MANAGE_ADMINS: 'manage_admins',

  // Content & Moderation
  VIEW_CONTENT: 'view_content',
  MODERATE_CONTENT: 'moderate_content',
  DELETE_CONTENT: 'delete_content',

  // System Controls
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_REVENUE: 'view_revenue',
  SYSTEM_SETTINGS: 'system_settings',
  MAINTENANCE_MODE: 'maintenance_mode',
  VIEW_AUDIT_LOGS: 'view_audit_logs',

  // Alerts
  SEND_ALERTS: 'send_alerts',
} as const

export type PermissionType = typeof Permissions[keyof typeof Permissions]

// Role -> Permissions Mapping
export const RolePermissions: Record<AdminRoleType, PermissionType[]> = {
  [AdminRole.SUPER_ADMIN]: [
    // SuperAdmin has ALL permissions
    Permissions.VIEW_USERS,
    Permissions.BAN_USERS,
    Permissions.DELETE_USERS,
    Permissions.PROMOTE_USERS,
    Permissions.RESET_PASSWORDS,
    Permissions.MANAGE_ADMINS,
    Permissions.VIEW_CONTENT,
    Permissions.MODERATE_CONTENT,
    Permissions.DELETE_CONTENT,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_REVENUE,
    Permissions.SYSTEM_SETTINGS,
    Permissions.MAINTENANCE_MODE,
    Permissions.VIEW_AUDIT_LOGS,
    Permissions.SEND_ALERTS,
  ],

  [AdminRole.MODERATOR]: [
    // Moderator: Can view and moderate, cannot delete users or see revenue
    Permissions.VIEW_USERS,
    Permissions.BAN_USERS,
    Permissions.VIEW_CONTENT,
    Permissions.MODERATE_CONTENT,
    Permissions.DELETE_CONTENT,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_AUDIT_LOGS,
  ],

  [AdminRole.SUPPORT]: [
    // Support: Can only view users and reset passwords
    Permissions.VIEW_USERS,
    Permissions.RESET_PASSWORDS,
  ],
}

// Permission Check Utilities
export function hasPermission(adminRole: AdminRoleType | null | undefined, permission: PermissionType): boolean {
  if (!adminRole) return false
  const permissions = RolePermissions[adminRole]
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(adminRole: AdminRoleType | null | undefined, permissions: PermissionType[]): boolean {
  if (!adminRole) return false
  return permissions.some(permission => hasPermission(adminRole, permission))
}

export function hasAllPermissions(adminRole: AdminRoleType | null | undefined, permissions: PermissionType[]): boolean {
  if (!adminRole) return false
  return permissions.every(permission => hasPermission(adminRole, permission))
}

// Get user-friendly role display name
export function getRoleDisplayName(role: AdminRoleType): string {
  const names: Record<AdminRoleType, string> = {
    [AdminRole.SUPER_ADMIN]: 'Super Admin',
    [AdminRole.MODERATOR]: 'Moderator',
    [AdminRole.SUPPORT]: 'Support',
  }
  return names[role] || role
}

// Get role badge color for UI
export function getRoleBadgeColor(role: AdminRoleType): string {
  const colors: Record<AdminRoleType, string> = {
    [AdminRole.SUPER_ADMIN]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [AdminRole.MODERATOR]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [AdminRole.SUPPORT]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return colors[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}
