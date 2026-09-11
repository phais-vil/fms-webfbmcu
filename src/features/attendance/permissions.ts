import type { PermissionDef } from "@/shared/lib/permission-def";

export const ATTENDANCE_P = {
  attendanceRead: "attendance:read",
  attendanceManage: "attendance:manage",
  attendanceCheckin: "attendance:checkin",
} as const;

export const ATTENDANCE_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: ATTENDANCE_P.attendanceRead,
    module: "attendance",
    action: "read",
    description: "ดูข้อมูลรายวิชา คาบเรียน และสถิติการเข้าชั้นเรียน",
  },
  {
    code: ATTENDANCE_P.attendanceManage,
    module: "attendance",
    action: "manage",
    description: "เปิด/ปิด คาบเรียน ฉาย Dynamic QR Code และปรับปรุงสถานะการเข้าเรียน",
  },
  {
    code: ATTENDANCE_P.attendanceCheckin,
    module: "attendance",
    action: "checkin",
    description: "บันทึกการเช็คชื่อเข้าชั้นเรียนหรือกิจกรรม",
  },
];
