import "server-only";
export { getSessionContext, requireSession } from "./_internal/session";
export { requirePermission, hasPermission, permissionScopes } from "./_internal/rbac";
export { P } from "./permissions";
export { auth, handlers, signIn, signOut, oauthProviderIds } from "./_internal/auth";
export { resolvePalette, getTenantPalette, getTenantSettings, resolveTenantBrand, getTenantGeminiConfig } from "./_internal/services/tenant.service";
export type { TenantBrandInfo, TenantContactSettingsView } from "./_internal/services/tenant.service";
export { getDashboardStats } from "./_internal/services/dashboard.service";
