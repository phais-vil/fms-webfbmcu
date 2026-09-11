"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileCheck,
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Award,
  BookOpen,
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
  submitStudentRequestAction,
  trackStudentRequestsAction,
} from "@/features/student-services/actions";
import type {
  CertificateTypeDto,
  StudentRequestDto,
  DegreeLevel,
} from "@/features/student-services";

interface Props {
  initialTypes: CertificateTypeDto[];
  locale: string;
}

export function ServicesClient({ initialTypes, locale }: Props) {
  const isThai = locale === "th";
  const [types] = React.useState<CertificateTypeDto[]>(initialTypes);
  const [activeTab, setActiveTab] = React.useState<"catalog" | "track" | "verify">("catalog");

  // Track Request state
  const [trackStudentCode, setTrackStudentCode] = React.useState("");
  const [myRequests, setMyRequests] = React.useState<StudentRequestDto[] | null>(null);
  const [isSearchingTrack, setIsSearchingTrack] = React.useState(false);

  // Quick verify code input
  const [quickVerifyCode, setQuickVerifyCode] = React.useState("");

  // Submission Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<CertificateTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    studentCode: "",
    titleTh: "พระ",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    degreeLevel: "BACHELOR" as DegreeLevel,
    majorProgram: "พุทธศาสตร์ (Buddhism)",
    yearLevel: 1,
    email: "",
    phone: "",
    purpose: "",
    copies: 1,
  });

  const handleOpenSubmit = (typeItem?: CertificateTypeDto) => {
    if (typeItem) {
      setSelectedType(typeItem);
    } else if (types.length > 0) {
      setSelectedType(types[0]);
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setIsSubmitting(true);
    try {
      const res = await submitStudentRequestAction({
        certificateTypeId: selectedType.id,
        ...form,
      });

      if (res.ok) {
        toast.success(
          isThai
            ? `ยื่นคำร้องสำเร็จ! เลขคำร้องของคุณคือ ${res.data.requestNumber}`
            : `Request submitted! Your request number is ${res.data.requestNumber}`
        );
        setIsSubmitModalOpen(false);
        // Switch to track tab and load this student's requests
        setTrackStudentCode(form.studentCode);
        setActiveTab("track");
        const trackRes = await trackStudentRequestsAction(form.studentCode);
        if (trackRes.ok) {
          setMyRequests(trackRes.data);
        }
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการยื่นคำร้อง");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackStudentCode.trim()) return;
    setIsSearchingTrack(true);
    try {
      const res = await trackStudentRequestsAction(trackStudentCode);
      if (res.ok) {
        setMyRequests(res.data);
      } else {
        toast.error(res.error.message || "ไม่สามารถค้นหาได้");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsSearchingTrack(false);
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-primary to-amber-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-amber-100 text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            {isThai ? "ระบบบริการคำร้องนิสิตออนไลน์ & QR Verification" : "Online Student Services & QR Verification"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {isThai
              ? "บริการนิสิตออนไลน์และตรวจสอบเอกสารดิจิทัล"
              : "Online Student Services & Digital Document Verification"}
          </h1>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            {isThai
              ? "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ให้บริการยื่นขอหนังสือรับรองสถานภาพนิสิต หนังสือรับรองความประพฤติ และตรวจสอบความถูกต้องของเอกสารด้วยรหัส QR Code ทันสมัย ปลอดภัย และสะดวกรวดเร็ว"
              : "Faculty of Buddhism, MCU offers online certificate issuance and real-time QR code verification for students and third-party organizations."}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleOpenSubmit()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-900 font-bold text-sm shadow-md hover:bg-amber-50 transition-all transform hover:-translate-y-0.5"
            >
              <FileCheck className="h-4 w-4" />
              {isThai ? "ยื่นคำร้องขอเอกสารทันที" : "Submit Request Now"}
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur transition-all border border-white/20"
            >
              <Search className="h-4 w-4" />
              {isThai ? "ติดตามสถานะคำร้อง" : "Track My Request"}
            </button>
            <button
              onClick={() => setActiveTab("verify")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur transition-all border border-white/20"
            >
              <ShieldCheck className="h-4 w-4" />
              {isThai ? "ตรวจสอบ QR วุฒิบัตร" : "Verify Document QR"}
            </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Award className="w-96 h-96" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "catalog"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {isThai ? "รายการประเภทเอกสารที่เปิดขอได้" : "Certificate Catalog"}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "track"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          {isThai ? "ติดตามสถานะคำร้อง" : "Track Request Status"}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verify")}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "verify"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          {isThai ? "ตรวจสอบความถูกต้องของเอกสาร (QR)" : "Verify Document"}
        </button>
      </div>

      {/* Tab 1: Certificate Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isThai ? "เลือกประเภทเอกสารที่ต้องการยื่นคำร้อง" : "Available Certificate Types"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isThai
                  ? "คลิกเลือกเอกสารเพื่อกรอกแบบฟอร์มยื่นคำร้องออนไลน์"
                  : "Click on any certificate to fill in the online application form"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {types.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary">
                      {item.code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                      {isThai ? "เปิดให้บริการ" : "Active"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {isThai ? item.nameTh : item.nameEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {isThai ? item.nameEn : item.nameTh}
                  </p>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {item.descriptionTh || "เอกสารรับรองอย่างเป็นทางการ ออกโดยคณะพุทธศาสตร์ มจร"}
                  </p>

                  <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      {isThai ? "ระยะเวลาดำเนินการ:" : "Processing:"}{" "}
                      <span className="font-bold text-foreground block mt-0.5">
                        {item.processingDays} {isThai ? "วันทำการ" : "Days"}
                      </span>
                    </div>
                    <div>
                      {isThai ? "ค่าธรรมเนียม:" : "Fee:"}{" "}
                      <span className="font-bold text-foreground block mt-0.5">
                        {Number(item.fee) > 0 ? `${Number(item.fee)} ฿` : isThai ? "ฟรี" : "Free"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Button
                    onClick={() => handleOpenSubmit(item)}
                    className="w-full justify-center gap-2 group-hover:bg-primary"
                  >
                    <FileCheck className="h-4 w-4" />
                    {isThai ? "ยื่นคำร้องขอนี้" : "Apply for Certificate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Track Status */}
      {activeTab === "track" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isThai ? "ติดตามสถานะคำร้องของนิสิต" : "Track Your Request Status"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isThai
                  ? "กรอกรหัสนิสิต (เช่น 6601201001) เพื่อดูประวัติและผลการพิจารณาคำร้องทั้งหมดของคุณ"
                  : "Enter your Student Code to view all your application status and verification codes"}
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={trackStudentCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackStudentCode(e.target.value)}
                placeholder={isThai ? "รหัสนิสิต เช่น 6601201001" : "Student Code e.g. 6601201001"}
                className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Button type="submit" disabled={isSearchingTrack} className="gap-2">
                <Search className="h-4 w-4" />
                {isThai ? "ค้นหาคำร้อง" : "Search"}
              </Button>
            </form>
          </div>

          {/* Search Results */}
          {myRequests !== null && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-base flex items-center justify-between">
                <span>
                  {isThai ? "ผลการค้นหาคำร้อง:" : "Request Results:"} {myRequests.length}{" "}
                  {isThai ? "รายการ" : "items"}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {trackStudentCode}
                </span>
              </h3>

              {myRequests.length === 0 ? (
                <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p>{isThai ? "ไม่พบประวัติคำร้องสำหรับรหัสนิสิตนี้" : "No requests found for this student code"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-card border rounded-xl p-5 shadow-sm space-y-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="text-xs font-mono font-bold text-primary">
                            {req.requestNumber}
                          </div>
                          <h4 className="font-bold text-foreground text-base">
                            {req.certificateType?.nameTh}
                          </h4>
                        </div>

                        <div>
                          {req.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
                              <Clock className="h-3.5 w-3.5" />
                              {isThai ? "รอเจ้าหน้าที่ตรวจสอบ" : "Pending Review"}
                            </span>
                          )}
                          {req.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isThai ? "อนุมัติแล้ว พร้อมใช้งาน" : "Approved"}
                            </span>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-destructive/10 text-destructive">
                              <XCircle className="h-3.5 w-3.5" />
                              {isThai ? "ปฏิเสธคำร้อง" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t">
                        <div>
                          {isThai ? "ยื่นเมื่อ:" : "Date:"}{" "}
                          <span className="text-foreground">
                            {new Date(req.createdAt).toLocaleDateString("th-TH")}
                          </span>
                        </div>
                        <div>
                          {isThai ? "จำนวน:" : "Copies:"}{" "}
                          <span className="text-foreground">{req.copies} ฉบับ</span>
                        </div>
                        <div>
                          {isThai ? "สาขา:" : "Major:"}{" "}
                          <span className="text-foreground">{req.majorProgram}</span>
                        </div>
                      </div>

                      {req.rejectionReason && (
                        <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg">
                          <strong>{isThai ? "เหตุผลที่ปฏิเสธ:" : "Rejection Reason:"}</strong>{" "}
                          {req.rejectionReason}
                        </div>
                      )}

                      {req.status === "APPROVED" && req.verificationCode && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                          <div>
                            <div className="font-bold flex items-center gap-1 text-emerald-800">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              {isThai ? "รหัสรับรองเอกสารดิจิทัล:" : "Digital Verification Code:"}
                            </div>
                            <div className="font-mono text-sm font-extrabold text-emerald-700 mt-0.5">
                              {req.verificationCode}
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-1">
                              {isThai ? "ใช้งานได้ถึง:" : "Valid until:"}{" "}
                              {req.expiresAt ? new Date(req.expiresAt).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                            </div>
                          </div>

                          <Link
                            href={`/verify/${req.verificationCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            {isThai ? "เปิดหน้าตรวจสอบ QR" : "Open QR Verification"}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: QR Verify Code Search */}
      {activeTab === "verify" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isThai ? "ตรวจสอบความถูกต้องของเอกสาร & วุฒิบัตร" : "Document & Certificate Verification"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isThai
                  ? "พิมพ์รหัสรับรอง (Verification Code) ที่ปรากฏบนเอกสาร หรือสแกน QR Code จากเอกสาร เพื่อตรวจสอบความถูกต้องทันที"
                  : "Enter the Verification Code printed on the document or scanned from QR Code to verify its authenticity"}
              </p>
            </div>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={quickVerifyCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickVerifyCode(e.target.value)}
                  placeholder="เช่น MCU-FMS-2026-XXXX"
                  className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
                <Link
                  href={quickVerifyCode.trim() ? `/verify/${quickVerifyCode.trim()}` : "#"}
                  onClick={(e) => {
                    if (!quickVerifyCode.trim()) {
                      e.preventDefault();
                      toast.error("กรุณาระบุรหัสยืนยันเอกสาร");
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isThai ? "ตรวจสอบทันที" : "Verify Now"}
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <div>
                <div className="font-bold text-foreground">100% ดิจิทัล</div>
                <div>ป้องกันการปลอมแปลง</div>
              </div>
              <div>
                <div className="font-bold text-foreground">ตรวจสอบได้ทันที</div>
                <div>ผ่านระบบออนไลน์ 24 ชม.</div>
              </div>
              <div>
                <div className="font-bold text-foreground">ออกโดย มจร</div>
                <div>คณะพุทธศาสตร์</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      <LiyonDialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <LiyonDialogHeader
          title={
            isThai
              ? `ยื่นคำร้องขอ: ${selectedType?.nameTh || ""}`
              : `Request Certificate: ${selectedType?.nameEn || ""}`
          }
          description={
            isThai
              ? `ระยะเวลาดำเนินการประมาณ ${selectedType?.processingDays || 3} วันทำการ | ค่าธรรมเนียม: ${
                  Number(selectedType?.fee) > 0 ? `${Number(selectedType?.fee)} บาท` : "ฟรี"
                }`
              : `Processing time: ${selectedType?.processingDays || 3} days`
          }
        />

        <form onSubmit={handleSubmitRequest}>
          <LiyonDialogBody className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={
                  <>
                    รหัสนิสิต <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={form.studentCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, studentCode: e.target.value })}
                  placeholder="เช่น 6601201001"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="คำนำหน้า">
                <select
                  value={form.titleTh}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, titleTh: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm"
                >
                  <option value="พระ">พระ</option>
                  <option value="พระมหา">พระมหา</option>
                  <option value="พระครู">พระครู</option>
                  <option value="สามเณร">สามเณร</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={
                  <>
                    ชื่อ (ภาษาไทย) <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={form.firstNameTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, firstNameTh: e.target.value })}
                  placeholder="สมชาย / ญาณสํวโร"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField
                label={
                  <>
                    นามสกุล (ภาษาไทย) <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={form.lastNameTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lastNameTh: e.target.value })}
                  placeholder="ใจดี / เจริญสุข"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label="ระดับการศึกษา">
                <select
                  value={form.degreeLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setForm({ ...form, degreeLevel: e.target.value as DegreeLevel })
                  }
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm"
                >
                  <option value="BACHELOR">ปริญญาตรี (B.A.)</option>
                  <option value="MASTER">ปริญญาโท (M.A.)</option>
                  <option value="DOCTORAL">ปริญญาเอก (Ph.D.)</option>
                </select>
              </LiyonField>

              <LiyonField
                label={
                  <>
                    สาขาวิชา <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={form.majorProgram}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, majorProgram: e.target.value })}
                  placeholder="พุทธศาสตร์"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="ชั้นปี">
                <select
                  value={form.yearLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setForm({ ...form, yearLevel: parseInt(e.target.value) || 1 })
                  }
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm"
                >
                  {[1, 2, 3, 4, 5, 6].map((yr) => (
                    <option key={yr} value={yr}>
                      ชั้นปีที่ {yr}
                    </option>
                  ))}
                </select>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={
                  <>
                    อีเมลติดต่อ <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@mcu.ac.th"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField
                label={
                  <>
                    เบอร์โทรศัพท์ติดต่อ <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })}
                  placeholder="081-234-5678"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <LiyonField
                  label={
                    <>
                      วัตถุประสงค์ในการขอเอกสาร <span className="text-destructive">*</span>
                    </>
                  }
                >
                  <textarea
                    value={form.purpose}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="เช่น ใช้ยื่นขอเปิดบัญชีธนาคารกรุงไทย สาขาวังน้อย / สมัครงาน / สอบคัดเลือก"
                    rows={2}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </LiyonField>
              </div>

              <div>
                <LiyonField label="จำนวนฉบับ (1-10)">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.copies}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, copies: parseInt(e.target.value) || 1 })
                    }
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </LiyonField>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="pt-3">
            <LiyonDialogCloseButton label="ยกเลิก" />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการยื่นคำร้อง"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
