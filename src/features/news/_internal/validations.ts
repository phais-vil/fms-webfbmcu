import { z } from "zod";

export const newsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createNewsArticleSchema = z.object({
  categoryId: z.string().uuid("หมวดหมู่ไม่ถูกต้อง / Invalid category"),
  titleTh: z.string().min(3, "กรุณากรอกหัวข้อภาษาไทยอย่างน้อย 3 ตัวอักษร").max(255),
  titleEn: z.string().min(3, "Title must be at least 3 characters").max(255),
  summaryTh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
  contentTh: z.string().min(5, "กรุณากรอกเนื้อหาข่าวภาษาไทย"),
  contentEn: z.string().min(5, "Please enter English content"),
  coverImage: z.string().url("URL รูปภาพไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  isPinned: z.boolean().default(false),
  status: newsStatusSchema.default("DRAFT"),
});

export const updateNewsArticleSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  titleTh: z.string().min(3).max(255).optional(),
  titleEn: z.string().min(3).max(255).optional(),
  summaryTh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
  contentTh: z.string().min(5).optional(),
  contentEn: z.string().min(5).optional(),
  coverImage: z.string().url().or(z.literal("")).optional().nullable(),
  isPinned: z.boolean().optional(),
  status: newsStatusSchema.optional(),
});

export const translateNewsSchema = z.object({
  titleTh: z.string().trim().min(1, "news.aiRequireThaiTitle"),
  summaryTh: z.string().trim().optional().default(""),
  contentTh: z.string().trim().optional().default(""),
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type TranslateNewsInput = z.infer<typeof translateNewsSchema>;
