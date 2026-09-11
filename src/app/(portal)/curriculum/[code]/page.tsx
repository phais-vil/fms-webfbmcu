import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Clock,
  FileText,
  ArrowLeft,
  Briefcase,
  Lightbulb,
  Coins,
  Calendar,
  Building,
  ExternalLink,
} from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { getPublicCurriculumByCode } from "@/features/curriculum/server";

export default async function PublicCurriculumDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const curriculum = await getPublicCurriculumByCode(tenantId, code);

  if (!curriculum) {
    notFound();
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาตรี" : "Bachelor's Degree"}</span>;
      case "MASTER":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาโท" : "Master's Degree"}</span>;
      case "DOCTORAL":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาเอก (ดุษฎีบัณฑิต)" : "Doctoral Degree (Ph.D.)"}</span>;
      case "CERTIFICATE":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "หลักสูตรประกาศนียบัตร" : "Certificate Program"}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isThai ? "กลับไปหน้ารายการหลักสูตร" : "Back to all programs"}
        </Link>
      </div>

      {/* Program Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-md">
            {curriculum.code}
          </span>
          {getLevelBadge(curriculum.degreeLevel)}
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {isThai ? `หลักสูตรปรับปรุง พ.ศ. ${curriculum.effectiveYear}` : `Curriculum Year ${curriculum.effectiveYear}`}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {isThai ? curriculum.nameTh : curriculum.nameEn}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {isThai ? curriculum.nameEn : curriculum.nameTh}
          </p>
        </div>

        {/* Degree Name Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border text-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isThai ? "ชื่อปริญญาภาษาไทย" : "Thai Degree Title"}
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {curriculum.degreeTh} ({curriculum.degreeAbbrTh})
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isThai ? "ชื่อปริญญาภาษาอังกฤษ" : "English Degree Title"}
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {curriculum.degreeEn} ({curriculum.degreeAbbrEn})
            </p>
          </div>
        </div>
      </div>

      {/* Highlight Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "จำนวนหน่วยกิตรวม" : "Total Credits"}</p>
          <p className="text-xl font-bold text-foreground">{curriculum.totalCredits} <span className="text-xs font-normal text-muted-foreground">{isThai ? "หน่วยกิต" : "credits"}</span></p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "ระยะเวลาศึกษา" : "Study Duration"}</p>
          <p className="text-xl font-bold text-foreground">{curriculum.durationYears} <span className="text-xs font-normal text-muted-foreground">{isThai ? "ปี" : "years"}</span></p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "ค่าธรรมเนียมการศึกษา" : "Tuition Fees"}</p>
          <p className="text-sm font-bold text-foreground truncate" title={curriculum.tuitionFees || "-"}>
            {curriculum.tuitionFees || (isThai ? "ตามระเบียบมหาวิทยาลัย" : "As per university regulation")}
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Building className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "ภาควิชาที่รับผิดชอบ" : "Department"}</p>
          <p className="text-sm font-bold text-foreground truncate" title={isThai ? curriculum.departmentNameTh : curriculum.departmentNameEn}>
            {isThai ? curriculum.departmentNameTh : curriculum.departmentNameEn}
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Philosophy */}
          {(curriculum.philosophyTh || curriculum.philosophyEn) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Lightbulb className="h-5 w-5" />
                <h2>{isThai ? "ปรัชญาและความสำคัญของหลักสูตร" : "Program Philosophy & Objectives"}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {isThai ? (curriculum.philosophyTh || curriculum.philosophyEn) : (curriculum.philosophyEn || curriculum.philosophyTh)}
              </p>
            </div>
          )}

          {/* Career Opportunities */}
          {(curriculum.careerOpportunitiesTh || curriculum.careerOpportunitiesEn) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Briefcase className="h-5 w-5" />
                <h2>{isThai ? "อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา" : "Career Opportunities"}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {isThai ? (curriculum.careerOpportunitiesTh || curriculum.careerOpportunitiesEn) : (curriculum.careerOpportunitiesEn || curriculum.careerOpportunitiesTh)}
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Actions & Contact */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-foreground">
              {isThai ? "เอกสารและการสมัครเรียน" : "Documents & Admission"}
            </h3>

            {curriculum.curriculumPdfUrl ? (
              <a
                href={curriculum.curriculumPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <FileText className="h-4 w-4" />
                {isThai ? "ดาวน์โหลดเล่มหลักสูตร (มคอ.2)" : "Download Curriculum PDF"}
              </a>
            ) : (
              <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
                {isThai ? "ยังไม่มีไฟล์เอกสาร มคอ.2 สำหรับดาวน์โหลด" : "No PDF document uploaded"}
              </div>
            )}

            <a
              href="https://reg.mcu.ac.th"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              <span>{isThai ? "ระบบรับสมัครนิสิต มจร" : "MCU Online Admission"}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>

          {/* Department Contact Card */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <h4 className="font-bold text-sm text-foreground">
              {isThai ? "ติดต่อสอบถามหลักสูตร" : "Inquiries & Contact"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {isThai
                ? `สำนักงาน${curriculum.departmentNameTh} คณะพุทธศาสตร์ อาคารเรียนรวม มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย อ.วังน้อย จ.พระนครศรีอยุธยา`
                : `Faculty of Buddhism, Mahachulalongkornrajavidyalaya University, Wang Noi, Phra Nakhon Si Ayutthaya`}
            </p>
            <div className="pt-2">
              <Link
                href="/staff"
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                {isThai ? "ดูทำเนียบคณาจารย์ผู้รับผิดชอบ" : "View Faculty Staff"} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
