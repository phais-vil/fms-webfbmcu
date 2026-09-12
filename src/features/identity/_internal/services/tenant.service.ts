import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import { testSmtpTransport, resolveSmtp, type ResolvedSmtp } from "@/shared/lib/infra/mailer";
import type { UpdateSettingsInput, SmtpSettingsInput } from "../validations/settings";

export interface TenantSmtpSettingsView {
  enabled: boolean;
  service: "gmail" | "custom";
  host: string;
  port: number;
  secure: boolean;
  user: string;
  hasPassword: boolean;
  fromName?: string;
}

export interface TenantGeminiSettingsView {
  enabled: boolean;
  hasApiKey: boolean;
  model: string;
}

export interface TenantContactSettingsView {
  phone: string;
  email: string;
  addressTh: string;
  addressEn: string;
  workingHoursTh: string;
  workingHoursEn: string;
  facebook: string;
  lineId: string;
  website: string;
  mapUrl: string;
}

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: TenantSmtpSettingsView;
  gemini?: TenantGeminiSettingsView;
  contact?: TenantContactSettingsView;
}


async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settingsObj = t.settings as { palette?: unknown; smtp?: Record<string, unknown>; gemini?: Record<string, unknown> } | null;
  const p = settingsObj?.palette;
  const rawSmtp = settingsObj?.smtp;
  const rawGemini = settingsObj?.gemini;
  const smtp: TenantSmtpSettingsView = {
    enabled: Boolean(rawSmtp?.enabled),
    service: rawSmtp?.service === "custom" ? "custom" : "gmail",
    host: typeof rawSmtp?.host === "string" && rawSmtp.host ? rawSmtp.host : "smtp.gmail.com",
    port: typeof rawSmtp?.port === "number" ? rawSmtp.port : 465,
    secure: rawSmtp?.secure !== undefined ? Boolean(rawSmtp.secure) : true,
    user: typeof rawSmtp?.user === "string" ? rawSmtp.user : "",
    hasPassword: Boolean(typeof rawSmtp?.pass === "string" && rawSmtp.pass.length > 0),
    fromName: typeof rawSmtp?.fromName === "string" ? rawSmtp.fromName : "",
  };

  const gemini: TenantGeminiSettingsView = {
    enabled: Boolean(rawGemini?.enabled),
    hasApiKey: Boolean(
      (typeof rawGemini?.apiKey === "string" && rawGemini.apiKey.length > 0) ||
      Boolean(process.env.GEMINI_API_KEY)
    ),
    model: typeof rawGemini?.model === "string" && rawGemini.model ? rawGemini.model : "gemini-2.5-flash",
  };

  const rawContact = (settingsObj as Record<string, unknown> | null)?.contact as Record<string, unknown> | undefined;
  const contact: TenantContactSettingsView = {
    phone: typeof rawContact?.phone === "string" ? rawContact.phone : "",
    email: typeof rawContact?.email === "string" ? rawContact.email : "",
    addressTh: typeof rawContact?.addressTh === "string" ? rawContact.addressTh : "",
    addressEn: typeof rawContact?.addressEn === "string" ? rawContact.addressEn : "",
    workingHoursTh: typeof rawContact?.workingHoursTh === "string" ? rawContact.workingHoursTh : "",
    workingHoursEn: typeof rawContact?.workingHoursEn === "string" ? rawContact.workingHoursEn : "",
    facebook: typeof rawContact?.facebook === "string" ? rawContact.facebook : "",
    lineId: typeof rawContact?.lineId === "string" ? rawContact.lineId : "",
    website: typeof rawContact?.website === "string" ? rawContact.website : "",
    mapUrl: typeof rawContact?.mapUrl === "string" ? rawContact.mapUrl : "",
  };

  return { code: t.code, nameTh: t.nameTh, nameEn: t.nameEn, logoUrl: t.logoUrl, palette: isPalette(p) ? p : DEFAULT_PALETTE, smtp, gemini, contact };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge เฉพาะ palette, smtp, gemini และ contact ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const currentSettings = (t.settings as { smtp?: Record<string, unknown>; gemini?: Record<string, unknown>; contact?: Record<string, unknown> } | null) || {};
    const existingSmtp = currentSettings.smtp;
    const existingGemini = currentSettings.gemini;

    const newSettings: Record<string, unknown> = {
      ...(t.settings as object),
      palette: input.palette,
    };

    if (input.smtp) {
      newSettings.smtp = {
        enabled: input.smtp.enabled,
        service: input.smtp.service,
        host: input.smtp.host,
        port: input.smtp.port,
        secure: input.smtp.secure,
        user: input.smtp.user,
        pass: input.smtp.pass && input.smtp.pass.trim() !== "" ? input.smtp.pass.trim() : (existingSmtp?.pass as string || ""),
        fromName: input.smtp.fromName || "",
      };
    }

    if (input.gemini) {
      newSettings.gemini = {
        enabled: input.gemini.enabled,
        apiKey: input.gemini.apiKey && input.gemini.apiKey.trim() !== ""
          ? input.gemini.apiKey.trim()
          : (existingGemini?.apiKey as string || ""),
        model: input.gemini.model || "gemini-2.5-flash",
      };
    }

    if (input.contact) {
      newSettings.contact = {
        phone: input.contact.phone || "",
        email: input.contact.email || "",
        addressTh: input.contact.addressTh || "",
        addressEn: input.contact.addressEn || "",
        workingHoursTh: input.contact.workingHoursTh || "",
        workingHoursEn: input.contact.workingHoursEn || "",
        facebook: input.contact.facebook || "",
        lineId: input.contact.lineId || "",
        website: input.contact.website || "",
        mapUrl: input.contact.mapUrl || "",
      };
    }

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: newSettings as object,
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function testSmtpConnection(input: {
  tenantId: string;
  recipient: string;
  smtp?: SmtpSettingsInput;
}): Promise<{ ok: boolean; error?: string }> {
  let config: ResolvedSmtp;
  if (input.smtp && input.smtp.user) {
    let pass = input.smtp.pass?.trim() || "";
    if (!pass) {
      const t = await prisma.tenant.findUnique({ where: { id: input.tenantId }, select: { settings: true } });
      pass = (t?.settings as { smtp?: { pass?: string } } | null)?.smtp?.pass || "";
    }
    const port = Number(input.smtp.port) || (input.smtp.secure ? 465 : 587);
    config = {
      host: input.smtp.host || "smtp.gmail.com",
      port,
      secure: input.smtp.secure,
      user: input.smtp.user.trim(),
      pass,
      from: `"${input.smtp.fromName?.trim() || "FMS"}" <${input.smtp.user.trim()}>`,
    };
  } else {
    const resolved = await resolveSmtp(input.tenantId);
    if (!resolved) {
      return { ok: false, error: "ยังไม่ได้ระบุข้อมูล SMTP (Host/User)" };
    }
    config = resolved;
  }

  return testSmtpTransport(config, input.recipient);
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId =
      (await sessionTenantId()) ||
      (await prisma.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } }))?.id ||
      (await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});

