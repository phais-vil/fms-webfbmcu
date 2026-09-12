/** Identity — client-safe API (types, schemas, constants) · server-only อยู่ที่ ./server · Server Actions อยู่ที่ ./actions */
export type { RoleGrant, ScopeType, Grants } from "./_internal/grants";
export type { PermissionScope, PermissionScopes, PermissionCtx } from "./_internal/rbac-pure";
export { hasPermission, permissionScopes } from "./_internal/rbac-pure";
export { P } from "./permissions";
// ./types มีแต่ module augmentation ของ next-auth ซึ่งมีผลเพราะ tsconfig include ไฟล์นั้นอยู่แล้ว
// ไม่ต้อง re-export อะไรจากที่นี่ (บรรทัด `export type {} from "./types"` เดิมไม่ได้ทำอะไรเลย)
export { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, registerSchema } from "./_internal/validations/auth";
export type { RegisterInput } from "./_internal/validations/auth";
export type { UserListItem } from "./_internal/services/user.service";
export type { RoleItem } from "./_internal/services/role.service";
export type { RoleAssignment, ListUsersQuery } from "./_internal/validations/users";
export type { TenantSettings, TenantSmtpSettingsView, TenantGeminiSettingsView, TenantBrandInfo, TenantContactSettingsView } from "./_internal/services/tenant.service";
export type { ImportResult } from "./_internal/services/user-csv.service";
export { csvUserRowSchema } from "./_internal/validations/users-csv";
export type { CsvUserRow, ImportUsersOptions } from "./_internal/validations/users-csv";
export { contactSettingsSchema } from "./_internal/validations/settings";
export type { ContactSettingsInput } from "./_internal/validations/settings";


