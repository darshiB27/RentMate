// Application role-based permissions and routes constants
// Purpose: Dictates authorized roles and route paths across components.

export const ROLES = {
  TENANT: 'tenant',
  OWNER: 'owner',
  ADMIN: 'admin',
};

export const ROLE_DASHBOARDS = {
  [ROLES.TENANT]: '/tenant/dashboard',
  [ROLES.OWNER]: '/owner/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};
