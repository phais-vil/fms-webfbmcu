import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";
import { prisma } from "./prisma";

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tenantId?: string;
}

export interface ResolvedSmtp {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export async function resolveSmtp(tenantId?: string): Promise<ResolvedSmtp | null> {
  // 1. Try tenant settings first
  try {
    const tenant = tenantId
      ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true, nameTh: true } })
      : await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { settings: true, nameTh: true } });

    const smtp = (tenant?.settings as Record<string, unknown> | null)?.smtp as
      | { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; fromName?: string }
      | undefined;

    if (smtp?.enabled && smtp.host && smtp.user) {
      const port = Number(smtp.port) || (smtp.secure ? 465 : 587);
      const secure = smtp.secure ?? (port === 465);
      const fromName = smtp.fromName?.trim() || tenant?.nameTh || "FMS";
      return {
        host: smtp.host.trim(),
        port,
        secure,
        user: smtp.user.trim(),
        pass: smtp.pass || undefined,
        from: `"${fromName}" <${smtp.user.trim()}>`,
      };
    }
  } catch (err) {
    logger.warn("failed to read tenant smtp settings", { err: err instanceof Error ? err.message : String(err) });
  }

  // 2. Fallback to env()
  if (smtpConfigured()) {
    const e = env();
    return {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      user: e.SMTP_USER || undefined,
      pass: e.SMTP_PASS || undefined,
      from: e.SMTP_FROM,
    };
  }

  return null;
}

/** ส่งอีเมลผ่าน SMTP (Tenant Settings หรือ ENV) หากไม่มีให้ log info แล้วคืน delivered:false */
export async function sendMail(input: MailInput): Promise<{ delivered: boolean; error?: string }> {
  const config = await resolveSmtp(input.tenantId);
  if (!config) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    });
    await transport.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { delivered: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("mail send failed", { to: input.to, err: errMsg });
    return { delivered: false, error: errMsg };
  }
}

/** ทดสอบเชื่อมต่อและส่งอีเมลทดสอบจริง */
export async function testSmtpTransport(config: ResolvedSmtp, recipient: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    });
    await transport.verify();
    await transport.sendMail({
      from: config.from,
      to: recipient,
      subject: "ทดสอบการเชื่อมต่อระบบอีเมล (FMS Test Email)",
      text: "ยินดีด้วย! การตั้งค่า SMTP Gmail ในระบบสำเร็จเรียบร้อยแล้ว\n\nนี่คืออีเมลทดสอบจากระบบ FMS",
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">ทดสอบการเชื่อมต่อระบบอีเมลสำเร็จ</h2>
          <p>ยินดีด้วย! การตั้งค่าเชื่อมต่อ <strong>Gmail SMTP</strong> ในระบบสารสนเทศทำงานได้อย่างถูกต้องเรียบร้อยแล้ว</p>
          <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 14px;">
            <p style="margin: 0;"><strong>Host:</strong> ${config.host}:${config.port}</p>
            <p style="margin: 4px 0 0 0;"><strong>ผู้ส่ง:</strong> ${config.from}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">อีเมลนี้เป็นอีเมลทดสอบอัตโนมัติจากระบบ กรุณาอย่าตอบกลับ</p>
        </div>
      `,
    });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
