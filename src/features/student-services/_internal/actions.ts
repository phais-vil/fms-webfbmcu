"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, auth } from "@/features/identity/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { STUDENT_SERVICES_P } from "../permissions";
import {
  createCertificateTypeSchema,
  updateCertificateTypeSchema,
  submitStudentRequestSchema,
  reviewStudentRequestSchema,
} from "./validations";
import {
  listCertificateTypes,
  createCertificateType,
  updateCertificateType,
  deleteCertificateType,
  listStudentRequests,
  getStudentRequestsByCode,
  reviewStudentRequest,
  submitStudentRequest,
  type CertificateTypeDto,
  type StudentRequestDto,
} from "./services";

async function resolveTenantId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.tenantId) return session.tenantId;
  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!tenant) throw new Error("No tenant found");
  return tenant.id;
}

export async function getAdminStudentRequestsAction(filters?: {
  status?: string;
  certificateTypeId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{
  items: StudentRequestDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentRead);
    return listStudentRequests(ctx.tenantId, filters);
  });
}

export async function getAdminCertificateTypesAction(): Promise<ActionResult<CertificateTypeDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentRead);
    return listCertificateTypes(ctx.tenantId);
  });
}

export async function createCertificateTypeAction(input: unknown): Promise<ActionResult<CertificateTypeDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentManage);
    const parsed = createCertificateTypeSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCertificateType(ctx.tenantId, parsed);
    revalidatePath("/services");
    revalidatePath("/admin/student-services");
    return result;
  });
}

export async function updateCertificateTypeAction(input: unknown): Promise<ActionResult<CertificateTypeDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentManage);
    const parsed = updateCertificateTypeSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCertificateType(ctx.tenantId, parsed);
    revalidatePath("/services");
    revalidatePath("/admin/student-services");
    return result;
  });
}

export async function deleteCertificateTypeAction(id: string): Promise<ActionResult<CertificateTypeDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentManage);
    const result = await deleteCertificateType(ctx.tenantId, id);
    revalidatePath("/services");
    revalidatePath("/admin/student-services");
    return result;
  });
}

export async function reviewStudentRequestAction(input: unknown): Promise<ActionResult<StudentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENT_SERVICES_P.studentManage);
    const parsed = reviewStudentRequestSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await reviewStudentRequest(ctx.tenantId, parsed);
    revalidatePath("/services");
    revalidatePath("/admin/student-services");
    if (result.verificationCode) {
      revalidatePath(`/verify/${result.verificationCode}`);
    }
    return result;
  });
}

export async function submitStudentRequestAction(input: unknown): Promise<ActionResult<StudentRequestDto>> {
  return runAction(async () => {
    const tenantId = await resolveTenantId();
    const parsed = submitStudentRequestSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await submitStudentRequest(tenantId, parsed);
    revalidatePath("/services");
    return result;
  });
}

export async function trackStudentRequestsAction(studentCode: string): Promise<ActionResult<StudentRequestDto[]>> {
  return runAction(async () => {
    const tenantId = await resolveTenantId();
    if (!studentCode || !studentCode.trim()) {
      return [];
    }
    return getStudentRequestsByCode(tenantId, studentCode.trim());
  });
}
