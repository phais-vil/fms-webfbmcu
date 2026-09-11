import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type CertificateType, type StudentRequest, type CertificateCategory, type RequestStatus } from "@/generated/prisma";
import type {
  CreateCertificateTypeInput,
  UpdateCertificateTypeInput,
  SubmitStudentRequestInput,
  ReviewStudentRequestInput,
} from "./validations";

export type CertificateTypeDto = CertificateType;
export type StudentRequestDto = StudentRequest & {
  certificateType?: CertificateType | null;
  tenant?: {
    nameTh: string;
    nameEn: string;
  } | null;
};

export async function listCertificateTypes(
  tenantId: string,
  options?: { category?: CertificateCategory; activeOnly?: boolean }
): Promise<CertificateTypeDto[]> {
  const where: Prisma.CertificateTypeWhereInput = { tenantId };
  if (options?.activeOnly) {
    where.isActive = true;
  }
  if (options?.category) {
    where.category = options.category;
  }

  return prisma.certificateType.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getCertificateTypeById(tenantId: string, id: string): Promise<CertificateTypeDto | null> {
  return prisma.certificateType.findFirst({
    where: { id, tenantId },
  });
}

export async function createCertificateType(tenantId: string, input: CreateCertificateTypeInput): Promise<CertificateTypeDto> {
  return prisma.certificateType.create({
    data: {
      tenantId,
      code: input.code.trim().toUpperCase(),
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      descriptionTh: input.descriptionTh?.trim() || null,
      descriptionEn: input.descriptionEn?.trim() || null,
      category: input.category,
      processingDays: input.processingDays,
      fee: new Prisma.Decimal(input.fee),
      requiresDoc: input.requiresDoc,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    },
  });
}

export async function updateCertificateType(tenantId: string, input: UpdateCertificateTypeInput): Promise<CertificateTypeDto> {
  const data: Prisma.CertificateTypeUpdateInput = {};
  if (input.code !== undefined) data.code = input.code.trim().toUpperCase();
  if (input.nameTh !== undefined) data.nameTh = input.nameTh.trim();
  if (input.nameEn !== undefined) data.nameEn = input.nameEn.trim();
  if (input.descriptionTh !== undefined) data.descriptionTh = input.descriptionTh?.trim() || null;
  if (input.descriptionEn !== undefined) data.descriptionEn = input.descriptionEn?.trim() || null;
  if (input.category !== undefined) data.category = input.category;
  if (input.processingDays !== undefined) data.processingDays = input.processingDays;
  if (input.fee !== undefined) data.fee = new Prisma.Decimal(input.fee);
  if (input.requiresDoc !== undefined) data.requiresDoc = input.requiresDoc;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;

  return prisma.certificateType.update({
    where: { id: input.id, tenantId },
    data,
  });
}

export async function deleteCertificateType(tenantId: string, id: string): Promise<CertificateTypeDto> {
  return prisma.certificateType.delete({
    where: { id, tenantId },
  });
}

export async function submitStudentRequest(tenantId: string, input: SubmitStudentRequestInput): Promise<StudentRequestDto> {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const currentYear = new Date().getFullYear();
  const requestNumber = `REQ-${currentYear}-${randNum}`;

  return prisma.studentRequest.create({
    data: {
      tenantId,
      certificateTypeId: input.certificateTypeId,
      requestNumber,
      studentCode: input.studentCode.trim(),
      titleTh: input.titleTh?.trim() || null,
      firstNameTh: input.firstNameTh.trim(),
      lastNameTh: input.lastNameTh.trim(),
      firstNameEn: input.firstNameEn?.trim() || null,
      lastNameEn: input.lastNameEn?.trim() || null,
      degreeLevel: input.degreeLevel,
      majorProgram: input.majorProgram.trim(),
      yearLevel: input.yearLevel,
      email: input.email.trim(),
      phone: input.phone.trim(),
      purpose: input.purpose.trim(),
      copies: input.copies,
      status: "PENDING",
    },
    include: {
      certificateType: true,
    },
  });
}

export async function listStudentRequests(
  tenantId: string,
  options?: {
    status?: string;
    certificateTypeId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<{
  items: StudentRequestDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.StudentRequestWhereInput = { tenantId };

  if (options?.status && options.status !== "ALL") {
    where.status = options.status as RequestStatus;
  }

  if (options?.certificateTypeId && options.certificateTypeId !== "ALL") {
    where.certificateTypeId = options.certificateTypeId;
  }

  if (options?.search) {
    const q = options.search.trim();
    where.OR = [
      { studentCode: { contains: q, mode: "insensitive" } },
      { requestNumber: { contains: q, mode: "insensitive" } },
      { verificationCode: { contains: q, mode: "insensitive" } },
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.studentRequest.findMany({
      where,
      include: {
        certificateType: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.studentRequest.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getStudentRequestsByCode(tenantId: string, studentCode: string): Promise<StudentRequestDto[]> {
  return prisma.studentRequest.findMany({
    where: {
      tenantId,
      studentCode: studentCode.trim(),
    },
    include: {
      certificateType: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentRequestById(tenantId: string, id: string): Promise<StudentRequestDto | null> {
  return prisma.studentRequest.findFirst({
    where: { id, tenantId },
    include: {
      certificateType: true,
    },
  });
}

export async function reviewStudentRequest(tenantId: string, input: ReviewStudentRequestInput): Promise<StudentRequestDto> {
  const existing = await prisma.studentRequest.findFirst({
    where: { id: input.id, tenantId },
  });

  if (!existing) {
    throw new Error("Student request not found");
  }

  const data: Prisma.StudentRequestUpdateInput = {
    status: input.status,
    approverNotes: input.approverNotes?.trim() || null,
    rejectionReason: input.rejectionReason?.trim() || null,
  };

  if (input.status === "APPROVED") {
    if (!existing.verificationCode) {
      const year = new Date().getFullYear();
      const codeSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      data.verificationCode = `MCU-FMS-${year}-${codeSuffix}`;
    }
    const now = new Date();
    data.issuedAt = now;
    // Valid for 180 days
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 180);
    data.expiresAt = expires;
  }

  return prisma.studentRequest.update({
    where: { id: input.id, tenantId },
    data,
    include: {
      certificateType: true,
    },
  });
}

/**
 * Public Verification lookup by verification code
 */
export async function verifyCertificateByCode(verificationCode: string): Promise<StudentRequestDto | null> {
  const code = verificationCode.trim().toUpperCase();
  return prisma.studentRequest.findFirst({
    where: {
      verificationCode: code,
      status: "APPROVED",
    },
    include: {
      certificateType: true,
      tenant: {
        select: {
          nameTh: true,
          nameEn: true,
        },
      },
    },
  });
}
