"use client";

import { useRef, useState } from "react";
import {
  Printer,
  MapPin,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Loader2,
  Clock,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  type ClassScheduleDto,
  type ClassScheduleItemDto,
  exportScheduleToPdf,
  exportScheduleToJpeg,
} from "@/features/curriculum";
import { formatThaiDateFull } from "@/shared/lib/format";

interface ScheduleTimetableViewProps {
  schedule: ClassScheduleDto;
  isThai?: boolean;
}

const DAY_NAMES_TH = [
  { day: 1, name: "จันทร์", full: "วันจันทร์", color: "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20" },
  { day: 2, name: "อังคาร", full: "วันอังคาร", color: "border-pink-400 bg-pink-50/50 dark:bg-pink-950/20" },
  { day: 3, name: "พุธ", full: "วันพุธ", color: "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" },
  { day: 4, name: "พฤหัสบดี", full: "วันพฤหัสบดี", color: "border-orange-400 bg-orange-50/50 dark:bg-orange-950/20" },
  { day: 5, name: "ศุกร์", full: "วันศุกร์", color: "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20" },
  { day: 6, name: "เสาร์", full: "วันเสาร์", color: "border-purple-400 bg-purple-50/50 dark:bg-purple-950/20" },
  { day: 7, name: "อาทิตย์", full: "วันอาทิตย์", color: "border-red-400 bg-red-50/50 dark:bg-red-950/20" },
];

const DAY_NAMES_EN = [
  { day: 1, name: "Mon", full: "Monday", color: "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20" },
  { day: 2, name: "Tue", full: "Tuesday", color: "border-pink-400 bg-pink-50/50 dark:bg-pink-950/20" },
  { day: 3, name: "Wed", full: "Wednesday", color: "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" },
  { day: 4, name: "Thu", full: "Thursday", color: "border-orange-400 bg-orange-50/50 dark:bg-orange-950/20" },
  { day: 5, name: "Fri", full: "Friday", color: "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20" },
  { day: 6, name: "Sat", full: "Saturday", color: "border-purple-400 bg-purple-50/50 dark:bg-purple-950/20" },
  { day: 7, name: "Sun", full: "Sunday", color: "border-red-400 bg-red-50/50 dark:bg-red-950/20" },
];

export interface PeriodSlotDef {
  slot: number; // 1 to 9
  labelTh: string;
  labelEn: string;
  timeRange: string;
  session: "morning" | "afternoon" | "evening";
}

export const PERIOD_SLOTS: PeriodSlotDef[] = [
  { slot: 1, labelTh: "คาบ ๑", labelEn: "P 1", timeRange: "09.00-09.50", session: "morning" },
  { slot: 2, labelTh: "คาบ ๒", labelEn: "P 2", timeRange: "09.50-10.40", session: "morning" },
  { slot: 3, labelTh: "คาบ ๓", labelEn: "P 3", timeRange: "10.40-11.30", session: "morning" },
  { slot: 4, labelTh: "คาบ ๔", labelEn: "P 4", timeRange: "12.30-13.20", session: "afternoon" },
  { slot: 5, labelTh: "คาบ ๕", labelEn: "P 5", timeRange: "13.20-14.10", session: "afternoon" },
  { slot: 6, labelTh: "คาบ ๖", labelEn: "P 6", timeRange: "14.20-15.10", session: "afternoon" },
  { slot: 7, labelTh: "คาบ ๗", labelEn: "P 7", timeRange: "15.30-16.20", session: "evening" },
  { slot: 8, labelTh: "คาบ ๘", labelEn: "P 8", timeRange: "16.00-16.50", session: "evening" },
  { slot: 9, labelTh: "คาบ ๙", labelEn: "P 9", timeRange: "16.50-17.30", session: "evening" },
];

