import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma } from "@/generated/prisma";
import type {
  FacultyDocument,
  FacultyDocumentLog,
  DocumentType,
  DocumentUrgency,
  DocumentStatus,
} from "@/generated/prisma";
import type {
  CreateDocumentInput,
  ReviewDocumentInput,
} from "./validations";

export type FacultyDocumentDto = Omit<FacultyDocument, "budgetAmount"> & {
  budgetAmount: number | null;
  logs?: FacultyDocumentLog[];
};

function mapDocument(doc: FacultyDocument & { logs?: FacultyDocumentLog[] }): FacultyDocumentDto {
  return {
    ...doc,
    budgetAmount: doc.budgetAmount ? Number(doc.budgetAmount) : null,
  };
}

export async function listFacultyDocuments(
  tenantId: string,
  options?: {
    status?: DocumentStatus;
    docType?: DocumentType;
    urgency?: DocumentUrgency;
    search?: string;
  }
): Promise<FacultyDocumentDto[]> {
  const where: Prisma.FacultyDocumentWhereInput = { tenantId };

  if (options?.status) where.status = options.status;
  if (options?.docType) where.docType = options.docType;
  if (options?.urgency) where.urgency = options.urgency;

  if (options?.search) {
    const q = options.search.trim();
    where.OR = [
      { documentNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { submitterName: { contains: q, mode: "insensitive" } },
      { department: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.facultyDocument.findMany({
    where,
    include: {
      logs: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapDocument);
}

export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<FacultyDocumentDto | null> {
  const item = await prisma.facultyDocument.findFirst({
    where: { id, tenantId },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!item) return null;
  return mapDocument(item);
}

export async function trackDocumentByNumber(
  documentNumber: string
): Promise<FacultyDocumentDto | null> {
  const item = await prisma.facultyDocument.findFirst({
    where: {
      documentNumber: {
        equals: documentNumber.trim(),
        mode: "insensitive",
      },
    },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!item) return null;
  return mapDocument(item);
}

export async function createFacultyDocument(
  tenantId: string,
  input: CreateDocumentInput
): Promise<FacultyDocumentDto> {
  const year = 2569;
  const count = await prisma.facultyDocument.count({
    where: { tenantId },
  });
  const docNum = `วธ-มจร-${year}/${String(count + 1).padStart(4, "0")}`;

  const created = await prisma.facultyDocument.create({
    data: {
      tenantId,
      documentNumber: docNum,
      title: input.title.trim(),
      docType: input.docType,
      urgency: input.urgency,
      status: "SUBMITTED",
      submitterName: input.submitterName.trim(),
      submitterRole: input.submitterRole?.trim() || "ผู้เสนอเรื่อง",
      submitterEmail: input.submitterEmail?.trim() || null,
      department: input.department?.trim() || "คณะพุทธศาสตร์",
      content: input.content.trim(),
      budgetAmount: input.budgetAmount ? new Prisma.Decimal(input.budgetAmount) : null,
      attachmentUrl: input.attachmentUrl?.trim() || null,
      currentStep: 1,
      totalSteps: 3,
      logs: {
        create: {
          action: "SUBMITTED",
          actorName: input.submitterName.trim(),
          actorRole: input.submitterRole?.trim() || "ผู้เสนอเรื่อง",
          comment: "เสนอเรื่องเข้าสู่ระบบสารบรรณอิเล็กทรอนิกส์",
        },
      },
    },
    include: {
      logs: true,
    },
  });

  return mapDocument(created);
}

export async function reviewFacultyDocument(
  tenantId: string,
  input: ReviewDocumentInput
): Promise<FacultyDocumentDto> {
  const existing = await prisma.facultyDocument.findFirst({
    where: { id: input.documentId, tenantId },
  });

  if (!existing) {
    throw new Error("ไม่พบเอกสารสารบรรณที่ระบุ");
  }

  let nextStatus = existing.status;
  let nextStep = existing.currentStep;

  if (input.action === "APPROVE") {
    if (nextStep < existing.totalSteps) {
      nextStep += 1;
      nextStatus = nextStep === existing.totalSteps ? "APPROVED" : "UNDER_REVIEW";
    } else {
      nextStatus = "APPROVED";
    }
  } else if (input.action === "REJECT") {
    nextStatus = "REJECTED";
  } else if (input.action === "ADVANCE_STEP") {
    if (nextStep < existing.totalSteps) {
      nextStep += 1;
      nextStatus = "UNDER_REVIEW";
    }
  }

  const updated = await prisma.facultyDocument.update({
    where: { id: input.documentId },
    data: {
      status: nextStatus,
      currentStep: nextStep,
      logs: {
        create: {
          action: input.action,
          actorName: input.actorName.trim(),
          actorRole: input.actorRole.trim(),
          comment: input.comment?.trim() || null,
        },
      },
    },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return mapDocument(updated);
}

export async function getFacultyDocumentStats(tenantId: string) {
  const docs = await prisma.facultyDocument.findMany({
    where: { tenantId },
    select: {
      status: true,
      budgetAmount: true,
    },
  });

  let totalBudget = 0;
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  for (const d of docs) {
    if (d.status === "SUBMITTED" || d.status === "UNDER_REVIEW") pendingCount++;
    if (d.status === "APPROVED") approvedCount++;
    if (d.status === "REJECTED") rejectedCount++;
    if (d.budgetAmount) totalBudget += Number(d.budgetAmount);
  }

  return {
    totalDocs: docs.length,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalBudget,
  };
}
