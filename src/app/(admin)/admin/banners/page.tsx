import { requirePermission, hasPermission } from "@/features/identity/server";
import { CMS_P } from "@/features/portal-cms/permissions";
import { listAdminBanners } from "@/features/portal-cms/server";
import { BannersAdminClient } from "./_components/banners-admin-client";

export const metadata = { title: "จัดการแบนเนอร์ - Admin" };

export default async function AdminBannersPage() {
  const ctx = await requirePermission(CMS_P.cmsRead);
  const banners = await listAdminBanners(ctx.tenantId);

  return (
    <BannersAdminClient
      initialData={banners}
      canManage={hasPermission(ctx, CMS_P.cmsManage)}
    />
  );
}
