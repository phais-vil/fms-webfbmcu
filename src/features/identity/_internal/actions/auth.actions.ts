"use server";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, registerSchema } from "../validations/auth";
import { requestPasswordReset, resetPasswordWithToken, changeOwnPassword } from "../services/password.service";
import { registerPublicUser } from "../services/user.service";
import { requireSession } from "../session";

export async function forgotPasswordAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const { email } = forgotPasswordSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await requestPasswordReset(email);
  });
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const { token, password } = resetPasswordSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await resetPasswordWithToken(token, password);
  });
}

export async function changePasswordAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireSession();
    const { currentPassword, newPassword } = changePasswordSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await changeOwnPassword(ctx.userId, currentPassword, newPassword);
  });
}

export async function registerUserAction(input: unknown): Promise<ActionResult<{ id: string; email: string; name: string; userType: string }>> {
  return runAction(async () => {
    const data = registerSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return await registerPublicUser(data);
  });
}

export async function ensureGoogleDemoUserAction(): Promise<ActionResult<{ email: string; password: string }>> {
  return runAction(async () => {
    const email = "google.demo@mcu.ac.th";
    const password = "Passw0rd!vibe";

    const { prisma } = await import("@/shared/lib/infra/prisma");
    const { hashPassword } = await import("@/shared/lib/security/password");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { email, password };
    }

    const tenant =
      (await prisma.tenant.findUnique({ where: { code: "DEMO" } })) ??
      (await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } }));
    if (!tenant) throw new Error("No active tenant found");

    const role =
      (await prisma.role.findFirst({ where: { tenantId: tenant.id, code: "STUDENT" } })) ??
      (await prisma.role.findFirst({ where: { tenantId: tenant.id, code: "VIEWER" } }));

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          name: "นิสิตตัวอย่าง (Google Student Demo)",
          imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
          provider: "google",
          providerId: "google-demo-123456",
          emailVerified: true,
          isActive: true,
          passwordHash,
          lastLoginAt: new Date(),
        },
      });

      const ut = await tx.userTenant.create({
        data: {
          userId: u.id,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      if (role) {
        await tx.userRole.create({
          data: {
            userTenantId: ut.id,
            roleId: role.id,
            scopeType: "ALL",
          },
        });
      }
    });

    return { email, password };
  });
}

