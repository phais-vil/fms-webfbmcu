import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type { CreateStaffProfileInput, UpdateStaffProfileInput } from "./validations";

export interface DepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  displayOrder: number;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  academicRankTh: string | null;
  academicRankEn: string | null;
  adminPositionTh: string | null;
  adminPositionEn: string | null;
  email: string | null;
  phone: string | null;
  officeRoom: string | null;
  avatarUrl: string | null;
  bioTh: string | null;
  bioEn: string | null;
  researchInterests: string | null;
  isExecutive: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function ensureDefaultDepartments(tenantId: string): Promise<void> {
  const count = await prisma.academicDepartment.count({ where: { tenantId } });
  if (count > 0) return;

  const defaults = [
    { code: "DEAN_OFFICE", nameTh: "สำนักงานคณบดี", nameEn: "Dean's Office", displayOrder: 1 },
    { code: "BUDDHISM", nameTh: "ภาควิชาพระพุทธศาสนา", nameEn: "Department of Buddhism", displayOrder: 2 },
    { code: "PHILOSOPHY", nameTh: "ภาควิชาศาสนาและปรัชญา", nameEn: "Department of Religion and Philosophy", displayOrder: 3 },
  ];

  for (const dept of defaults) {
    await prisma.academicDepartment.create({
      data: {
        tenantId,
        code: dept.code,
        nameTh: dept.nameTh,
        nameEn: dept.nameEn,
        displayOrder: dept.displayOrder,
      },
    });
  }
}

export async function listStaffDepartments(tenantId: string): Promise<DepartmentDto[]> {
  await ensureDefaultDepartments(tenantId);
  const departments = await prisma.academicDepartment.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: "asc" },
  });
  return departments.map((d) => ({
    id: d.id,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    displayOrder: d.displayOrder,
  }));
}

