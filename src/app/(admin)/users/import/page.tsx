import { requirePermission, P } from "@/features/identity/server";
import { UsersImportClient } from "./_components/users-import-client";

export default async function UsersImportPage() {
  await requirePermission(P.usersManage);
  return <UsersImportClient />;
}
