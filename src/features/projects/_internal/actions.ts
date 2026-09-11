"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { PROJECT_P } from "../permissions";
import {
  createProjectSchema,
  updateProjectSchema,
  reportProgressSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ReportProgressInput,
} from "./validations";
import {
  listAnnualProjects,
  getProjectById,
  createAnnualProject,
  updateAnnualProject,
  reportProjectProgress,
  getAnnualBudgetStats,
  type AnnualProjectDto,
} from "./services";
import type { StrategicPillar, ProjectQuarter, ProjectPlanStatus } from "@/generated/prisma";

export async function getAdminProjectsAction(options?: {
  fiscalYear?: number;
  pillar?: StrategicPillar;
  quarter?: ProjectQuarter;
  status?: ProjectPlanStatus;
  search?: string;
}): Promise<ActionResult<AnnualProjectDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectRead);
    return listAnnualProjects(ctx.tenantId, options);
  });
}

export async function getAdminProjectByIdAction(
  id: string
): Promise<ActionResult<AnnualProjectDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectRead);
    return getProjectById(ctx.tenantId, id);
  });
}

export async function createProjectAction(
  rawInput: CreateProjectInput
): Promise<ActionResult<AnnualProjectDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectManage);
    const locale = await getLocale();
    const input = createProjectSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const created = await createAnnualProject(ctx.tenantId, input);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return created;
  });
}

export async function updateProjectAction(
  rawInput: UpdateProjectInput
): Promise<ActionResult<AnnualProjectDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectManage);
    const locale = await getLocale();
    const input = updateProjectSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const updated = await updateAnnualProject(ctx.tenantId, input);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return updated;
  });
}

export async function reportProjectProgressAction(
  rawInput: ReportProgressInput
): Promise<ActionResult<AnnualProjectDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectReport);
    const locale = await getLocale();
    const input = reportProgressSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const updated = await reportProjectProgress(ctx.tenantId, input);
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    return updated;
  });
}

export async function getAdminBudgetStatsAction(
  fiscalYear: number = 2569
): Promise<ActionResult<{
  fiscalYear: number;
  totalProjects: number;
  totalAllocated: number;
  totalSpent: number;
  overallBurnRate: number;
  completedCount: number;
  inProgressCount: number;
  delayedCount: number;
  pillarBreakdown: Record<string, { allocated: number; spent: number; count: number }>;
}>> {
  return runAction(async () => {
    const ctx = await requirePermission(PROJECT_P.projectRead);
    return getAnnualBudgetStats(ctx.tenantId, fiscalYear);
  });
}
