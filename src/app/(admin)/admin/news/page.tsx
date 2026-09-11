import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listNewsCategories, listAdminNewsArticles } from "@/features/news/server";
import { NewsAdminClient } from "./_components/news-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [categories, initialArticles] = await Promise.all([
    listNewsCategories(ctx.tenantId),
    listAdminNewsArticles(ctx.tenantId),
  ]);

  return (
    <NewsAdminClient
      categories={categories}
      initialArticles={initialArticles}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
      canEdit={hasPermission(ctx, NEWS_P.newsEdit)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
      canDelete={hasPermission(ctx, NEWS_P.newsDelete)}
    />
  );
}
