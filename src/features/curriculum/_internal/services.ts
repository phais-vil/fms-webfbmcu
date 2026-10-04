import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, DegreeLevel } from "@/generated/prisma";
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateScheduleInput,
  UpdateScheduleInput,
} from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  code: string;
  nameTh: string;
  nameEn: string;
  majorTh: string | null;
  majorEn: string | null;
  programLanguage: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCurriculum(c: any): CurriculumDto {
  return {
    id: c.id,
    tenantId: c.tenantId,
    departmentId: c.departmentId,
    departmentNameTh: c.department?.nameTh || "",
    departmentNameEn: c.department?.nameEn || "",
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    majorTh: c.majorTh || null,
    majorEn: c.majorEn || null,
    programLanguage: c.programLanguage || "THAI",
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

export async function listAdminCurriculums(
  tenantId: string,
  filter?: {
    degreeLevel?: string;
    departmentId?: string;
    programLanguage?: string;
    search?: string;
  }
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = { tenantId };

  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.degreeLevel = filter.degreeLevel as DegreeLevel;
  }
  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.programLanguage && filter.programLanguage !== "ALL") {
    where.programLanguage = filter.programLanguage;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { majorTh: { contains: filter.search, mode: "insensitive" } },
      { majorEn: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrTh: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const list = await prisma.curriculum.findMany({
    where,
    include: { department: true },
    orderBy: [{ degreeLevel: "asc" }, { displayOrder: "asc" }, { code: "asc" }],
  });

  return list.map(mapCurriculum);
}

export async function listPublicCurriculums(
  tenantId: string,
  filter?: {
    degreeLevel?: string;
    departmentId?: string;
    programLanguage?: string;
    search?: string;
  }
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
  if (filter?.programLanguage && filter.programLanguage !== "ALL") {
    where.programLanguage = filter.programLanguage;
  }
  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { majorTh: { contains: filter.search, mode: "insensitive" } },
      { majorEn: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrTh: { contains: filter.search, mode: "insensitive" } },
      { degreeAbbrEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const list = await prisma.curriculum.findMany({
    where,
    include: { department: true },
    orderBy: [{ degreeLevel: "asc" }, { displayOrder: "asc" }, { code: "asc" }],
  });

  return list.map(mapCurriculum);
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
  return mapCurriculum(c);
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
      majorTh: input.majorTh?.trim() || null,
      majorEn: input.majorEn?.trim() || null,
      programLanguage: input.programLanguage || "THAI",
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

  return mapCurriculum(created);
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
  if (input.majorTh !== undefined) data.majorTh = input.majorTh?.trim() || null;
  if (input.majorEn !== undefined) data.majorEn = input.majorEn?.trim() || null;
  if (input.programLanguage !== undefined) data.programLanguage = input.programLanguage;
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

  return mapCurriculum(updated);
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

export interface AcademicDepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  curriculumsCount: number;
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function listAdminDepartments(
  tenantId: string,
  search?: string
): Promise<AcademicDepartmentDto[]> {
  const where: Prisma.AcademicDepartmentWhereInput = { tenantId };
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { nameTh: { contains: search, mode: "insensitive" } },
      { nameEn: { contains: search, mode: "insensitive" } },
    ];
  }
  const list = await prisma.academicDepartment.findMany({
    where,
    include: {
      _count: {
        select: {
          curriculums: true,
          staffProfiles: true,
        },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
  });

  return list.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    curriculumsCount: d._count.curriculums,
    staffCount: d._count.staffProfiles,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function getDepartmentById(
  tenantId: string,
  id: string
): Promise<AcademicDepartmentDto | null> {
  const d = await prisma.academicDepartment.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          curriculums: true,
          staffProfiles: true,
        },
      },
    },
  });
  if (!d) return null;
  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    curriculumsCount: d._count.curriculums,
    staffCount: d._count.staffProfiles,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput
): Promise<AcademicDepartmentDto> {
  const existing = await prisma.academicDepartment.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existing) {
    throw new Error("curriculum.dept.duplicateCode");
  }

  const d = await prisma.academicDepartment.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      description: input.description ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      _count: {
        select: {
          curriculums: true,
          staffProfiles: true,
        },
      },
    },
  });

  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    curriculumsCount: d._count.curriculums,
    staffCount: d._count.staffProfiles,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput
): Promise<AcademicDepartmentDto> {
  const { id, ...data } = input;
  if (data.code) {
    const existing = await prisma.academicDepartment.findFirst({
      where: { tenantId, code: data.code, NOT: { id } },
    });
    if (existing) {
      throw new Error("curriculum.dept.duplicateCode");
    }
  }

  const d = await prisma.academicDepartment.update({
    where: { id, tenantId },
    data,
    include: {
      _count: {
        select: {
          curriculums: true,
          staffProfiles: true,
        },
      },
    },
  });

  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    curriculumsCount: d._count.curriculums,
    staffCount: d._count.staffProfiles,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function deleteDepartment(tenantId: string, id: string): Promise<void> {
  const d = await prisma.academicDepartment.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          curriculums: true,
          staffProfiles: true,
        },
      },
    },
  });
  if (!d) {
    throw new Error("curriculum.dept.notFound");
  }
  if (d._count.curriculums > 0) {
    throw new Error("curriculum.dept.hasCurriculums");
  }
  if (d._count.staffProfiles > 0) {
    throw new Error("curriculum.dept.hasStaff");
  }

  await prisma.academicDepartment.delete({
    where: { id, tenantId },
  });
}

