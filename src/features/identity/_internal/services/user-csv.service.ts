import { prisma } from "@/shared/lib/infra/prisma";
import { generateCsv } from "@/shared/lib/csv";
import { hashPassword } from "@/shared/lib/security/password";
import { writeAudit } from "../audit";
import { SUPER_ADMIN_CODE } from "../../permissions";
import { csvUserRowSchema, type ImportUsersOptions } from "../validations/users-csv";

interface Actor {
  tenantId: string;
  actorId: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; email?: string; message: string }>;
}

/**
 * Exports all users in a tenant to CSV string with UTF-8 BOM.
 */
export async function exportUsersCsv(tenantId: string, locale: "th" | "en" = "th"): Promise<string> {
  const rows = await prisma.userTenant.findMany({
    where: { tenantId },
    orderBy: { user: { name: "asc" } },
    include: {
      user: true,
      userRoles: {
        include: { role: true },
      },
    },
  });

  const isEn = locale === "en";
  const headers = [
    { key: "name", label: isEn ? "Full Name" : "ชื่อ-นามสกุล" },
    { key: "email", label: isEn ? "Email" : "อีเมล" },
    { key: "roles", label: isEn ? "Roles" : "บทบาท" },
    { key: "status", label: isEn ? "Status" : "สถานะ" },
    { key: "lastLoginAt", label: isEn ? "Last Sign-In" : "เข้าสู่ระบบล่าสุด" },
    { key: "createdAt", label: isEn ? "Created At" : "วันที่สร้าง" },
  ];

  const data = rows.map((r) => {
    const isActive = r.isActive && r.user.isActive;
    const roleNames = r.userRoles
      .map((ur) => (isEn ? ur.role.nameEn : ur.role.nameTh) || ur.role.code)
      .join(", ");

    return {
      name: r.user.name,
      email: r.user.email,
      roles: roleNames,
      status: isActive ? (isEn ? "Active" : "ใช้งาน") : (isEn ? "Inactive" : "ระงับการใช้งาน"),
      lastLoginAt: r.user.lastLoginAt ? r.user.lastLoginAt.toISOString() : "-",
      createdAt: r.user.createdAt ? r.user.createdAt.toISOString() : "-",
    };
  });

  return generateCsv(headers, data, { includeBom: true });
}

/**
 * Generates sample CSV template for user bulk import.
 */
export function getUsersCsvTemplate(locale: "th" | "en" = "th"): string {
  const isEn = locale === "en";
  const headers = [
    { key: "name", label: isEn ? "Full Name *" : "ชื่อ-นามสกุล *" },
    { key: "email", label: isEn ? "Email *" : "อีเมล *" },
    { key: "roles", label: isEn ? "Roles (e.g. STUDENT, INSTRUCTOR)" : "บทบาท (เช่น STUDENT, INSTRUCTOR)" },
    { key: "phone", label: isEn ? "Phone" : "เบอร์โทรศัพท์" },
    { key: "password", label: isEn ? "Initial Password (Optional)" : "รหัสผ่านเริ่มต้น (ไม่บังคับ)" },
    { key: "isActive", label: isEn ? "Status (active/inactive)" : "สถานะ (active/inactive)" },
  ];

  const sampleRows = [
    {
      name: isEn ? "Somchai Jaidee" : "พระมหาสมชาย ปญฺญาธโร",
      email: "somchai@mcu.ac.th",
      roles: "STUDENT",
      phone: "0812345678",
      password: "",
      isActive: "active",
    },
    {
      name: isEn ? "Dr. Wichai Chan" : "ผศ.ดร.วิชัย ชาญฉลาด",
      email: "wichai@mcu.ac.th",
      roles: "INSTRUCTOR",
      phone: "0898765432",
      password: "",
      isActive: "active",
    },
  ];

  return generateCsv(headers, sampleRows, { includeBom: true });
}

/**
 * Imports users from parsed CSV rows into tenant.
 */
