"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building2,
  DollarSign,
  User,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackDocumentPublicAction } from "@/features/documents/actions";
import type {
  FacultyDocumentDto,
  DocumentUrgency,
  DocumentStatus,
  DocumentType,
} from "@/features/documents";

export default function DocumentTrackPage() {
  const [docNumber, setDocNumber] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [document, setDocument] = React.useState<FacultyDocumentDto | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await trackDocumentPublicAction(docNumber.trim());
      if (!res.ok) {
        toast.error("ไม่สามารถตรวจสอบสถานะเอกสารได้");
        return;
      }
      setDocument(res.data);
      if (!res.data) {
        toast.error("ไม่พบเอกสารตามเลขที่ระบุ");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: DocumentUrgency) => {
    switch (urgency) {
      case "EXPEDITE":
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 border border-rose-500/20">ด่วนที่สุด</span>;
      case "VERY_URGENT":
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/20">ด่วนมาก</span>;
      case "URGENT":
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 border border-blue-500/20">ด่วน</span>;
      default:
        return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border">ปกติ</span>;
    }
  };

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "MEMO": return "บันทึกข้อความ";
      case "PROJECT_PROPOSAL": return "ขออนุมัติโครงการ";
      case "BUDGET_REQUEST": return "ขอเบิกจ่าย/งบประมาณ";
      case "GENERAL_REQUEST": return "หนังสือราชการทั่วไป";
      default: return type;
    }
  };

  const getStatusBadge = (status: DocumentStatus, currentStep: number, totalSteps: number) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4" />
            อนุมัติสมบูรณ์ (ผ่านครบทุกขั้นตอน)
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="h-4 w-4 animate-pulse" />
            ขั้นตอนที่ {currentStep}/{totalSteps} (กำลังอยู่ระหว่างตรวจสอบ)
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Send className="h-4 w-4" />
            ขั้นตอนที่ 1/{totalSteps} (เสนอเรื่องใหม่)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="h-4 w-4" />
            ส่งกลับแก้ไข / มีข้อทักท้วง
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Bar */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับสู่หน้าหลักคณะ
        </Link>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          ระบบติดตามสถานะเอกสารสารบรรณ
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          ติดตามขั้นตอนการพิจารณา บันทึกข้อความ ขออนุมัติโครงการ และงบประมาณ คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="กรอกเลขที่หนังสือ เช่น วธ-มจร-2569/0101"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="gap-2 px-6">
            <Search className="h-4 w-4" />
            {isLoading ? "กำลังค้นหา..." : "ติดตามเรื่อง"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>ตัวอย่าง: วธ-มจร-2569/0101, วธ-มจร-2569/0102</span>
          <span>อัปเดตสถานะแบบเรียลไทม์</span>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && !document && !isLoading && (
        <div className="bg-card border rounded-2xl p-12 text-center space-y-3 max-w-2xl mx-auto animate-in fade-in duration-300">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h3 className="font-semibold text-foreground">ไม่พบข้อมูลเอกสาร</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            โปรดตรวจสอบเลขที่หนังสือราชการให้ถูกต้องครบถ้วน หรือติดต่อฝ่ายสารบรรณคณะพุทธศาสตร์
          </p>
        </div>
      )}

      {document && (
        <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {document.documentNumber}
                </span>
                {getUrgencyBadge(document.urgency)}
                <span className="text-xs font-medium text-muted-foreground">
                  {getTypeLabel(document.docType)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{document.title}</h2>
              <div className="text-xs text-muted-foreground mt-1">
                วันที่เสนอเรื่อง: {new Date(document.createdAt).toLocaleDateString("th-TH")} (พ.ศ. 2569)
              </div>
            </div>
            <div>
              {getStatusBadge(document.status, document.currentStep, document.totalSteps)}
            </div>
          </div>

          {/* Stepper Visual Pipeline */}
          <div className="p-5 rounded-xl bg-muted/40 border space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ขั้นตอนการเดินเรื่องเอกสาร (Workflow Pipeline)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-lg border text-center space-y-1 ${
                  document.currentStep >= 1
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                }`}
              >
                <div className="text-xs font-bold">ขั้นตอนที่ 1: เสนอเรื่อง</div>
                <div className="text-xs font-medium">{document.submitterName}</div>
                <div className="text-[11px] text-muted-foreground">{document.department || "คณะพุทธศาสตร์"}</div>
              </div>

              <div
                className={`p-3.5 rounded-lg border text-center space-y-1 ${
                  document.currentStep >= 2
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : document.currentStep === 1
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                }`}
              >
                <div className="text-xs font-bold">ขั้นตอนที่ 2: ตรวจสอบเอกสาร/งบประมาณ</div>
                <div className="text-xs font-medium">เจ้าหน้าที่ธุรการ / งานคลัง</div>
                <div className="text-[11px] text-muted-foreground">ตรวจความถูกต้องตามระเบียบ</div>
              </div>

              <div
                className={`p-3.5 rounded-lg border text-center space-y-1 ${
                  document.status === "APPROVED"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : document.currentStep >= 2
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                }`}
              >
                <div className="text-xs font-bold">ขั้นตอนที่ 3: คณบดีลงนามอนุมัติ</div>
                <div className="text-xs font-medium">คณบดีคณะพุทธศาสตร์</div>
                <div className="text-[11px] text-muted-foreground">พิจารณาและลงนามขั้นสุดท้าย</div>
              </div>
            </div>
          </div>

          {/* Document Content Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border bg-card space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                ผู้เสนอเรื่อง
              </div>
              <div className="font-semibold text-foreground">{document.submitterName}</div>
              <div className="text-xs text-muted-foreground">{document.submitterRole}</div>
            </div>
            <div className="p-4 rounded-xl border bg-card space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                ส่วนงาน / งบประมาณ
              </div>
              <div className="font-semibold text-foreground">{document.department || "คณะพุทธศาสตร์"}</div>
              {document.budgetAmount && (
                <div className="text-xs text-primary font-semibold flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  วงเงินงบประมาณ: ฿{document.budgetAmount.toLocaleString("th-TH")} บาท
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              สาระสำคัญของบันทึก
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {document.content}
            </div>
          </div>

          {/* Workflow Timeline Logs */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              บันทึกการพิจารณาและการลงนาม (Workflow History)
            </div>
            <div className="space-y-2">
              {document.logs && document.logs.length > 0 ? (
                document.logs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-lg border bg-card text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {log.actorName} ({log.actorRole})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("th-TH")}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      การดำเนินการ:{" "}
                      <span className="font-medium text-foreground">
                        {log.action === "APPROVE"
                          ? "อนุมัติ / ผ่านขั้นตอนถัดไป"
                          : log.action === "REJECT"
                          ? "ส่งกลับแก้ไข"
                          : log.action === "SUBMITTED"
                          ? "เสนอเรื่องเข้าสู่ระบบ"
                          : "แสดงความเห็น"}
                      </span>
                    </div>
                    {log.comment && (
                      <div className="p-2.5 rounded bg-muted/40 text-foreground border-l-2 border-primary mt-1">
                        &ldquo;{log.comment}&rdquo;
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2">
                  อยู่ระหว่างเริ่มกระบวนการเดินเรื่อง
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
