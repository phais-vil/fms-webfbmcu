"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle2, XCircle, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonSelect,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { StaffProfileDto, DepartmentDto } from "@/features/staff";
import {
  createStaffProfileAction,
  updateStaffProfileAction,
  deleteStaffProfileAction,
  toggleStaffActiveAction,
} from "@/features/staff/actions";

interface StaffClientProps {
  departments: DepartmentDto[];
  initialStaff: StaffProfileDto[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface StaffFormData {
  id?: string;
  departmentId: string;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  academicRankTh: string;
  academicRankEn: string;
  adminPositionTh: string;
  adminPositionEn: string;
  email: string;
  phone: string;
  officeRoom: string;
  avatarUrl: string;
  bioTh: string;
  bioEn: string;
  researchInterests: string;
  isExecutive: boolean;
  isActive: boolean;
  displayOrder: number;
}

export function StaffAdminClient({
  departments,
  initialStaff,
  canCreate,
  canEdit,
  canDelete,
}: StaffClientProps) {
  const t = useT();
  const locale = useLocale();

  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffProfileDto | null>(null);

  const initialForm: StaffFormData = {
    departmentId: departments[0]?.id || "",
    prefixTh: "",
    prefixEn: "",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    academicRankTh: "",
    academicRankEn: "",
    adminPositionTh: "",
    adminPositionEn: "",
    email: "",
    phone: "",
    officeRoom: "",
    avatarUrl: "",
    bioTh: "",
    bioEn: "",
    researchInterests: "",
    isExecutive: false,
    isActive: true,
    displayOrder: 0,
  };

  const [form, setForm] = useState<StaffFormData>(initialForm);

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
      s.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      (s.adminPositionTh && s.adminPositionTh.toLowerCase().includes(search.toLowerCase())) ||
      (s.adminPositionEn && s.adminPositionEn.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === "ALL" || s.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const openCreateDialog = () => {
    setForm({
      ...initialForm,
      departmentId: departments[0]?.id || "",
    });
    setActiveStaff(null);
    setDialogOpen(true);
  };

  const openEditDialog = (staff: StaffProfileDto) => {
    setActiveStaff(staff);
    setForm({
      id: staff.id,
      departmentId: staff.departmentId,
      prefixTh: staff.prefixTh,
      prefixEn: staff.prefixEn,
      firstNameTh: staff.firstNameTh,
      lastNameTh: staff.lastNameTh,
      firstNameEn: staff.firstNameEn,
      lastNameEn: staff.lastNameEn,
      academicRankTh: staff.academicRankTh || "",
      academicRankEn: staff.academicRankEn || "",
      adminPositionTh: staff.adminPositionTh || "",
      adminPositionEn: staff.adminPositionEn || "",
      email: staff.email || "",
      phone: staff.phone || "",
      officeRoom: staff.officeRoom || "",
      avatarUrl: staff.avatarUrl || "",
      bioTh: staff.bioTh || "",
      bioEn: staff.bioEn || "",
      researchInterests: staff.researchInterests || "",
      isExecutive: staff.isExecutive,
      isActive: staff.isActive,
      displayOrder: staff.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.firstNameTh.trim() || !form.lastNameTh.trim() || !form.firstNameEn.trim() || !form.lastNameEn.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกชื่อและนามสกุลทั้งภาษาไทยและอังกฤษ" : "Please fill in full name in both languages");
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateStaffProfileAction(form);
        if (res.ok) {
          setStaffList((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
          toast.success(locale === "th" ? "บันทึกข้อมูลบุคลากรสำเร็จ" : "Staff profile updated");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to update staff");
        }
      } else {
        const res = await createStaffProfileAction(form);
        if (res.ok) {
          setStaffList((prev) => [res.data, ...prev]);
          toast.success(locale === "th" ? "เพิ่มข้อมูลบุคลากรสำเร็จ" : "Staff profile created");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to create staff");
        }
      }
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleStaffActiveAction(id);
      if (res.ok) {
        setStaffList((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
        toast.success(
          res.data.isActive
            ? locale === "th" ? "เปิดแสดงผลแล้ว" : "Staff profile activated"
            : locale === "th" ? "ปิดการแสดงผลแล้ว" : "Staff profile deactivated"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!activeStaff) return;
    startTransition(async () => {
      const res = await deleteStaffProfileAction(activeStaff.id);
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== activeStaff.id));
        toast.success(locale === "th" ? "ลบข้อมูลบุคลากรแล้ว" : "Staff member deleted");
        setDeleteDialogOpen(false);
        setActiveStaff(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("staff.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("staff.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("staff.create")}
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("staff.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="w-full sm:w-72">
            <LiyonSelect
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">{t("staff.filter.allDepartments")}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {locale === "th" ? d.nameTh : d.nameEn}
                </option>
              ))}
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* Staff Table Card */}
      <div className="card overflow-hidden border border-border">
        {filteredStaff.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-base">{t("staff.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">{t("staff.field.firstNameTh")}</th>
                  <th className="py-3 px-4">{t("staff.field.department")}</th>
                  <th className="py-3 px-4">{t("staff.field.adminPositionTh")}</th>
                  <th className="py-3 px-4">{t("staff.field.academicRankTh")}</th>
                  <th className="py-3 px-4">{t("staff.field.isActive")}</th>
                  <th className="py-3 px-4 text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                          {staff.avatarUrl ? (
                            <img src={staff.avatarUrl} alt={staff.fullNameTh} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">
                              {locale === "th" ? staff.fullNameTh : staff.fullNameEn}
                            </span>
                            {staff.isExecutive && (
                              <span title="ผู้บริหาร" className="text-primary shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{staff.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        {locale === "th" ? staff.departmentNameTh : staff.departmentNameEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {locale === "th" ? staff.adminPositionTh || "—" : staff.adminPositionEn || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {locale === "th" ? staff.academicRankTh || "—" : staff.academicRankEn || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {staff.isActive ? (
                        <StatusPill tone="ok">{locale === "th" ? "แสดงบนเว็บ" : "Active"}</StatusPill>
                      ) : (
                        <StatusPill tone="off">{locale === "th" ? "ซ่อน" : "Inactive"}</StatusPill>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={staff.isActive ? "ซ่อน" : "แสดงบนเว็บ"}
                            onClick={() => handleToggleActive(staff.id)}
                            disabled={isPending}
                            className={staff.isActive ? "text-emerald-600" : "text-muted-foreground"}
                          >
                            {staff.isActive ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(staff)}
                            disabled={isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveStaff(staff);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={activeStaff ? t("staff.edit") : t("staff.create")}
          description={t("staff.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("staff.field.department")} htmlFor="staff-department">
              <LiyonSelect
                id="staff-department"
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === "th" ? d.nameTh : d.nameEn}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("staff.field.prefixTh")} htmlFor="prefix-th">
                <input
                  id="prefix-th"
                  type="text"
                  value={form.prefixTh}
                  onChange={(e) => setForm((f) => ({ ...f, prefixTh: e.target.value }))}
                  placeholder="เช่น พระมหา, ผศ.ดร."
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
              <LiyonField label={t("staff.field.firstNameTh")} htmlFor="firstname-th">
                <input
                  id="firstname-th"
                  type="text"
                  value={form.firstNameTh}
                  onChange={(e) => setForm((f) => ({ ...f, firstNameTh: e.target.value }))}
                  placeholder="ชื่อภาษาไทย"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
              <LiyonField label={t("staff.field.lastNameTh")} htmlFor="lastname-th">
                <input
                  id="lastname-th"
                  type="text"
                  value={form.lastNameTh}
                  onChange={(e) => setForm((f) => ({ ...f, lastNameTh: e.target.value }))}
                  placeholder="นามสกุลภาษาไทย"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("staff.field.prefixEn")} htmlFor="prefix-en">
                <input
                  id="prefix-en"
                  type="text"
                  value={form.prefixEn}
                  onChange={(e) => setForm((f) => ({ ...f, prefixEn: e.target.value }))}
                  placeholder="e.g. Phramaha, Asst. Prof. Dr."
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
              <LiyonField label={t("staff.field.firstNameEn")} htmlFor="firstname-en">
                <input
                  id="firstname-en"
                  type="text"
                  value={form.firstNameEn}
                  onChange={(e) => setForm((f) => ({ ...f, firstNameEn: e.target.value }))}
                  placeholder="English First Name"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
              <LiyonField label={t("staff.field.lastNameEn")} htmlFor="lastname-en">
                <input
                  id="lastname-en"
                  type="text"
                  value={form.lastNameEn}
                  onChange={(e) => setForm((f) => ({ ...f, lastNameEn: e.target.value }))}
                  placeholder="English Last Name"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("staff.field.academicRankTh")} htmlFor="rank-th">
                <input
                  id="rank-th"
                  type="text"
                  value={form.academicRankTh}
                  onChange={(e) => setForm((f) => ({ ...f, academicRankTh: e.target.value }))}
                  placeholder="เช่น ผู้ช่วยศาสตราจารย์, อาจารย์"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("staff.field.academicRankEn")} htmlFor="rank-en">
                <input
                  id="rank-en"
                  type="text"
                  value={form.academicRankEn}
                  onChange={(e) => setForm((f) => ({ ...f, academicRankEn: e.target.value }))}
                  placeholder="e.g. Assistant Professor, Lecturer"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("staff.field.adminPositionTh")} htmlFor="admin-th">
                <input
                  id="admin-th"
                  type="text"
                  value={form.adminPositionTh}
                  onChange={(e) => setForm((f) => ({ ...f, adminPositionTh: e.target.value }))}
                  placeholder="เช่น คณบดี, รองคณบดีฝ่ายวิชาการ, หัวหน้าภาควิชา"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("staff.field.adminPositionEn")} htmlFor="admin-en">
                <input
                  id="admin-en"
                  type="text"
                  value={form.adminPositionEn}
                  onChange={(e) => setForm((f) => ({ ...f, adminPositionEn: e.target.value }))}
                  placeholder="e.g. Dean, Associate Dean, Department Head"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("staff.field.email")} htmlFor="staff-email">
                <input
                  id="staff-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="staff@mcu.ac.th"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("staff.field.phone")} htmlFor="staff-phone">
                <input
                  id="staff-phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="035-248-xxx"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("staff.field.officeRoom")} htmlFor="staff-room">
                <input
                  id="staff-room"
                  type="text"
                  value={form.officeRoom}
                  onChange={(e) => setForm((f) => ({ ...f, officeRoom: e.target.value }))}
                  placeholder="ห้อง B405 อาคารเรียนรวม"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("staff.field.avatarUrl")} htmlFor="staff-avatar">
              <input
                id="staff-avatar"
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 border rounded bg-background text-sm"
              />
            </LiyonField>

            <LiyonField label={t("staff.field.researchInterests")} htmlFor="staff-research">
              <textarea
                id="staff-research"
                rows={2}
                value={form.researchInterests}
                onChange={(e) => setForm((f) => ({ ...f, researchInterests: e.target.value }))}
                placeholder="เช่น พระอภิธรรมปิฎก, พุทธปรัชญาร่วมสมัย, สมาธิกับการพัฒนาปัญญา..."
                className="w-full p-2 border rounded bg-background text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <LiyonSwitchRow
                id="staff-is-executive"
                checked={form.isExecutive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isExecutive: checked }))}
                label={t("staff.field.isExecutive")}
              />
              <LiyonSwitchRow
                id="staff-is-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                label={t("staff.field.isActive")}
              />
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={isPending}>
            {t("staff.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("staff.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirm Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader title={t("staff.delete")} description={t("staff.deleteConfirm")} />
        <LiyonDialogFooter>
          <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isPending}>
            {t("staff.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("staff.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
