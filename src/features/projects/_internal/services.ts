import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma } from "@/generated/prisma";
import type {
  AnnualProject,
  ProjectProgressUpdate,
  StrategicPillar,
  ProjectQuarter,
  ProjectPlanStatus,
} from "@/generated/prisma";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ReportProgressInput,
} from "./validations";

export type ProjectProgressUpdateDto = Omit<ProjectProgressUpdate, "spentAmount"> & {
  spentAmount: number;
};

export type AnnualProjectDto = Omit<AnnualProject, "allocatedBudget" | "spentBudget"> & {
  allocatedBudget: number;
  spentBudget: number;
  burnRate: number;
  updates?: ProjectProgressUpdateDto[];
};

function mapProject(
  p: AnnualProject & { updates?: ProjectProgressUpdate[] }
): AnnualProjectDto {
  const allocated = Number(p.allocatedBudget);
  const spent = Number(p.spentBudget);
  const burnRate = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  return {
    ...p,
    allocatedBudget: allocated,
    spentBudget: spent,
    burnRate,
    updates: p.updates?.map((u) => ({
      ...u,
      spentAmount: Number(u.spentAmount),
    })),
  };
}

export async function listAnnualProjects(
  tenantId: string,
  options?: {
    fiscalYear?: number;
    pillar?: StrategicPillar;
    quarter?: ProjectQuarter;
    status?: ProjectPlanStatus;
    search?: string;
  }
): Promise<AnnualProjectDto[]> {
  const where: Prisma.AnnualProjectWhereInput = { tenantId };

  if (options?.fiscalYear) where.fiscalYear = options.fiscalYear;
  if (options?.pillar) where.pillar = options.pillar;
  if (options?.quarter) where.quarter = options.quarter;
  if (options?.status) where.status = options.status;

  if (options?.search) {
    const q = options.search.trim();
    where.OR = [
      { projectCode: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { responsiblePerson: { contains: q, mode: "insensitive" } },
      { department: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.annualProject.findMany({
    where,
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ quarter: "asc" }, { createdAt: "desc" }],
  });

  return items.map(mapProject);
}

export async function getProjectById(
  tenantId: string,
  id: string
): Promise<AnnualProjectDto | null> {
  const item = await prisma.annualProject.findFirst({
    where: { id, tenantId },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!item) return null;
  return mapProject(item);
}

export async function createAnnualProject(
  tenantId: string,
  input: CreateProjectInput
): Promise<AnnualProjectDto> {
  const count = await prisma.annualProject.count({
    where: { tenantId, fiscalYear: input.fiscalYear },
  });
  const projectCode = `PRJ-${input.fiscalYear}-${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.annualProject.create({
    data: {
      tenantId,
      projectCode,
      fiscalYear: input.fiscalYear,
      title: input.title.trim(),
      pillar: input.pillar,
      quarter: input.quarter,
      department: input.department?.trim() || null,
      responsiblePerson: input.responsiblePerson.trim(),
      responsibleEmail: input.responsibleEmail?.trim() || null,
      allocatedBudget: new Prisma.Decimal(input.allocatedBudget),
      spentBudget: new Prisma.Decimal(0),
      targetKpi: input.targetKpi.trim(),
      progressPercent: 0,
      status: "PROPOSED",
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      remarks: input.remarks?.trim() || null,
    },
    include: {
      updates: true,
    },
  });

  return mapProject(created);
}

export async function updateAnnualProject(
  tenantId: string,
  input: UpdateProjectInput
): Promise<AnnualProjectDto> {
  const data: Prisma.AnnualProjectUpdateInput = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.pillar !== undefined) data.pillar = input.pillar;
  if (input.quarter !== undefined) data.quarter = input.quarter;
  if (input.department !== undefined) data.department = input.department?.trim() || null;
  if (input.responsiblePerson !== undefined) data.responsiblePerson = input.responsiblePerson.trim();
  if (input.responsibleEmail !== undefined) data.responsibleEmail = input.responsibleEmail?.trim() || null;
  if (input.allocatedBudget !== undefined) data.allocatedBudget = new Prisma.Decimal(input.allocatedBudget);
  if (input.targetKpi !== undefined) data.targetKpi = input.targetKpi.trim();
  if (input.actualResult !== undefined) data.actualResult = input.actualResult?.trim() || null;
  if (input.progressPercent !== undefined) data.progressPercent = input.progressPercent;
  if (input.status !== undefined) data.status = input.status;
  if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null;
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.remarks !== undefined) data.remarks = input.remarks?.trim() || null;

  const updated = await prisma.annualProject.update({
    where: { id: input.id, tenantId },
    data,
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return mapProject(updated);
}

export async function reportProjectProgress(
  tenantId: string,
  input: ReportProgressInput
): Promise<AnnualProjectDto> {
  const existing = await prisma.annualProject.findFirst({
    where: { id: input.projectId, tenantId },
  });

  if (!existing) {
    throw new Error("ไม่พบโครงการที่ระบุ");
  }

  const currentSpent = Number(existing.spentBudget);
  const newTotalSpent = currentSpent + input.spentAmount;

  let newStatus = input.status || existing.status;
  if (input.progressPercent >= 100) {
    newStatus = "COMPLETED";
  } else if (input.progressPercent > 0 && newStatus === "PROPOSED") {
    newStatus = "IN_PROGRESS";
  }

  const updated = await prisma.annualProject.update({
    where: { id: input.projectId },
    data: {
      progressPercent: input.progressPercent,
      spentBudget: new Prisma.Decimal(newTotalSpent),
      status: newStatus,
      actualResult: input.actualResult ? input.actualResult.trim() : existing.actualResult,
      updates: {
        create: {
          progressPercent: input.progressPercent,
          spentAmount: new Prisma.Decimal(input.spentAmount),
          reportNote: input.reportNote.trim(),
          reporterName: input.reporterName.trim(),
        },
      },
    },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return mapProject(updated);
}

export async function getAnnualBudgetStats(tenantId: string, fiscalYear: number = 2569) {
  const projects = await prisma.annualProject.findMany({
    where: { tenantId, fiscalYear },
  });

  let totalAllocated = 0;
  let totalSpent = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let delayedCount = 0;

  const pillarBreakdown: Record<string, { allocated: number; spent: number; count: number }> = {
    DHAMMA_STUDY: { allocated: 0, spent: 0, count: 0 },
    RESEARCH_INNOVATION: { allocated: 0, spent: 0, count: 0 },
    ACADEMIC_SERVICES: { allocated: 0, spent: 0, count: 0 },
    CULTURE_PRESERVATION: { allocated: 0, spent: 0, count: 0 },
    ORGANIZATION_EXCELLENCE: { allocated: 0, spent: 0, count: 0 },
  };

  for (const p of projects) {
    const alloc = Number(p.allocatedBudget);
    const spent = Number(p.spentBudget);
    totalAllocated += alloc;
    totalSpent += spent;

    if (p.status === "COMPLETED") completedCount++;
    if (p.status === "IN_PROGRESS") inProgressCount++;
    if (p.status === "DELAYED") delayedCount++;

    if (pillarBreakdown[p.pillar]) {
      pillarBreakdown[p.pillar].allocated += alloc;
      pillarBreakdown[p.pillar].spent += spent;
      pillarBreakdown[p.pillar].count += 1;
    }
  }

  const overallBurnRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return {
    fiscalYear,
    totalProjects: projects.length,
    totalAllocated,
    totalSpent,
    overallBurnRate,
    completedCount,
    inProgressCount,
    delayedCount,
    pillarBreakdown,
  };
}
