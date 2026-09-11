"use client";

import * as React from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  FileCheck,
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
  reviewStudentRequestAction,
  createCertificateTypeAction,
  updateCertificateTypeAction,
  deleteCertificateTypeAction,
  getAdminStudentRequestsAction,
  getAdminCertificateTypesAction,
} from "@/features/student-services/actions";
import type {
  CertificateTypeDto,
  StudentRequestDto,
  CertificateCategory,
} from "@/features/student-services";

interface Props {
  initialTypes: CertificateTypeDto[];
  initialRequests: StudentRequestDto[];
  canManage: boolean;
}

export function StudentServicesAdminClient({
  initialTypes,
  initialRequests,
  canManage,
}: Props) {
  const [types, setTypes] = React.useState<CertificateTypeDto[]>(initialTypes);
  const [requests, setRequests] = React.useState<StudentRequestDto[]>(initialRequests);
  const [activeTab, setActiveTab] = React.useState<"requests" | "types">("requests");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Modal states for Request Review
  const [selectedRequest, setSelectedRequest] = React.useState<StudentRequestDto | null>(null);
  const [reviewActionType, setReviewActionType] = React.useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [approverNotes, setApproverNotes] = React.useState("");

  // Modal states for Certificate Type CRUD
  const [isTypeModalOpen, setIsTypeModalOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<CertificateTypeDto | null>(null);
  const [typeForm, setTypeForm] = React.useState({
    code: "",
    nameTh: "",
    nameEn: "",
    descriptionTh: "",
    descriptionEn: "",
    category: "ENROLLMENT" as CertificateCategory,
    processingDays: 3,
    fee: 0,
    requiresDoc: false,
    isActive: true,
    displayOrder: 0,
  });

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, typeRes] = await Promise.all([
        getAdminStudentRequestsAction({ status: statusFilter, search: searchQuery }),
        getAdminCertificateTypesAction(),
      ]);
      if (reqRes.ok && reqRes.data) setRequests(reqRes.data.items);
      if (typeRes.ok && typeRes.data) setTypes(typeRes.data);
    } catch (e: unknown) {
      toast.error("Failed to load data: " + (e instanceof Error ? e.message : ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = async (newStatus: string) => {
    setStatusFilter(newStatus);
    setIsLoading(true);
    const res = await getAdminStudentRequestsAction({ status: newStatus, search: searchQuery });
    if (res.ok && res.data) {
      setRequests(res.data.items);
    }
    setIsLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await getAdminStudentRequestsAction({ status: statusFilter, search: searchQuery });
    if (res.ok && res.data) {
      setRequests(res.data.items);
    }
    setIsLoading(false);
  };

  const openApproveModal = (req: StudentRequestDto) => {
    setSelectedRequest(req);
    setReviewActionType("APPROVE");
    setApproverNotes("ตรวจสอบข้อมูลนิสิตเรียบร้อย ถูกต้องตามระเบียบคณะ");
  };

  const openRejectModal = (req: StudentRequestDto) => {
    setSelectedRequest(req);
    setReviewActionType("REJECT");
    setRejectionReason("");
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest || !reviewActionType) return;
    setIsLoading(true);
    try {
      const res = await reviewStudentRequestAction({
        id: selectedRequest.id,
        status: reviewActionType === "APPROVE" ? "APPROVED" : "REJECTED",
        approverNotes: reviewActionType === "APPROVE" ? approverNotes : undefined,
        rejectionReason: reviewActionType === "REJECT" ? rejectionReason : undefined,
      });

      if (res.ok) {
        toast.success(
          reviewActionType === "APPROVE"
            ? `อนุมัติคำร้อง ${selectedRequest.requestNumber} เรียบร้อยแล้ว รหัสตรวจสอบ: ${res.data.verificationCode}`
            : `ปฏิเสธคำร้อง ${selectedRequest.requestNumber} เรียบร้อยแล้ว`
        );
        setSelectedRequest(null);
        setReviewActionType(null);
        await reloadData();
      } else {
        toast.error(res.error.message || "ดำเนินการไม่สำเร็จ");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateTypeModal = () => {
    setEditingType(null);
    setTypeForm({
      code: `CERT-${String(types.length + 1).padStart(2, "0")}`,
      nameTh: "",
      nameEn: "",
      descriptionTh: "",
      descriptionEn: "",
      category: "ENROLLMENT",
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: types.length + 1,
    });
    setIsTypeModalOpen(true);
  };

  const openEditTypeModal = (t: CertificateTypeDto) => {
    setEditingType(t);
    setTypeForm({
      code: t.code,
      nameTh: t.nameTh,
      nameEn: t.nameEn,
      descriptionTh: t.descriptionTh || "",
      descriptionEn: t.descriptionEn || "",
      category: t.category,
      processingDays: t.processingDays,
      fee: Number(t.fee) || 0,
      requiresDoc: t.requiresDoc,
      isActive: t.isActive,
      displayOrder: t.displayOrder,
    });
    setIsTypeModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingType) {
        const res = await updateCertificateTypeAction({
          id: editingType.id,
          ...typeForm,
        });
        if (res.ok) {
          toast.success("อัปเดตประเภทเอกสารเรียบร้อยแล้ว");
          setIsTypeModalOpen(false);
          await reloadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const res = await createCertificateTypeAction(typeForm);
        if (res.ok) {
          toast.success("สร้างประเภทเอกสารเรียบร้อยแล้ว");
          setIsTypeModalOpen(false);
          await reloadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteType = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบประเภทเอกสาร "${name}" ใช่หรือไม่?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteCertificateTypeAction(id);
      if (res.ok) {
        toast.success("ลบประเภทเอกสารสำเร็จ");
        await reloadData();
      } else {
        toast.error(res.error.message || "ไม่สามารถลบได้");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="h-7 w-7 text-primary" />
            ระบบคำร้องนิสิต & ตรวจสอบวุฒิบัตร (Student Services)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            บริหารจัดการคำร้องขอหนังสือรับรอง ตรวจสอบสถานะ ออกรหัสรับรอง QR Code
            และจัดการประเภทเอกสาร
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "types" && canManage && (
            <Button onClick={openCreateTypeModal} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มประเภทเอกสาร
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">คำร้องรอตรวจสอบ</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
            <div className="text-xs text-muted-foreground">อนุมัติแล้ว (มีรหัส QR)</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{rejectedCount}</div>
            <div className="text-xs text-muted-foreground">ปฏิเสธคำร้อง</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{types.length}</div>
            <div className="text-xs text-muted-foreground">ประเภทเอกสารที่เปิดบริการ</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "requests"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          รายการคำร้องของนิสิต
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("types")}
          className={`px-4 py-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "types"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" />
          จัดการประเภทเอกสารคำร้อง ({types.length})
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusFilterChange(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {st === "ALL" && "ทั้งหมด"}
                  {st === "PENDING" && `รอพิจารณา (${pendingCount})`}
                  {st === "APPROVED" && "อนุมัติแล้ว"}
                  {st === "REJECTED" && "ปฏิเสธ"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ค้นหารหัสนิสิต, ชื่อ, เลขคำร้อง..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border bg-background text-foreground"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                ค้นหา
              </Button>
            </form>
          </div>

          {/* Requests Table */}
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">เลขคำร้อง / วันที่</th>
                    <th className="px-4 py-3">ข้อมูลนิสิต</th>
                    <th className="px-4 py-3">ประเภทเอกสารที่ขอ</th>
                    <th className="px-4 py-3">วัตถุประสงค์</th>
                    <th className="px-4 py-3">สถานะ / รหัสยืนยัน</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        ไม่พบข้อมูลคำร้องตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-foreground">{req.requestNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            จำนวน: {req.copies} ฉบับ
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-foreground">
                            {req.titleTh || ""} {req.firstNameTh} {req.lastNameTh}
                          </div>
                          <div className="text-xs text-primary font-mono font-medium">
                            รหัสนิสิต: {req.studentCode}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {req.majorProgram} (ปี {req.yearLevel})
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            โทร: {req.phone} | {req.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-foreground">
                            {req.certificateType?.nameTh}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {req.certificateType?.nameEn}
                          </div>
                          <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            รหัส: {req.certificateType?.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top max-w-xs">
                          <div className="text-xs text-foreground line-clamp-2">{req.purpose}</div>
                          {req.rejectionReason && (
                            <div className="mt-1 text-xs text-destructive bg-destructive/10 p-1.5 rounded">
                              <strong>เหตุผลที่ปฏิเสธ:</strong> {req.rejectionReason}
                            </div>
                          )}
                          {req.approverNotes && (
                            <div className="mt-1 text-xs text-emerald-700 bg-emerald-50 p-1.5 rounded">
                              <strong>บันทึก:</strong> {req.approverNotes}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {req.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                              <Clock className="h-3.5 w-3.5" />
                              รอการตรวจสอบ
                            </span>
                          )}
                          {req.status === "APPROVED" && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                อนุมัติเรียบร้อย
                              </span>
                              {req.verificationCode && (
                                <div className="mt-1">
                                  <a
                                    href={`/verify/${req.verificationCode}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {req.verificationCode}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                              <XCircle className="h-3.5 w-3.5" />
                              ปฏิเสธคำร้อง
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-right space-x-1">
                          {canManage && req.status === "PENDING" && (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => openApproveModal(req)}
                                className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                อนุมัติ & ออก QR
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectModal(req)}
                                className="h-7 text-xs px-2.5"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                ปฏิเสธ
                              </Button>
                            </div>
                          )}
                          {req.status === "APPROVED" && req.verificationCode && (
                            <a
                              href={`/verify/${req.verificationCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border hover:bg-muted text-foreground"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              ดูหน้าตรวจสอบ QR
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Types Tab */}
      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((t) => (
              <div
                key={t.id}
                className={`border rounded-xl p-5 bg-card relative flex flex-col justify-between ${
                  !t.isActive ? "opacity-60 border-dashed" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {t.code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.isActive
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.isActive ? "เปิดให้บริการ" : "ปิดชั่วคราว"}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground mt-2">{t.nameTh}</h3>
                  <p className="text-xs text-muted-foreground">{t.nameEn}</p>

                  {t.descriptionTh && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {t.descriptionTh}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      ระยะเวลาดำเนินการ:{" "}
                      <span className="font-semibold text-foreground">
                        {t.processingDays} วันทำการ
                      </span>
                    </div>
                    <div>
                      ค่าธรรมเนียม:{" "}
                      <span className="font-semibold text-foreground">
                        {Number(t.fee) > 0 ? `${Number(t.fee)} บาท` : "ฟรี"}
                      </span>
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditTypeModal(t)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteType(t.id, t.nameTh)}
                      className="text-destructive hover:text-destructive"
                    >
                      ลบ
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Dialog (Approve/Reject) */}
      <LiyonDialog
        open={!!selectedRequest}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setSelectedRequest(null);
            setReviewActionType(null);
          }
        }}
      >
        <LiyonDialogHeader
          title={
            reviewActionType === "APPROVE"
              ? "อนุมัติคำร้องและออกรหัสยืนยัน QR Code"
              : "ปฏิเสธคำร้องขอเอกสาร"
          }
          description={`คำร้องเลขที่: ${selectedRequest?.requestNumber} (${selectedRequest?.studentCode})`}
        />

        <LiyonDialogBody className="space-y-4 py-2">
          <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
            <div>
              <strong>นิสิต:</strong> {selectedRequest?.titleTh || ""}{" "}
              {selectedRequest?.firstNameTh} {selectedRequest?.lastNameTh}
            </div>
            <div>
              <strong>เอกสารที่ขอ:</strong> {selectedRequest?.certificateType?.nameTh}
            </div>
            <div>
              <strong>วัตถุประสงค์:</strong> {selectedRequest?.purpose}
            </div>
          </div>

          {reviewActionType === "APPROVE" ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  ระบบจะทำการออก <strong>รหัสรับรองดิจิทัล (Verification Code)</strong> อัตโนมัติ
                  เช่น <code className="bg-emerald-100 px-1 rounded font-mono">MCU-FMS-2026-XXXXXX</code>{" "}
                  พร้อมสร้างหน้าเว็บตรวจสอบ QR Code ที่มีอายุรับรอง 180 วัน
                </div>
              </div>

              <LiyonField label="หมายเหตุหรือบันทึกของเจ้าหน้าที่">
                <input
                  type="text"
                  value={approverNotes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApproverNotes(e.target.value)}
                  placeholder="เช่น ตรวจสอบข้อมูลครบถ้วน ถูกต้องตามระเบียบ"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          ) : (
            <div className="space-y-3">
              <LiyonField
                label={
                  <>
                    เหตุผลที่ปฏิเสธคำร้อง <span className="text-destructive">*</span>
                  </>
                }
              >
                <textarea
                  value={rejectionReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น ข้อมูลสาขาวิชาไม่ถูกต้อง กรุณาติดต่อสำนักงานคณะ"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <LiyonDialogCloseButton label="ยกเลิก" />
          <Button
            variant={reviewActionType === "APPROVE" ? "default" : "destructive"}
            onClick={handleConfirmReview}
            disabled={isLoading || (reviewActionType === "REJECT" && !rejectionReason.trim())}
            className={reviewActionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            {reviewActionType === "APPROVE" ? "ยืนยันอนุมัติ & ออก QR" : "ยืนยันปฏิเสธ"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Certificate Type Create/Edit Dialog */}
      <LiyonDialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
        <LiyonDialogHeader
          title={editingType ? "แก้ไขประเภทเอกสารคำร้อง" : "เพิ่มประเภทเอกสารคำร้องใหม่"}
          description="กำหนดข้อมูลและเงื่อนไขการขอเอกสารออนไลน์สำหรับนิสิต"
        />

        <form onSubmit={handleSaveType}>
          <LiyonDialogBody className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <LiyonField
                label={
                  <>
                    รหัสเอกสาร <span className="text-destructive">*</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={typeForm.code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeForm({ ...typeForm, code: e.target.value })}
                  placeholder="เช่น CERT-01"
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="หมวดหมู่เอกสาร">
                <select
                  value={typeForm.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTypeForm({ ...typeForm, category: e.target.value as CertificateCategory })
                  }
                  className="w-full h-10 px-3 rounded-md border bg-background text-foreground text-sm"
                >
                  <option value="ENROLLMENT">รับรองสถานภาพนิสิต</option>
                  <option value="CONDUCT">รับรองความประพฤติ</option>
                  <option value="BANK_ACCOUNT">ขอเปิดบัญชีธนาคาร</option>
                  <option value="MILITARY_DEFERMENT">ผ่อนผันการเกณฑ์ทหาร</option>
                  <option value="VOLUNTEER">รับรองการปฏิบัติธรรม/จิตอาสา</option>
                  <option value="TRANSCRIPT_REQUEST">คำร้องขอใบแสดงผลการเรียน</option>
                </select>
              </LiyonField>
            </div>

            <LiyonField
              label={
                <>
                  ชื่อประเภทเอกสาร (ภาษาไทย) <span className="text-destructive">*</span>
                </>
              }
            >
              <input
                type="text"
                value={typeForm.nameTh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeForm({ ...typeForm, nameTh: e.target.value })}
                placeholder="เช่น หนังสือรับรองการเป็นนิสิต (ภาษาไทย)"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <LiyonField
              label={
                <>
                  ชื่อประเภทเอกสาร (ภาษาอังกฤษ) <span className="text-destructive">*</span>
                </>
              }
            >
              <input
                type="text"
                value={typeForm.nameEn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeForm({ ...typeForm, nameEn: e.target.value })}
                placeholder="e.g. Certificate of Student Status (Thai)"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-2 gap-3">
              <LiyonField label="ระยะเวลาดำเนินการ (วันทำการ)">
                <input
                  type="number"
                  min={1}
                  value={typeForm.processingDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTypeForm({ ...typeForm, processingDays: parseInt(e.target.value) || 1 })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>

              <LiyonField label="ค่าธรรมเนียม (บาท)">
                <input
                  type="number"
                  min={0}
                  value={typeForm.fee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTypeForm({ ...typeForm, fee: parseFloat(e.target.value) || 0 })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </LiyonField>
            </div>

            <LiyonField label="คำอธิบายรายละเอียด">
              <textarea
                value={typeForm.descriptionTh}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTypeForm({ ...typeForm, descriptionTh: e.target.value })}
                placeholder="รายละเอียดเงื่อนไขและเอกสารประกอบที่ต้องใช้..."
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </LiyonField>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.isActive}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeForm({ ...typeForm, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span>เปิดให้บริการในระบบ</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.requiresDoc}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeForm({ ...typeForm, requiresDoc: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span>ต้องแนบเอกสารหลักฐาน</span>
              </label>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter className="pt-4">
            <LiyonDialogCloseButton label="ยกเลิก" />
            <Button type="submit" disabled={isLoading}>
              {editingType ? "บันทึกการแก้ไข" : "สร้างประเภทเอกสาร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