export async function importUsersCsv(
  actor: Actor,
  options: ImportUsersOptions,
  rawRows: Record<string, string>[]
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rawRows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (rawRows.length === 0) {
    return result;
  }

  // Load tenant roles
  const tenantRoles = await prisma.role.findMany({
    where: { tenantId: actor.tenantId },
  });

  const roleByCode = new Map<string, string>();
  const roleByName = new Map<string, string>();

  for (const role of tenantRoles) {
    roleByCode.set(role.code.toUpperCase(), role.id);
    roleByName.set(role.nameTh.toLowerCase().trim(), role.id);
    roleByName.set(role.nameEn.toLowerCase().trim(), role.id);
  }

  // Determine default role ID
  let defaultRoleId = options.defaultRoleId;
  if (!defaultRoleId || !tenantRoles.some((r) => r.id === defaultRoleId)) {
    const studentRole = tenantRoles.find((r) => r.code === "STUDENT");
    defaultRoleId = studentRole?.id ?? tenantRoles.find((r) => r.code !== SUPER_ADMIN_CODE)?.id;
  }

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2; // +1 for 0-index, +1 for header
    const raw = rawRows[i];

    // Map common header variants
    const name = raw["ชื่อ-นามสกุล *"] || raw["ชื่อ-นามสกุล"] || raw["Full Name *"] || raw["Full Name"] || raw["name"] || "";
    const email = raw["อีเมล *"] || raw["อีเมล"] || raw["Email *"] || raw["Email"] || raw["email"] || "";
    const rolesStr = raw["บทบาท (เช่น STUDENT, INSTRUCTOR)"] || raw["บทบาท"] || raw["Roles (e.g. STUDENT, INSTRUCTOR)"] || raw["Roles"] || raw["roles"] || "";
    const phone = raw["เบอร์โทรศัพท์"] || raw["Phone"] || raw["phone"] || "";
    const password = raw["รหัสผ่านเริ่มต้น (ไม่บังคับ)"] || raw["รหัสผ่าน"] || raw["Initial Password (Optional)"] || raw["Password"] || raw["password"] || "";
    const isActiveStr = raw["สถานะ (active/inactive)"] || raw["สถานะ"] || raw["Status (active/inactive)"] || raw["Status"] || raw["isActive"] || "active";

    const parsed = csvUserRowSchema.safeParse({
      name,
      email,
      roles: rolesStr,
      phone,
      password,
      isActive: isActiveStr,
    });

    if (!parsed.success) {
      const errMsgs = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      result.errors.push({ row: rowNum, email, message: errMsgs });
      continue;
    }

    const { name: validName, email: validEmail, roles: validRolesStr, password: rowPassword, isActive } = parsed.data;

    // Resolve roles for this row
    const targetRoleIds: string[] = [];
    if (validRolesStr.trim()) {
      const tokens = validRolesStr.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
      for (const token of tokens) {
        const roleId = roleByCode.get(token.toUpperCase()) || roleByName.get(token.toLowerCase());
        if (roleId) {
          targetRoleIds.push(roleId);
        }
      }
    }

    if (targetRoleIds.length === 0 && defaultRoleId) {
      targetRoleIds.push(defaultRoleId);
    }

    // Security guard: Non-super-admin cannot assign SUPER_ADMIN role
    if (!actor.isSuperAdmin) {
      const superAdminRole = tenantRoles.find((r) => r.code === SUPER_ADMIN_CODE);
      if (superAdminRole && targetRoleIds.includes(superAdminRole.id)) {
        result.errors.push({ row: rowNum, email: validEmail, message: "super_admin_protected" });
        continue;
      }
    }

    try {
      // Check if user exists by email
      const existingUser = await prisma.user.findUnique({
        where: { email: validEmail },
        include: {
          userTenants: {
            where: { tenantId: actor.tenantId },
            include: {
              userRoles: {
                include: { role: true },
              },
            },
          },
        },
      });

      if (existingUser) {
        const existingMembership = existingUser.userTenants[0];

        if (existingMembership) {
          if (options.mode === "skip") {
            result.skipped++;
            continue;
          }

          // Mode is 'update': check if target has SUPER_ADMIN
          const isTargetSuperAdmin = existingMembership.userRoles.some((ur) => ur.role.code === SUPER_ADMIN_CODE);
          if (isTargetSuperAdmin && !actor.isSuperAdmin) {
            result.errors.push({ row: rowNum, email: validEmail, message: "super_admin_protected" });
            continue;
          }

          // Update user
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: existingUser.id },
              data: {
                name: validName,
                isActive,
              },
            });

            await tx.userTenant.update({
              where: { id: existingMembership.id },
              data: { isActive },
            });

            if (targetRoleIds.length > 0) {
              await tx.userRole.deleteMany({
                where: { userTenantId: existingMembership.id },
              });
              await tx.userRole.createMany({
                data: targetRoleIds.map((roleId) => ({
                  userTenantId: existingMembership.id,
                  roleId,
                  scopeType: "ALL",
                  scopeId: null,
                })),
              });
            }

            await writeAudit(
              {
                tenantId: actor.tenantId,
                actorId: actor.actorId,
                action: "user.csv_update",
                entity: "user",
                entityId: existingUser.id,
                after: { name: validName, email: validEmail, roles: targetRoleIds },
              },
              tx
            );
          });

          result.updated++;
        } else {
          // User exists globally, but not member of this tenant -> link to this tenant
          await prisma.$transaction(async (tx) => {
            const ut = await tx.userTenant.create({
              data: {
                userId: existingUser.id,
                tenantId: actor.tenantId,
                isActive,
              },
            });

            if (targetRoleIds.length > 0) {
              await tx.userRole.createMany({
                data: targetRoleIds.map((roleId) => ({
                  userTenantId: ut.id,
                  roleId,
                  scopeType: "ALL",
                  scopeId: null,
                })),
              });
            }

            await writeAudit(
              {
                tenantId: actor.tenantId,
                actorId: actor.actorId,
                action: "user.csv_link_tenant",
                entity: "user",
                entityId: existingUser.id,
                after: { email: validEmail, roles: targetRoleIds },
              },
              tx
            );
          });

          result.created++;
        }
      } else {
        // Brand new user
        const initialPassword = rowPassword || options.defaultPassword;
        const passwordHash = initialPassword ? await hashPassword(initialPassword) : null;

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: validEmail,
              name: validName,
              passwordHash,
              isActive,
              mustChangePassword: !!initialPassword,
            },
          });

          const ut = await tx.userTenant.create({
            data: {
              userId: newUser.id,
              tenantId: actor.tenantId,
              isActive,
            },
          });

          if (targetRoleIds.length > 0) {
            await tx.userRole.createMany({
              data: targetRoleIds.map((roleId) => ({
                userTenantId: ut.id,
                roleId,
                scopeType: "ALL",
                scopeId: null,
              })),
            });
          }

          await writeAudit(
            {
              tenantId: actor.tenantId,
              actorId: actor.actorId,
              action: "user.csv_create",
              entity: "user",
              entityId: newUser.id,
              after: { email: validEmail, name: validName, roles: targetRoleIds },
            },
            tx
          );
        });

        result.created++;
      }
    } catch (err) {
      result.errors.push({
        row: rowNum,
        email: validEmail,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Summary audit row
  await writeAudit({
    tenantId: actor.tenantId,
    actorId: actor.actorId,
    action: "user.csv_import_batch",
    entity: "user_batch",
    entityId: `batch-${Date.now()}`,
    after: {
      total: result.total,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errorCount: result.errors.length,
    },
  });

  return result;
}
