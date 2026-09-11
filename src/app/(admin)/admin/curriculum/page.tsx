import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listAdminCurriculums } from "@/features/curriculum/server";
import { listStaffDepartments } from "@/features/staff/server";
import { CurriculumAdminClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [departments, initialCurriculums] = await Promise.all([
    listStaffDepartments(ctx.tenantId),
    listAdminCurriculums(ctx.tenantId),
  ]);

  return (
    <CurriculumAdminClient
      departments={departments}
      initialCurriculums={initialCurriculums}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
      canEdit={hasPermission(ctx, CURRICULUM_P.curriculumEdit)}
      canDelete={hasPermission(ctx, CURRICULUM_P.curriculumDelete)}
    />
  );
}