const COLOR_PALETTES = [
  {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-l-4 border-amber-500",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200",
    timeBadge: "bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40",
    title: "text-amber-950 dark:text-amber-100",
  },
  {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    border: "border-l-4 border-blue-500",
    badge: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200",
    timeBadge: "bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40",
    title: "text-blue-950 dark:text-blue-100",
  },
  {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-l-4 border-emerald-500",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200",
    timeBadge: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40",
    title: "text-emerald-950 dark:text-emerald-100",
  },
  {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    border: "border-l-4 border-purple-500",
    badge: "bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200",
    timeBadge: "bg-purple-50 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40",
    title: "text-purple-950 dark:text-purple-100",
  },
  {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-l-4 border-rose-500",
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200",
    timeBadge: "bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
    title: "text-rose-950 dark:text-rose-100",
  },
  {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    border: "border-l-4 border-indigo-500",
    badge: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200",
    timeBadge: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40",
    title: "text-indigo-950 dark:text-indigo-100",
  },
];

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().replace("น.", "").replace("น", "");
  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

interface ItemSlotPosition {
  item: ClassScheduleItemDto;
  startSlot: number; // 1..9
  endSlot: number;   // 1..9
  span: number;      // 1..9
  periodCountText: string;
  palette: typeof COLOR_PALETTES[0];
}

function getItemSlotPosition(item: ClassScheduleItemDto, isThai: boolean, index: number): ItemSlotPosition {
  const startMin = parseTimeToMinutes(item.startTime);
  const endMin = parseTimeToMinutes(item.endTime);

  let startSlot = 1;
  let endSlot = 3;

  if (startMin !== null && endMin !== null) {
    // Map startMin to slot 1..9
    if (startMin < 565) startSlot = 1;             // 09:00 -> Slot 1
    else if (startMin < 615) startSlot = 2;        // 09:50 -> Slot 2
    else if (startMin < 700) startSlot = 3;        // 10:40 -> Slot 3
    else if (startMin < 780) startSlot = 4;        // 12:30 -> Slot 4
    else if (startMin < 835) startSlot = 5;        // 13:20 -> Slot 5
    else if (startMin < 895) startSlot = 6;        // 14:20 - 14:30 -> Slot 6
    else if (startMin < 960) startSlot = 7;        // 15:30 -> Slot 7
    else if (startMin < 1010) startSlot = 8;       // 16:00 - 16:20 -> Slot 8
    else startSlot = 9;                            // 16:50+ -> Slot 9

    // Map endMin to slot 1..9
    if (endMin <= 615) endSlot = 1;                // 09:50 -> Slot 1
    else if (endMin <= 665) endSlot = 2;           // 10:40 -> Slot 2
    else if (endMin <= 740) endSlot = 3;           // 11:30 -> Slot 3
    else if (endMin <= 825) endSlot = 4;           // 13:20 -> Slot 4
    else if (endMin <= 875) endSlot = 5;           // 14:10 -> Slot 5
    else if (endMin <= 935) endSlot = 6;           // 15:10 -> Slot 6
    else if (endMin <= 985) endSlot = 7;           // 16:20 -> Slot 7
    else if (endMin <= 1035) endSlot = 8;          // 16:50 -> Slot 8
    else endSlot = 9;                              // 17:30+ -> Slot 9
  } else {
    // Fallback based on slotPeriod text
    const p = item.slotPeriod || "";
    if (p.includes("บ่าย")) {
      startSlot = 4;
      endSlot = 6;
    } else if (p.includes("เย็น") || p.includes("ค่ำ")) {
      startSlot = 7;
      endSlot = 9;
    } else {
      startSlot = 1;
      endSlot = 3;
    }
  }

  // Ensure boundaries 1..9
  startSlot = Math.max(1, Math.min(9, startSlot));
  endSlot = Math.max(startSlot, Math.min(9, endSlot));
  const span = endSlot - startSlot + 1;

  const thaiNumerals = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
  const countStr = isThai
    ? `${thaiNumerals[span] || span} คาบ`
    : `${span} ${span === 1 ? "Period" : "Periods"}`;

  const palette = COLOR_PALETTES[index % COLOR_PALETTES.length];

  return {
    item,
    startSlot,
    endSlot,
    span,
    periodCountText: countStr,
    palette,
  };
}

