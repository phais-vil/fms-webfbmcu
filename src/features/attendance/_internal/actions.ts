"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "../permissions";
import {
  createCourseSchema,
  updateCourseSchema,
  createSessionSchema,
  openSessionSchema,
  studentCheckInSchema,
  updateRecordStatusSchema,
} from "./validations";
import {
  listAttendanceCourses,
  getAttendanceCourseById,
  createAttendanceCourse,
  updateAttendanceCourse,
  deleteAttendanceCourse,
  createAttendanceSession,
  getAttendanceSessionById,
  openAttendanceSession,
  refreshSessionQRToken,
  closeAttendanceSession,
  recordStudentCheckIn,
  updateRecordStatus,
  getStudentAttendanceSummary,
  type AttendanceCourseDto,
  type AttendanceSessionDto,
  type AttendanceRecordDto,
} from "./services";

export async function getAdminCoursesAction(options?: {
  semester?: string;
  search?: string;
}): Promise<ActionResult<AttendanceCourseDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceRead);
    return listAttendanceCourses(ctx.tenantId, options);
  });
}

export async function getAdminCourseByIdAction(id: string): Promise<ActionResult<AttendanceCourseDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceRead);
    return getAttendanceCourseById(ctx.tenantId, id);
  });
}

export async function createCourseAction(input: unknown): Promise<ActionResult<AttendanceCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = createCourseSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAttendanceCourse(ctx.tenantId, parsed);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function updateCourseAction(input: unknown): Promise<ActionResult<AttendanceCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = updateCourseSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateAttendanceCourse(ctx.tenantId, parsed);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function deleteCourseAction(id: string): Promise<ActionResult<AttendanceCourseDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const result = await deleteAttendanceCourse(ctx.tenantId, id);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function createSessionAction(input: unknown): Promise<ActionResult<AttendanceSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = createSessionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAttendanceSession(ctx.tenantId, parsed);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function getAdminSessionByIdAction(sessionId: string): Promise<ActionResult<AttendanceSessionDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceRead);
    return getAttendanceSessionById(ctx.tenantId, sessionId);
  });
}

export async function openSessionAction(input: unknown): Promise<ActionResult<AttendanceSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = openSessionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await openAttendanceSession(ctx.tenantId, parsed);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function refreshSessionQRTokenAction(
  sessionId: string,
  expirySeconds = 60
): Promise<ActionResult<{ qrToken: string; qrExpiresAt: Date }>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    return refreshSessionQRToken(ctx.tenantId, sessionId, expirySeconds);
  });
}

export async function closeSessionAction(sessionId: string): Promise<ActionResult<AttendanceSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const result = await closeAttendanceSession(ctx.tenantId, sessionId);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function updateRecordStatusAction(input: unknown): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = updateRecordStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateRecordStatus(ctx.tenantId, parsed);
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function studentCheckInAction(input: unknown): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const parsed = studentCheckInSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await recordStudentCheckIn(parsed);
    revalidatePath("/attendance/checkin");
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function getStudentAttendanceSummaryAction(studentCode: string): Promise<ActionResult<{
  studentCode: string;
  courses: Array<{
    courseId: string;
    courseCode: string;
    courseNameTh: string;
    totalSessions: number;
    attendedCount: number;
    percentage: number;
    isEligible: boolean;
    records: AttendanceRecordDto[];
  }>;
}>> {
  return runAction(async () => {
    if (!studentCode || !studentCode.trim()) {
      return { studentCode: "", courses: [] };
    }
    return getStudentAttendanceSummary(studentCode.trim());
  });
}
