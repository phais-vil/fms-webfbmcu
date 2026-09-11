import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  curriculumRead: "curriculum:read",
  curriculumCreate: "curriculum:create",
  curriculumEdit: "curriculum:edit",
  curriculumDelete: "curriculum:delete",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  { code: CURRICULUM_P.curriculumRead, module: "curriculum", action: "read", description: "ดูรายการหลักสูตรในระบบหลังบ้าน" },
  { code: CURRICULUM_P.curriculumCreate, module: "curriculum", action: "create", description: "สร้างและเพิ่มหลักสูตรใหม่" },
  { code: CURRICULUM_P.curriculumEdit, module: "curriculum", action: "edit", description: "แก้ไขรายละเอียดหลักสูตรและโครงสร้างวิชา" },
  { code: CURRICULUM_P.curriculumDelete, module: "curriculum", action: "delete", description: "ลบหลักสูตร" },
];
