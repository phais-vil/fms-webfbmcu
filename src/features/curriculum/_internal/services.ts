import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, DegreeLevel } from "@/generated/prisma";
import type { CreateCurriculumInput, UpdateCurriculumInput } from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeAbbrTh: string;
  degreeAbbrEn: string;
  degreeLevel: DegreeLevel;
  totalCredits: number;
  durationYears: number;
  philosophyTh: string | null;
  philosophyEn: string | null;
  careerOpportunitiesTh: string | null;
  careerOpportunitiesEn: string | null;
  tuitionFees: string | null;
  coverImage: string | null;
  curriculumPdfUrl: string | null;
  effectiveYear: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function listAdminCurriculums(
  tenantId: string,
  filter?: { degreeLevel?: string; departmentId?: string; search?: string }
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = { tenantId };

  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.degreeLevel = filter.degreeLevel as DegreeLevel;
  }
  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrTh: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const list = await prisma.curriculum.findMany({
    where,
    include: { department: true },
    orderBy: [{ degreeLevel: "asc" }, { displayOrder: "asc" }, { code: "asc" }],
  });

  return list.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    departmentId: c.departmentId,
    departmentNameTh: c.department.nameTh,
    departmentNameEn: c.department.nameEn,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    degreeAbbrTh: c.degreeAbbrTh,
    degreeAbbrEn: c.degreeAbbrEn,
    degreeLevel: c.degreeLevel,
    totalCredits: c.totalCredits,
    durationYears: c.durationYears,
    philosophyTh: c.philosophyTh,
    philosophyEn: c.philosophyEn,
    careerOpportunitiesTh: c.careerOpportunitiesTh,
    careerOpportunitiesEn: c.careerOpportunitiesEn,
    tuitionFees: c.tuitionFees,
    coverImage: c.coverImage,
    curriculumPdfUrl: c.curriculumPdfUrl,
    effectiveYear: c.effectiveYear,
    isActive: c.isActive,
    displayOrder: c.displayOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function listPublicCurriculums(
  tenantId: string,
  filter?: { degreeLevel?: string; departmentId?: string; search?: string }
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = {
    tenantId,
    isActive: true,
  };

  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.degreeLevel = filter.degreeLevel as DegreeLevel;
  }
  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrTh: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const list = await prisma.curriculum.findMany({
    where,
    include: { department: true },
    orderBy: [{ degreeLevel: "asc" }, { displayOrder: "asc" }, { code: "asc" }],
  });

  return list.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    departmentId: c.departmentId,
    departmentNameTh: c.department.nameTh,
    departmentNameEn: c.department.nameEn,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    degreeAbbrTh: c.degreeAbbrTh,
    degreeAbbrEn: c.degreeAbbrEn,
    degreeLevel: c.degreeLevel,
    totalCredits: c.totalCredits,
    durationYears: c.durationYears,
    philosophyTh: c.philosophyTh,
    philosophyEn: c.philosophyEn,
    careerOpportunitiesTh: c.careerOpportunitiesTh,
    careerOpportunitiesEn: c.careerOpportunitiesEn,
    tuitionFees: c.tuitionFees,
    coverImage: c.coverImage,
    curriculumPdfUrl: c.curriculumPdfUrl,
    effectiveYear: c.effectiveYear,
    isActive: c.isActive,
    displayOrder: c.displayOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getPublicCurriculumByCode(
  tenantId: string,
  code: string
): Promise<CurriculumDto | null> {
  const c = await prisma.curriculum.findFirst({
    where: { tenantId, code, isActive: true },
    include: { department: true },
  });

  if (!c) return null;

  return {
    id: c.id,
    tenantId: c.tenantId,
    departmentId: c.departmentId,
    departmentNameTh: c.department.nameTh,
    departmentNameEn: c.department.nameEn,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    degreeTh: c.degreeTh,
    degreeEn: c.degreeEn,
    degreeAbbrTh: c.degreeAbbrTh,
    degreeAbbrEn: c.degreeAbbrEn,
    degreeLevel: c.degreeLevel,
    totalCredits: c.totalCredits,
    durationYears: c.durationYears,
    philosophyTh: c.philosophyTh,
    philosophyEn: c.philosophyEn,
    careerOpportunitiesTh: c.careerOpportunitiesTh,
    careerOpportunitiesEn: c.careerOpportunitiesEn,
    tuitionFees: c.tuitionFees,
    coverImage: c.coverImage,
    curriculumPdfUrl: c.curriculumPdfUrl,
    effectiveYear: c.effectiveYear,
    isActive: c.isActive,
    displayOrder: c.displayOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function createCurriculum(
  tenantId: string,
  input: CreateCurriculumInput
): Promise<CurriculumDto> {
  const created = await prisma.curriculum.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      code: input.code.trim().toUpperCase(),
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      degreeTh: input.degreeTh.trim(),
      degreeEn: input.degreeEn.trim(),
      degreeAbbrTh: input.degreeAbbrTh.trim(),
      degreeAbbrEn: input.degreeAbbrEn.trim(),
      degreeLevel: input.degreeLevel as DegreeLevel,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      philosophyTh: input.philosophyTh || null,
      philosophyEn: input.philosophyEn || null,
      careerOpportunitiesTh: input.careerOpportunitiesTh || null,
      careerOpportunitiesEn: input.careerOpportunitiesEn || null,
      tuitionFees: input.tuitionFees || null,
      coverImage: input.coverImage || null,
      curriculumPdfUrl: input.curriculumPdfUrl || null,
      effectiveYear: input.effectiveYear,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    },
    include: { department: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    departmentId: created.departmentId,
    departmentNameTh: created.department.nameTh,
    departmentNameEn: created.department.nameEn,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    degreeTh: created.degreeTh,
    degreeEn: created.degreeEn,
    degreeAbbrTh: created.degreeAbbrTh,
    degreeAbbrEn: created.degreeAbbrEn,
    degreeLevel: created.degreeLevel,
    totalCredits: created.totalCredits,
    durationYears: created.durationYears,
    philosophyTh: created.philosophyTh,
    philosophyEn: created.philosophyEn,
    careerOpportunitiesTh: created.careerOpportunitiesTh,
    careerOpportunitiesEn: created.careerOpportunitiesEn,
    tuitionFees: created.tuitionFees,
    coverImage: created.coverImage,
    curriculumPdfUrl: created.curriculumPdfUrl,
    effectiveYear: created.effectiveYear,
    isActive: created.isActive,
    displayOrder: created.displayOrder,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateCurriculum(
  tenantId: string,
  input: UpdateCurriculumInput
): Promise<CurriculumDto> {
  await prisma.curriculum.findFirstOrThrow({
    where: { id: input.id, tenantId },
  });

  const data: Prisma.CurriculumUncheckedUpdateInput = {};
  if (input.departmentId !== undefined) data.departmentId = input.departmentId;
  if (input.code !== undefined) data.code = input.code.trim().toUpperCase();
  if (input.nameTh !== undefined) data.nameTh = input.nameTh.trim();
  if (input.nameEn !== undefined) data.nameEn = input.nameEn.trim();
  if (input.degreeTh !== undefined) data.degreeTh = input.degreeTh.trim();
  if (input.degreeEn !== undefined) data.degreeEn = input.degreeEn.trim();
  if (input.degreeAbbrTh !== undefined) data.degreeAbbrTh = input.degreeAbbrTh.trim();
  if (input.degreeAbbrEn !== undefined) data.degreeAbbrEn = input.degreeAbbrEn.trim();
  if (input.degreeLevel !== undefined) data.degreeLevel = input.degreeLevel as DegreeLevel;
  if (input.totalCredits !== undefined) data.totalCredits = input.totalCredits;
  if (input.durationYears !== undefined) data.durationYears = input.durationYears;
  if (input.philosophyTh !== undefined) data.philosophyTh = input.philosophyTh;
  if (input.philosophyEn !== undefined) data.philosophyEn = input.philosophyEn;
  if (input.careerOpportunitiesTh !== undefined) data.careerOpportunitiesTh = input.careerOpportunitiesTh;
  if (input.careerOpportunitiesEn !== undefined) data.careerOpportunitiesEn = input.careerOpportunitiesEn;
  if (input.tuitionFees !== undefined) data.tuitionFees = input.tuitionFees;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage || null;
  if (input.curriculumPdfUrl !== undefined) data.curriculumPdfUrl = input.curriculumPdfUrl || null;
  if (input.effectiveYear !== undefined) data.effectiveYear = input.effectiveYear;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;

  const updated = await prisma.curriculum.update({
    where: { id: input.id },
    data,
    include: { department: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department.nameTh,
    departmentNameEn: updated.department.nameEn,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    degreeTh: updated.degreeTh,
    degreeEn: updated.degreeEn,
    degreeAbbrTh: updated.degreeAbbrTh,
    degreeAbbrEn: updated.degreeAbbrEn,
    degreeLevel: updated.degreeLevel,
    totalCredits: updated.totalCredits,
    durationYears: updated.durationYears,
    philosophyTh: updated.philosophyTh,
    philosophyEn: updated.philosophyEn,
    careerOpportunitiesTh: updated.careerOpportunitiesTh,
    careerOpportunitiesEn: updated.careerOpportunitiesEn,
    tuitionFees: updated.tuitionFees,
    coverImage: updated.coverImage,
    curriculumPdfUrl: updated.curriculumPdfUrl,
    effectiveYear: updated.effectiveYear,
    isActive: updated.isActive,
    displayOrder: updated.displayOrder,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteCurriculum(tenantId: string, id: string): Promise<void> {
  await prisma.curriculum.delete({
    where: { id, tenantId },
  });
}

export async function toggleCurriculumActive(tenantId: string, id: string): Promise<CurriculumDto> {
  const current = await prisma.curriculum.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateCurriculum(tenantId, { id, isActive: !current.isActive });
}