export async function toggleDepartmentActive(
  tenantId: string,
  id: string
): Promise<AcademicDepartmentDto> {
  const current = await prisma.academicDepartment.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateDepartment(tenantId, { id, isActive: !current.isActive });
}

// ---------------------------------------------------------------------------
// Class Schedule Services
// ---------------------------------------------------------------------------

export interface ClassScheduleItemDto {
  id: string;
  scheduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotPeriod: string | null;
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string | null;
  instructorsTh: string;
  instructorsEn: string | null;
  roomOrNote: string | null;
  displayOrder: number;
}

export interface ClassScheduleDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  curriculumId: string | null;
  curriculumCode: string | null;
  curriculumNameTh: string | null;
  curriculumNameEn: string | null;
  degreeLevel: DegreeLevel | null;
  academicYear: number;
  semester: number;
  yearLevel: number;
  titleTh: string;
  titleEn: string | null;
  targetGroupTh: string | null;
  targetGroupEn: string | null;
  roomLocationTh: string | null;
  roomLocationEn: string | null;
  startDate: string | null;
  endDate: string | null;
  remarksTh: string | null;
  remarksEn: string | null;
  fileUrl: string | null;
  isActive: boolean;
  items: ClassScheduleItemDto[];
  createdAt: string;
  updatedAt: string;
}

type ScheduleWithRelations = Prisma.ClassScheduleGetPayload<{
  include: {
    department: true;
    curriculum: true;
    items: true;
  };
}>;

function mapScheduleToDto(s: ScheduleWithRelations): ClassScheduleDto {
  return {
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department?.nameTh ?? "",
    departmentNameEn: s.department?.nameEn ?? "",
    curriculumId: s.curriculumId ?? null,
    curriculumCode: s.curriculum?.code ?? null,
    curriculumNameTh: s.curriculum?.nameTh ?? null,
    curriculumNameEn: s.curriculum?.nameEn ?? null,
    degreeLevel: s.curriculum?.degreeLevel ?? null,
    academicYear: s.academicYear,
    semester: s.semester,
    yearLevel: s.yearLevel,
    titleTh: s.titleTh,
    titleEn: s.titleEn,
    targetGroupTh: s.targetGroupTh,
    targetGroupEn: s.targetGroupEn,
    roomLocationTh: s.roomLocationTh,
    roomLocationEn: s.roomLocationEn,
    startDate: s.startDate ? s.startDate.toISOString().slice(0, 10) : null,
    endDate: s.endDate ? s.endDate.toISOString().slice(0, 10) : null,
    remarksTh: s.remarksTh,
    remarksEn: s.remarksEn,
    fileUrl: s.fileUrl,
    isActive: s.isActive,
    items: (s.items || []).map((item) => ({
      id: item.id,
      scheduleId: item.scheduleId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      slotPeriod: item.slotPeriod,
      courseCode: item.courseCode,
      courseNameTh: item.courseNameTh,
      courseNameEn: item.courseNameEn,
      instructorsTh: item.instructorsTh,
      instructorsEn: item.instructorsEn,
      roomOrNote: item.roomOrNote,
      displayOrder: item.displayOrder,
    })),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function listAdminSchedules(
  tenantId: string,
  filter?: {
    departmentId?: string;
    curriculumId?: string;
    academicYear?: number;
    semester?: number;
    yearLevel?: number;
    search?: string;
  }
): Promise<ClassScheduleDto[]> {
  const where: Prisma.ClassScheduleWhereInput = { tenantId };

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.curriculumId && filter.curriculumId !== "ALL") {
    where.curriculumId = filter.curriculumId;
  }
  if (filter?.academicYear) {
    where.academicYear = filter.academicYear;
  }
  if (filter?.semester) {
    where.semester = filter.semester;
  }
  if (filter?.yearLevel) {
    where.yearLevel = filter.yearLevel;
  }
  if (filter?.search) {
    where.OR = [
      { titleTh: { contains: filter.search, mode: "insensitive" } },
      { roomLocationTh: { contains: filter.search, mode: "insensitive" } },
      { targetGroupTh: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.classSchedule.findMany({
    where,
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }, { displayOrder: "asc" }],
      },
    },
    orderBy: [
      { academicYear: "desc" },
      { semester: "asc" },
      { yearLevel: "asc" },
      { createdAt: "desc" },
    ],
  });

  return rows.map(mapScheduleToDto);
}

