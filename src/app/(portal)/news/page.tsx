import Link from "next/link";
import { BookOpen, Calendar, Eye, Search } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { formatDate } from "@/shared/lib/format";
import {
  resolvePublicTenantId,
  listPublicNewsArticles,
  listNewsCategories,
} from "@/features/news/server";

export default async function PublicNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const [categories, articles] = await Promise.all([
    listNewsCategories(tenantId),
    listPublicNewsArticles(tenantId, {
      categoryId: params.category,
      search: params.q,
      limit: 50,
    }),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isThai ? "ข่าวสารและกิจกรรมประชาสัมพันธ์" : "News & Faculty Announcements"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {isThai
            ? "ติดตามข่าวสาร งานประชุมวิชาการ ทุนการศึกษา และกิจกรรมสำคัญของคณะพุทธศาสตร์"
            : "Explore latest news, conferences, scholarships, and activities from the Faculty of Buddhism"}
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link
            href="/news"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !params.category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {isThai ? "ทั้งหมด" : "All Categories"}
          </Link>
          {categories.map((cat) => {
            const isActive = params.category === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/news?category=${cat.id}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isThai ? cat.nameTh : cat.nameEn}
              </Link>
            );
          })}
        </div>

        {/* Search Bar Form */}
        <form method="GET" action="/news" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder={isThai ? "ค้นหาข่าว..." : "Search news..."}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {params.category && <input type="hidden" name="category" value={params.category} />}
        </form>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="card p-16 text-center text-muted-foreground border border-border rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">
            {isThai ? "ไม่พบรายการข่าวสารในเงื่อนไขที่เลือก" : "No news articles found for this criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="card overflow-hidden rounded-xl border border-border hover:shadow-md hover:border-primary/40 transition-all flex flex-col bg-card"
            >
              <div className="h-48 bg-muted/60 relative overflow-hidden flex items-center justify-center">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.titleTh}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                )}
                <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-background/90 backdrop-blur shadow-sm text-foreground">
                  {isThai ? article.categoryNameTh : article.categoryNameEn}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/news/${article.slug}`}>
                      {isThai ? article.titleTh : article.titleEn}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {isThai
                      ? article.summaryTh || article.contentTh.slice(0, 120)
                      : article.summaryEn || article.contentEn.slice(0, 120)}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
