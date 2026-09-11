"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle2, XCircle, GraduationCap, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
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
import type { CurriculumDto, DegreeLevel } from "@/features/curriculum";
import type { DepartmentDto } from "@/features/staff";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  toggleCurriculumActiveAction,
} from "@/features/curriculum/actions";

interface CurriculumClientProps {
  departments: DepartmentDto[];
  initialCurriculums: CurriculumDto[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface CurriculumFormData {
  id?: string;
  departmentId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeAbbrTh: string;
  degreeAbbrEn: string;
  degreeLevel: DegreeLevel;
  totalCredits: number;
  durationYears: number;
  philosophyTh: string;
  philosophyEn: string;
  careerOpportunitiesTh: string;
  careerOpportunitiesEn: string;
  tuitionFees: string;
  coverImage: string;
  curriculumPdfUrl: string;
  effectiveYear: number;
  isActive: boolean;
  displayOrder: number;
}

export function CurriculumAdminClient({
  departments,
  initialCurriculums,
  canCreate,
  canEdit,
  canDelete,
}: CurriculumClientProps) {
  const t = useT();
  const locale = useLocale();

  const [curriculums, setCurriculums] = useState<CurriculumDto[]>(initialCurriculums);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CurriculumDto | null>(null);

  const initialForm: CurriculumFormData = {
    departmentId: departments[0]?.id || "",
    code: "",
    nameTh: "",
    nameEn: "",
    degreeTh: "",
    degreeEn: "",
    degreeAbbrTh: "",
    degreeAbbrEn: "",
    degreeLevel: "BACHELOR",
    totalCredits: 136,
    durationYears: 4,
    philosophyTh: "",
    philosophyEn: "",
    careerOpportunitiesTh: "",
    careerOpportunitiesEn: "",
    tuitionFees: "",
    coverImage: "",
    curriculumPdfUrl: "",
    effectiveYear: 2568,
    isActive: true,
    displayOrder: 0,
  };

  const [form, setForm] = useState<CurriculumFormData>(initialForm);

  const filteredList = curriculums.filter((c) => {
    const matchesSearch =
      search.trim() === "" ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.degreeAbbrTh.toLowerCase().includes(search.toLowerCase()) ||
      c.degreeAbbrEn.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = selectedLevel === "ALL" || c.degreeLevel === selectedLevel;
    const matchesDept = selectedDept === "ALL" || c.departmentId === selectedDept;
    return matchesSearch && matchesLevel && matchesDept;
  });

  const openCreateDialog = () => {
    setForm({
      ...initialForm,
      departmentId: departments[0]?.id || "",
    });
    setActiveItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (c: CurriculumDto) => {
    setActiveItem(c);
    setForm({
      id: c.id,
      departmentId: c.departmentId,
      code: c.code,
      nameTh: c.nameTh,
      nameEn: c.nameEn,
      degreeTh: c.degreeTh,
      degreeEn: c.degreeEn,
      degreeAbbrTh: c.degreeAbbrTh,
      degreeAbbrEn: c.degreeAbbrEn,
      degreeLevel: c.degreeLevel,
      totalCredits: c.totalCredits,
      durationYears: c.durationYears,
      philosophyTh: c.philosophyTh || "",
      philosophyEn: c.philosophyEn || "",
      careerOpportunitiesTh: c.careerOpportunitiesTh || "",
      careerOpportunitiesEn: c.careerOpportunitiesEn || "",
      tuitionFees: c.tuitionFees || "",
      coverImage: c.coverImage || "",
      curriculumPdfUrl: c.curriculumPdfUrl || "",
      effectiveYear: c.effectiveYear,
      isActive: c.isActive,
      displayOrder: c.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.nameTh.trim() || !form.nameEn.trim()) {
      toast.error(locale === "th" ? "กรุณาระบุรหัส และชื่อหลักสูตรทั้งไทยและอังกฤษ" : "Please fill in program code and name in both languages");
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateCurriculumAction(form);
        if (res.ok) {
          setCurriculums((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
          toast.success(locale === "th" ? "บันทึกหลักสูตรเรียบร้อยแล้ว" : "Curriculum updated successfully");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to update curriculum");
        }
      } else {
        const res = await createCurriculumAction(form);
        if (res.ok) {
          setCurriculums((prev) => [res.data, ...prev]);
          toast.success(locale === "th" ? "เพิ่มหลักสูตรใหม่สำเร็จ" : "Curriculum created successfully");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to create curriculum");
        }
      }
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleCurriculumActiveAction(id);
      if (res.ok) {
        setCurriculums((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
        toast.success(
          res.data.isActive
            ? locale === "th" ? "เปิดแสดงผลบนเว็บไซต์แล้ว" : "Curriculum published"
            : locale === "th" ? "ปิดการแสดงผลแล้ว" : "Curriculum unpublished"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!activeItem) return;
    startTransition(async () => {
      const res = await deleteCurriculumAction(activeItem.id);
      if (res.ok) {
        setCurriculums((prev) => prev.filter((item) => item.id !== activeItem.id));
        toast.success(locale === "th" ? "ลบหลักสูตรเรียบร้อยแล้ว" : "Curriculum deleted");
        setDeleteDialogOpen(false);
        setActiveItem(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getDegreeLevelBadge = (level: DegreeLevel) => {
    switch (level) {
      case "BACHELOR":
        return <StatusPill tone="info">{t("curriculum.level.bachelor")}</StatusPill>;
      case "MASTER":
        return <StatusPill tone="ok">{t("curriculum.level.master")}</StatusPill>;
      case "DOCTORAL":
        return <StatusPill tone="warn">{t("curriculum.level.doctoral")}</StatusPill>;
      case "CERTIFICATE":
        return <StatusPill tone="off">{t("curriculum.level.certificate")}</StatusPill>;
      default:
        return <StatusPill tone="off">{level}</StatusPill>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("curriculum.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("curriculum.create")}
          </Button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("curriculum.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="w-full sm:w-56">
            <LiyonSelect
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="ALL">{t("curriculum.filter.allLevels")}</option>
              <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
              <option value="MASTER">{t("curriculum.level.master")}</option>
              <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
              <option value="CERTIFICATE">{t("curriculum.level.certificate")}</option>
            </LiyonSelect>
          </div>
          <div className="w-full sm:w-64">
            <LiyonSelect
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">{locale === "th" ? "ทุกภาควิชา" : "All Departments"}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {locale === "th" ? d.nameTh : d.nameEn}
                </option>
              ))}
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
              <tr>
                <th className="py-3.5 px-4">{t("curriculum.field.code")}</th>
                <th className="py-3.5 px-4">{locale === "th" ? "ชื่อหลักสูตร / ปริญญา" : "Program Name / Degree"}</th>
                <th className="py-3.5 px-4">{t("curriculum.field.degreeLevel")}</th>
                <th className="py-3.5 px-4">{t("curriculum.field.department")}</th>
                <th className="py-3.5 px-4 text-center">{t("curriculum.field.totalCredits")}</th>
                <th className="py-3.5 px-4 text-center">{t("curriculum.field.isActive")}</th>
                <th className="py-3.5 px-4 text-right">{locale === "th" ? "จัดการ" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    {t("curriculum.empty")}
                  </td>
                </tr>
              ) : (
                filteredList.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">
                        {locale === "th" ? c.nameTh : c.nameEn}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {locale === "th" ? `${c.degreeTh} (${c.degreeAbbrTh})` : `${c.degreeEn} (${c.degreeAbbrEn})`}
                      </div>
                      {c.curriculumPdfUrl && (
                        <a
                          href={c.curriculumPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                        >
                          <FileText className="h-3 w-3" />
                          {locale === "th" ? "เอกสาร มคอ.2" : "Curriculum Doc"}
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getDegreeLevelBadge(c.degreeLevel)}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {locale === "th" ? c.departmentNameTh : c.departmentNameEn}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold">{c.totalCredits}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({c.durationYears} {t("curriculum.portal.years")})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {canEdit ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggleActive(c.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {c.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {locale === "th" ? "เปิดใช้งาน" : "Active"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
                              <XCircle className="h-3.5 w-3.5" />
                              {locale === "th" ? "ปิด" : "Inactive"}
                            </span>
                          )}
                        </button>
                      ) : (
                        c.isActive ? (
                          <span className="text-xs text-emerald-600 font-medium">{locale === "th" ? "เปิดใช้งาน" : "Active"}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{locale === "th" ? "ปิด" : "Inactive"}</span>
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/curriculum/${c.code}`}
                          target="_blank"
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="View on portal"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(c)}
                            className="h-8 w-8 p-0"
                            title={t("curriculum.edit")}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setActiveItem(c);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                            title={t("curriculum.delete")}
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

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={form.id ? t("curriculum.edit") : t("curriculum.create")}
          description={t("curriculum.subtitle")}
        />

        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Row 1: Code & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("curriculum.field.code")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="เช่น B.A.-BUDDHISM"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>
            <LiyonField label={<>{t("curriculum.field.degreeLevel")} <span className="text-destructive">*</span></>}>
              <LiyonSelect
                value={form.degreeLevel}
                onChange={(e) => setForm({ ...form, degreeLevel: e.target.value as DegreeLevel })}
              >
                <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                <option value="MASTER">{t("curriculum.level.master")}</option>
                <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                <option value="CERTIFICATE">{t("curriculum.level.certificate")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          {/* Row 2: Department */}
          <LiyonField label={<>{t("curriculum.field.department")} <span className="text-destructive">*</span></>}>
            <LiyonSelect
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTh} ({d.nameEn})
                </option>
              ))}
            </LiyonSelect>
          </LiyonField>

          {/* Row 3: Name TH & EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("curriculum.field.nameTh")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                placeholder="เช่น หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("curriculum.field.nameEn")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="e.g. Bachelor of Arts Program in Buddhist Studies"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 4: Degree Full TH & EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("curriculum.field.degreeTh")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.degreeTh}
                onChange={(e) => setForm({ ...form, degreeTh: e.target.value })}
                placeholder="เช่น พุทธศาสตรบัณฑิต (พระพุทธศาสนา)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("curriculum.field.degreeEn")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.degreeEn}
                onChange={(e) => setForm({ ...form, degreeEn: e.target.value })}
                placeholder="e.g. Bachelor of Arts (Buddhist Studies)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 5: Degree Abbr TH & EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("curriculum.field.degreeAbbrTh")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.degreeAbbrTh}
                onChange={(e) => setForm({ ...form, degreeAbbrTh: e.target.value })}
                placeholder="เช่น พธ.บ. (พระพุทธศาสนา)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("curriculum.field.degreeAbbrEn")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={form.degreeAbbrEn}
                onChange={(e) => setForm({ ...form, degreeAbbrEn: e.target.value })}
                placeholder="e.g. B.A. (Buddhist Studies)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 6: Credits, Duration, Effective Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LiyonField label={<>{t("curriculum.field.totalCredits")} <span className="text-destructive">*</span></>}>
              <input
                type="number"
                value={form.totalCredits}
                onChange={(e) => setForm({ ...form, totalCredits: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("curriculum.field.durationYears")} <span className="text-destructive">*</span></>}>
              <input
                type="number"
                value={form.durationYears}
                onChange={(e) => setForm({ ...form, durationYears: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.field.effectiveYear")}>
              <input
                type="number"
                value={form.effectiveYear}
                onChange={(e) => setForm({ ...form, effectiveYear: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 7: Tuition Fees & PDF Doc URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("curriculum.field.tuitionFees")}>
              <input
                type="text"
                value={form.tuitionFees}
                onChange={(e) => setForm({ ...form, tuitionFees: e.target.value })}
                placeholder="เช่น 15,000 บาท/ภาคการศึกษา"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={t("curriculum.field.curriculumPdfUrl")}>
              <input
                type="url"
                value={form.curriculumPdfUrl}
                onChange={(e) => setForm({ ...form, curriculumPdfUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 8: Cover Image URL & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("curriculum.field.coverImage")}>
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={locale === "th" ? "ลำดับการแสดงผล" : "Display Order"}>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          {/* Row 9: Philosophy (TH/EN) */}
          <LiyonField label={t("curriculum.field.philosophyTh")}>
            <textarea
              rows={3}
              value={form.philosophyTh}
              onChange={(e) => setForm({ ...form, philosophyTh: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <LiyonField label={t("curriculum.field.philosophyEn")}>
            <textarea
              rows={3}
              value={form.philosophyEn}
              onChange={(e) => setForm({ ...form, philosophyEn: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          {/* Row 10: Career Opportunities (TH/EN) */}
          <LiyonField label={t("curriculum.field.careerOpportunitiesTh")}>
            <textarea
              rows={2}
              value={form.careerOpportunitiesTh}
              onChange={(e) => setForm({ ...form, careerOpportunitiesTh: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          {/* Switch: IsActive */}
          <div className="pt-2 border-t">
            <LiyonSwitchRow
              id="isActiveSwitch"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              label={t("curriculum.field.isActive")}
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

      {/* Delete Confirmation Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} danger>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("curriculum.delete")}
          description={t("curriculum.deleteConfirm")}
        />
        <LiyonDialogBody>
          {activeItem && (
            <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono">
              <p className="font-semibold text-foreground">{activeItem.code}: {activeItem.nameTh}</p>
              <p className="text-muted-foreground">{activeItem.nameEn}</p>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isPending}>
              {t("curriculum.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {t("curriculum.delete")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
