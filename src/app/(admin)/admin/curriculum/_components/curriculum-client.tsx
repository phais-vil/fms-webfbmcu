"use client";

import { useState, useRef, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Building2,
  ExternalLink,
  FileText,
  Download,
  Upload,
  FileCode2,
  Lightbulb,
  Briefcase,
  Sparkles,
} from "lucide-react";
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
import { cn } from "@/shared/lib/utils";
import type { CurriculumDto, DegreeLevel, AcademicDepartmentDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  toggleCurriculumActiveAction,
} from "@/features/curriculum/actions";
import { DepartmentAdminClient } from "./department-client";

interface CurriculumClientProps {
  departments: AcademicDepartmentDto[];
  initialCurriculums: CurriculumDto[];
  initialTab?: "curriculums" | "departments";
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
  initialTab = "curriculums",
  canCreate,
  canEdit,
  canDelete,
}: CurriculumClientProps) {
  const t = useT();
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<"curriculums" | "departments">(initialTab);
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

  const [dialogTab, setDialogTab] = useState<"general" | "philosophy" | "career" | "media">("general");

  const openCreateDialog = () => {
    setForm({
      ...initialForm,
      departmentId: departments[0]?.id || "",
    });
    setActiveItem(null);
    setDialogTab("general");
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
    setDialogTab("general");
    setDialogOpen(true);
  };

  const loadTqf2RelPhilTemplate = () => {
    const dept = departments.find((d) => d.code === "PHILOSOPHY") || departments[0];
    setForm({
      ...form,
      departmentId: dept?.id || form.departmentId,
      code: "B.A.-REL-PHIL",
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๕)",
      nameEn: "Bachelor of Arts Program in Religion and Philosophy",
      degreeTh: "พุทธศาสตรบัณฑิต (ศาสนาและปรัชญา)",
      degreeEn: "Bachelor of Arts (Religion and Philosophy)",
      degreeAbbrTh: "พธ.บ. (ศาสนาและปรัชญา)",
      degreeAbbrEn: "B.A. (Religion and Philosophy)",
      degreeLevel: "BACHELOR",
      totalCredits: 140,
      durationYears: 4,
      effectiveYear: 2565,
      tuitionFees: "๑๔,๐๐๐ บาท/คน/ปี (พระภิกษุสามเณรได้รับทุนอุปถัมภ์)",
      philosophyTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา มุ่งให้ความรู้และความเข้าใจหลักการทางศาสนาและปรัชญา สร้างบัณฑิตที่รับฟังความคิดเห็นของผู้อื่นอย่างมีเหตุผลและเข้าใจชีวิตที่ดีงามตามหลักศาสนา สามารถนำความรู้ทางศาสนาและปรัชญาไปประยุกต์ใช้เพื่อประโยชน์ตนเองและสังคม อยู่ร่วมกันในสังคมพหุวัฒนธรรมได้อย่างมีความสุข\n\nวัตถุประสงค์ของหลักสูตร:\n๑. เพื่อผลิตบัณฑิตที่มีความรอบรู้และเชี่ยวชาญในศาสนาและปรัชญา สามารถวิเคราะห์วิพากษ์ปัญหาทางสังคมได้อย่างแหลมคม และเข้าใจลึกซึ้งในศาสนาทั้งในด้านประวัติความเป็นมาและหลักคำสอน\n๒. เพื่อผลิตบัณฑิตที่สามารถนำหลักศาสนาและปรัชญาไปประยุกต์ใช้โดยบูรณาการกับศาสตร์สมัยใหม่ในการพัฒนาชีวิตและสังคม\n๓. เพื่อผลิตบัณฑิตที่มีคุณธรรมและจริยธรรม เป็นผู้นำสังคมด้านจิตใจและปัญญา",
      philosophyEn: "The Bachelor of Arts Program in Religion and Philosophy aims to provide profound knowledge and understanding of religious and philosophical principles, fostering rational graduates who appreciate virtuous living according to religious tenets, respect diverse viewpoints, and can constructively apply philosophical and religious wisdom for personal and societal harmony in a multicultural world.\n\nObjectives:\n1. To produce graduates with deep mastery of religious and philosophical theories capable of critical social analysis.\n2. To equip graduates to integrate religious wisdom with contemporary disciplines for holistic life and community development.\n3. To cultivate graduates with moral leadership and spiritual resilience.",
      careerOpportunitiesTh: "๑. ผู้บริหารมหาวิทยาลัยและนักวิชาการในสถาบันการศึกษา\n๒. อาจารย์ประจำมหาวิทยาลัย/ผู้สอนวิชาศาสนา ปรัชญา และจริยศึกษา\n๓. นักวิชาการศาสนา สำนักงานพระพุทธศาสนาแห่งชาติ\n๔. นักวิชาการศึกษา\n๕. เจ้าหน้าที่บริหารงานการศาสนาและวัฒนธรรม\n๖. อนุศาสนาจารย์ในหน่วยงานราชการและกองทัพ\n๗. เจ้าหน้าที่ฝึกอบรมบุคลากรและพัฒนาทรัพยากรมนุษย์\n๘. นักสังคมสงเคราะห์ฟื้นฟูพัฒนาจิตใจ\n๙. ผู้นำสังคมด้านจิตใจและปัญญา\n๑๐. วิทยากรการท่องเที่ยวด้านศาสนาและวัฒนธรรม\n๑๑. ประกอบกิจการส่วนตัวที่เกี่ยวกับการบริการการศึกษา อบรม และอื่นๆ",
      careerOpportunitiesEn: "1. University administrators and higher education scholars\n2. Faculty lecturers in Religion, Philosophy, and Applied Ethics\n3. Religious Affairs Officers (National Office of Buddhism)\n4. Academic and Educational Affairs Specialists\n5. Religious and Cultural Administration Officers\n6. Military and Institutional Chaplains\n7. Personnel Training and Human Resource Specialists\n8. Mental Rehabilitation and Social Welfare Officers\n9. Community Leaders in Mindfulness, Ethics, and Wisdom\n10. Cultural, Religious, and Pilgrimage Tourism Guides\n11. Educational Consultants and Training Entrepreneurs",
      coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      curriculumPdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      isActive: true,
      displayOrder: 1,
    });
    toast.success(t("curriculum.tqf2Template"));
  };

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    try {
      const exportData = {
        code: form.code,
        nameTh: form.nameTh,
        nameEn: form.nameEn,
        degreeTh: form.degreeTh,
        degreeEn: form.degreeEn,
        degreeAbbrTh: form.degreeAbbrTh,
        degreeAbbrEn: form.degreeAbbrEn,
        degreeLevel: form.degreeLevel,
        totalCredits: form.totalCredits,
        durationYears: form.durationYears,
        philosophyTh: form.philosophyTh,
        philosophyEn: form.philosophyEn,
        careerOpportunitiesTh: form.careerOpportunitiesTh,
        careerOpportunitiesEn: form.careerOpportunitiesEn,
        tuitionFees: form.tuitionFees,
        coverImage: form.coverImage,
        curriculumPdfUrl: form.curriculumPdfUrl,
        effectiveYear: form.effectiveYear,
        isActive: form.isActive,
        displayOrder: form.displayOrder,
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeCode = (form.code || "program").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.href = url;
      a.download = `curriculum-${safeCode}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(locale === "th" ? "ส่งออกข้อมูล JSON สำเร็จ" : "JSON exported successfully");
    } catch {
      toast.error(locale === "th" ? "เกิดข้อผิดพลาดในการส่งออก JSON" : "Failed to export JSON");
    }
  };

  const handleJsonFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid format");
      }

      setForm((prev) => ({
        ...prev,
        code: typeof parsed.code === "string" ? parsed.code : prev.code,
        nameTh: typeof parsed.nameTh === "string" ? parsed.nameTh : prev.nameTh,
        nameEn: typeof parsed.nameEn === "string" ? parsed.nameEn : prev.nameEn,
        degreeTh: typeof parsed.degreeTh === "string" ? parsed.degreeTh : prev.degreeTh,
        degreeEn: typeof parsed.degreeEn === "string" ? parsed.degreeEn : prev.degreeEn,
        degreeAbbrTh: typeof parsed.degreeAbbrTh === "string" ? parsed.degreeAbbrTh : prev.degreeAbbrTh,
        degreeAbbrEn: typeof parsed.degreeAbbrEn === "string" ? parsed.degreeAbbrEn : prev.degreeAbbrEn,
        degreeLevel: ["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"].includes(parsed.degreeLevel)
          ? parsed.degreeLevel
          : prev.degreeLevel,
        totalCredits: typeof parsed.totalCredits === "number" ? parsed.totalCredits : prev.totalCredits,
        durationYears: typeof parsed.durationYears === "number" ? parsed.durationYears : prev.durationYears,
        philosophyTh: typeof parsed.philosophyTh === "string" ? parsed.philosophyTh : prev.philosophyTh,
        philosophyEn: typeof parsed.philosophyEn === "string" ? parsed.philosophyEn : prev.philosophyEn,
        careerOpportunitiesTh: typeof parsed.careerOpportunitiesTh === "string" ? parsed.careerOpportunitiesTh : prev.careerOpportunitiesTh,
        careerOpportunitiesEn: typeof parsed.careerOpportunitiesEn === "string" ? parsed.careerOpportunitiesEn : prev.careerOpportunitiesEn,
        tuitionFees: typeof parsed.tuitionFees === "string" ? parsed.tuitionFees : prev.tuitionFees,
        coverImage: typeof parsed.coverImage === "string" ? parsed.coverImage : prev.coverImage,
        curriculumPdfUrl: typeof parsed.curriculumPdfUrl === "string" ? parsed.curriculumPdfUrl : prev.curriculumPdfUrl,
        effectiveYear: typeof parsed.effectiveYear === "number" ? parsed.effectiveYear : prev.effectiveYear,
        isActive: typeof parsed.isActive === "boolean" ? parsed.isActive : prev.isActive,
        displayOrder: typeof parsed.displayOrder === "number" ? parsed.displayOrder : prev.displayOrder,
      }));

      toast.success(t("curriculum.importJsonSuccess"));
    } catch {
      toast.error(t("curriculum.importJsonError"));
    } finally {
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
    }
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
      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("curriculums")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "curriculums"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="h-4 w-4" />
          <span>{t("curriculum.tab.curriculums")}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal">
            {curriculums.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "departments"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>{t("curriculum.tab.departments")}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal">
            {departments.length}
          </span>
        </button>
      </div>

      {activeTab === "departments" ? (
        <DepartmentAdminClient
          initialDepartments={departments}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <>
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
          {/* JSON Import/Export & TQF2 Tools Bar */}
          <div className="flex flex-wrap items-center justify-between p-3 bg-muted/40 rounded-xl border border-border gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <FileCode2 className="h-4 w-4 text-primary" />
              {t("curriculum.jsonTools")}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadTqf2RelPhilTemplate}
                className="h-8 text-xs gap-1.5 border-primary/40 hover:bg-primary/10 text-primary font-medium"
                title="โหลดข้อมูลตัวอย่าง มคอ.๒ สาขาวิชาศาสนาและปรัชญา พ.ศ. ๒๕๖๕"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{locale === "th" ? "โหลดตัวอย่าง มคอ.๒ ศาสนาและปรัชญา (๒๕๖๕)" : "Load TQF 2 Template (2022)"}</span>
              </Button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleJsonFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => jsonFileInputRef.current?.click()}
                className="h-8 text-xs gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                {t("curriculum.importJson")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                {t("curriculum.exportJson")}
              </Button>
            </div>
          </div>

          {/* Dialog Tab Navigation */}
          <div className="flex border-b border-border space-x-1 pb-px overflow-x-auto">
            <button
              type="button"
              onClick={() => setDialogTab("general")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                dialogTab === "general"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>{t("curriculum.dialogTab.general")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDialogTab("philosophy")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                dialogTab === "philosophy"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Lightbulb className="h-4 w-4" />
              <span>{t("curriculum.dialogTab.philosophy")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDialogTab("career")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                dialogTab === "career"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Briefcase className="h-4 w-4" />
              <span>{t("curriculum.dialogTab.career")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDialogTab("media")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                dialogTab === "media"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>{t("curriculum.dialogTab.media")}</span>
            </button>
          </div>

          {/* TAB 1: GENERAL & DEGREE */}
          {dialogTab === "general" && (
            <div className="space-y-4 pt-1">
              {/* Row 1: Code, Department, Degree Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LiyonField label={<>{t("curriculum.field.code")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="เช่น B.A.-REL-PHIL"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
                  />
                </LiyonField>
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

              {/* Row 2: Name TH & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={<>{t("curriculum.field.nameTh")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.nameTh}
                    onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                    placeholder="เช่น หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๕)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
                <LiyonField label={<>{t("curriculum.field.nameEn")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="e.g. Bachelor of Arts Program in Religion and Philosophy"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
              </div>

              {/* Row 3: Degree Full TH & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={<>{t("curriculum.field.degreeTh")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.degreeTh}
                    onChange={(e) => setForm({ ...form, degreeTh: e.target.value })}
                    placeholder="เช่น พุทธศาสตรบัณฑิต (ศาสนาและปรัชญา)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
                <LiyonField label={<>{t("curriculum.field.degreeEn")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.degreeEn}
                    onChange={(e) => setForm({ ...form, degreeEn: e.target.value })}
                    placeholder="e.g. Bachelor of Arts (Religion and Philosophy)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
              </div>

              {/* Row 4: Degree Abbr TH & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={<>{t("curriculum.field.degreeAbbrTh")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.degreeAbbrTh}
                    onChange={(e) => setForm({ ...form, degreeAbbrTh: e.target.value })}
                    placeholder="เช่น พธ.บ. (ศาสนาและปรัชญา)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
                <LiyonField label={<>{t("curriculum.field.degreeAbbrEn")} <span className="text-destructive">*</span></>}>
                  <input
                    type="text"
                    value={form.degreeAbbrEn}
                    onChange={(e) => setForm({ ...form, degreeAbbrEn: e.target.value })}
                    placeholder="e.g. B.A. (Religion and Philosophy)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
              </div>

              {/* Row 5: Credits, Duration, Effective Year, Tuition Fees */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <LiyonField label={t("curriculum.field.tuitionFees")}>
                  <input
                    type="text"
                    value={form.tuitionFees}
                    onChange={(e) => setForm({ ...form, tuitionFees: e.target.value })}
                    placeholder="เช่น ๑๔,๐๐๐ บาท/ปี"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
              </div>
            </div>
          )}

          {/* TAB 2: PHILOSOPHY & OBJECTIVES */}
          {dialogTab === "philosophy" && (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-foreground leading-relaxed flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{locale === "th" ? "หมวดที่ ๒: ปรัชญา ความสำคัญ และวัตถุประสงค์ของหลักสูตร" : "Section 2: Philosophy, Significance, & Objectives"}</span>
                  <p className="text-muted-foreground mt-0.5">
                    {locale === "th"
                      ? "ระบุความมุ่งหมายของหลักสูตรในการสร้างบัณฑิต วัตถุประสงค์เพื่อการพัฒนาชีวิตและสังคม และการประยุกต์ใช้ในบริบทพหุวัฒนธรรม"
                      : "Describe the core educational philosophy, societal relevance, and program aims."}
                  </p>
                </div>
              </div>

              <LiyonField label={t("curriculum.field.philosophyTh")}>
                <textarea
                  rows={6}
                  value={form.philosophyTh}
                  onChange={(e) => setForm({ ...form, philosophyTh: e.target.value })}
                  placeholder="กรอกปรัชญา ความสำคัญ และวัตถุประสงค์ของหลักสูตร (ภาษาไทย)..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm leading-relaxed"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.philosophyEn")}>
                <textarea
                  rows={6}
                  value={form.philosophyEn}
                  onChange={(e) => setForm({ ...form, philosophyEn: e.target.value })}
                  placeholder="Enter program philosophy, significance, and objectives (English)..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm leading-relaxed"
                />
              </LiyonField>
            </div>
          )}

          {/* TAB 3: CAREERS & OPPORTUNITIES */}
          {dialogTab === "career" && (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-foreground leading-relaxed flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{locale === "th" ? "หมวดที่ ๑ ข้อ ๘: อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา" : "Section 1.8: Career Opportunities upon Graduation"}</span>
                  <p className="text-muted-foreground mt-0.5">
                    {locale === "th"
                      ? "ระบุสายอาชีพในหน่วยงานรัฐ (ก.พ., พศ.), สถาบันการศึกษา, องค์กรศาสนา, งานอนุศาสนาจารย์ และภาคเอกชน โดยสามารถแบ่งเป็นบรรทัดตามลำดับข้อได้"
                      : "List career pathways in public civil service, educational institutions, religious bodies, and private sector."}
                  </p>
                </div>
              </div>

              <LiyonField label={t("curriculum.field.careerOpportunitiesTh")}>
                <textarea
                  rows={6}
                  value={form.careerOpportunitiesTh}
                  onChange={(e) => setForm({ ...form, careerOpportunitiesTh: e.target.value })}
                  placeholder="๑. ผู้บริหารและอาจารย์ในสถาบันการศึกษา&#10;๒. นักวิชาการศาสนา สำนักงานพระพุทธศาสนาแห่งชาติ&#10;๓. อนุศาสนาจารย์..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm leading-relaxed"
                />
              </LiyonField>

              <LiyonField label={t("curriculum.field.careerOpportunitiesEn")}>
                <textarea
                  rows={6}
                  value={form.careerOpportunitiesEn}
                  onChange={(e) => setForm({ ...form, careerOpportunitiesEn: e.target.value })}
                  placeholder="1. Educational administrators and university lecturers&#10;2. Religious Affairs Officers&#10;3. Institutional Chaplains..."
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm leading-relaxed"
                />
              </LiyonField>
            </div>
          )}

          {/* TAB 4: MEDIA & DOCUMENTS */}
          {dialogTab === "media" && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("curriculum.field.curriculumPdfUrl")}>
                  <input
                    type="url"
                    value={form.curriculumPdfUrl}
                    onChange={(e) => setForm({ ...form, curriculumPdfUrl: e.target.value })}
                    placeholder="https://... เล่ม มคอ.๒ ฉบับสมบูรณ์ (PDF)"
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>

                <LiyonField label={t("curriculum.field.coverImage")}>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>
              </div>

              {form.coverImage && (
                <div className="rounded-lg overflow-hidden border border-border h-36 max-w-sm bg-muted flex items-center justify-center">
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                <LiyonField label={locale === "th" ? "ลำดับการแสดงผล" : "Display Order"}>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  />
                </LiyonField>

                <div className="flex items-center pt-6">
                  <LiyonSwitchRow
                    id="isActiveSwitch"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    label={t("curriculum.field.isActive")}
                  />
                </div>
              </div>
            </div>
          )}
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
        </>
      )}
    </div>
  );
}
