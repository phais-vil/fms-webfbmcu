import type { PermissionDef } from "@/shared/lib/permission-def";

export const PROJECT_P = {
  projectRead: "project:read",
  projectManage: "project:manage",
  projectReport: "project:report",
} as const;

export const PROJECT_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: PROJECT_P.projectRead,
    module: "project",
    action: "read",
    description: "ดูแผนโครงการและงบประมาณประจำปี",
  },
  {
    code: PROJECT_P.projectManage,
    module: "project",
    action: "manage",
    description: "จัดทำ แก้ไข และอนุมัติแผนโครงการและงบประมาณ",
  },
  {
    code: PROJECT_P.projectReport,
    module: "project",
    action: "report",
    description: "บันทึกรายงานความก้าวหน้าและการเบิกจ่ายงบประมาณ",
  },
];

export type ProjectPermission = (typeof PROJECT_PERMISSIONS)[number]["code"];
