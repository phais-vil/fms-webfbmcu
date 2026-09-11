import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  PROJECT_P,
  listAnnualProjects,
  getAnnualBudgetStats,
} from "@/features/projects/server";
import { ProjectsAdminClient } from "./_components/projects-admin-client";

export default async function AdminProjectsPage() {
  const ctx = await requirePermission(PROJECT_P.projectRead);
  const [projects, stats] = await Promise.all([
    listAnnualProjects(ctx.tenantId, { fiscalYear: 2569 }),
    getAnnualBudgetStats(ctx.tenantId, 2569),
  ]);

  return (
    <ProjectsAdminClient
      initialProjects={projects}
      initialStats={stats}
      canManage={hasPermission(ctx, PROJECT_P.projectManage)}
      canReport={hasPermission(ctx, PROJECT_P.projectReport)}
    />
  );
}
