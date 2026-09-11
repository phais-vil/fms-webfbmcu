import type { PermissionDef } from "@/shared/lib/permission-def";

export const CMS_P = {
  cmsRead: "cms:read",
  cmsManage: "cms:manage",
} as const;

export const CMS_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: CMS_P.cmsRead,
    module: "cms",
    action: "read",
    description: "ดูรายการแบนเนอร์และไฮไลต์หน้าแรก",
  },
  {
    code: CMS_P.cmsManage,
    module: "cms",
    action: "manage",
    description: "เพิ่ม แก้ไข ลบ และจัดลำดับแบนเนอร์หน้าแรก",
  },
];

export type CmsPermission = (typeof CMS_PERMISSIONS)[number]["code"];
