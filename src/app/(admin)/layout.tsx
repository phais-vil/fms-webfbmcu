import { resolveTenantBrand } from "@/features/identity/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await resolveTenantBrand();
  return <AdminLayoutClient brand={brand}>{children}</AdminLayoutClient>;
}
