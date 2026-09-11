import { z } from "zod";

export const DegreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"]);

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid("กรุณาเลือกภาควิชาที่รับผิดชอบ / Invalid department"),
  code: z.string().min(2, "กรุณาระบุรหัสหลักสูตรอย่างน้อย 2 ตัวอักษร").max(50),
  nameTh: z.string().min(3, "กรุณากรอกชื่อหลักสูตรภาษาไทย").max(255),
  nameEn: z.string().min(3, "Please enter English curriculum name").max(255),
  degreeTh: z.string().min(2, "กรุณากรอกชื่อปริญญาเต็มภาษาไทย").max(150),
  degreeEn: z.string().min(2, "Please enter English degree title").max(150),
  degreeAbbrTh: z.string().min(1, "กรุณากรอกชื่อปริญญาย่อภาษาไทย").max(50),
  degreeAbbrEn: z.string().min(1, "Please enter English degree abbreviation").max(50),
  degreeLevel: DegreeLevelEnum.default("BACHELOR"),
  totalCredits: z.coerce.number().int().min(1, "หน่วยกิตรวมต้องมากกว่า 0").default(136),
  durationYears: z.coerce.number().int().min(1, "ระยะเวลาการศึกษาต้องมากกว่า 0").default(4),
  philosophyTh: z.string().optional().nullable(),
  philosophyEn: z.string().optional().nullable(),
  careerOpportunitiesTh: z.string().optional().nullable(),
  careerOpportunitiesEn: z.string().optional().nullable(),
  tuitionFees: z.string().max(255).optional().nullable(),
  coverImage: z.string().url("URL ไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  curriculumPdfUrl: z.string().url("URL ไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  effectiveYear: z.coerce.number().int().default(2568),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateCurriculumSchema = z.object({
  id: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  code: z.string().min(2).max(50).optional(),
  nameTh: z.string().min(3).max(255).optional(),
  nameEn: z.string().min(3).max(255).optional(),
  degreeTh: z.string().min(2).max(150).optional(),
  degreeEn: z.string().min(2).max(150).optional(),
  degreeAbbrTh: z.string().min(1).max(50).optional(),
  degreeAbbrEn: z.string().min(1).max(50).optional(),
  degreeLevel: DegreeLevelEnum.optional(),
  totalCredits: z.coerce.number().int().min(1).optional(),
  durationYears: z.coerce.number().int().min(1).optional(),
  philosophyTh: z.string().optional().nullable(),
  philosophyEn: z.string().optional().nullable(),
  careerOpportunitiesTh: z.string().optional().nullable(),
  careerOpportunitiesEn: z.string().optional().nullable(),
  tuitionFees: z.string().max(255).optional().nullable(),
  coverImage: z.string().url().or(z.literal("")).optional().nullable(),
  curriculumPdfUrl: z.string().url().or(z.literal("")).optional().nullable(),
  effectiveYear: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
export type DegreeLevel = z.infer<typeof DegreeLevelEnum>;
