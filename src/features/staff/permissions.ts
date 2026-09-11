import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffCreate: "staff:create",
  staffEdit: "staff:edit",
  staffDelete: "staff:delete",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "ดูรายการและข้อมูลบุคลากรในระบบหลังบ้าน" },
  { code: STAFF_P.staffCreate, module: "staff", action: "create", description: "เพิ่มข้อมูลบุคลากรและคณาจารย์ใหม่" },
  { code: STAFF_P.staffEdit, module: "staff", action: "edit", description: "แก้ไขข้อมูลประวัติและตำแหน่งบุคลากร" },
  { code: STAFF_P.staffDelete, module: "staff", action: "delete", description: "ลบข้อมูลบุคลากร" },
];
