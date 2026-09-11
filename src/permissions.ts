import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { STAFF_PERMISSIONS } from "@/features/staff/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { ROOMS_PERMISSIONS } from "@/features/rooms/permissions";
import { STUDENT_SERVICES_PERMISSIONS } from "@/features/student-services/permissions";
import { ATTENDANCE_PERMISSIONS } from "@/features/attendance/permissions";
import { DOCUMENT_PERMISSIONS } from "@/features/documents/permissions";
import { PROJECT_PERMISSIONS } from "@/features/projects/permissions";
import { CMS_PERMISSIONS } from "@/features/portal-cms/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...STAFF_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...ROOMS_PERMISSIONS,
  ...STUDENT_SERVICES_PERMISSIONS,
  ...ATTENDANCE_PERMISSIONS,
  ...DOCUMENT_PERMISSIONS,
  ...PROJECT_PERMISSIONS,
  ...CMS_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
