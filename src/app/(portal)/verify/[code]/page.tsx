import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  Building2,
  Calendar,
  User,
  FileText,
  Lock,
} from "lucide-react";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { verifyCertificateByCode } from "@/features/student-services/server";
import { PrintButton } from "./_components/print-button";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params;
  return {
    title: `ตรวจสอบเอกสาร ${code} | คณะพุทธศาสตร์ มจร`,
    description: "ระบบตรวจสอบความถูกต้องของเอกสารและวุฒิบัตร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params;
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  const cert = await verifyCertificateByCode(code);

  const isExpired = cert?.expiresAt && new Date(cert.expiresAt) < new Date();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isThai ? "กลับไปหน้าบริการนิสิต" : "Back to Student Services"}
        </Link>
      </div>

      {!cert ? (
        /* Not Found / Invalid State */
        <div className="bg-card border border-destructive/30 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <XCircle className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-destructive/10 text-destructive uppercase">
              Unverified / Invalid Code
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isThai ? "ไม่พบข้อมูลเอกสารในระบบ" : "Document Not Found"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isThai
                ? `ไม่พบข้อมูลเอกสารที่ตรงกับรหัส "${code}" กรุณาตรวจสอบรหัสรับรองใหม่อีกครั้ง หรือติดต่อฝ่ายทะเบียนและบริการการศึกษา คณะพุทธศาสตร์`
                : `No valid record matches code "${code}". Please check your code or contact the Faculty Registry.`}
            </p>
          </div>

          <div className="pt-4 border-t border-border flex justify-center gap-4">
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
            >
              {isThai ? "ค้นหาใหม่อีกครั้ง" : "Search Again"}
            </Link>
          </div>
        </div>
      ) : isExpired ? (
        /* Expired State */
        <div className="bg-card border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 uppercase">
              Expired Document
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isThai ? "เอกสารนี้หมดอายุการรับรองแล้ว" : "Document Verification Expired"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isThai
                ? `เอกสารนี้ออกเมื่อ ${new Date(cert.issuedAt!).toLocaleDateString("th-TH")} และสิ้นสุดอายุการรับรองเมื่อ ${new Date(cert.expiresAt!).toLocaleDateString("th-TH")} นิสิตสามารถยื่นคำร้องขอฉบับใหม่ได้`
                : "This document has passed its expiration validity window."}
            </p>
          </div>

          <div className="pt-4 border-t border-border flex justify-center gap-4">
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
            >
              {isThai ? "ยื่นขอเอกสารใหม่" : "Apply for New Certificate"}
            </Link>
          </div>
        </div>
      ) : (
        /* Valid & Authentic State */
        <div className="space-y-6">
          {/* Certificate Authenticity Card */}
          <div className="bg-card border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-xl">
            {/* Top Official Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                      Mahachulalongkornrajavidyalaya University
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
                    </h2>
                    <p className="text-xs text-emerald-100/90">
                      ระบบตรวจสอบและรับรองความถูกต้องของเอกสารดิจิทัล
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-emerald-800 text-xs font-bold shadow-sm self-start sm:self-auto">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {isThai ? "เอกสารถูกต้อง 100%" : "OFFICIALLY VERIFIED"}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Status Header */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {isThai ? "สถานะการตรวจสอบความถูกต้อง" : "Verification Status"}
                  </div>
                  <div className="text-base font-extrabold text-emerald-950">
                    {isThai
                      ? "เอกสารนี้ได้รับการรับรองอย่างเป็นทางการและถูกต้องตามระเบียบมหาวิทยาลัย"
                      : "This certificate is genuine and officially issued by Faculty of Buddhism, MCU"}
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    {isThai ? "รหัสรับรองดิจิทัล (Verification Code)" : "Verification Code"}
                  </span>
                  <div className="font-mono font-bold text-primary text-base">
                    {cert.verificationCode}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {isThai ? "เลขที่คำร้อง (Request Number)" : "Request Number"}
                  </span>
                  <div className="font-mono font-semibold text-foreground">
                    {cert.requestNumber}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1 sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">
                    {isThai ? "ประเภทเอกสาร / Certificate Type" : "Certificate Type"}
                  </span>
                  <div className="font-bold text-foreground text-base">
                    {cert.certificateType?.nameTh}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cert.certificateType?.nameEn}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {isThai ? "ชื่อ-นามสกุล นิสิต" : "Student Name"}
                  </span>
                  <div className="font-bold text-foreground">
                    {cert.titleTh || ""} {cert.firstNameTh} {cert.lastNameTh}
                  </div>
                  {(cert.firstNameEn || cert.lastNameEn) && (
                    <div className="text-xs text-muted-foreground font-medium">
                      {cert.firstNameEn} {cert.lastNameEn}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block">
                    {isThai ? "รหัสนิสิต" : "Student Code"}
                  </span>
                  <div className="font-mono font-bold text-primary">
                    {cert.studentCode}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cert.degreeLevel === "BACHELOR"
                      ? "ปริญญาตรี (B.A.)"
                      : cert.degreeLevel === "MASTER"
                      ? "ปริญญาโท (M.A.)"
                      : "ปริญญาเอก (Ph.D.)"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1 sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">
                    {isThai ? "สาขาวิชา / ภาควิชา" : "Major Program"}
                  </span>
                  <div className="font-semibold text-foreground">
                    {cert.majorProgram} (ชั้นปีที่ {cert.yearLevel})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {isThai ? "วันที่ออกเอกสาร (Issued Date)" : "Issued Date"}
                  </span>
                  <div className="font-semibold text-foreground">
                    {cert.issuedAt
                      ? new Date(cert.issuedAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                  <span className="text-xs text-muted-foreground block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    {isThai ? "ใช้ได้ถึง (Valid Until)" : "Valid Until"}
                  </span>
                  <div className="font-semibold text-emerald-700">
                    {cert.expiresAt
                      ? new Date(cert.expiresAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "ไม่มีกำหนด"}
                  </div>
                </div>
              </div>

              {/* Digital Seal Simulation */}
              <div className="border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      งานทะเบียนและบริการนิสิต คณะพุทธศาสตร์
                    </div>
                    <div>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (วังน้อย อยุธยา)</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PrintButton label={isThai ? "พิมพ์หลักฐานการรับรอง" : "Print Verification"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
