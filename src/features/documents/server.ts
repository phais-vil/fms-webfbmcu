import "server-only";

export { DOCUMENT_P, DOCUMENT_PERMISSIONS } from "./permissions";
export {
  listFacultyDocuments,
  getDocumentById,
  trackDocumentByNumber,
  createFacultyDocument,
  reviewFacultyDocument,
  getFacultyDocumentStats,
} from "./_internal/services";
