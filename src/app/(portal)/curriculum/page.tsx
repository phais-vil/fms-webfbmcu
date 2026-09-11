import Link from "next/link";
import { GraduationCap, BookOpen, Clock, Award, FileText, Search, ChevronRight } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { listStaffDepartments } from "@/features/staff/server";
import { listPublicCurriculums } from "@/features/curriculum/server";

export default async function PublicCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; dept?: string; q?: string }>;
}) {
  const params = await searchParams;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const [departments, curriculums] = await Promise.all([
    listStaffDepartments(tenantId),
    listPublicCurriculums(tenantId, {
      degreeLevel: params.level,
      departmentId: params.dept,
      search: params.q,
    }),
  ]);

  const levelOptions = [
    { key: "ALL", th: "ทุกระดับการศึกษา", en: "All Degrees" },
    { key: "BACHELOR", th: "ปริญญาตรี", en: "Bachelor's" },
    { key: "MASTER", th: "ปริญญาโท", en: "Master's" },
    { key: "DOCTORAL", th: "ปริญญาเอก", en: "Doctoral (Ph.D.)" },
    { key: "CERTIFICATE", th: "ประกาศนียบัตร", en: "Certificates" },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{isThai ? "ปริญญาตรี" : "Bachelor"}</span>;
      case "MASTER":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{isThai ? "ปริญญาโท" : "Master"}</span>;
      case "DOCTORAL":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{isThai ? "ปริญญาเอก" : "Doctoral (Ph.D.)"}</span>;
      case "CERTIFICATE":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{isThai ? "ประกาศนียบัตร" : "Certificate"}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <GraduationCap className="h-4 w-4" />
          {isThai ? "หลักสูตรมาตรฐานสากล คณะพุทธศาสตร์" : "International Academic Curriculums"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isThai ? "หลักสูตรการศึกษา" : "Academic Programs"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {isThai
            ? "หลักสูตรระดับปริญญาตรี โท และเอก ด้านพระพุทธศาสนา ปรัชญา และภาษาบาลี มุ่งเน้นการบูรณาการพุทธธรรมสู่สังคมยุคใหม่ ณ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
            : "Bachelor, Master, and Doctoral degree programs in Buddhist Studies, Religion, and Philosophy integrating timeless Buddhist wisdom with modern societal development at MCU."}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {levelOptions.map((opt) => {
              const isSelected = (!params.level && opt.key === "ALL") || params.level === opt.key;
              const queryParams = new URLSearchParams();
              if (opt.key !== "ALL") queryParams.set("level", opt.key);
              if (params.dept) queryParams.set("dept", params.dept);
              if (params.q) queryParams.set("q", params.q);
              const href = `/curriculum${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

              return (
                <Link
                  key={opt.key}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isThai ? opt.th : opt.en}
                </Link>
              );
            })}
          </div>

          <form method="GET" action="/curriculum" className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder={isThai ? "ค้นหารหัส หรือชื่อหลักสูตร..." : "Search curriculum..."}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {params.level && <input type="hidden" name="level" value={params.level} />}
            {params.dept && <input type="hidden" name="dept" value={params.dept} />}
          </form>
        </div>

        {/* Department Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium mr-1">{isThai ? "ภาควิชา:" : "Department:"}</span>
          <Link
            href={`/curriculum${params.level ? `?level=${params.level}` : ""}${params.q ? `&q=${params.q}` : ""}`}
            className={`px-3 py-1 rounded-md transition-colors ${
              !params.dept
                ? "bg-muted-foreground/20 font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {isThai ? "ทั้งหมด" : "All"}
          </Link>
          {departments.map((dept) => {
            const isDeptActive = params.dept === dept.id;
            const q = new URLSearchParams();
            if (params.level) q.set("level", params.level);
            q.set("dept", dept.id);
            if (params.q) q.set("q", params.q);

            return (
              <Link
                key={dept.id}
                href={`/curriculum?${q.toString()}`}
                className={`px-3 py-1 rounded-md transition-colors ${
                  isDeptActive
                    ? "bg-muted-foreground/20 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {isThai ? dept.nameTh : dept.nameEn}
              </Link>
            );
          })}
        </div>
      </div>


      {/* Curriculum Grid */}
      {curriculums.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl p-8 space-y-3">
          <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            {isThai ? "ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา" : "No academic programs found matching your search"}
          </p>
          <Link
            href="/curriculum"
            className="inline-block text-xs text-primary font-semibold hover:underline"
          >
            {isThai ? "ดูหลักสูตรทั้งหมด" : "View all programs"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curriculums.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Card Top */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                    {c.code}
                  </span>
                  {getLevelBadge(c.degreeLevel)}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/curriculum/${c.code}`}>
                      {isThai ? c.nameTh : c.nameEn}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {isThai ? `${c.degreeTh} (${c.degreeAbbrTh})` : `${c.degreeEn} (${c.degreeAbbrEn})`}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {isThai ? "หน่วยกิตรวม" : "Credits"}
                    </span>
                    <span className="font-semibold text-foreground">{c.totalCredits} {isThai ? "หน่วยกิต" : "credits"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {isThai ? "ระยะเวลาศึกษา" : "Duration"}
                    </span>
                    <span className="font-semibold text-foreground">{c.durationYears} {isThai ? "ปี" : "years"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      {isThai ? "ภาควิชา" : "Department"}
                    </span>
                    <span className="text-foreground truncate max-w-[150px]" title={isThai ? c.departmentNameTh : c.departmentNameEn}>
                      {isThai ? c.departmentNameTh : c.departmentNameEn}
                    </span>
                  </div>

                  {c.tuitionFees && (
                    <div className="pt-2 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded">
                      <span className="font-medium text-foreground">{isThai ? "ค่าธรรมเนียม: " : "Tuition: "}</span>
                      {c.tuitionFees}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                {c.curriculumPdfUrl ? (
                  <a
                    href={c.curriculumPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>มคอ.2</span>
                  </a>
                ) : <span />}

                <Link
                  href={`/curriculum/${c.code}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all"
                >
                  <span>{isThai ? "ดูรายละเอียดหลักสูตร" : "View Details"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