export async function getScheduleById(
  tenantId: string,
  id: string
): Promise<ClassScheduleDto | null> {
  const s = await prisma.classSchedule.findFirst({
    where: { id, tenantId },
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }, { displayOrder: "asc" }],
      },
    },
  });

  if (!s) return null;
  return mapScheduleToDto(s);
}

function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return null;
  const d = new Date(dateStr.trim());
  return isNaN(d.getTime()) ? null : d;
}

export async function createSchedule(
  tenantId: string,
  input: CreateScheduleInput
): Promise<ClassScheduleDto> {
  const created = await prisma.classSchedule.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      curriculumId: input.curriculumId || null,
      academicYear: input.academicYear,
      semester: input.semester,
      yearLevel: input.yearLevel,
      titleTh: input.titleTh,
      titleEn: input.titleEn || null,
      targetGroupTh: input.targetGroupTh || null,
      targetGroupEn: input.targetGroupEn || null,
      roomLocationTh: input.roomLocationTh || null,
      roomLocationEn: input.roomLocationEn || null,
      startDate: parseDateSafe(input.startDate),
      endDate: parseDateSafe(input.endDate),
      remarksTh: input.remarksTh || null,
      remarksEn: input.remarksEn || null,
      fileUrl: input.fileUrl || null,
      isActive: input.isActive ?? true,
      items: {
        create: (input.items || []).map((item, idx) => ({
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          slotPeriod: item.slotPeriod || null,
          courseCode: item.courseCode,
          courseNameTh: item.courseNameTh,
          courseNameEn: item.courseNameEn || null,
          instructorsTh: item.instructorsTh,
          instructorsEn: item.instructorsEn || null,
          roomOrNote: item.roomOrNote || null,
          displayOrder: item.displayOrder ?? idx,
        })),
      },
    },
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  return mapScheduleToDto(created);
}

