import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: z.string().min(20), password: passwordSchema });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema })
  .refine((d) => d.newPassword !== d.currentPassword, { message: "same_as_old", path: ["newPassword"] });

export const registerSchema = z
  .object({
    userType: z.enum(["INSTRUCTOR", "STUDENT"]),
    name: z.string().trim().min(2).max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1),
    phone: z.string().trim().max(50).optional().default(""),
    studentCode: z.string().trim().max(50).optional().default(""),
    degreeLevel: z.string().trim().max(50).optional().default(""),
    department: z.string().trim().max(150).optional().default(""),
    academicTitle: z.string().trim().max(100).optional().default(""),
    services: z.array(z.string()).optional().default([]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwords_mismatch",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
