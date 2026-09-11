import { z } from "zod";

export const documentTypeSchema = z.enum([
  "MEMO",
  "PROJECT_PROPOSAL",
  "BUDGET_REQUEST",
  "GENERAL_REQUEST",
]);

export const documentUrgencySchema = z.enum([
  "NORMAL",
  "URGENT",
  "VERY_URGENT",
  "EXPEDITE",
]);

export const documentStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
]);

export const createDocumentSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  docType: documentTypeSchema.default("MEMO"),
  urgency: documentUrgencySchema.default("NORMAL"),
  submitterName: z.string().trim().min(2, "Submitter name must be at least 2 characters"),
  submitterRole: z.string().trim().optional(),
  submitterEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  department: z.string().trim().optional(),
  content: z.string().trim().min(5, "Content must be at least 5 characters"),
  budgetAmount: z.number().nonnegative("Budget must be non-negative").optional().nullable(),
  attachmentUrl: z.string().trim().url("Invalid URL").optional().nullable().or(z.literal("")),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().uuid("Invalid document ID"),
  status: documentStatusSchema.optional(),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  action: z.enum(["APPROVE", "REJECT", "COMMENT", "ADVANCE_STEP"]),
  actorName: z.string().trim().min(2, "Reviewer name is required"),
  actorRole: z.string().trim().min(2, "Reviewer role is required"),
  comment: z.string().trim().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
