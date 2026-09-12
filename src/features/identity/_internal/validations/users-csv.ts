import { z } from "zod";
import { emailSchema } from "./auth";

export const csvUserRowSchema = z.object({
  name: z.string().trim().min(1, "name_required").max(255),
  email: emailSchema,
  roles: z.string().optional().default(""),
  phone: z.string().trim().max(50).optional().default(""),
  password: z.string().optional().default(""),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (!val) return true;
      const lower = val.trim().toLowerCase();
      if (lower === "0" || lower === "false" || lower === "inactive" || lower === "ระงับ") return false;
      return true;
    }),
});

export const importUsersOptionsSchema = z.object({
  mode: z.enum(["skip", "update"]).default("skip"),
  defaultRoleId: z.string().uuid().optional(),
  defaultPassword: z.string().optional(),
});

export const importUsersPayloadSchema = z.object({
  options: importUsersOptionsSchema,
  rows: z.array(z.record(z.string(), z.string())),
});

export type CsvUserRow = z.infer<typeof csvUserRowSchema>;
export type ImportUsersOptions = z.infer<typeof importUsersOptionsSchema>;
export type ImportUsersPayload = z.infer<typeof importUsersPayloadSchema>;
