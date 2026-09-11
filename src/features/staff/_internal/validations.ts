import { z } from "zod";

export const createStaffProfileSchema = z.object({
  departmentId: z.string().uuid("กรุณาเลือกภาควิชา / Invalid department"),
  prefixTh: z.string().min(1, "กรุณากรอกคำนำหน้าภาษาไทย").max(50),
  prefixEn: z.string().min(1, "Please enter English prefix").max(50),
  firstNameTh: z.string().min(2, "กรุณากรอกชื่อภาษาไทย").max(100),
  lastNameTh: z.string().min(2, "กรุณากรอกนามสกุลภาษาไทย").max(100),
  firstNameEn: z.string().min(2, "Please enter English first name").max(100),
  lastNameEn: z.string().min(2, "Please enter English last name").max(100),
  academicRankTh: z.string().max(100).optional().nullable(),
  academicRankEn: z.string().max(100).optional().nullable(),
  adminPositionTh: z.string().max(150).optional().nullable(),
  adminPositionEn: z.string().max(150).optional().nullable(),
  email: z.string().email("อีเมลไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url("URL ไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  bioTh: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  researchInterests: z.string().optional().nullable(),
  isExecutive: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const updateStaffProfileSchema = z.object({
  id: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  prefixTh: z.string().min(1).max(50).optional(),
  prefixEn: z.string().min(1).max(50).optional(),
  firstNameTh: z.string().min(2).max(100).optional(),
  lastNameTh: z.string().min(2).max(100).optional(),
  firstNameEn: z.string().min(2).max(100).optional(),
  lastNameEn: z.string().min(2).max(100).optional(),
  academicRankTh: z.string().max(100).optional().nullable(),
  academicRankEn: z.string().max(100).optional().nullable(),
  adminPositionTh: z.string().max(150).optional().nullable(),
  adminPositionEn: z.string().max(150).optional().nullable(),
  email: z.string().email().or(z.literal("")).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().or(z.literal("")).optional().nullable(),
  bioTh: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  researchInterests: z.string().optional().nullable(),
  isExecutive: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export type CreateStaffProfileInput = z.infer<typeof createStaffProfileSchema>;
export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;
