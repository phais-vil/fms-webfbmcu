import { z } from "zod";

export const DegreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"]);

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid("กรุณาเลือกภาควิชาที่รับผิดชอบ / Invalid department"),
  code: z.string().min(2, "กรุณาระบุรหัสหลักสูตรอย่างน้อย 2 ตัวอักษร").max(50),
  nameTh: z.string().min(3, "กรุณากรอกชื่อหลักสูตรภาษาไทย").max(255),
  nameEn: z.string().min(3, "Please enter English curriculum name").max(255),
  majorTh: z.string().max(150).optional().nullable(),
  majorEn: z.string().max(150).optional().nullable(),
  programLanguage: z.enum(["THAI", "ENGLISH", "BILINGUAL"]).default("THAI"),
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
  majorTh: z.string().max(150).optional().nullable(),
  majorEn: z.string().max(150).optional().nullable(),
  programLanguage: z.enum(["THAI", "ENGLISH", "BILINGUAL"]).optional(),
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

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(2, "กรุณาระบุรหัสภาควิชาอย่างน้อย 2 ตัวอักษร").max(50),
  nameTh: z.string().trim().min(2, "กรุณาระบุชื่อภาควิชาภาษาไทย").max(100),
  nameEn: z.string().trim().min(2, "Please enter English department name").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string().trim().min(2).max(50).optional(),
  nameTh: z.string().trim().min(2).max(100).optional(),
  nameEn: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const scheduleItemSchema = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  startTime: z.string().min(1, "กรุณาระบุเวลาเริ่มต้น"),
  endTime: z.string().min(1, "กรุณาระบุเวลาสิ้นสุด"),
  slotPeriod: z.string().optional().nullable(),
  courseCode: z.string().min(1, "กรุณาระบุรหัสวิชา"),
  courseNameTh: z.string().min(1, "กรุณาระบุชื่อวิชา"),
  courseNameEn: z.string().optional().nullable(),
  instructorsTh: z.string().min(1, "กรุณาระบุอาจารย์ผู้สอน"),
  instructorsEn: z.string().optional().nullable(),
  roomOrNote: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
});

export const createScheduleSchema = z.object({
  departmentId: z.string().uuid("กรุณาเลือกสาขาวิชา/ภาควิชา"),
  curriculumId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => v || null)
    .optional(),
  academicYear: z.coerce.number().int().min(2500, "ปีการศึกษาไม่ถูกต้อง").default(2569),
  semester: z.coerce.number().int().min(1).max(3).default(1),
  yearLevel: z.coerce.number().int().min(1).max(6).default(1),
  titleTh: z.string().min(3, "กรุณาระบุชื่อตารางสอน/ตารางเรียน"),
  titleEn: z.string().optional().nullable(),
  targetGroupTh: z.string().optional().nullable(),
  targetGroupEn: z.string().optional().nullable(),
  roomLocationTh: z.string().optional().nullable(),
  roomLocationEn: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  remarksTh: z.string().optional().nullable(),
  remarksEn: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  items: z.array(scheduleItemSchema).default([]),
});

export const updateScheduleSchema = z.object({
  id: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  curriculumId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === undefined ? undefined : v || null))
    .optional(),
  academicYear: z.coerce.number().int().min(2500).optional(),
  semester: z.coerce.number().int().min(1).max(3).optional(),
  yearLevel: z.coerce.number().int().min(1).max(6).optional(),
  titleTh: z.string().min(3).optional(),
  titleEn: z.string().optional().nullable(),
  targetGroupTh: z.string().optional().nullable(),
  targetGroupEn: z.string().optional().nullable(),
  roomLocationTh: z.string().optional().nullable(),
  roomLocationEn: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  remarksTh: z.string().optional().nullable(),
  remarksEn: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  items: z.array(scheduleItemSchema).optional(),
});

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

