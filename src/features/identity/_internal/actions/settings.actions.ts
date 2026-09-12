"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema, testGeminiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, testSmtpConnection, testGeminiConnection, type TenantSettings } from "../services/tenant.service";

import path from "node:path";
import fs from "node:fs/promises";
import { errors } from "@/shared/lib/errors";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function testSmtpAction(input: unknown): Promise<ActionResult<{ ok: boolean; error?: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const parsed = testSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return testSmtpConnection({
      tenantId: ctx.tenantId,
      recipient: parsed.recipient,
      smtp: parsed.smtp,
    });
  });
}

export async function testGeminiAction(input: unknown): Promise<ActionResult<{ ok: boolean; error?: string; modelUsed?: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const parsed = testGeminiSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return testGeminiConnection({
      tenantId: ctx.tenantId,
      apiKey: parsed.apiKey,
      model: parsed.model,
    });
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw errors.validation("common.noFile", { file: ["common.noFile"] });
    }
    if (file.size > MAX_LOGO_SIZE) {
      throw errors.validation("settings.fileTooLarge", { file: ["settings.fileTooLarge"] });
    }
    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      throw errors.validation("settings.invalidFileType", { file: ["settings.invalidFileType"] });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeTenantId = ctx.tenantId.replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `logo-${safeTenantId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    return { url: `/uploads/logos/${filename}` };
  });
}
