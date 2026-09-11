"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DOCUMENT_P } from "../permissions";
import {
  createDocumentSchema,
  reviewDocumentSchema,
  type CreateDocumentInput,
  type ReviewDocumentInput,
} from "./validations";
import {
  listFacultyDocuments,
  getDocumentById,
  trackDocumentByNumber,
  createFacultyDocument,
  reviewFacultyDocument,
  getFacultyDocumentStats,
  type FacultyDocumentDto,
} from "./services";
import type { DocumentStatus, DocumentType, DocumentUrgency } from "@/generated/prisma";

export async function getAdminDocumentsAction(options?: {
  status?: DocumentStatus;
  docType?: DocumentType;
  urgency?: DocumentUrgency;
  search?: string;
}): Promise<ActionResult<FacultyDocumentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentRead);
    return listFacultyDocuments(ctx.tenantId, options);
  });
}

export async function getAdminDocumentByIdAction(
  id: string
): Promise<ActionResult<FacultyDocumentDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentRead);
    return getDocumentById(ctx.tenantId, id);
  });
}

export async function createDocumentAction(
  rawInput: CreateDocumentInput
): Promise<ActionResult<FacultyDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentCreate);
    const locale = await getLocale();
    const input = createDocumentSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const created = await createFacultyDocument(ctx.tenantId, input);
    revalidatePath("/admin/documents");
    return created;
  });
}

export async function reviewDocumentAction(
  rawInput: ReviewDocumentInput
): Promise<ActionResult<FacultyDocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentApprove);
    const locale = await getLocale();
    const input = reviewDocumentSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const updated = await reviewFacultyDocument(ctx.tenantId, input);
    revalidatePath("/admin/documents");
    return updated;
  });
}

export async function getAdminDocumentStatsAction(): Promise<
  ActionResult<{
    totalDocs: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalBudget: number;
  }>
> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentRead);
    return getFacultyDocumentStats(ctx.tenantId);
  });
}

export async function trackDocumentPublicAction(
  documentNumber: string
): Promise<ActionResult<FacultyDocumentDto | null>> {
  return runAction(async () => {
    if (!documentNumber || !documentNumber.trim()) {
      return null;
    }
    return trackDocumentByNumber(documentNumber);
  });
}
