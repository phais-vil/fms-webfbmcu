import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
  listAdminDepartments,
} from "@/features/curriculum/server";
import { CurriculumAdminClient } from "../curriculum/_components/curriculum-client";

export default async function AdminDepartmentsPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [departments, initialCurriculums] = await Promise.all([
    listAdminDepartments(ctx.tenantId),
    listAdminCurriculums(ctx.tenantId),
  ]);

  return (
    <CurriculumAdminClient
      departments={departments}
      initialCurriculums={initialCurriculums}
      initialTab="departments"
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
      canEdit={hasPermission(ctx, CURRICULUM_P.curriculumEdit)}
      canDelete={hasPermission(ctx, CURRICULUM_P.curriculumDelete)}
    />
  );
}
