"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getStudentAttendanceSummaryAction } from "@/features/attendance/actions";
import type { AttendanceRecordDto } from "@/features/attendance";

export default function AttendanceHistoryPage() {
  const [studentCode, setStudentCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<{
    studentCode: string;
    courses: Array<{
      courseId: string;
      courseCode: string;
      courseNameTh: string;
      totalSessions: number;
      attendedCount: number;
      percentage: number;
      isEligible: boolean;
      records: AttendanceRecordDto[];
    }>;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) return;
    setIsLoading(true);
    try {
      const res = await getStudentAttendanceSummaryAction(studentCode);
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถค้นหาข้อมูลได้");
        return;
      }
      setSummary(res.data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div>
        <Link
          href="/attendance/checkin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าเช็คชื่อเข้าชั้นเรียน
        </Link>
      </div>

      {/* Search Header */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Users className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            ตรวจสอบสถิติเวลาเรียน & สิทธิ์สอบ
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            เกณฑ์มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย: นิสิตต้องมีเวลาเรียนไม่น้อยกว่าร้อยละ 80 (80%) จึงจะมีสิทธิ์เข้าสอบไล่
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <input
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="กรอกรหัสนิสิต เช่น 6601201001"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" disabled={isLoading} className="gap-2">
            <Search className="h-4 w-4" />
            ค้นหา
          </Button>
        </form>
      </div>

      {/* Results */}
      {summary && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              ผลการตรวจสอบสำหรับรหัสนิสิต:{" "}
              <span className="font-mono text-primary">{summary.studentCode}</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              พบ {summary.courses.length} รายวิชาที่มีประวัติการเช็คชื่อ
            </span>
          </div>

          {summary.courses.length === 0 ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
              ไม่พบประวัติการเช็คชื่อสำหรับรหัสนิสิตนี้
            </div>
          ) : (
            <div className="space-y-4">
              {summary.courses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-card border rounded-2xl p-6 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {course.courseCode}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1">
                        {course.courseNameTh}
                      </h3>
                    </div>

                    <div>
                      {course.isEligible ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                          มีสิทธิ์สอบ ({course.percentage}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                          <AlertTriangle className="h-4 w-4" />
                          ระวัง: ไม่ถึง 80% ({course.percentage}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        เข้าเรียนแล้ว:{" "}
                        <strong className="text-foreground">{course.attendedCount}</strong> จาก{" "}
                        {course.totalSessions} คาบ
                      </span>
                      <span className="font-bold text-foreground font-mono">
                        {course.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          course.isEligible ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, course.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Sessions Breakdown */}
                  <div className="pt-2 border-t text-xs space-y-2">
                    <div className="font-semibold text-foreground">ประวัติการบันทึกเวลาเรียน:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.records.map((r) => (
                        <div
                          key={r.id}
                          className="p-2.5 rounded-lg bg-muted/40 border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              ครั้งที่ {r.session?.sessionNumber}: {r.session?.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(r.checkInTime).toLocaleDateString("th-TH")}{" "}
                              {new Date(r.checkInTime).toLocaleTimeString("th-TH")} น.
                            </div>
                          </div>
                          <div>
                            {r.status === "PRESENT" && (
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                                มาเรียน
                              </span>
                            )}
                            {r.status === "LATE" && (
                              <span className="text-[11px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                                มาสาย
                              </span>
                            )}
                            {r.status === "EXCUSED" && (
                              <span className="text-[11px] font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                                ลา
                              </span>
                            )}
                            {r.status === "ABSENT" && (
                              <span className="text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                                ขาด
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