export async function updateSchedule(
  tenantId: string,
  input: UpdateScheduleInput
): Promise<ClassScheduleDto> {
  const existing = await prisma.classSchedule.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("curriculum.schedule.notFound");
  }

  // Update schedule and replace items in transaction if items provided
  const updated = await prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.classScheduleItem.deleteMany({
        where: { scheduleId: input.id },
      });
      await tx.classScheduleItem.createMany({
        data: input.items.map((item, idx) => ({
          scheduleId: input.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          slotPeriod: item.slotPeriod || null,
          courseCode: item.courseCode,
          courseNameTh: item.courseNameTh,
          courseNameEn: item.courseNameEn || null,
          instructorsTh: item.instructorsTh,
          instructorsEn: item.instructorsEn || null,
          roomOrNote: item.roomOrNote || null,
          displayOrder: item.displayOrder ?? idx,
        })),
      });
    }

    return tx.classSchedule.update({
      where: { id: input.id },
      data: {
        departmentId: input.departmentId,
        curriculumId: input.curriculumId === undefined ? undefined : input.curriculumId || null,
        academicYear: input.academicYear,
        semester: input.semester,
        yearLevel: input.yearLevel,
        titleTh: input.titleTh,
        titleEn: input.titleEn === undefined ? undefined : input.titleEn || null,
        targetGroupTh: input.targetGroupTh === undefined ? undefined : input.targetGroupTh || null,
        targetGroupEn: input.targetGroupEn === undefined ? undefined : input.targetGroupEn || null,
        roomLocationTh: input.roomLocationTh === undefined ? undefined : input.roomLocationTh || null,
        roomLocationEn: input.roomLocationEn === undefined ? undefined : input.roomLocationEn || null,
        startDate: input.startDate === undefined ? undefined : parseDateSafe(input.startDate),
        endDate: input.endDate === undefined ? undefined : parseDateSafe(input.endDate),
        remarksTh: input.remarksTh === undefined ? undefined : input.remarksTh || null,
        remarksEn: input.remarksEn === undefined ? undefined : input.remarksEn || null,
        fileUrl: input.fileUrl === undefined ? undefined : input.fileUrl || null,
        isActive: input.isActive,
      },
      include: {
        department: true,
        curriculum: true,
        items: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });
  });

  return mapScheduleToDto(updated);
}

export async function deleteSchedule(tenantId: string, id: string): Promise<void> {
  const existing = await prisma.classSchedule.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new Error("curriculum.schedule.notFound");
  }

  await prisma.classSchedule.delete({
    where: { id },
  });
}

export async function toggleScheduleActive(
  tenantId: string,
  id: string
): Promise<ClassScheduleDto> {
  const existing = await prisma.classSchedule.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateSchedule(tenantId, { id, isActive: !existing.isActive });
}

// ---------------------------------------------------------------------------
// Public Schedule Queries (Portal)
// ---------------------------------------------------------------------------

export async function listPublicSchedules(
  tenantId: string,
  filter?: {
    departmentId?: string;
    curriculumId?: string;
    degreeLevel?: string;
    academicYear?: number;
    semester?: number;
    yearLevel?: number;
    search?: string;
  }
): Promise<ClassScheduleDto[]> {
  const where: Prisma.ClassScheduleWhereInput = {
    tenantId,
    isActive: true,
  };

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.curriculumId && filter.curriculumId !== "ALL") {
    where.curriculumId = filter.curriculumId;
  }
  if (filter?.degreeLevel && filter.degreeLevel !== "ALL") {
    where.curriculum = {
      degreeLevel: filter.degreeLevel as DegreeLevel,
    };
  }
  if (filter?.academicYear) {
    where.academicYear = filter.academicYear;
  }
  if (filter?.semester) {
    where.semester = filter.semester;
  }
  if (filter?.yearLevel) {
    where.yearLevel = filter.yearLevel;
  }
  if (filter?.search) {
    where.OR = [
      { titleTh: { contains: filter.search, mode: "insensitive" } },
      { roomLocationTh: { contains: filter.search, mode: "insensitive" } },
      { targetGroupTh: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.classSchedule.findMany({
    where,
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }, { displayOrder: "asc" }],
      },
    },
    orderBy: [
      { academicYear: "desc" },
      { semester: "asc" },
      { yearLevel: "asc" },
      { createdAt: "desc" },
    ],
  });

  return rows.map(mapScheduleToDto);
}

export async function getPublicScheduleById(
  tenantId: string,
  id: string
): Promise<ClassScheduleDto | null> {
  const s = await prisma.classSchedule.findFirst({
    where: { id, tenantId, isActive: true },
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }, { displayOrder: "asc" }],
      },
    },
  });

  if (!s) return null;
  return mapScheduleToDto(s);
}

export async function getPublicSchedulesByCurriculum(
  tenantId: string,
  curriculumId: string
): Promise<ClassScheduleDto[]> {
  const rows = await prisma.classSchedule.findMany({
    where: { tenantId, curriculumId, isActive: true },
    include: {
      department: true,
      curriculum: true,
      items: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }, { displayOrder: "asc" }],
      },
    },
    orderBy: [
      { academicYear: "desc" },
      { semester: "asc" },
      { yearLevel: "asc" },
    ],
  });

  return rows.map(mapScheduleToDto);
}


