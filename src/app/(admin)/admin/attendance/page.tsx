import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  ATTENDANCE_P,
  listAttendanceCourses,
} from "@/features/attendance/server";
import { AttendanceAdminClient } from "./_components/attendance-admin-client";

export default async function AdminAttendancePage() {
  const ctx = await requirePermission(ATTENDANCE_P.attendanceRead);
  const courses = await listAttendanceCourses(ctx.tenantId);

  return (
    <AttendanceAdminClient
      initialCourses={courses}
      canManage={hasPermission(ctx, ATTENDANCE_P.attendanceManage)}
    />
  );
}
