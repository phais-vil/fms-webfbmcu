import type { PermissionDef } from "@/shared/lib/permission-def";

export const DOCUMENT_P = {
  documentRead: "document:read",
  documentCreate: "document:create",
  documentApprove: "document:approve",
} as const;

export const DOCUMENT_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: DOCUMENT_P.documentRead,
    module: "document",
    action: "read",
    description: "ดูรายการและติดตามเอกสารสารบรรณ",
  },
  {
    code: DOCUMENT_P.documentCreate,
    module: "document",
    action: "create",
    description: "เสนอเอกสาร/ร่างบันทึกข้อความและโครงการ",
  },
  {
    code: DOCUMENT_P.documentApprove,
    module: "document",
    action: "approve",
    description: "ตรวจสอบ ลงนาม และอนุมัติเอกสารสารบรรณ",
  },
];

export type DocumentPermission = (typeof DOCUMENT_PERMISSIONS)[number]["code"];

