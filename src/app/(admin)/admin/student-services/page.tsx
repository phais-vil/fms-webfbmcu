import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  STUDENT_SERVICES_P,
  listCertificateTypes,
  listStudentRequests,
} from "@/features/student-services/server";
import type { CertificateTypeDto } from "@/features/student-services";
import { StudentServicesAdminClient } from "./_components/student-services-admin-client";

export default async function AdminStudentServicesPage() {
  const ctx = await requirePermission(STUDENT_SERVICES_P.studentRead);
  const [rawTypes, requestsData] = await Promise.all([
    listCertificateTypes(ctx.tenantId),
    listStudentRequests(ctx.tenantId, { pageSize: 50 }),
  ]);

  const types = rawTypes.map((t) => ({
    ...t,
    fee: Number(t.fee),
  }));

  return (
    <StudentServicesAdminClient
      initialTypes={types as unknown as CertificateTypeDto[]}
      initialRequests={requestsData.items}
      canManage={hasPermission(ctx, STUDENT_SERVICES_P.studentManage)}
    />
  );
}
