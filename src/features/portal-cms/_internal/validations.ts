import { z } from "zod";

export const createBannerSchema = z.object({
  titleTh: z.string().trim().min(3, "Thai title must be at least 3 characters"),
  titleEn: z.string().trim().min(3, "English title must be at least 3 characters"),
  subtitleTh: z.string().trim().optional().nullable(),
  subtitleEn: z.string().trim().optional().nullable(),
  tagTh: z.string().trim().optional().nullable(),
  tagEn: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().url("Valid image URL is required"),
  linkUrl: z.string().trim().optional().nullable().or(z.literal("")),
  buttonTextTh: z.string().trim().optional().nullable(),
  buttonTextEn: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial().extend({
  id: z.string().uuid("Invalid banner ID"),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
