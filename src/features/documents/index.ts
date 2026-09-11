export { DOCUMENT_PERMISSIONS, DOCUMENT_P, type DocumentPermission } from "./permissions";
export { messages } from "./messages";
export {
  createDocumentSchema,
  updateDocumentSchema,
  reviewDocumentSchema,
  documentTypeSchema,
  documentUrgencySchema,
  documentStatusSchema,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type ReviewDocumentInput,
} from "./_internal/validations";
export type { FacultyDocumentDto } from "./_internal/services";
export type {
  DocumentType,
  DocumentUrgency,
  DocumentStatus,
} from "@/generated/prisma";
