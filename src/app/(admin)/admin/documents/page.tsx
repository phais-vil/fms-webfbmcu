import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  DOCUMENT_P,
  listFacultyDocuments,
  getFacultyDocumentStats,
} from "@/features/documents/server";
import { DocumentsAdminClient } from "./_components/documents-admin-client";

export default async function AdminDocumentsPage() {
  const ctx = await requirePermission(DOCUMENT_P.documentRead);
  const [documents, stats] = await Promise.all([
    listFacultyDocuments(ctx.tenantId),
    getFacultyDocumentStats(ctx.tenantId),
  ]);

  return (
    <DocumentsAdminClient
      initialDocuments={documents}
      initialStats={stats}
      canCreate={hasPermission(ctx, DOCUMENT_P.documentCreate)}
      canApprove={hasPermission(ctx, DOCUMENT_P.documentApprove)}
    />
  );
}
