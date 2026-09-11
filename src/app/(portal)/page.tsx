import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Eye,
  BookOpen,
  CalendarDays,
  FileCheck2,
  QrCode,
  Sparkles,
  Pin,
} from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { formatDate } from "@/shared/lib/format";
import {
  resolvePublicTenantId,
  listPublicNewsArticles,
} from "@/features/news/server";
import { Button } from "@/components/ui/button";

export default async function PortalHomePage() {
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const articles = await listPublicNewsArticles(tenantId, { limit: 7 });

  const pinnedArticles = articles.filter((a) => a.isPinned);
  const heroArticle = pinnedArticles[0] || articles[0];
  const gridArticles = heroArticle ? articles.filter((a) => a.id !== heroArticle.id) : [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isThai
                ? "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                : "Faculty of Buddhism, MCU"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {isThai ? (
              <>
                แหล่งรวมปัญญาวิชาการ <br className="hidden sm:inline" />
                <span className="text-primary">พัฒนาจิตใจสู่สังคมสากล</span>
              </>
            ) : (
              <>
                Wisdom & Buddhist Studies <br className="hidden sm:inline" />
                <span className="text-primary">for Global Harmony</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isThai
              ? "มุ่งผลิตบัณฑิตให้มีความรู้เชี่ยวชาญในพระไตรปิฎก มีคุณธรรม จริยธรรม พร้อมประยุกต์หลักพุทธธรรมเพื่อแก้ไขปัญหาสังคมยุคดิจิทัล"
              : "Dedicated to fostering scholars in Tipitaka studies, ethics, and mindfulness, integrating Buddhist wisdom to enrich contemporary society."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="gap-2 shadow-md">
              <Link href="/news">
                <span>{isThai ? "อ่านข่าวสารประชาสัมพันธ์" : "Explore News"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/curriculum">
                {isThai ? "ดูหลักสูตรการศึกษา" : "Academic Programs"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick E-Services Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isThai ? "ระบบบริการดิจิทัลคณะพุทธศาสตร์" : "Faculty Digital E-Services"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isThai
              ? "ทางลัดเข้าสู่ระบบอำนวยความสะดวกสำหรับคณาจารย์ บุคลากร และนิสิต"
              : "Direct access to academic and administrative online services"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/news"
            className="card p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-1">
              {isThai ? "ข่าวสารและประกาศ" : "News & Announcements"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai ? "ประชาสัมพันธ์ข้อมูล กิจกรรม และบทความวิชาการ" : "Faculty updates, academic events and press releases"}
            </p>
          </Link>

          <Link
            href="/login"
            className="card p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-1">
              {isThai ? "ระบบจองห้องประชุม" : "Room Booking"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai ? "ตรวจสอบตารางห้องว่างและยื่นขอใช้ห้องประชุม" : "Check availability and reserve faculty meeting rooms"}
            </p>
          </Link>

          <Link
            href="/login"
            className="card p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-1">
              {isThai ? "บริการคำร้องนิสิต" : "Student Certificates"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai ? "ขอหนังสือรับรองและตรวจสอบความถูกต้องผ่าน QR" : "Request certificates and verify credentials via QR"}
            </p>
          </Link>

          <Link
            href="/login"
            className="card p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-1">
              {isThai ? "เช็คชื่อเข้าชั้นเรียน" : "Smart Attendance"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai ? "ระบบตรวจลงทะเบียนเข้าเรียนและกิจกรรมด้วย QR สด" : "Real-time class and activity check-in via Dynamic QR"}
            </p>
          </Link>
        </div>
      </section>

      {/* Featured & Latest News Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
              <Pin className="h-4 w-4" />
              <span>{isThai ? "ข่าวสารคณะพุทธศาสตร์" : "Faculty News & Updates"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isThai ? "ข่าวสารและกิจกรรมล่าสุด" : "Latest News & Events"}
            </h2>
          </div>
          <Button asChild variant="ghost" className="gap-2 self-start sm:self-auto">
            <Link href="/news">
              <span>{isThai ? "ดูข่าวทั้งหมด" : "View All News"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {articles.length === 0 ? (
          <div className="card p-12 text-center text-muted-foreground rounded-xl border border-border">
            <p>{isThai ? "ยังไม่มีข้อมูลข่าวสารที่เผยแพร่" : "No published news articles at this time."}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Featured Headline Article */}
            {heroArticle && (
              <div className="card overflow-hidden rounded-2xl border border-border hover:shadow-lg transition-shadow grid grid-cols-1 lg:grid-cols-12 bg-card">
                <div className="lg:col-span-7 bg-muted/60 min-h-[260px] lg:min-h-[380px] relative overflow-hidden flex items-center justify-center">
                  {heroArticle.coverImage ? (
                    <img
                      src={heroArticle.coverImage}
                      alt={heroArticle.titleTh}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <BookOpen className="h-16 w-16 mb-2 opacity-30" />
                      <span className="text-xs uppercase font-medium">Faculty News</span>
                    </div>
                  )}
                  {heroArticle.isPinned && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                      <Pin className="h-3 w-3" />
                      {isThai ? "ข่าวเด่นปักหมุด" : "Featured"}
                    </span>
                  )}
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="inline-block text-xs font-medium text-primary px-2.5 py-1 bg-primary/10 rounded-full">
                      {isThai ? heroArticle.categoryNameTh : heroArticle.categoryNameEn}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                      <Link href={`/news/${heroArticle.slug}`}>
                        {isThai ? heroArticle.titleTh : heroArticle.titleEn}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {isThai
                        ? heroArticle.summaryTh || heroArticle.contentTh.slice(0, 160)
                        : heroArticle.summaryEn || heroArticle.contentEn.slice(0, 160)}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {heroArticle.publishedAt
                        ? formatDate(new Date(heroArticle.publishedAt), locale)
                        : "-"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {heroArticle.viewCount} {isThai ? "เข้าชม" : "views"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Grid for Other Articles */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
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
                        <h4 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition-colors">
                          <Link href={`/news/${article.slug}`}>
                            {isThai ? article.titleTh : article.titleEn}
                          </Link>
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {isThai
                            ? article.summaryTh || article.contentTh.slice(0, 100)
                            : article.summaryEn || article.contentEn.slice(0, 100)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {article.publishedAt
                            ? formatDate(new Date(article.publishedAt), locale)
                            : "-"}
                        </span>
                        <Link
                          href={`/news/${article.slug}`}
                          className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                        >
                          {isThai ? "อ่านต่อ" : "Read more"}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
