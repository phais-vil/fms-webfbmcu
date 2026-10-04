import Link from "next/link";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { listStaffDepartments } from "@/features/staff/server";
import { listPublicSchedules } from "@/features/curriculum/server";
import { ScheduleTimetableView } from "../_components/schedule-timetable-view";
import { SchedulesFilterBar } from "../_components/schedules-filter-bar";

export default async function PublicSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{
    dept?: string;
    curriculum?: string;
    year?: string;
    semester?: string;
    level?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();

  const selectedYear = params.year ? parseInt(params.year) : 2569;
  const selectedSemester = params.semester ? parseInt(params.semester) : 1;
  const selectedYearLevel = params.level ? parseInt(params.level) : 1;

  const [departments, schedules] = await Promise.all([
    listStaffDepartments(tenantId),
    listPublicSchedules(tenantId, {
      departmentId: params.dept,
      curriculumId: params.curriculum,
      academicYear: selectedYear,
      semester: selectedSemester,
      yearLevel: selectedYearLevel,
    }),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isThai ? "กลับไปหน้าหลักสูตรการศึกษา" : "Back to curriculums"}
        </Link>
      </div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Calendar className="h-4 w-4" />
          {isThai ? "ตารางสอนประจำภาคการศึกษา" : "Semester Class Timetables"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isThai ? "ตารางสอนและตารางเรียน" : "Class Timetables & Schedules"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {isThai
            ? "ค้นหาและตรวจสอบตารางเรียนรายสัปดาห์ คาบเรียน อาจารย์ผู้สอน และห้องเรียน แยกตามสาขาวิชาและชั้นปี คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
            : "Search and review weekly class timetables, courses, lecturers, and lecture rooms by major and year level at Faculty of Buddhism, MCU."}
        </p>
      </div>

      {/* Filter Toolbar */}
      <SchedulesFilterBar
        departments={departments}
        selectedDept={params.dept}
        selectedYear={selectedYear}
        selectedSemester={selectedSemester}
        selectedYearLevel={selectedYearLevel}
        isThai={isThai}
      />

      {/* Timetables Display */}
      {schedules.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="font-bold text-foreground text-lg">
            {isThai ? "ไม่พบตารางสอนสำหรับเงื่อนไขที่เลือก" : "No Schedules Found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isThai
              ? "ยังไม่มีการเพิ่มตารางสอนสำหรับสาขาวิชา หรือภาคการศึกษาที่ท่านเลือก กรุณาลองเปลี่ยนตัวกรอง หรือติดต่อสำนักงานคณบดี"
              : "No class timetable has been registered for this selected criteria. Please adjust your filters or contact the Dean's office."}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {schedules.map((schedule) => (
            <ScheduleTimetableView
              key={schedule.id}
              schedule={schedule}
              isThai={isThai}
            />
          ))}
        </div>
      )}
    </div>
  );
}