export async function listAdminStaff(
  tenantId: string,
  filter?: { departmentId?: string; search?: string }
): Promise<StaffProfileDto[]> {
  await ensureDefaultDepartments(tenantId);

  const where: Prisma.StaffProfileWhereInput = { tenantId };
  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.search) {
    where.OR = [
      { firstNameTh: { contains: filter.search, mode: "insensitive" } },
      { lastNameTh: { contains: filter.search, mode: "insensitive" } },
      { firstNameEn: { contains: filter.search, mode: "insensitive" } },
      { lastNameEn: { contains: filter.search, mode: "insensitive" } },
      { adminPositionTh: { contains: filter.search, mode: "insensitive" } },
      { adminPositionEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const staffList = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ isExecutive: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return staffList.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department.nameTh,
    departmentNameEn: s.department.nameEn,
    prefixTh: s.prefixTh,
    prefixEn: s.prefixEn,
    firstNameTh: s.firstNameTh,
    lastNameTh: s.lastNameTh,
    firstNameEn: s.firstNameEn,
    lastNameEn: s.lastNameEn,
    fullNameTh: `${s.prefixTh} ${s.firstNameTh} ${s.lastNameTh}`.trim(),
    fullNameEn: `${s.prefixEn} ${s.firstNameEn} ${s.lastNameEn}`.trim(),
    academicRankTh: s.academicRankTh,
    academicRankEn: s.academicRankEn,
    adminPositionTh: s.adminPositionTh,
    adminPositionEn: s.adminPositionEn,
    email: s.email,
    phone: s.phone,
    officeRoom: s.officeRoom,
    avatarUrl: s.avatarUrl,
    bioTh: s.bioTh,
    bioEn: s.bioEn,
    researchInterests: s.researchInterests,
    isExecutive: s.isExecutive,
    isActive: s.isActive,
    displayOrder: s.displayOrder,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function listPublicStaff(
  tenantId: string,
  filter?: { departmentId?: string; search?: string }
): Promise<StaffProfileDto[]> {
  await ensureDefaultDepartments(tenantId);

  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    isActive: true,
  };

  if (filter?.departmentId && filter.departmentId !== "ALL") {
    where.departmentId = filter.departmentId;
  }
  if (filter?.search) {
    where.OR = [
      { firstNameTh: { contains: filter.search, mode: "insensitive" } },
      { lastNameTh: { contains: filter.search, mode: "insensitive" } },
      { firstNameEn: { contains: filter.search, mode: "insensitive" } },
      { lastNameEn: { contains: filter.search, mode: "insensitive" } },
      { adminPositionTh: { contains: filter.search, mode: "insensitive" } },
      { adminPositionEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const staffList = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ isExecutive: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return staffList.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    departmentId: s.departmentId,
    departmentNameTh: s.department.nameTh,
    departmentNameEn: s.department.nameEn,
    prefixTh: s.prefixTh,
    prefixEn: s.prefixEn,
    firstNameTh: s.firstNameTh,
    lastNameTh: s.lastNameTh,
    firstNameEn: s.firstNameEn,
    lastNameEn: s.lastNameEn,
    fullNameTh: `${s.prefixTh} ${s.firstNameTh} ${s.lastNameTh}`.trim(),
    fullNameEn: `${s.prefixEn} ${s.firstNameEn} ${s.lastNameEn}`.trim(),
    academicRankTh: s.academicRankTh,
    academicRankEn: s.academicRankEn,
    adminPositionTh: s.adminPositionTh,
    adminPositionEn: s.adminPositionEn,
    email: s.email,
    phone: s.phone,
    officeRoom: s.officeRoom,
    avatarUrl: s.avatarUrl,
    bioTh: s.bioTh,
    bioEn: s.bioEn,
    researchInterests: s.researchInterests,
    isExecutive: s.isExecutive,
    isActive: s.isActive,
    displayOrder: s.displayOrder,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function createStaffProfile(
  tenantId: string,
  input: CreateStaffProfileInput
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicRankTh: input.academicRankTh ?? null,
      academicRankEn: input.academicRankEn ?? null,
      adminPositionTh: input.adminPositionTh ?? null,
      adminPositionEn: input.adminPositionEn ?? null,
      email: input.email || null,
      phone: input.phone || null,
      officeRoom: input.officeRoom || null,
      avatarUrl: input.avatarUrl || null,
      bioTh: input.bioTh ?? null,
      bioEn: input.bioEn ?? null,
      researchInterests: input.researchInterests ?? null,
      isExecutive: input.isExecutive,
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
    prefixTh: created.prefixTh,
    prefixEn: created.prefixEn,
    firstNameTh: created.firstNameTh,
    lastNameTh: created.lastNameTh,
    firstNameEn: created.firstNameEn,
    lastNameEn: created.lastNameEn,
    fullNameTh: `${created.prefixTh} ${created.firstNameTh} ${created.lastNameTh}`.trim(),
    fullNameEn: `${created.prefixEn} ${created.firstNameEn} ${created.lastNameEn}`.trim(),
    academicRankTh: created.academicRankTh,
    academicRankEn: created.academicRankEn,
    adminPositionTh: created.adminPositionTh,
    adminPositionEn: created.adminPositionEn,
    email: created.email,
    phone: created.phone,
    officeRoom: created.officeRoom,
    avatarUrl: created.avatarUrl,
    bioTh: created.bioTh,
    bioEn: created.bioEn,
    researchInterests: created.researchInterests,
    isExecutive: created.isExecutive,
    isActive: created.isActive,
    displayOrder: created.displayOrder,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateStaffProfile(
  tenantId: string,
  input: UpdateStaffProfileInput
): Promise<StaffProfileDto> {
  await prisma.staffProfile.findFirstOrThrow({
    where: { id: input.id, tenantId },
  });

  const data: Prisma.StaffProfileUncheckedUpdateInput = {};
  if (input.departmentId !== undefined) data.departmentId = input.departmentId;
  if (input.prefixTh !== undefined) data.prefixTh = input.prefixTh;
  if (input.prefixEn !== undefined) data.prefixEn = input.prefixEn;
  if (input.firstNameTh !== undefined) data.firstNameTh = input.firstNameTh;
  if (input.lastNameTh !== undefined) data.lastNameTh = input.lastNameTh;
  if (input.firstNameEn !== undefined) data.firstNameEn = input.firstNameEn;
  if (input.lastNameEn !== undefined) data.lastNameEn = input.lastNameEn;
  if (input.academicRankTh !== undefined) data.academicRankTh = input.academicRankTh;
  if (input.academicRankEn !== undefined) data.academicRankEn = input.academicRankEn;
  if (input.adminPositionTh !== undefined) data.adminPositionTh = input.adminPositionTh;
  if (input.adminPositionEn !== undefined) data.adminPositionEn = input.adminPositionEn;
  if (input.email !== undefined) data.email = input.email || null;
  if (input.phone !== undefined) data.phone = input.phone || null;
  if (input.officeRoom !== undefined) data.officeRoom = input.officeRoom || null;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl || null;
  if (input.bioTh !== undefined) data.bioTh = input.bioTh;
  if (input.bioEn !== undefined) data.bioEn = input.bioEn;
  if (input.researchInterests !== undefined) data.researchInterests = input.researchInterests;
  if (input.isExecutive !== undefined) data.isExecutive = input.isExecutive;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;

  const updated = await prisma.staffProfile.update({
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
    prefixTh: updated.prefixTh,
    prefixEn: updated.prefixEn,
    firstNameTh: updated.firstNameTh,
    lastNameTh: updated.lastNameTh,
    firstNameEn: updated.firstNameEn,
    lastNameEn: updated.lastNameEn,
    fullNameTh: `${updated.prefixTh} ${updated.firstNameTh} ${updated.lastNameTh}`.trim(),
    fullNameEn: `${updated.prefixEn} ${updated.firstNameEn} ${updated.lastNameEn}`.trim(),
    academicRankTh: updated.academicRankTh,
    academicRankEn: updated.academicRankEn,
    adminPositionTh: updated.adminPositionTh,
    adminPositionEn: updated.adminPositionEn,
    email: updated.email,
    phone: updated.phone,
    officeRoom: updated.officeRoom,
    avatarUrl: updated.avatarUrl,
    bioTh: updated.bioTh,
    bioEn: updated.bioEn,
    researchInterests: updated.researchInterests,
    isExecutive: updated.isExecutive,
    isActive: updated.isActive,
    displayOrder: updated.displayOrder,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteStaffProfile(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}

export async function toggleStaffActive(tenantId: string, id: string): Promise<StaffProfileDto> {
  const staff = await prisma.staffProfile.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateStaffProfile(tenantId, { id, isActive: !staff.isActive });
}