export interface TenantBrandInfo {
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  contact?: TenantContactSettingsView;
}

/** ใช้โดย layouts (Portal & Admin) เพื่อแสดงชื่อและโลโก้องค์กรจากหน้า Settings · ไม่ throw */
export const resolveTenantBrand = cache(async (): Promise<TenantBrandInfo> => {
  try {
    const sessionTid = await sessionTenantId();
    const tenant = sessionTid
      ? await prisma.tenant.findUnique({
          where: { id: sessionTid },
          select: { nameTh: true, nameEn: true, logoUrl: true, settings: true },
        })
      : (await prisma.tenant.findUnique({
          where: { code: "DEMO" },
          select: { nameTh: true, nameEn: true, logoUrl: true, settings: true },
        })) ??
        (await prisma.tenant.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: { nameTh: true, nameEn: true, logoUrl: true, settings: true },
        }));

    const rawContact = (tenant?.settings as Record<string, unknown> | null)?.contact as Record<string, unknown> | undefined;
    const contact: TenantContactSettingsView | undefined = rawContact
      ? {
          phone: typeof rawContact.phone === "string" ? rawContact.phone : "",
          email: typeof rawContact.email === "string" ? rawContact.email : "",
          addressTh: typeof rawContact.addressTh === "string" ? rawContact.addressTh : "",
          addressEn: typeof rawContact.addressEn === "string" ? rawContact.addressEn : "",
          workingHoursTh: typeof rawContact.workingHoursTh === "string" ? rawContact.workingHoursTh : "",
          workingHoursEn: typeof rawContact.workingHoursEn === "string" ? rawContact.workingHoursEn : "",
          facebook: typeof rawContact.facebook === "string" ? rawContact.facebook : "",
          lineId: typeof rawContact.lineId === "string" ? rawContact.lineId : "",
          website: typeof rawContact.website === "string" ? rawContact.website : "",
          mapUrl: typeof rawContact.mapUrl === "string" ? rawContact.mapUrl : "",
        }
      : undefined;

    return {
      nameTh: tenant?.nameTh || "คณะพุทธศาสตร์ มจร",
      nameEn: tenant?.nameEn || "Faculty of Buddhism, MCU",
      logoUrl: tenant?.logoUrl || null,
      contact,
    };
  } catch {
    return {
      nameTh: "คณะพุทธศาสตร์ มจร",
      nameEn: "Faculty of Buddhism, MCU",
      logoUrl: null,
    };
  }
});

export async function getTenantGeminiConfig(tenantId: string): Promise<{
  enabled: boolean;
  apiKey: string;
  model: string;
}> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const rawGemini = (t?.settings as { gemini?: Record<string, unknown> } | null)?.gemini;
  const apiKey = (typeof rawGemini?.apiKey === "string" && rawGemini.apiKey.trim()) || process.env.GEMINI_API_KEY || "";
  const enabled = rawGemini?.enabled !== undefined ? Boolean(rawGemini.enabled) : Boolean(apiKey);
  const model = typeof rawGemini?.model === "string" && rawGemini.model ? rawGemini.model : "gemini-2.5-flash";

  return { enabled, apiKey, model };
}

export async function testGeminiConnection(input: {
  tenantId: string;
  apiKey?: string;
  model?: string;
}): Promise<{ ok: boolean; error?: string; modelUsed?: string }> {
  let apiKey = input.apiKey?.trim() || "";
  let model = input.model?.trim() || "gemini-2.5-flash";

  if (!apiKey) {
    const config = await getTenantGeminiConfig(input.tenantId);
    apiKey = config.apiKey;
    if (!input.model && config.model) model = config.model;
  }

  if (!apiKey) {
    return { ok: false, error: "settings.geminiNoApiKey" };
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Hello, respond with OK if you can read this." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const msg = errorJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { ok: false, error: msg };
    }

    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) {
      return { ok: false, error: "Empty response from Gemini API" };
    }

    return { ok: true, modelUsed: model };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Connection failed" };
  }
}


