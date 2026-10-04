"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SchedulesFilterBarProps {
  departments: Array<{ id: string; nameTh: string; nameEn?: string | null }>;
  selectedDept?: string;
  selectedYear: number;
  selectedSemester: number;
  selectedYearLevel: number;
  isThai: boolean;
}

export function SchedulesFilterBar({
  departments,
  selectedDept,
  selectedYear,
  selectedSemester,
  selectedYearLevel,
  isThai,
}: SchedulesFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/curriculum/schedules?${params.toString()}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4 print:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {isThai ? "สาขาวิชา / ภาควิชา" : "Department / Major"}
          </label>
          <select
            value={selectedDept || "ALL"}
            onChange={(e) => handleFilterChange("dept", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">{isThai ? "ทุกสาขาวิชา" : "All Departments"}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {isThai ? d.nameTh : d.nameEn || d.nameTh}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {isThai ? "ปีการศึกษา" : "Academic Year"}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {[2569, 2568, 2567].map((yr) => (
              <option key={yr} value={yr}>
                {isThai ? `ปีการศึกษา ${yr}` : `Year ${yr}`}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {isThai ? "ภาคการศึกษา" : "Semester"}
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => handleFilterChange("semester", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value={1}>{isThai ? "ภาคการศึกษาที่ ๑" : "Semester 1"}</option>
            <option value={2}>{isThai ? "ภาคการศึกษาที่ ๒" : "Semester 2"}</option>
            <option value={3}>{isThai ? "ภาคฤดูร้อน (Summer)" : "Summer"}</option>
          </select>
        </div>

        {/* Year Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {isThai ? "ชั้นปีที่" : "Year Level"}
          </label>
          <select
            value={selectedYearLevel}
            onChange={(e) => handleFilterChange("level", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {[1, 2, 3, 4].map((lvl) => (
              <option key={lvl} value={lvl}>
                {isThai ? `ชั้นปีที่ ${lvl}` : `Year ${lvl}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
