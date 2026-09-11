import type { PermissionDef } from "@/shared/lib/permission-def";

export const STUDENT_SERVICES_P = {
  studentRead: "student:read",
  studentManage: "student:manage",
} as const;

export const STUDENT_SERVICES_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: STUDENT_SERVICES_P.studentRead,
    module: "student-services",
    action: "read",
    description: "ดูรายการคำร้องนิสิตและเอกสารในระบบหลังบ้าน",
  },
  {
    code: STUDENT_SERVICES_P.studentManage,
    module: "student-services",
    action: "manage",
    description: "อนุมัติ/ปฏิเสธคำร้อง และจัดการแบบเอกสารคำร้อง",
  },
];

