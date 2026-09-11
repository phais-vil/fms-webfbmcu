import Link from "next/link";
import { User, Mail, Phone, MapPin, Search, ShieldCheck, BookOpen } from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { resolvePublicTenantId } from "@/features/news/server";
import { listStaffDepartments, listPublicStaff } from "@/features/staff/server";

export default async function PublicStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; q?: string }>;
}) {
  const params = await searchParams;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const tenantId = await resolvePublicTenantId();
  const [departments, staffList] = await Promise.all([
    listStaffDepartments(tenantId),
    listPublicStaff(tenantId, {
      departmentId: params.dept,
      search: params.q,
    }),
  ]);

  const executives = !params.dept && !params.q ? staffList.filter((s) => s.isExecutive) : [];
  const otherStaff = !params.dept && !params.q ? staffList.filter((s) => !s.isExecutive) : staffList;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {isThai ? "ทำเนียบคณาจารย์และบุคลากร" : "Faculty & Staff Directory"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {isThai
            ? "ทำเนียบผู้บริหาร คณาจารย์ประจำภาควิชา และบุคลากรสายสนับสนุน คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
            : "Directory of academic professors, executive leaders, and administrative officers of the Faculty of Buddhism, MCU"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link
            href="/staff"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !params.dept
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {isThai ? "บุคลากรทั้งหมด" : "All Departments"}
          </Link>
          {departments.map((dept) => {
            const isActive = params.dept === dept.id;
            return (
              <Link
                key={dept.id}
                href={`/staff?dept=${dept.id}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isThai ? dept.nameTh : dept.nameEn}
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/staff" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder={isThai ? "ค้นหาชื่อ หรือตำแหน่ง..." : "Search name or position..."}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {params.dept && <input type="hidden" name="dept" value={params.dept} />}
        </form>
      </div>

      {/* Executive Leadership Section */}
      {executives.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isThai ? "คณะผู้บริหารประจำคณะพุทธศาสตร์" : "Executive Board of Leadership"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map((staff) => (
              <div
                key={staff.id}
                className="card p-6 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/5 to-card flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-28 w-28 rounded-full bg-muted border-2 border-primary/20 overflow-hidden shadow-inner flex items-center justify-center">
                  {staff.avatarUrl ? (
                    <img src={staff.avatarUrl} alt={staff.fullNameTh} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground mb-1">
                    {isThai ? staff.adminPositionTh : staff.adminPositionEn}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {isThai ? staff.fullNameTh : staff.fullNameEn}
                  </h3>
                  {staff.academicRankTh && (
                    <p className="text-xs text-muted-foreground font-medium">
                      {isThai ? staff.academicRankTh : staff.academicRankEn}
                    </p>
                  )}
                  <p className="text-xs text-primary/80">
                    {isThai ? staff.departmentNameTh : staff.departmentNameEn}
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-border/70 space-y-1.5 text-xs text-muted-foreground text-left">
                  {staff.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                  )}
                  {staff.officeRoom && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{staff.officeRoom}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Staff Members Grid */}
      <section className="space-y-6">
        {executives.length > 0 && (
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
            {isThai ? "คณาจารย์และบุคลากรประจำภาควิชา" : "Academic Faculty & Department Personnel"}
          </h2>
        )}

        {otherStaff.length === 0 && executives.length === 0 ? (
          <div className="card p-16 text-center text-muted-foreground border border-border rounded-xl">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">
              {isThai ? "ไม่พบข้อมูลบุคลากรในเงื่อนไขที่เลือก" : "No staff profiles found for this criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherStaff.map((staff) => (
              <div
                key={staff.id}
                className="card p-5 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {staff.avatarUrl ? (
                      <img src={staff.avatarUrl} alt={staff.fullNameTh} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {isThai ? staff.fullNameTh : staff.fullNameEn}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isThai
                        ? staff.adminPositionTh || staff.academicRankTh || "อาจารย์ประจำ"
                        : staff.adminPositionEn || staff.academicRankEn || "Lecturer"}
                    </p>
                    <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {isThai ? staff.departmentNameTh : staff.departmentNameEn}
                    </span>
                  </div>
                </div>

                {staff.researchInterests && (
                  <div className="bg-muted/40 p-2.5 rounded-lg text-xs text-muted-foreground space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                      <BookOpen className="h-3 w-3 text-primary" />
                      {isThai ? "ความเชี่ยวชาญ / งานวิจัย" : "Research & Expertise"}
                    </span>
                    <p className="line-clamp-2">{staff.researchInterests}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                  {staff.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                  )}
                  {staff.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{staff.phone}</span>
                    </div>
                  )}
                  {staff.officeRoom && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{staff.officeRoom}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
