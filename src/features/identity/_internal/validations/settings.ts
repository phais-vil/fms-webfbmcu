import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  service: z.enum(["gmail", "custom"]).default("gmail"),
  host: z.string().trim().max(255).default("smtp.gmail.com"),
  port: z.coerce.number().int().min(1).max(65535).default(465),
  secure: z.boolean().default(true),
  user: z.string().trim().max(255).default(""),
  pass: z.string().trim().max(255).optional().default(""),
  fromName: z.string().trim().max(255).optional().default(""),
});

export const testSmtpSchema = z.object({
  recipient: z.string().trim().email(),
  smtp: smtpSettingsSchema.optional(),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (val) => val === "" || val.startsWith("/") || /^https?:\/\//i.test(val) || /^data:image\//i.test(val),
      { message: "invalid_url_or_path" }
    )
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
