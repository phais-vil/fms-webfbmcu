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
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  Users,
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
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาตรี (๔ ปี)" : "Bachelor's Degree (4 Years)"}</span>;
      case "MASTER":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาโท (๒ ปี)" : "Master's Degree (2 Years)"}</span>;
      case "DOCTORAL":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "ระดับปริญญาเอก (๓ ปี)" : "Doctoral Degree (Ph.D.)"}</span>;
      case "CERTIFICATE":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-3 py-1 rounded-full font-medium">{isThai ? "หลักสูตรประกาศนียบัตร" : "Certificate Program"}</span>;
      default:
        return null;
    }
  };

  // Format career opportunities as item list
  const rawCareers = isThai
    ? (curriculum.careerOpportunitiesTh || curriculum.careerOpportunitiesEn || "")
    : (curriculum.careerOpportunitiesEn || curriculum.careerOpportunitiesTh || "");

  const careerList = rawCareers
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

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
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 relative overflow-hidden">
        {curriculum.coverImage && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
            <img
              src={curriculum.coverImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-md">
            {curriculum.code}
          </span>
          {getLevelBadge(curriculum.degreeLevel)}
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {isThai ? `หลักสูตรปรับปรุง พ.ศ. ${curriculum.effectiveYear}` : `Curriculum Revision Year ${curriculum.effectiveYear}`}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md flex items-center gap-1">
            <Building className="h-3.5 w-3.5" />
            {isThai ? curriculum.departmentNameTh : curriculum.departmentNameEn}
          </span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {isThai ? curriculum.nameTh : curriculum.nameEn}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            {isThai ? curriculum.nameEn : curriculum.nameTh}
          </p>
        </div>

        {/* Degree Name Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border text-sm max-w-4xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isThai ? "ชื่อปริญญาภาษาไทย (เต็ม / ย่อ)" : "Thai Degree Title (Full / Abbr)"}
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {curriculum.degreeTh} <span className="text-primary font-semibold">({curriculum.degreeAbbrTh})</span>
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isThai ? "ชื่อปริญญาภาษาอังกฤษ (เต็ม / ย่อ)" : "English Degree Title (Full / Abbr)"}
            </span>
            <p className="font-medium text-foreground mt-0.5">
              {curriculum.degreeEn} <span className="text-primary font-semibold">({curriculum.degreeAbbrEn})</span>
            </p>
          </div>
        </div>

        {/* Action buttons inside header */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {curriculum.curriculumPdfUrl && (
            <a
              href={curriculum.curriculumPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <FileText className="h-4 w-4" />
              <span>{isThai ? "ดาวน์โหลดเล่มหลักสูตร มคอ.๒ (PDF)" : "Download TQF 2 PDF"}</span>
            </a>
          )}
          <a
            href="https://reg.mcu.ac.th"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors shadow-xs"
          >
            <span>{isThai ? "สมัครเรียนออนไลน์ (มจร)" : "MCU Online Admission"}</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Highlight Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-2 shadow-xs">
          <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "จำนวนหน่วยกิตรวม" : "Total Credits"}</p>
          <p className="text-xl font-bold text-foreground">{curriculum.totalCredits} <span className="text-xs font-normal text-muted-foreground">{isThai ? "หน่วยกิต" : "credits"}</span></p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2 shadow-xs">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "ระยะเวลาศึกษา" : "Study Duration"}</p>
          <p className="text-xl font-bold text-foreground">{curriculum.durationYears} <span className="text-xs font-normal text-muted-foreground">{isThai ? "ปี" : "years"}</span></p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2 shadow-xs">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "ค่าธรรมเนียมการศึกษา" : "Tuition Fees"}</p>
          <p className="text-sm font-bold text-foreground truncate" title={curriculum.tuitionFees || "-"}>
            {curriculum.tuitionFees || (isThai ? "ตามระเบียบมหาวิทยาลัย" : "As per university regulation")}
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2 shadow-xs">
          <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground">{isThai ? "วุฒิการศึกษา" : "Degree Qualification"}</p>
          <p className="text-sm font-bold text-foreground truncate" title={isThai ? curriculum.degreeAbbrTh : curriculum.degreeAbbrEn}>
            {isThai ? curriculum.degreeAbbrTh : curriculum.degreeAbbrEn}
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Philosophy & Objectives */}
          {(curriculum.philosophyTh || curriculum.philosophyEn) && (
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
                <Lightbulb className="h-5 w-5" />
                <h2>{isThai ? "ปรัชญา ความสำคัญ และวัตถุประสงค์ของหลักสูตร" : "Program Philosophy, Significance & Objectives"}</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-3">
                {isThai ? (curriculum.philosophyTh || curriculum.philosophyEn) : (curriculum.philosophyEn || curriculum.philosophyTh)}
              </div>
            </div>
          )}

          {/* Curriculum Structure Highlight */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Sparkles className="h-5 w-5" />
              <h2>{isThai ? "โครงสร้างหลักสูตรและสัดส่วนหน่วยกิต" : "Curriculum Structure & Credits"}</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {isThai
                ? `โครงสร้างหลักสูตรกำหนดตามเกณฑ์มาตรฐานกระทรวง อว. และประกาศมหาวิทยาลัย รวมตลอดหลักสูตรไม่น้อยกว่า ${curriculum.totalCredits} หน่วยกิต`
                : `Curriculum structure aligned with Higher Education standards, requiring a minimum of ${curriculum.totalCredits} total credits.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/80 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">{isThai ? "๑. หมวดวิชาศึกษาทั่วไป" : "1. General Education"}</span>
                <p className="text-lg font-bold text-foreground">30 <span className="text-xs font-normal text-muted-foreground">{isThai ? "หน่วยกิต" : "credits"}</span></p>
                <p className="text-xs text-muted-foreground">{isThai ? "วิชาบังคับ ๑๘, วิชาเลือก ๑๒" : "Required 18, Electives 12"}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                <span className="text-xs text-primary font-semibold uppercase">{isThai ? "๒. หมวดวิชาเฉพาะ" : "2. Core & Specialized"}</span>
                <p className="text-lg font-bold text-primary">{curriculum.totalCredits >= 140 ? 104 : (curriculum.totalCredits - 36)} <span className="text-xs font-normal text-muted-foreground">{isThai ? "หน่วยกิต" : "credits"}</span></p>
                <p className="text-muted-foreground text-xs">{isThai ? "กลุ่มพุทธศาสนา, วิชาแกน, วิชาเฉพาะด้าน" : "Buddhist, Core & Major courses"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/40 border border-border/80 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase">{isThai ? "๓. หมวดวิชาเลือกเสรี" : "3. Free Electives"}</span>
                <p className="text-lg font-bold text-foreground">6 <span className="text-xs font-normal text-muted-foreground">{isThai ? "หน่วยกิต" : "credits"}</span></p>
                <p className="text-xs text-muted-foreground">{isThai ? "เลือกเรียนข้ามสาขาหรือคณะได้" : "Cross-departmental electives"}</p>
              </div>
            </div>
          </div>

          {/* Program Expected Learning Outcomes (PLOs) */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
              <Award className="h-5 w-5" />
              <h2>{isThai ? "ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)" : "Expected Learning Outcomes (PLOs)"}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>{isThai ? "ด้านวิชาการ & ทฤษฎี" : "Academic Mastery"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isThai
                    ? "รอบรู้ในหลักการและทฤษฎีทางศาสนาและปรัชญา สามารถวิเคราะห์วิพากษ์ปัญหาด้วยวิธีการทางวิชาการและใช้เครื่องมือได้อย่างมีประสิทธิภาพ"
                    : "Comprehensive theoretical knowledge in religion and philosophy with sharp analytical skills."}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span>{isThai ? "การคิดวิเคราะห์ & บูรณาการ" : "Critical Integration"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isThai
                    ? "คิดเป็นเหตุเป็นผล สังเคราะห์ข้อมูลจากแหล่งที่หลากหลาย บูรณาการองค์ความรู้เพื่อเสนอแนะแนวทางพัฒนาชีวิตและสังคม"
                    : "Systematic critical thinking and cross-disciplinary integration for social and economic problem solving."}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{isThai ? "คุณธรรม & ความเป็นผู้นำ" : "Ethics & Leadership"}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isThai
                    ? "มีความซื่อสัตย์สุจริต รับผิดชอบต่อตนเองและสังคม มีภาวะผู้นำทางจิตใจและปัญญา เป็นแบบอย่างที่ดีในสังคมพหุวัฒนธรรม"
                    : "High ethical standards, social responsibility, and spiritual leadership in a diverse global society."}
                </p>
              </div>
            </div>
          </div>

          {/* Career Opportunities */}
          {careerList.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary font-bold text-lg">
                <Briefcase className="h-5 w-5" />
                <h2>{isThai ? "อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา" : "Career Opportunities upon Graduation"}</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {isThai
                  ? "ผู้สำเร็จการศึกษาสามารถเข้าทำงานในส่วนราชการ (ก.พ., พศ.), สถาบันการศึกษา, องค์กรศาสนา และภาคเอกชน ดังนี้"
                  : "Graduates are qualified for public civil service, educational institutions, religious bodies, and private sector roles:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {careerList.map((career, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/80 text-sm hover:border-primary/40 transition-colors"
                  >
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground leading-relaxed font-medium">
                      {career.replace(/^[0-9๑-๙()\. -]+/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Actions & Contact */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>{isThai ? "เอกสารและการสมัครเรียน" : "Documents & Admission"}</span>
            </h3>

            {curriculum.curriculumPdfUrl ? (
              <a
                href={curriculum.curriculumPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <FileText className="h-4 w-4" />
                <span>{isThai ? "ดาวน์โหลดเล่มหลักสูตร มคอ.๒ (PDF)" : "Download TQF 2 PDF"}</span>
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors shadow-xs"
            >
              <span>{isThai ? "ระบบรับสมัครนิสิต มจร" : "MCU Online Admission"}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>

          {/* Department Contact Card */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3 shadow-xs">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span>{isThai ? "ติดต่อสอบถามหลักสูตร" : "Department Inquiries"}</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai
                ? `สำนักงาน${curriculum.departmentNameTh} คณะพุทธศาสตร์ อาคารเรียนรวม มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย อ.วังน้อย จ.พระนครศรีอยุธยา`
                : `Faculty of Buddhism, Mahachulalongkornrajavidyalaya University, Wang Noi, Phra Nakhon Si Ayutthaya`}
            </p>
            <div className="pt-2">
              <Link
                href="/staff"
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                <span>{isThai ? "ดูทำเนียบคณาจารย์ผู้รับผิดชอบ" : "View Faculty Staff"}</span> &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
