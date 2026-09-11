import "server-only";
import { prisma } from "@/shared/lib/infra/prisma";
import { auth } from "@/features/identity/server";

export async function resolvePublicTenantId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.tenantId) return session.tenantId;
  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!tenant) throw new Error("No tenant found");
  return tenant.id;
}

export {
  listPublicNewsArticles,
  getPublicNewsArticleBySlug,
  listNewsCategories,
  listAdminNewsArticles,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./_internal/services";

export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