export function ScheduleTimetableView({
  schedule,
  isThai = true,
}: ScheduleTimetableViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<"pdf" | "jpeg" | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting("pdf");
      const filename = `ตารางสอน_${schedule.academicYear}_ภาค${schedule.semester}_ชั้นปี${schedule.yearLevel}`;
      await exportScheduleToPdf(printRef.current, { filename });
      toast.success(isThai ? "ส่งออกไฟล์ PDF เรียบร้อยแล้ว" : "Exported PDF successfully");
    } catch {
      toast.error(isThai ? "เกิดข้อผิดพลาดในการส่งออก PDF" : "Failed to export PDF");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJpeg = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting("jpeg");
      const filename = `ตารางสอน_${schedule.academicYear}_ภาค${schedule.semester}_ชั้นปี${schedule.yearLevel}`;
      await exportScheduleToJpeg(printRef.current, { filename });
      toast.success(isThai ? "ส่งออกภาพ JPEG เรียบร้อยแล้ว" : "Exported JPEG successfully");
    } catch {
      toast.error(isThai ? "เกิดข้อผิดพลาดในการส่งออก JPEG" : "Failed to export JPEG");
    } finally {
      setIsExporting(null);
    }
  };

  const dayNames = isThai ? DAY_NAMES_TH : DAY_NAMES_EN;

  // Show days with classes or Mon-Thu by default
  const activeDays = dayNames.filter((d) =>
    schedule.items.some((item) => item.dayOfWeek === d.day) || d.day <= 4
  );

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {isThai ? `ปีการศึกษา ${schedule.academicYear}` : `Academic Year ${schedule.academicYear}`}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {isThai ? `ภาคการศึกษาที่ ${schedule.semester}` : `Semester ${schedule.semester}`}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {isThai ? `ชั้นปีที่ ${schedule.yearLevel}` : `Year Level ${schedule.yearLevel}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{isThai ? "ตารางมาตรฐาน มจร" : "Standard Grid"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "timeline"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{isThai ? "แถบเวลาสีสัน" : "Timeline View"}</span>
            </button>
          </div>

          <Button
            onClick={handleExportPdf}
            disabled={isExporting !== null}
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer text-xs"
          >
            {isExporting === "pdf" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{isThai ? "ส่งออก PDF" : "Export PDF"}</span>
          </Button>

          <Button
            onClick={handleExportJpeg}
            disabled={isExporting !== null}
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer text-xs"
          >
            {isExporting === "jpeg" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>{isThai ? "ส่งออก JPEG" : "Export JPEG"}</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{isThai ? "พิมพ์ตารางสอน" : "Print"}</span>
          </Button>
        </div>
      </div>

      {/* Main Timetable Document */}
      <div
        ref={printRef}
        className="bg-card border border-border rounded-xl p-5 sm:p-9 shadow-xs print:border-none print:shadow-none print:p-0 text-foreground"
      >
        {/* Document Header (Thai Buddhist MCU Format) */}
        <div className="text-center space-y-2 pb-6 border-b border-border/80">
          <div className="flex justify-center mb-2">
            <div className="h-14 w-14 rounded-full border-2 border-primary/20 flex items-center justify-center p-2 bg-primary/5">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            {isThai ? schedule.titleTh : (schedule.titleEn || schedule.titleTh)}
          </h2>

          {schedule.targetGroupTh && (
            <p className="text-xs sm:text-sm font-semibold text-foreground/90">
              {isThai ? schedule.targetGroupTh : (schedule.targetGroupEn || schedule.targetGroupTh)}
            </p>
          )}

          {schedule.roomLocationTh && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>{isThai ? schedule.roomLocationTh : (schedule.roomLocationEn || schedule.roomLocationTh)}</span>
            </p>
          )}

          {(schedule.startDate || schedule.endDate) && (
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 max-w-4xl mx-auto px-2">
              <span>
                {schedule.startDate && (
                  isThai
                    ? `เปิดเรียนวันที่ ${formatThaiDateFull(schedule.startDate, "th")}`
                    : `Term Starts: ${formatThaiDateFull(schedule.startDate, "en")}`
                )}
              </span>
              <span>
                {schedule.endDate && (
                  isThai
                    ? `สิ้นสุดวันที่ ${formatThaiDateFull(schedule.endDate, "th")}`
                    : `Term Ends: ${formatThaiDateFull(schedule.endDate, "en")}`
                )}
              </span>
            </div>
          )}
        </div>

        {/* VIEW 1: Standard Academic Grid (Official MCU Format with dynamic period spans) */}
        {viewMode === "grid" ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse border border-border text-xs sm:text-sm min-w-[860px]">
              <thead>
                {/* Session Header Row */}
                <tr className="bg-muted/70 text-muted-foreground divide-x divide-border border-b border-border text-center font-bold">
                  <th className="p-2.5 w-24 text-center">
                    {isThai ? "วัน/เวลา" : "Day / Time"}
                  </th>
                  {/* Morning Session: Col 1 to 3 */}
                  <th colSpan={3} className="p-2 bg-amber-500/10 dark:bg-amber-500/15 border-r-2 border-r-border/80">
                    <span className="block font-bold text-foreground">
                      {isThai ? "ช่วงเช้า (๓ คาบ)" : "Morning (3 Periods)"}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">09.00 - 11.30</span>
                  </th>
                  {/* Afternoon Session: Col 4 to 6 */}
                  <th colSpan={3} className="p-2 bg-blue-500/10 dark:bg-blue-500/15 border-r-2 border-r-border/80">
                    <span className="block font-bold text-foreground">
                      {isThai ? "ช่วงบ่าย (๓ คาบ)" : "Afternoon (3 Periods)"}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">12.30 - 15.10</span>
                  </th>
                  {/* Evening Session: Col 7 to 9 */}
                  <th colSpan={3} className="p-2 bg-purple-500/10 dark:bg-purple-500/15">
                    <span className="block font-bold text-foreground">
                      {isThai ? "ช่วงเย็น / กิจกรรม" : "Evening Session"}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">15.30 - 17.30</span>
                  </th>
                </tr>

                {/* Specific Period Header Row (9 Discrete Slots) */}
                <tr className="bg-muted/40 text-[11px] text-muted-foreground divide-x divide-border border-b border-border text-center font-mono">
                  <th className="p-1.5 font-sans font-medium text-muted-foreground/80">
                    {isThai ? "คาบเรียน" : "Periods"}
                  </th>
                  {PERIOD_SLOTS.map((p) => (
                    <th
                      key={p.slot}
                      className={`p-1.5 w-[10.5%] ${
                        p.slot === 3 || p.slot === 6 ? "border-r-2 border-r-border/80" : ""
                      }`}
                    >
                      <div className="font-semibold text-foreground/80 text-[10px] font-sans">
                        {isThai ? p.labelTh : p.labelEn}
                      </div>
                      <div className="text-[10px] text-muted-foreground tracking-tighter">
                        {p.timeRange}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {activeDays.map((d) => {
                  const dayItems = schedule.items.filter((it) => it.dayOfWeek === d.day);
                  
                  // Calculate slot positions for all items on this day
                  const positions = dayItems
                    .map((it, idx) => getItemSlotPosition(it, isThai, idx))
                    .sort((a, b) => a.startSlot - b.startSlot);

                  // Build table cells dynamically covering all 9 slots (1..9)
                  const cells: React.ReactNode[] = [];
                  let currentSlot = 1;

                  while (currentSlot <= 9) {
                    const matchedCourse = positions.find((p) => p.startSlot === currentSlot);

                    if (matchedCourse) {
                      // Render course slot card spanning its actual period count (1, 2, or 3)
                      const isBorderRightDistinct =
                        matchedCourse.endSlot === 3 || matchedCourse.endSlot === 6;

                      cells.push(
                        <td
                          key={`course-${matchedCourse.item.id || currentSlot}`}
                          colSpan={matchedCourse.span}
                          className={`p-2 align-top transition-colors ${
                            isBorderRightDistinct ? "border-r-2 border-r-border/80" : ""
                          }`}
                        >
                          <div
                            className={`rounded-lg p-2.5 h-full flex flex-col justify-between space-y-1.5 ${matchedCourse.palette.bg} ${matchedCourse.palette.border} shadow-2xs`}
                          >
                            <div className="space-y-1">
                              {/* Header: Course Code & Period/Time Badge */}
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold font-mono ${matchedCourse.palette.badge}`}
                                >
                                  {matchedCourse.item.courseCode}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${matchedCourse.palette.timeBadge}`}
                                >
                                  <Clock className="h-2.5 w-2.5" />
                                  <span>
                                    {matchedCourse.item.startTime} - {matchedCourse.item.endTime} ({matchedCourse.periodCountText})
                                  </span>
                                </span>
                              </div>

                              {/* Course Title */}
                              <div
                                className={`font-bold text-xs sm:text-sm leading-snug pt-0.5 ${matchedCourse.palette.title}`}
                              >
                                {isThai
                                  ? matchedCourse.item.courseNameTh
                                  : (matchedCourse.item.courseNameEn || matchedCourse.item.courseNameTh)}
                              </div>

                              {/* Lecturers */}
                              {matchedCourse.item.instructorsTh && (
                                <div className="text-[11px] text-muted-foreground leading-tight whitespace-pre-line pt-0.5">
                                  {isThai
                                    ? matchedCourse.item.instructorsTh
                                    : (matchedCourse.item.instructorsEn || matchedCourse.item.instructorsTh)}
                                </div>
                              )}
                            </div>

                            {/* Room or Note Footer */}
                            {matchedCourse.item.roomOrNote && (
                              <div className="text-[10px] text-muted-foreground/80 italic pt-1 border-t border-border/40 flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5 shrink-0 opacity-70" />
                                <span className="truncate">{matchedCourse.item.roomOrNote}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );

                      currentSlot += matchedCourse.span;
                    } else {
                      // Calculate empty slot span
                      const nextCourse = positions.find((p) => p.startSlot > currentSlot);
                      const nextCourseStart = nextCourse ? nextCourse.startSlot : 10;
                      
                      // Keep empty slot spans within session boundaries (slot 3 and slot 6) for crisp borders
                      let emptyEnd = nextCourseStart - 1;
                      if (currentSlot <= 3 && emptyEnd > 3) emptyEnd = 3;
                      else if (currentSlot <= 6 && currentSlot > 3 && emptyEnd > 6) emptyEnd = 6;
                      
                      const emptySpan = Math.max(1, emptyEnd - currentSlot + 1);
                      const isBorderRightDistinct =
                        currentSlot + emptySpan - 1 === 3 || currentSlot + emptySpan - 1 === 6;

                      cells.push(
                        <td
                          key={`empty-${currentSlot}`}
                          colSpan={emptySpan}
                          className={`p-2 text-center align-middle bg-muted/5 text-muted-foreground/30 text-xs font-mono select-none ${
                            isBorderRightDistinct ? "border-r-2 border-r-border/80" : ""
                          }`}
                        >
                          <span className="text-[11px] opacity-40">-</span>
                        </td>
                      );

                      currentSlot += emptySpan;
                    }
                  }

                  return (
                    <tr
                      key={d.day}
                      className="divide-x divide-border hover:bg-muted/10 transition-colors"
                    >
                      {/* Day Column */}
                      <td className="p-3 text-center font-bold align-middle bg-muted/20">
                        <div className="text-foreground font-semibold">{d.name}</div>
                        <div className="text-[10px] font-normal text-muted-foreground hidden sm:block">
                          {d.full}
                        </div>
                      </td>

                      {/* Dynamic Slots for this day */}
                      {cells}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: Visual Timeline Strip View (แทบสีพื้น แสดงตามแถบเวลาต่อเนื่อง) */
          <div className="mt-6 space-y-4">
            <div className="text-xs text-muted-foreground flex items-center justify-between pb-2 border-b border-border">
              <span>{isThai ? "เวลาเรียน: ๐๙.๐๐ น. — ๑๗.๓๐ น." : "Class Schedule: 09:00 - 17:30"}</span>
              <span className="text-[11px]">{isThai ? "ความกว้างแถบสีสัมพันธ์กับจำนวนคาบจริง" : "Color width proportional to class duration"}</span>
            </div>

            <div className="space-y-3">
              {activeDays.map((d) => {
                const dayItems = schedule.items.filter((it) => it.dayOfWeek === d.day);
                const positions = dayItems
                  .map((it, idx) => getItemSlotPosition(it, isThai, idx))
                  .sort((a, b) => a.startSlot - b.startSlot);

                return (
                  <div
                    key={d.day}
                    className="p-3.5 rounded-xl border border-border bg-card/50 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    {/* Day Badge */}
                    <div className="w-24 shrink-0 font-bold flex sm:flex-col items-center sm:items-start justify-between sm:justify-center">
                      <span className="text-sm text-foreground">{d.full}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {positions.length > 0
                          ? isThai ? `${positions.length} รายวิชา` : `${positions.length} Classes`
                          : isThai ? "ไม่มีการสอน" : "No Classes"}
                      </span>
                    </div>

                    {/* Timeline Course Badges */}
                    <div className="flex-1 flex flex-wrap gap-2.5 items-center">
                      {positions.length === 0 ? (
                        <span className="text-xs text-muted-foreground/60 italic">
                          {isThai ? "— ไม่มีตารางเรียนในวันนี้ —" : "— Free Day —"}
                        </span>
                      ) : (
                        positions.map((pos) => (
                          <div
                            key={pos.item.id || pos.item.courseCode}
                            className={`rounded-lg p-2.5 border ${pos.palette.border} ${pos.palette.bg} shadow-2xs flex-1 min-w-[240px] max-w-sm`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${pos.palette.badge}`}>
                                {pos.item.courseCode}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] ${pos.palette.timeBadge}`}>
                                <Clock className="h-2.5 w-2.5" />
                                {pos.item.startTime} - {pos.item.endTime} ({pos.periodCountText})
                              </span>
                            </div>

                            <div className={`font-bold text-xs leading-snug ${pos.palette.title}`}>
                              {isThai ? pos.item.courseNameTh : (pos.item.courseNameEn || pos.item.courseNameTh)}
                            </div>

                            {pos.item.instructorsTh && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                                {isThai ? pos.item.instructorsTh : (pos.item.instructorsEn || pos.item.instructorsTh)}
                              </div>
                            )}

                            {pos.item.roomOrNote && (
                              <div className="text-[10px] text-muted-foreground/80 italic mt-1 pt-1 border-t border-border/40 flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5 opacity-70" />
                                <span>{pos.item.roomOrNote}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Remarks Section (MCU Footer Notes) */}
        {(schedule.remarksTh || schedule.remarksEn) && (
          <div className="mt-6 pt-4 border-t border-border/80 text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground">
              {isThai ? "หมายเหตุท้ายตาราง:" : "Remarks:"}
            </div>
            <div className="whitespace-pre-line leading-relaxed pl-2">
              {isThai ? schedule.remarksTh : (schedule.remarksEn || schedule.remarksTh)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
