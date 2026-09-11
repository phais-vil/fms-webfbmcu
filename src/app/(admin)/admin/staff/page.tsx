import { requirePermission, hasPermission } from "@/features/identity/server";
import { STAFF_P, listStaffDepartments, listAdminStaff } from "@/features/staff/server";
import { StaffAdminClient } from "./_components/staff-client";

export default async function AdminStaffPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);
  const [departments, initialStaff] = await Promise.all([
    listStaffDepartments(ctx.tenantId),
    listAdminStaff(ctx.tenantId),
  ]);

  return (
    <StaffAdminClient
      departments={departments}
      initialStaff={initialStaff}
      canCreate={hasPermission(ctx, STAFF_P.staffCreate)}
      canEdit={hasPermission(ctx, STAFF_P.staffEdit)}
      canDelete={hasPermission(ctx, STAFF_P.staffDelete)}
    />
  );
}
