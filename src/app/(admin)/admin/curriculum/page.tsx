import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
  listAdminDepartments,
} from "@/features/curriculum/server";
import { CurriculumAdminClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [departments, initialCurriculums] = await Promise.all([
    listAdminDepartments(ctx.tenantId),
    listAdminCurriculums(ctx.tenantId),
  ]);

  return (
    <CurriculumAdminClient
      departments={departments}
      initialCurriculums={initialCurriculums}
      initialTab={params?.tab === "departments" ? "departments" : "curriculums"}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
      canEdit={hasPermission(ctx, CURRICULUM_P.curriculumEdit)}
      canDelete={hasPermission(ctx, CURRICULUM_P.curriculumDelete)}
    />
  );
}

