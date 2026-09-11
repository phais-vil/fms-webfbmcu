"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  QrCode,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { studentCheckInAction } from "@/features/attendance/actions";
import type { AttendanceRecordDto } from "@/features/attendance";

export default function StudentCheckInPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <CheckInFormContent />
    </React.Suspense>
  );
}

function CheckInFormContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = React.useState({
    qrToken: tokenFromUrl,
    studentCode: "",
    studentName: "",
    majorProgram: "พุทธศาสตร์ (B.A. Buddhism)",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successRecord, setSuccessRecord] = React.useState<AttendanceRecordDto | null>(null);

  React.useEffect(() => {
    if (tokenFromUrl) {
      const timer = setTimeout(() => {
        setForm((prev) => (prev.qrToken === tokenFromUrl.toUpperCase() ? prev : { ...prev, qrToken: tokenFromUrl.toUpperCase() }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await studentCheckInAction(form);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
        return;
      }
      toast.success("เช็คชื่อเข้าชั้นเรียนสำเร็จ!");
      setSuccessRecord(res.data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      {successRecord ? (
        /* Success State */
        <div className="bg-card border-2 border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
              CHECK-IN SUCCESSFUL
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              ลงทะเบียนเข้าเรียนสำเร็จ
            </h1>
            <p className="text-sm text-muted-foreground">
              บันทึกเวลาเรียนเข้าสู่ฐานข้อมูลคณะพุทธศาสตร์ มจร เรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-muted/40 rounded-2xl p-5 text-left text-xs space-y-2 border">
            <div>
              <span className="text-muted-foreground">รายวิชา: </span>
              <strong className="text-foreground">
                {successRecord.session?.course?.courseCode}{" "}
                {successRecord.session?.course?.courseNameTh}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">คาบเรียน: </span>
              <strong className="text-foreground">
                ครั้งที่ {successRecord.session?.sessionNumber}: {successRecord.session?.title}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">นิสิต: </span>
              <strong className="text-foreground">
                {successRecord.studentName} ({successRecord.studentCode})
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">เวลาที่เช็คอิน: </span>
              <strong className="text-emerald-700 font-mono">
                {new Date(successRecord.checkInTime).toLocaleTimeString("th-TH")} น.
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">สถานะ: </span>
              <span className="font-bold text-emerald-600">
                {successRecord.status === "PRESENT" ? "มาเรียนตรงเวลา" : "มาสาย"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setSuccessRecord(null);
                setForm({
                  qrToken: "",
                  studentCode: form.studentCode,
                  studentName: form.studentName,
                  majorProgram: form.majorProgram,
                });
              }}
              variant="outline"
            >
              เช็คชื่อวิชาอื่น
            </Button>
            <Link
              href="/attendance/history"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
            >
              ตรวจสอบเวลาเรียนสะสม
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className="bg-card border rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              เช็คชื่อเข้าชั้นเรียนออนไลน์
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                รหัสคาบเรียน (Dynamic Token) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.qrToken}
                onChange={(e) => setForm({ ...form, qrToken: e.target.value.toUpperCase() })}
                placeholder="เช่น ATT-A1B2C3 (ดูจากจอโปรเจกเตอร์อาจารย์)"
                required
                className="h-12 w-full rounded-xl border-2 border-primary/30 bg-background px-4 text-base font-mono font-bold tracking-widest text-primary uppercase focus:border-primary focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                รหัสจะหมุนเวียนเปลี่ยนใหม่ทุก 30 วินาทีบนหน้าจออาจารย์
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  รหัสนิสิต <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.studentCode}
                  onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                  placeholder="เช่น 6601201001"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  ชื่อ-นามสกุล (หรือสมณศักดิ์) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="เช่น พระมหาชัชวาลย์ ญาณเมธี"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                สาขาวิชา / ภาควิชา
              </label>
              <input
                type="text"
                value={form.majorProgram}
                onChange={(e) => setForm({ ...form, majorProgram: e.target.value })}
                placeholder="พุทธศาสตร์"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                {isSubmitting ? "กำลังบันทึกเวลา..." : "ยืนยันการเช็คชื่อ"}
              </Button>
            </div>
          </form>

          <div className="border-t pt-4 text-center">
            <Link
              href="/attendance/history"
              className="text-xs text-primary hover:underline font-medium"
            >
              ตรวจสอบประวัติการเข้าเรียนและสิทธิ์สอบ (Exam Eligibility) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
