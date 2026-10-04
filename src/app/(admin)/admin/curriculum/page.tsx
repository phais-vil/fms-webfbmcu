import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
  listAdminDepartments,
  listAdminSchedules,
} from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [departments, initialCurriculums, initialSchedules] = await Promise.all([
    listAdminDepartments(ctx.tenantId),
    listAdminCurriculums(ctx.tenantId),
    listAdminSchedules(ctx.tenantId),
  ]);

  const activeTab =
    params?.tab === "departments"
      ? "departments"
      : params?.tab === "schedules"
      ? "schedules"
      : "curriculums";

  return (
    <CurriculumAdminClient
      departments={departments}
      initialCurriculums={initialCurriculums}
      initialSchedules={initialSchedules}
      initialTab={activeTab}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
      canEdit={hasPermission(ctx, CURRICULUM_P.curriculumEdit)}
      canDelete={hasPermission(ctx, CURRICULUM_P.curriculumDelete)}
    />
  );
}

