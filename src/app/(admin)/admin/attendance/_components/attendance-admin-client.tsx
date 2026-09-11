"use client";

import * as React from "react";
import {
  QrCode,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  RefreshCw,
  Plus,
  Calendar,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonField,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import {
  createCourseAction,
  createSessionAction,
  openSessionAction,
  refreshSessionQRTokenAction,
  closeSessionAction,
  updateRecordStatusAction,
  getAdminCourseByIdAction,
  getAdminSessionByIdAction,
  getAdminCoursesAction,
} from "@/features/attendance/actions";
import type {
  AttendanceCourseDto,
  AttendanceSessionDto,
  AttendanceStatus,
  SessionType,
} from "@/features/attendance";

interface Props {
  initialCourses: AttendanceCourseDto[];
  canManage: boolean;
}

export function AttendanceAdminClient({ initialCourses, canManage }: Props) {
  const [courses, setCourses] = React.useState<AttendanceCourseDto[]>(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(
    initialCourses[0]?.id || ""
  );
  const [activeCourse, setActiveCourse] = React.useState<AttendanceCourseDto | null>(
    initialCourses[0] || null
  );
  const [selectedSession, setSelectedSession] = React.useState<AttendanceSessionDto | null>(null);

  // Dynamic QR Projector state
  const [isProjectorOpen, setIsProjectorOpen] = React.useState(false);
  const [projectorSession, setProjectorSession] = React.useState<AttendanceSessionDto | null>(null);
  const [countdown, setCountdown] = React.useState(30);

  // Modal states
  const [isAddCourseOpen, setIsAddCourseOpen] = React.useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Course Form
  const [courseForm, setCourseForm] = React.useState({
    courseCode: "",
    courseNameTh: "",
    courseNameEn: "",
    section: "1",
    semester: "1/2569",
    instructorName: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
    roomNumber: "ห้อง 401",
    totalSessions: 16,
    isActive: true,
  });

  // Session Form
  const [sessionForm, setSessionForm] = React.useState({
    sessionNumber: 1,
    title: "",
    sessionType: "LECTURE" as SessionType,
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "12:00",
  });

  // Load course details when selectedCourseId changes
  const reloadSelectedCourse = React.useCallback(async (courseId: string) => {
    if (!courseId) return;
    const res = await getAdminCourseByIdAction(courseId);
    if (res.ok && res.data) {
      setActiveCourse(res.data);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    if (selectedCourseId) {
      getAdminCourseByIdAction(selectedCourseId).then((res) => {
        if (!ignore && res.ok && res.data) {
          setActiveCourse(res.data);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [selectedCourseId]);

  // Dynamic QR auto-refresh countdown
  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isProjectorOpen && projectorSession && projectorSession.status === "OPEN") {
      timer = setInterval(async () => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Trigger token refresh
            refreshSessionQRTokenAction(projectorSession.id, 30).then((res) => {
              if (res.ok && res.data) {
                setProjectorSession((cur) =>
                  cur ? { ...cur, qrToken: res.data.qrToken, qrExpiresAt: res.data.qrExpiresAt } : null
                );
              }
            });
            // Also refresh attendees list
            getAdminSessionByIdAction(projectorSession.id).then((res) => {
              if (res.ok && res.data) {
                setProjectorSession((cur) =>
                  cur ? { ...cur, records: res.data?.records || [] } : null
                );
              }
            });
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isProjectorOpen, projectorSession]);

  const handleOpenCourseModal = () => {
    setCourseForm({
      courseCode: "",
      courseNameTh: "",
      courseNameEn: "",
      section: "1",
      semester: "1/2569",
      instructorName: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
      roomNumber: "ห้อง 401",
      totalSessions: 16,
      isActive: true,
    });
    setIsAddCourseOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createCourseAction(courseForm);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
        return;
      }
      toast.success("สร้างรายวิชาใหม่เรียบร้อยแล้ว");
      setIsAddCourseOpen(false);
      const listRes = await getAdminCoursesAction();
      if (listRes.ok) {
        setCourses(listRes.data);
        setSelectedCourseId(res.data.id);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSessionModal = () => {
    if (!activeCourse) return;
    const nextNum = (activeCourse.sessions?.length || 0) + 1;
    setSessionForm({
      sessionNumber: nextNum,
      title: `การบรรยายครั้งที่ ${nextNum}`,
      sessionType: "LECTURE",
      sessionDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "12:00",
    });
    setIsAddSessionOpen(true);
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;
    setIsLoading(true);
    try {
      const res = await createSessionAction({
        courseId: activeCourse.id,
        ...sessionForm,
      });
      if (res.ok) {
        toast.success("เพิ่มคาบเรียนเรียบร้อยแล้ว");
        setIsAddSessionOpen(false);
        await reloadSelectedCourse(activeCourse.id);
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Start Open Session & Project Dynamic QR
  const handleLaunchProjector = async (session: AttendanceSessionDto) => {
    setIsLoading(true);
    try {
      const res = await openSessionAction({
        sessionId: session.id,
        expirySeconds: 30,
      });
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถเปิดคาบเรียนได้");
        return;
      }
      setProjectorSession(res.data);
      setCountdown(30);
      setIsProjectorOpen(true);
      await reloadSelectedCourse(session.courseId);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Close Session
  const handleCloseProjectorSession = async () => {
    if (!projectorSession) return;
    setIsLoading(true);
    try {
      const res = await closeSessionAction(projectorSession.id);
      if (res.ok) {
        toast.success("ปิดการเช็คชื่อในคาบเรียนนี้เรียบร้อยแล้ว");
        setIsProjectorOpen(false);
        setProjectorSession(null);
        await reloadSelectedCourse(projectorSession.courseId);
      } else {
        toast.error(res.error.message || "ไม่สามารถปิดคาบเรียนได้");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Student Record Status
  const handleUpdateStatus = async (recordId: string, status: AttendanceStatus) => {
    try {
      const res = await updateRecordStatusAction({
        recordId,
        status,
      });
      if (res.ok) {
        toast.success("ปรับปรุงสถานะเรียบร้อยแล้ว");
        if (selectedSession) {
          const sRes = await getAdminSessionByIdAction(selectedSession.id);
          if (sRes.ok && sRes.data) setSelectedSession(sRes.data);
        }
        if (activeCourse) {
          await reloadSelectedCourse(activeCourse.id);
        }
      } else {
        toast.error(res.error.message || "ไม่สามารถปรับปรุงได้");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <QrCode className="h-7 w-7 text-primary" />
            ระบบตรวจลงทะเบียนเข้าชั้นเรียน (Attendance & Dynamic QR)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ฉายรหัส Dynamic QR Code หมุนเวียนป้องกันการทุจริต ติดตาม Live Roster
            และประเมินสิทธิ์สอบ (ขั้นต่ำ 80%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Button variant="outline" onClick={handleOpenCourseModal} className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มรายวิชา
              </Button>
              {activeCourse && (
                <Button onClick={handleOpenSessionModal} className="gap-2">
                  <Plus className="h-4 w-4" />
                  เพิ่มคาบเรียน
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCourseId(c.id);
              setSelectedSession(null);
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all border ${
              selectedCourseId === c.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {c.courseCode} ({c.section}) {c.courseNameTh}
          </button>
        ))}
      </div>

      {activeCourse && (
        <div className="space-y-6">
          {/* Course Summary Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary">
                  {activeCourse.courseCode} (กลุ่ม {activeCourse.section})
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  ภาคการศึกษา {activeCourse.semester}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-2">
                {activeCourse.courseNameTh}
              </h2>
              <p className="text-xs text-muted-foreground">{activeCourse.courseNameEn}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                <div>
                  อาจารย์ผู้สอน:{" "}
                  <strong className="text-foreground">{activeCourse.instructorName}</strong>
                </div>
                {activeCourse.roomNumber && (
                  <div>
                    ห้องเรียน:{" "}
                    <strong className="text-foreground">{activeCourse.roomNumber}</strong>
                  </div>
                )}
                <div>
                  จำนวนคาบเรียนทั้งหมด:{" "}
                  <strong className="text-foreground">{activeCourse.totalSessions} คาบ</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/attendance/checkin"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/40 hover:bg-muted text-foreground text-xs font-medium"
              >
                <QrCode className="h-3.5 w-3.5 text-primary" />
                เปิดหน้านิสิตสแกน QR
              </a>
              <a
                href="/attendance/history"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/40 hover:bg-muted text-foreground text-xs font-medium"
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                เปิดหน้าตรวจสอบเวลาเรียน
              </a>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-between">
              <span>ตารางคาบเรียนและการเช็คชื่อ ({activeCourse.sessions?.length || 0} คาบ)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCourse.sessions?.map((s) => (
                <div
                  key={s.id}
                  className={`border rounded-2xl p-5 bg-card shadow-sm flex flex-col justify-between transition-all ${
                    s.status === "OPEN"
                      ? "border-emerald-500 ring-2 ring-emerald-500/20"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                        ครั้งที่ {s.sessionNumber}
                      </span>
                      {s.status === "OPEN" && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold animate-pulse">
                          <Play className="h-3 w-3 fill-current" />
                          กำลังเปิดเช็คชื่อ
                        </span>
                      )}
                      {s.status === "CLOSED" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          ปิดคาบแล้ว
                        </span>
                      )}
                      {s.status === "SCHEDULED" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                          กำหนดการ
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-foreground text-base mt-1">{s.title}</h4>

                    <div className="text-xs text-muted-foreground mt-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.sessionDate).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        เวลา: {s.startTime} - {s.endTime} น.
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">นิสิตที่เช็คชื่อแล้ว:</span>
                      <span className="font-bold text-foreground text-sm">
                        {s._count?.records || s.records?.length || 0} คน
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center gap-2">
                    {canManage && s.status !== "OPEN" && (
                      <Button
                        size="sm"
                        onClick={() => handleLaunchProjector(s)}
                        className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Play className="h-3.5 w-3.5" />
                        เปิดห้อง & ฉาย QR
                      </Button>
                    )}

                    {canManage && s.status === "OPEN" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setProjectorSession(s);
                          setIsProjectorOpen(true);
                        }}
                        className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        แสดงจอโปรเจกเตอร์
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const res = await getAdminSessionByIdAction(s.id);
                        if (res.ok && res.data) {
                          setSelectedSession(res.data);
                        }
                      }}
                    >
                      ดูรายชื่อ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Live Roster Table for Selected Session */}
          {selectedSession && (
            <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
                <div>
                  <div className="text-xs font-bold text-primary">
                    ครั้งที่ {selectedSession.sessionNumber}: {selectedSession.title}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    รายชื่อนิสิตที่ลงทะเบียนเข้าเรียน ({selectedSession.records?.length || 0} คน)
                  </h3>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedSession(null)}
                >
                  ปิดหน้ารายชื่อ
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">ลำดับ</th>
                      <th className="px-4 py-3">รหัสนิสิต</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3">สาขาวิชา</th>
                      <th className="px-4 py-3">เวลาที่สแกนเช็คอิน</th>
                      <th className="px-4 py-3">สถานะ</th>
                      {canManage && <th className="px-4 py-3 text-right">ปรับสถานะ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedSession.records?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          ยังไม่มีนิสิตลงทะเบียนในคาบเรียนนี้
                        </td>
                      </tr>
                    ) : (
                      selectedSession.records?.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold text-primary">
                            {rec.studentCode}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {rec.studentName}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {rec.majorProgram || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(rec.checkInTime).toLocaleTimeString("th-TH")} น.
                          </td>
                          <td className="px-4 py-3">
                            {rec.status === "PRESENT" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" />
                                มาเรียน
                              </span>
                            )}
                            {rec.status === "LATE" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                                <Clock className="h-3 w-3" />
                                มาสาย
                              </span>
                            )}
                            {rec.status === "ABSENT" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                                <XCircle className="h-3 w-3" />
                                ขาดเรียน
                              </span>
                            )}
                            {rec.status === "EXCUSED" && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                                ลา (มีใบลา)
                              </span>
                            )}
                          </td>
                          {canManage && (
                            <td className="px-4 py-3 text-right">
                              <select
                                value={rec.status}
                                onChange={(e) =>
                                  handleUpdateStatus(rec.id, e.target.value as AttendanceStatus)
                                }
                                className="text-xs h-7 px-2 rounded border bg-background text-foreground"
                              >
                                <option value="PRESENT">มาตรงเวลา</option>
                                <option value="LATE">มาสาย</option>
                                <option value="ABSENT">ขาดเรียน</option>
                                <option value="EXCUSED">ลาป่วย/ลากิจ</option>
                              </select>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic QR Projector Dialog (Full Screen Classroom Mode) */}
      <LiyonDialog
        open={isProjectorOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setIsProjectorOpen(false);
          }
        }}
      >
        <LiyonDialogHeader
          title={`ฉายจอโปรเจกเตอร์เช็คชื่อ: ${projectorSession?.title || ""}`}
          description={`วิชา ${activeCourse?.courseCode} ${activeCourse?.courseNameTh} (กลุ่ม ${activeCourse?.section})`}
        />

        <LiyonDialogBody className="space-y-6 py-4 text-center">
          <div className="bg-gradient-to-br from-amber-900 via-primary to-amber-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-amber-200 text-xs font-bold">
                <Sparkles className="h-4 w-4" />
                Dynamic Rotating QR Code (เปลี่ยนรหัสอัตโนมัติทุก 30 วินาที)
              </div>

              {/* Big High-Contrast Simulated QR Code */}
              <div className="bg-white text-black p-6 rounded-3xl inline-block shadow-2xl border-4 border-amber-300/40">
                <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center border-4 border-dashed border-gray-800 rounded-2xl relative p-4 bg-gray-50">
                  <QrCode className="w-40 h-40 text-black mb-2 animate-pulse" />
                  <div className="font-mono font-extrabold text-lg text-primary tracking-widest bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                    {projectorSession?.qrToken || "ATT-WAIT"}
                  </div>
                </div>
              </div>

              {/* Dynamic Rotating Progress Bar & Timer */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-amber-200">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    รหัสจะเปลี่ยนใหม่ใน
                  </span>
                  <span className="font-bold text-sm text-white">{countdown} วินาที</span>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Instructions for students */}
              <div className="bg-black/30 backdrop-blur rounded-2xl p-4 max-w-lg mx-auto text-xs text-amber-100/90 text-left space-y-1 border border-white/10">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  ขั้นตอนสำหรับนิสิต:
                </div>
                <div>1. เปิดเว็บไซต์ <strong>/attendance/checkin</strong> บนโทรศัพท์มือถือ</div>
                <div>
                  2. กรอกรหัสคาบเรียน{" "}
                  <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">
                    {projectorSession?.qrToken}
                  </code>{" "}
                  พร้อมรหัสนิสิตและชื่อ-สกุล
                </div>
                <div>3. กดยืนยัน ระบบจะบันทึกเวลาเข้าเรียนขึ้นจออาจารย์ทันที</div>
              </div>

              {/* Live Count */}
              <div className="pt-2 text-sm font-semibold text-white flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                เช็คชื่อสำเร็จแล้วขณะนี้:{" "}
                <span className="text-xl font-extrabold text-emerald-300 font-mono">
                  {projectorSession?.records?.length || 0}
                </span>{" "}
                คน
              </div>
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <LiyonDialogCloseButton label="ย่อหน้าจอ" />
          <Button
            variant="destructive"
            onClick={handleCloseProjectorSession}
            disabled={isLoading}
            className="gap-1.5"
          >
            <Square className="h-4 w-4 fill-current" />
            ปิดคาบเรียน & ยุติการเช็คชื่อ
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Add Course Modal */}
      <LiyonDialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <LiyonDialogHeader
          title="เพิ่มรายวิชาใหม่ (Course Creation)"
          description="กำหนดรหัสวิชา กลุ่มเรียน และอาจารย์ผู้สอนประจำภาคการศึกษา"
        />

        <form onSubmit={handleSaveCourse}>
          <LiyonDialogBody className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <LiyonField label={<>รหัสวิชา <span className="text-destructive">*</span></>}>
                <input
                  type="text"
                  value={courseForm.courseCode}
                  onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                  placeholder="เช่น พธ101 หรือ 000101"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="กลุ่มเรียน (Section)">
                <input
                  type="text"
                  value={courseForm.section}
                  onChange={(e) => setCourseForm({ ...courseForm, section: e.target.value })}
                  placeholder="1"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <LiyonField label={<>ชื่อวิชา (ภาษาไทย) <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={courseForm.courseNameTh}
                onChange={(e) => setCourseForm({ ...courseForm, courseNameTh: e.target.value })}
                placeholder="เช่น พระไตรปิฎกศึกษา"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <LiyonField label={<>ชื่อวิชา (ภาษาอังกฤษ) <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={courseForm.courseNameEn}
                onChange={(e) => setCourseForm({ ...courseForm, courseNameEn: e.target.value })}
                placeholder="e.g. Tipitaka Studies"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-2 gap-3">
              <LiyonField label="อาจารย์ผู้สอน">
                <input
                  type="text"
                  value={courseForm.instructorName}
                  onChange={(e) => setCourseForm({ ...courseForm, instructorName: e.target.value })}
                  placeholder="ชื่อ-นามสกุล หรือสมณศักดิ์"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="ห้องเรียนประจำ">
                <input
                  type="text"
                  value={courseForm.roomNumber || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, roomNumber: e.target.value })}
                  placeholder="เช่น ห้อง 401"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <LiyonField label="ภาคการศึกษา">
                <input
                  type="text"
                  value={courseForm.semester}
                  onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  placeholder="1/2569"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="จำนวนคาบทั้งหมด">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={courseForm.totalSessions}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, totalSessions: parseInt(e.target.value) || 16 })
                  }
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <LiyonDialogCloseButton label="ยกเลิก" />
            <Button type="submit" disabled={isLoading}>
              สร้างรายวิชา
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Add Session Modal */}
      <LiyonDialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
        <LiyonDialogHeader
          title={`เพิ่มคาบเรียน: ${activeCourse?.courseCode}`}
          description="กำหนดหัวข้อการเรียนรู้ วันที่ และเวลา"
        />

        <form onSubmit={handleSaveSession}>
          <LiyonDialogBody className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <LiyonField label="ครั้งที่">
                <input
                  type="number"
                  min={1}
                  value={sessionForm.sessionNumber}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, sessionNumber: parseInt(e.target.value) || 1 })
                  }
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="ประเภทคาบเรียน">
                <select
                  value={sessionForm.sessionType}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, sessionType: e.target.value as SessionType })
                  }
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm"
                >
                  <option value="LECTURE">บรรยายในชั้นเรียน (Lecture)</option>
                  <option value="SEMINAR">สัมมนาเชิงวิชาการ (Seminar)</option>
                  <option value="MEDITATION">ปฏิบัติวิปัสสนากรรมฐาน (Meditation)</option>
                  <option value="FACULTY_ACTIVITY">กิจกรรมคณะ/มหาวิทยาลัย (Activity)</option>
                </select>
              </LiyonField>
            </div>

            <LiyonField label={<>หัวข้อการเรียนรู้ <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="เช่น บทนำพระไตรปิฎกและคัมภีร์อรรถกถา"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-3 gap-3">
              <LiyonField label="วันที่จัดสอน">
                <input
                  type="date"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="เวลาเริ่ม">
                <input
                  type="text"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  placeholder="09:00"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="เวลาสิ้นสุด">
                <input
                  type="text"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  placeholder="12:00"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <LiyonDialogCloseButton label="ยกเลิก" />
            <Button type="submit" disabled={isLoading}>
              เพิ่มคาบเรียน
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
