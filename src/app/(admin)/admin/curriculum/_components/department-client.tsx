"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, Building2, BookOpen, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { AcademicDepartmentDto } from "@/features/curriculum";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  toggleDepartmentActiveAction,
} from "@/features/curriculum/actions";

interface DepartmentClientProps {
  initialDepartments: AcademicDepartmentDto[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface DepartmentFormData {
  id?: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export function DepartmentAdminClient({
  initialDepartments,
  canCreate,
  canEdit,
  canDelete,
}: DepartmentClientProps) {
  const t = useT();
  const locale = useLocale();

  const [departments, setDepartments] = useState<AcademicDepartmentDto[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<AcademicDepartmentDto | null>(null);

  const initialForm: DepartmentFormData = {
    code: "",
    nameTh: "",
    nameEn: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  };

  const [form, setForm] = useState<DepartmentFormData>(initialForm);

  const filtered = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.code.toLowerCase().includes(q) ||
      d.nameTh.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q)
    );
  });

  const openCreateDialog = () => {
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (d: AcademicDepartmentDto) => {
    setForm({
      id: d.id,
      code: d.code,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      description: d.description || "",
      displayOrder: d.displayOrder,
      isActive: d.isActive,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (d: AcademicDepartmentDto) => {
    setActiveItem(d);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.nameTh.trim() || !form.nameEn.trim()) {
      toast.error(
        locale === "th"
          ? "กรุณากรอกรหัสภาควิชา และชื่อภาควิชาทั้งภาษาไทยและอังกฤษ"
          : "Please fill in department code and name in both languages"
      );
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateDepartmentAction(form);
        if (res.ok) {
          setDepartments((prev) =>
            prev.map((item) => (item.id === res.data.id ? res.data : item))
          );
          toast.success(t("curriculum.dept.saveSuccess"));
          setDialogOpen(false);
        } else {
          toast.error(res.error.message ? t(res.error.message) : "Failed to update department");
        }
      } else {
        const res = await createDepartmentAction(form);
        if (res.ok) {
          setDepartments((prev) => [...prev, res.data]);
          toast.success(t("curriculum.dept.saveSuccess"));
          setDialogOpen(false);
        } else {
          toast.error(res.error.message ? t(res.error.message) : "Failed to create department");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!activeItem) return;

    if (activeItem.curriculumsCount > 0) {
      toast.error(t("curriculum.dept.hasCurriculums"));
      return;
    }

    if (activeItem.staffCount > 0) {
      toast.error(t("curriculum.dept.hasStaff"));
      return;
    }

    startTransition(async () => {
      const res = await deleteDepartmentAction(activeItem.id);
      if (res.ok) {
        setDepartments((prev) => prev.filter((d) => d.id !== activeItem.id));
        toast.success(t("curriculum.dept.deleteSuccess"));
        setDeleteDialogOpen(false);
        setActiveItem(null);
      } else {
        toast.error(res.error.message ? t(res.error.message) : "Failed to delete department");
      }
    });
  };

  const handleToggleActive = (d: AcademicDepartmentDto) => {
    startTransition(async () => {
      const res = await toggleDepartmentActiveAction(d.id);
      if (res.ok) {
        setDepartments((prev) =>
          prev.map((item) => (item.id === d.id ? res.data : item))
        );
        toast.success(
          locale === "th"
            ? `ปรับสถานะเป็น ${res.data.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}`
            : `Status updated to ${res.data.isActive ? "Active" : "Inactive"}`
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("curriculum.dept.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("curriculum.dept.subtitle")}
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {t("curriculum.dept.create")}
          </Button>
        )}
      </div>

      {/* Toolbar / Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("curriculum.dept.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Departments Table */}
      <div className="card overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
              <tr>
                <th className="px-4 py-3">{t("curriculum.dept.code")}</th>
                <th className="px-4 py-3">{t("curriculum.dept.nameTh")} / {t("curriculum.dept.nameEn")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.dept.curriculumsCount")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.dept.staffCount")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.dept.displayOrder")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.dept.status")}</th>
                <th className="px-4 py-3 text-right">{t("curriculum.dept.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {t("curriculum.dept.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        {d.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{d.nameTh}</div>
                      <div className="text-xs text-muted-foreground">{d.nameEn}</div>
                      {d.description && (
                        <div className="text-xs text-muted-foreground/80 mt-1 line-clamp-1 italic">
                          {d.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        <BookOpen className="h-3 w-3" />
                        {d.curriculumsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <Users className="h-3 w-3" />
                        {d.staffCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {d.displayOrder}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => canEdit && handleToggleActive(d)}
                        disabled={!canEdit || isPending}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        title={d.isActive ? t("curriculum.dept.active") : t("curriculum.dept.inactive")}
                      >
                        {d.isActive ? (
                          <StatusPill tone="ok">
                            {t("curriculum.dept.active")}
                          </StatusPill>
                        ) : (
                          <StatusPill tone="off">
                            {t("curriculum.dept.inactive")}
                          </StatusPill>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(d)}
                            className="h-8 w-8 p-0"
                            title={t("curriculum.dept.edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(d)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title={t("curriculum.dept.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Department Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={form.id ? t("curriculum.dept.edit") : t("curriculum.dept.create")}
          description={t("curriculum.dept.subtitle")}
        />
        <LiyonDialogBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={`${t("curriculum.dept.code")} *`}>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. DEPT_BUDDHIST"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.dept.displayOrder")}>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={`${t("curriculum.dept.nameTh")} *`}>
            <input
              type="text"
              value={form.nameTh}
              onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
              placeholder="e.g. ภาควิชาพระพุทธศาสนา"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <LiyonField label={`${t("curriculum.dept.nameEn")} *`}>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="e.g. Department of Buddhist Studies"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <LiyonField label={t("curriculum.dept.description")}>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="คำอธิบายเกี่ยวกับภาควิชา..."
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <div className="pt-2 border-t">
            <LiyonSwitchRow
              id="deptIsActiveSwitch"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              label={t("curriculum.dept.active")}
            />
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
              {t("curriculum.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {t("curriculum.save")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Department Confirmation Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} danger>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("curriculum.dept.delete")}
          description={t("curriculum.dept.deleteConfirm")}
        />
        <LiyonDialogBody className="space-y-3">
          {activeItem && (
            <div className="p-3 bg-muted rounded-md text-xs font-mono">
              <p className="font-semibold text-foreground">{activeItem.code}: {activeItem.nameTh}</p>
              <p className="text-muted-foreground">{activeItem.nameEn}</p>
            </div>
          )}

          {activeItem && (activeItem.curriculumsCount > 0 || activeItem.staffCount > 0) && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {locale === "th" ? "ไม่สามารถลบภาควิชานี้ได้" : "Cannot delete this department"}
                </p>
                <p className="mt-0.5">
                  {activeItem.curriculumsCount > 0 && (
                    <span>• {locale === "th" ? `มี ${activeItem.curriculumsCount} หลักสูตรสังกัดอยู่ ` : `Contains ${activeItem.curriculumsCount} curriculums. `}</span>
                  )}
                  {activeItem.staffCount > 0 && (
                    <span>• {locale === "th" ? `มี ${activeItem.staffCount} บุคลากรสังกัดอยู่` : `Contains ${activeItem.staffCount} staff members.`}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isPending}>
              {t("curriculum.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || (activeItem ? activeItem.curriculumsCount > 0 || activeItem.staffCount > 0 : false)}
            >
              {t("curriculum.dept.delete")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
