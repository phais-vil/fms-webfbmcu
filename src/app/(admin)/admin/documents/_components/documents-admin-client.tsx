"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Building2,
  DollarSign,
  User,
  ExternalLink,
  ChevronRight,
  MessageSquare,
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
  createDocumentAction,
  reviewDocumentAction,
  getAdminDocumentsAction,
  getAdminDocumentByIdAction,
} from "@/features/documents/actions";
import type {
  FacultyDocumentDto,
  DocumentType,
  DocumentUrgency,
  DocumentStatus,
  CreateDocumentInput,
} from "@/features/documents";

interface DocumentsAdminClientProps {
  initialDocuments: FacultyDocumentDto[];
  initialStats: {
    totalDocs: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalBudget: number;
  };
  canCreate: boolean;
  canApprove: boolean;
}

export function DocumentsAdminClient({
  initialDocuments,
  initialStats,
  canCreate,
  canApprove,
}: DocumentsAdminClientProps) {
  const [documents, setDocuments] = React.useState<FacultyDocumentDto[]>(initialDocuments);
  const [stats, setStats] = React.useState(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<FacultyDocumentDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Review Form state
  const [reviewComment, setReviewComment] = React.useState("");
  const [reviewerName, setReviewerName] = React.useState("พระธรรมวัชรบัณฑิต, ศ.ดร.");
  const [reviewerRole, setReviewerRole] = React.useState("คณบดีคณะพุทธศาสตร์");

  // Create Form state
  const [createForm, setCreateForm] = React.useState<CreateDocumentInput>({
    title: "",
    docType: "MEMO",
    urgency: "NORMAL",
    submitterName: "",
    submitterRole: "อาจารย์ประจำภาควิชา",
    submitterEmail: "",
    department: "ภาควิชาพระพุทธศาสนา",
    content: "",
    budgetAmount: null,
    attachmentUrl: "",
  });

  const reloadDocuments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminDocumentsAction();
      if (!res.ok) {
        toast.error("ไม่สามารถโหลดรายการเอกสารได้");
        return;
      }
      setDocuments(res.data);
      // Recalculate stats
      let totalBudget = 0;
      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;
      for (const d of res.data) {
        if (d.status === "SUBMITTED" || d.status === "UNDER_REVIEW") pendingCount++;
        if (d.status === "APPROVED") approvedCount++;
        if (d.status === "REJECTED") rejectedCount++;
        if (d.budgetAmount) totalBudget += d.budgetAmount;
      }
      setStats({
        totalDocs: res.data.length,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalBudget,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenDetail = async (doc: FacultyDocumentDto) => {
    setSelectedDoc(doc);
    setIsDetailOpen(true);
    setReviewComment("");
    // Fetch latest with full logs
    try {
      const res = await getAdminDocumentByIdAction(doc.id);
      if (res.ok && res.data) {
        setSelectedDoc(res.data);
      }
    } catch {
      // Keep doc if failed
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createDocumentAction(createForm);
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถเสนอเอกสารได้");
        return;
      }
      toast.success("เสนอเรื่องเข้าสู่ระบบสารบรรณเรียบร้อยแล้ว");
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        docType: "MEMO",
        urgency: "NORMAL",
        submitterName: "",
        submitterRole: "อาจารย์ประจำภาควิชา",
        submitterEmail: "",
        department: "ภาควิชาพระพุทธศาสนา",
        content: "",
        budgetAmount: null,
        attachmentUrl: "",
      });
      await reloadDocuments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = async (action: "APPROVE" | "REJECT" | "COMMENT") => {
    if (!selectedDoc) return;
    setIsLoading(true);
    try {
      const res = await reviewDocumentAction({
        documentId: selectedDoc.id,
        action,
        actorName: reviewerName,
        actorRole: reviewerRole,
        comment: reviewComment,
      });
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถดำเนินการได้");
        return;
      }
      toast.success(
        action === "APPROVE"
          ? "อนุมัติ / ผ่านขั้นตอนถัดไปเรียบร้อยแล้ว"
          : action === "REJECT"
          ? "ส่งกลับแก้ไขเรียบร้อยแล้ว"
          : "บันทึกความเห็นเรียบร้อยแล้ว"
      );
      setSelectedDoc(res.data);
      setReviewComment("");
      await reloadDocuments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    if (statusFilter !== "ALL" && doc.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && doc.docType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = doc.documentNumber.toLowerCase().includes(q);
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchSubmitter = doc.submitterName.toLowerCase().includes(q);
      const matchDept = (doc.department || "").toLowerCase().includes(q);
      if (!matchNumber && !matchTitle && !matchSubmitter && !matchDept) return false;
    }
    return true;
  });

  const getUrgencyBadge = (urgency: DocumentUrgency) => {
    switch (urgency) {
      case "EXPEDITE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            ด่วนที่สุด
          </span>
        );
      case "VERY_URGENT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            ด่วนมาก
          </span>
        );
      case "URGENT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            ด่วน
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border">
            ปกติ
          </span>
        );
    }
  };

  const getStatusBadge = (status: DocumentStatus, currentStep: number, totalSteps: number) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            อนุมัติแล้ว (ครบขั้นตอน)
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            ขั้นที่ {currentStep}/{totalSteps} (กำลังตรวจสอบ)
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Send className="h-3.5 w-3.5" />
            ขั้นที่ 1/{totalSteps} (เสนอเรื่องใหม่)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            ส่งกลับแก้ไข
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "MEMO":
        return "บันทึกข้อความ";
      case "PROJECT_PROPOSAL":
        return "ขออนุมัติโครงการ";
      case "BUDGET_REQUEST":
        return "ขอเบิกจ่าย/งบประมาณ";
      case "GENERAL_REQUEST":
        return "หนังสือราชการทั่วไป";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            ระบบสารบรรณและอนุมัติเอกสาร (Document E-Approval)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            สารบรรณอิเล็กทรอนิกส์ เสนอเรื่อง บันทึกข้อความ ขออนุมัติโครงการ และงบประมาณ พร้อมกระบวนการลงนามดิจิทัล
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            เสนอเอกสารใหม่
          </Button>
        )}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
          <div className="text-xs font-medium text-muted-foreground">เอกสารทั้งหมด</div>
          <div className="text-2xl font-bold text-foreground">{stats.totalDocs} ฉบับ</div>
          <div className="text-[11px] text-muted-foreground">ในระบบสารบรรณปี 2569</div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">รอตรวจสอบ/อนุมัติ</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCount} เรื่อง</div>
          <div className="text-[11px] text-muted-foreground">อยู่ระหว่างดำเนินการ</div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">อนุมัติแล้ว</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approvedCount} เรื่อง</div>
          <div className="text-[11px] text-muted-foreground">ลงนามครบทุกขั้นตอน</div>
        </div>
        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
          <div className="text-xs font-medium text-primary">งบประมาณที่ขออนุมัติ</div>
          <div className="text-2xl font-bold text-primary">
            ฿{stats.totalBudget.toLocaleString("th-TH")}
          </div>
          <div className="text-[11px] text-muted-foreground">ยอดรวมโครงการทั้งหมด</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl border bg-card space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาตามเลขที่หนังสือ, เรื่อง, ผู้เสนอ หรือส่วนงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="SUBMITTED">เสนอเรื่องใหม่</option>
              <option value="UNDER_REVIEW">กำลังตรวจสอบ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="REJECTED">ส่งกลับแก้ไข</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">ประเภททั้งหมด</option>
              <option value="MEMO">บันทึกข้อความ</option>
              <option value="PROJECT_PROPOSAL">ขออนุมัติโครงการ</option>
              <option value="BUDGET_REQUEST">ขอเบิกจ่าย/งบประมาณ</option>
              <option value="GENERAL_REQUEST">หนังสือราชการทั่วไป</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">เลขที่หนังสือ / วันที่</th>
                <th className="py-3.5 px-4 font-semibold">เรื่อง / ความเร่งด่วน</th>
                <th className="py-3.5 px-4 font-semibold">ผู้เสนอ / ส่วนงาน</th>
                <th className="py-3.5 px-4 font-semibold">งบประมาณ</th>
                <th className="py-3.5 px-4 font-semibold">สถานะการเดินเรื่อง</th>
                <th className="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    ไม่พบรายการเอกสารตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{doc.documentNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        {getUrgencyBadge(doc.urgency)}
                        <span className="text-xs text-muted-foreground font-medium">
                          {getTypeLabel(doc.docType)}
                        </span>
                      </div>
                      <div className="font-medium text-foreground truncate" title={doc.title}>
                        {doc.title}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{doc.submitterName}</div>
                      <div className="text-xs text-muted-foreground">{doc.department || "-"}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {doc.budgetAmount ? (
                        <div className="font-semibold text-foreground">
                          ฿{doc.budgetAmount.toLocaleString("th-TH")}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(doc.status, doc.currentStep, doc.totalSteps)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(doc)}
                        className="gap-1.5"
                      >
                        ดูรายละเอียด / พิจารณา
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Document Detail & Review Stepper */}
      {selectedDoc && (
        <LiyonDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} wide>
          <LiyonDialogCloseButton label="ปิด" />
          <LiyonDialogHeader
            title={
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {selectedDoc.documentNumber}
                </span>
                <span>{selectedDoc.title}</span>
              </span>
            }
            description={`${getTypeLabel(selectedDoc.docType)} · ${selectedDoc.submitterName} (${selectedDoc.department || "คณะพุทธศาสตร์"})`}
          />

            <LiyonDialogBody>
              <div className="space-y-6">
                {/* 3-Step Visual Stepper */}
                <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    กระบวนการอนุมัติ (Workflow Progress)
                  </div>
                  <div className="grid grid-cols-3 gap-2 relative">
                    {/* Step 1 */}
                    <div
                      className={`p-3 rounded-lg border text-center space-y-1 ${
                        selectedDoc.currentStep >= 1
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">ขั้นตอนที่ 1</div>
                      <div className="text-xs font-medium">เสนอเรื่อง</div>
                      <div className="text-[10px] text-muted-foreground">ผู้เสนอจัดทำบันทึก</div>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-3 rounded-lg border text-center space-y-1 ${
                        selectedDoc.currentStep >= 2
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : selectedDoc.currentStep === 1
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">ขั้นตอนที่ 2</div>
                      <div className="text-xs font-medium">ตรวจสอบเอกสาร & งบประมาณ</div>
                      <div className="text-[10px] text-muted-foreground">ธุรการ / การเงิน</div>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-3 rounded-lg border text-center space-y-1 ${
                        selectedDoc.status === "APPROVED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : selectedDoc.currentStep >= 2
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div className="text-xs font-bold">ขั้นตอนที่ 3</div>
                      <div className="text-xs font-medium">คณบดีลงนามอนุมัติ</div>
                      <div className="text-[10px] text-muted-foreground">พิจารณาขั้นสุดท้าย</div>
                    </div>
                  </div>
                </div>

                {/* Document Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 rounded-lg border bg-card space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      ผู้เสนอเรื่อง
                    </div>
                    <div className="font-semibold text-foreground">{selectedDoc.submitterName}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedDoc.submitterRole} {selectedDoc.submitterEmail ? `(${selectedDoc.submitterEmail})` : ""}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border bg-card space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      ส่วนงาน / ภาควิชา
                    </div>
                    <div className="font-semibold text-foreground">{selectedDoc.department || "-"}</div>
                    {selectedDoc.budgetAmount && (
                      <div className="text-xs text-primary font-semibold flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        งบประมาณ: ฿{selectedDoc.budgetAmount.toLocaleString("th-TH")} บาท
                      </div>
                    )}
                  </div>
                </div>

                {/* Content / Memo Body */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    สาระสำคัญ / รายละเอียดบันทึก
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {selectedDoc.content}
                  </div>
                  {selectedDoc.attachmentUrl && (
                    <div className="pt-2">
                      <a
                        href={selectedDoc.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        เปิดดูเอกสารแนบประกอบ
                      </a>
                    </div>
                  )}
                </div>

                {/* Workflow Logs & Comments */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    ประวัติการพิจารณาและการลงนาม (Workflow Logs)
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDoc.logs && selectedDoc.logs.length > 0 ? (
                      selectedDoc.logs.map((log) => (
                        <div key={log.id} className="p-3 rounded-lg border bg-card text-xs space-y-1">
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
                                ? "อนุมัติ / ส่งต่อขั้นตอนถัดไป"
                                : log.action === "REJECT"
                                ? "ส่งกลับแก้ไข"
                                : log.action === "SUBMITTED"
                                ? "เสนอเรื่องใหม่"
                                : "แสดงความเห็น"}
                            </span>
                          </div>
                          {log.comment && (
                            <div className="p-2 rounded bg-muted/40 text-foreground border-l-2 border-primary mt-1">
                              &ldquo;{log.comment}&rdquo;
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-3">ยังไม่มีบันทึกประวัติเพิ่มเติม</div>
                    )}
                  </div>
                </div>

                {/* Review Action Box (If user has approve permission) */}
                {canApprove && selectedDoc.status !== "APPROVED" && selectedDoc.status !== "REJECTED" && (
                  <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-3">
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      ส่วนงานพิจารณาและลงนามอนุมัติ (E-Approval Action)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <LiyonField label="ชื่อผู้ลงนาม/ผู้พิจารณา">
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                          required
                        />
                      </LiyonField>
                      <LiyonField label="ตำแหน่ง">
                        <input
                          type="text"
                          value={reviewerRole}
                          onChange={(e) => setReviewerRole(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                          required
                        />
                      </LiyonField>
                    </div>
                    <LiyonField label="ความเห็น / คำสั่งการประกอบการลงนาม">
                      <textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="ระบุข้อสั่งการ ความเห็น หรือเหตุผลในการพิจารณา..."
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                      />
                    </LiyonField>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleReviewAction("APPROVE")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedDoc.currentStep === selectedDoc.totalSteps - 1
                          ? "ลงนามอนุมัติขั้นสุดท้าย (Dean Approval)"
                          : "ผ่านการตรวจสอบ / ส่งต่อขั้นตอนถัดไป"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => handleReviewAction("REJECT")}
                        className="gap-1.5"
                      >
                        <XCircle className="h-4 w-4" />
                        ส่งกลับแก้ไข
                      </Button>
                      {reviewComment.trim() && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => handleReviewAction("COMMENT")}
                        >
                          บันทึกความเห็นอย่างเดียว
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                ปิดหน้าต่าง
              </Button>
            </LiyonDialogFooter>
        </LiyonDialog>
      )}

      {/* Modal: Create Document */}
      <LiyonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} wide>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="เสนอเอกสารสารบรรณใหม่"
          description="ระบบจะออกเลขที่หนังสือราชการ วธ-มจร-2569/XXXX ให้อัตโนมัติ"
        />

        <form onSubmit={handleCreateDocument}>
            <LiyonDialogBody>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiyonField label="ประเภทเอกสาร">
                    <select
                      value={createForm.docType}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, docType: e.target.value as DocumentType }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    >
                      <option value="MEMO">บันทึกข้อความ</option>
                      <option value="PROJECT_PROPOSAL">ขออนุมัติโครงการ</option>
                      <option value="BUDGET_REQUEST">ขอเบิกจ่าย/งบประมาณ</option>
                      <option value="GENERAL_REQUEST">หนังสือราชการทั่วไป</option>
                    </select>
                  </LiyonField>
                  <LiyonField label="ระดับความเร่งด่วน">
                    <select
                      value={createForm.urgency}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, urgency: e.target.value as DocumentUrgency }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    >
                      <option value="NORMAL">ปกติ</option>
                      <option value="URGENT">ด่วน</option>
                      <option value="VERY_URGENT">ด่วนมาก</option>
                      <option value="EXPEDITE">ด่วนที่สุด</option>
                    </select>
                  </LiyonField>
                </div>

                <LiyonField label="เรื่อง / หัวข้อเอกสาร (Subject)">
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="เช่น ขออนุมัติจัดโครงการสัมมนาพระไตรปิฎกศึกษาประจำปี"
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <LiyonField label="ชื่อผู้เสนอเรื่อง">
                    <input
                      type="text"
                      required
                      value={createForm.submitterName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, submitterName: e.target.value }))}
                      placeholder="พระมหา... / ผศ.ดร. ..."
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                  <LiyonField label="ตำแหน่ง">
                    <input
                      type="text"
                      value={createForm.submitterRole || ""}
                      onChange={(e) => setCreateForm((f) => ({ ...f, submitterRole: e.target.value }))}
                      placeholder="อาจารย์ / เจ้าหน้าที่"
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                  <LiyonField label="ส่วนงาน / ภาควิชา">
                    <input
                      type="text"
                      value={createForm.department || ""}
                      onChange={(e) => setCreateForm((f) => ({ ...f, department: e.target.value }))}
                      placeholder="ภาควิชาพระพุทธศาสนา"
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiyonField label="อีเมลติดต่อ">
                    <input
                      type="email"
                      value={createForm.submitterEmail || ""}
                      onChange={(e) => setCreateForm((f) => ({ ...f, submitterEmail: e.target.value }))}
                      placeholder="user@mcu.ac.th"
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                  <LiyonField label="วงเงินงบประมาณที่ขออนุมัติ (บาท)">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={createForm.budgetAmount ?? ""}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          budgetAmount: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="ระบุจำนวนเงิน (ถ้ามี)"
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                </div>

                <LiyonField label="สาระสำคัญ / รายละเอียดบันทึกข้อความ">
                  <textarea
                    rows={4}
                    required
                    value={createForm.content}
                    onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="ระบุวัตถุประสงค์ รายละเอียดของโครงการหรือเรื่องที่เสนอ..."
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground leading-relaxed"
                  />
                </LiyonField>

                <LiyonField label="ลิงก์เอกสารแนบ (URL)">
                  <input
                    type="url"
                    value={createForm.attachmentUrl || ""}
                    onChange={(e) => setCreateForm((f) => ({ ...f, attachmentUrl: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Send className="h-4 w-4" />
                เสนอเรื่องเข้าสู่ระบบ
              </Button>
            </LiyonDialogFooter>
          </form>
      </LiyonDialog>
    </div>
  );
}
