import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, Pin } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { formatDate } from "@/shared/lib/format";
import {
  resolvePublicTenantId,
  getPublicNewsArticleBySlug,
} from "@/features/news/server";
import { Button } from "@/components/ui/button";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const article = await getPublicNewsArticleBySlug(tenantId, decodeURIComponent(slug));

  if (!article) {
    notFound();
  }

  const title = isThai ? article.titleTh : article.titleEn;
  const content = isThai ? article.contentTh : article.contentEn;
  const categoryName = isThai ? article.categoryNameTh : article.categoryNameEn;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      {/* Back to news button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" />
            <span>{isThai ? "กลับไปหน้ารวมข่าวสาร" : "Back to all news"}</span>
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
            {categoryName}
          </span>
          {article.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
              <Pin className="h-3 w-3" />
              {isThai ? "ข่าวเด่นปักหมุด" : "Featured"}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-border text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {article.viewCount} {isThai ? "ครั้งที่เข้าชม" : "views"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground/80">
              {isThai ? "คณะพุทธศาสตร์ มจร" : "Faculty of Buddhism, MCU"}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      {article.coverImage && (
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm max-h-[480px]">
          <img
            src={article.coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      {/<[a-z][\s\S]*>/i.test(content) ? (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-base sm:text-lg py-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-base sm:text-lg whitespace-pre-line py-4">
          {content}
        </div>
      )}

      {/* Footer Share & Back */}
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" />
            <span>{isThai ? "ดูข่าวสารอื่น ๆ" : "Explore More News"}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
