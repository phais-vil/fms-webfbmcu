import Link from "next/link";
import {
  Target,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { listAnnualProjects, getAnnualBudgetStats } from "@/features/projects/server";
import type { StrategicPillar, ProjectQuarter } from "@/features/projects";

export default async function PublicProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; quarter?: string }>;
}) {
  const params = await searchParams;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const [projects, stats] = await Promise.all([
    listAnnualProjects(tenantId, {
      fiscalYear: 2569,
      pillar: params.pillar && params.pillar !== "ALL" ? (params.pillar as StrategicPillar) : undefined,
      quarter: params.quarter && params.quarter !== "ALL" ? (params.quarter as ProjectQuarter) : undefined,
    }),
    getAnnualBudgetStats(tenantId, 2569),
  ]);

  const pillars = [
    {
      key: "DHAMMA_STUDY",
      nameTh: "ยุทธศาสตร์ที่ 1: พระพุทธศาสนาและวิชาการ",
      nameEn: "Pillar 1: Buddhist & Academic Studies",
      descTh: "ยกระดับการศึกษาพระไตรปิฎก ผลิตศาสนทายาทและบัณฑิตที่มีปฏิปทาน่าเลื่อมใส",
      descEn: "Elevating Tipitaka studies and producing righteous Buddhist scholars",
      icon: Layers,
      color: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    {
      key: "RESEARCH_INNOVATION",
      nameTh: "ยุทธศาสตร์ที่ 2: การวิจัยและนวัตกรรม",
      nameEn: "Pillar 2: Research & Innovation",
      descTh: "ส่งเสริมการวิจัยบูรณาการศาสตร์สมัยใหม่ เพื่อตอบโจทย์สังคมยุคปัญญาประดิษฐ์",
      descEn: "Fostering integrated research addressing modern AI and societal challenges",
      icon: Sparkles,
      color: "from-purple-500/20 to-purple-500/5 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    {
      key: "ACADEMIC_SERVICES",
      nameTh: "ยุทธศาสตร์ที่ 3: บริการวิชาการแก่สังคม",
      nameEn: "Pillar 3: Academic Social Services",
      descTh: "เผยแผ่หลักธรรม นำสันติสุขสู่ชุมชน และจัดอบรมวิปัสสนากรรมฐานแก่ประชาชน",
      descEn: "Propagating Dhamma teachings and meditation retreats for public peace",
      icon: Target,
      color: "from-blue-500/20 to-blue-500/5 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    {
      key: "CULTURE_PRESERVATION",
      nameTh: "ยุทธศาสตร์ที่ 4: ศิลปวัฒนธรรมและภูมิปัญญา",
      nameEn: "Pillar 4: Art & Cultural Preservation",
      descTh: "ทำนุบำรุงพระพุทธศาสนา อนุรักษ์พุทธศิลป์และมรดกทางวัฒนธรรมอันล้ำค่า",
      descEn: "Preserving Buddhist arts, sacred scriptures, and cultural heritage",
      icon: Award,
      color: "from-rose-500/20 to-rose-500/5 text-rose-700 dark:text-rose-400 border-rose-500/20",
    },
    {
      key: "ORGANIZATION_EXCELLENCE",
      nameTh: "ยุทธศาสตร์ที่ 5: การบริหารสู่ความเป็นเลิศ",
      nameEn: "Pillar 5: Organizational Excellence",
      descTh: "พัฒนาระบบดิจิทัลและธรรมาภิบาลตามเกณฑ์คุณภาพการศึกษา (EdPEx)",
      descEn: "Digital transformation and governance under EdPEx quality criteria",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
          <Target className="h-4 w-4" />
          {isThai ? "แผนยุทธศาสตร์การพัฒนาคณะพุทธศาสตร์ พ.ศ. 2569" : "Strategic Plan FY 2026"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {isThai ? "แผนโครงการและผลสัมฤทธิ์ตัวชี้วัด (KPIs)" : "Annual Projects & Strategic KPIs"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {isThai
            ? "ขับเคลื่อนคณะพุทธศาสตร์ มจร สู่การเป็นศูนย์กลางการศึกษาพระพุทธศาสนาระดับสากล ด้วยความโปร่งใสและผลสัมฤทธิ์ที่ตรวจสอบได้"
            : "Propelling the Faculty of Buddhism towards global leadership in Buddhist studies with transparency and accountable achievements."}
        </p>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border bg-card/60 shadow-sm space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            {isThai ? "โครงการในแผนยุทธศาสตร์" : "Strategic Projects"}
          </div>
          <div className="text-3xl font-extrabold text-foreground">{stats.totalProjects}</div>
          <div className="text-xs text-muted-foreground">{isThai ? "ประจำปีงบประมาณ 2569" : "Fiscal Year 2026"}</div>
        </div>

        <div className="p-5 rounded-2xl border bg-card/60 shadow-sm space-y-1">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {isThai ? "โครงการที่เสร็จสิ้นแล้ว" : "Completed Projects"}
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.completedCount}
          </div>
          <div className="text-xs text-muted-foreground">
            {isThai ? `กำลังดำเนินงาน ${stats.inProgressCount} โครงการ` : `${stats.inProgressCount} in progress`}
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-card/60 shadow-sm space-y-1">
          <div className="text-xs font-medium text-primary">
            {isThai ? "งบประมาณที่จัดสรรรวม" : "Total Allocated Budget"}
          </div>
          <div className="text-3xl font-extrabold text-primary">
            ฿{(stats.totalAllocated / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-muted-foreground">
            {isThai ? `฿${stats.totalAllocated.toLocaleString("th-TH")} บาท` : `THB ${stats.totalAllocated.toLocaleString()}`}
          </div>
        </div>

        <div className="p-5 rounded-2xl border bg-card/60 shadow-sm space-y-1">
          <div className="text-xs font-medium text-muted-foreground flex justify-between">
            <span>{isThai ? "อัตราการเบิกจ่าย (Burn Rate)" : "Budget Burn Rate"}</span>
            <span className="font-bold text-foreground">{stats.overallBurnRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden mt-2">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.overallBurnRate, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isThai ? "เป็นไปตามเป้าหมายแผนงาน" : "On track with fiscal goals"}
          </div>
        </div>
      </div>

      {/* 5 Strategic Pillars Presentation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isThai ? "ยุทธศาสตร์ 5 ด้าน (Strategic Pillars)" : "5 Core Strategic Pillars"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isThai ? "กรอบการดำเนินงานหลักเพื่อการพัฒนาอย่างยั่งยืน" : "Core operational framework for sustainable excellence"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            const pStats = stats.pillarBreakdown[p.key] || { allocated: 0, spent: 0, count: 0 };
            const isActive = params.pillar === p.key;

            return (
              <Link
                key={p.key}
                href={`/projects?pillar=${isActive ? "ALL" : p.key}`}
                className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md bg-gradient-to-br ${p.color} ${
                  isActive ? "ring-2 ring-primary shadow-lg" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-background/80 shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-background/80">
                    {pStats.count} {isThai ? "โครงการ" : "Projects"}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground mb-1">
                  {isThai ? p.nameTh : p.nameEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {isThai ? p.descTh : p.descEn}
                </p>
                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{isThai ? "งบประมาณจัดสรร:" : "Budget:"}</span>
                  <span className="font-bold text-foreground">฿{pStats.allocated.toLocaleString("th-TH")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Projects List Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isThai ? "รายการโครงการและตัวชี้วัดความสำเร็จ" : "Projects & Key Performance Indicators"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {params.pillar && params.pillar !== "ALL"
                ? isThai ? `กรองเฉพาะ: ${params.pillar}` : `Filtered by: ${params.pillar}`
                : isThai ? "แสดงโครงการทั้งหมดในแผนประจำปี" : "Showing all projects in annual plan"}
            </p>
          </div>

          {/* Quarter Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {["ALL", "Q1", "Q2", "Q3", "Q4"].map((q) => {
              const active = (params.quarter || "ALL") === q;
              return (
                <Link
                  key={q}
                  href={`/projects?${params.pillar ? `pillar=${params.pillar}&` : ""}quarter=${q}`}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {q === "ALL" ? (isThai ? "ทุกไตรมาส" : "All Quarters") : q}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full p-12 text-center border rounded-2xl bg-card">
              <Target className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {isThai ? "ไม่พบโครงการในเงื่อนไขที่เลือก" : "No projects found in selected criteria"}
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border bg-card hover:border-primary/40 transition-all shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {proj.projectCode}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {proj.quarter}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {proj.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {proj.responsiblePerson} · {proj.department || (isThai ? "คณะพุทธศาสตร์" : "Faculty of Buddhism")}
                    </div>
                  </div>
                </div>

                {/* KPI Box */}
                <div className="p-3 rounded-xl bg-muted/40 border text-xs space-y-1.5">
                  <div className="font-semibold text-muted-foreground uppercase tracking-wider">
                    {isThai ? "เป้าหมายตัวชี้วัด (Target KPI):" : "Target KPI:"}
                  </div>
                  <div className="text-foreground">{proj.targetKpi}</div>
                  {proj.actualResult && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-border/50">
                      {isThai ? "ผลสัมฤทธิ์จริง:" : "Actual Result:"} {proj.actualResult}
                    </div>
                  )}
                </div>

                {/* Progress & Budget Footnote */}
                <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isThai ? "ความก้าวหน้าโครงการ:" : "Progress:"}</span>
                    <span className="font-bold text-foreground">{proj.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        proj.progressPercent >= 100
                          ? "bg-emerald-500"
                          : proj.status === "DELAYED"
                          ? "bg-rose-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1">
                    <span>
                      {isThai ? "งบจัดสรร: " : "Budget: "}
                      <strong className="text-foreground">฿{proj.allocatedBudget.toLocaleString("th-TH")}</strong>
                    </span>
                    <span>
                      {isThai ? "เบิกจ่ายแล้ว: " : "Spent: "}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        ฿{proj.spentBudget.toLocaleString("th-TH")} ({proj.burnRate}%)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
