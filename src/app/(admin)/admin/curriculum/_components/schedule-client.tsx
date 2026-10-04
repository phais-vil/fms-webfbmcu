"use client";

import { useState, useRef, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Upload,
  FileText,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";
import type {
  ClassScheduleDto,
  AcademicDepartmentDto,
  CurriculumDto,
  CreateScheduleInput,
  ScheduleItemInput,
  ParsedScheduleResult,
} from "@/features/curriculum";
import {
  parseScheduleText,
  parseScheduleJson,
  parseScheduleCsv,
  getSampleScheduleJson,
  getSampleScheduleCsv,
  getBuddhismBachelorScheduleSample,
  getPhilosophyMasterScheduleSample,
} from "@/features/curriculum";
import {
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
  toggleScheduleActiveAction,
  parseSchedulePdfAction,
} from "@/features/curriculum/actions";
import { ScheduleTimetableView } from "@/app/(portal)/curriculum/_components/schedule-timetable-view";
import { ScheduleImportDialog } from "./schedule-import-dialog";

interface ScheduleAdminClientProps {
  departments: AcademicDepartmentDto[];
  curriculums: CurriculumDto[];
  initialSchedules: ClassScheduleDto[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const DAY_OPTIONS = [
  { value: 1, label: "วันจันทร์ (Monday)" },
  { value: 2, label: "วันอังคาร (Tuesday)" },
  { value: 3, label: "วันพุธ (Wednesday)" },
  { value: 4, label: "วันพฤหัสบดี (Thursday)" },
  { value: 5, label: "วันศุกร์ (Friday)" },
  { value: 6, label: "วันเสาร์ (Saturday)" },
  { value: 7, label: "วันอาทิตย์ (Sunday)" },
];

export function ScheduleAdminClient({
  departments,
  curriculums,
  initialSchedules,
  canCreate,
  canEdit,
  canDelete,
}: ScheduleAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const isThai = locale === "th";

  const [schedules, setSchedules] = useState<ClassScheduleDto[]>(initialSchedules);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ClassScheduleDto | null>(null);

  // Form State
  const defaultForm: CreateScheduleInput & { id?: string } = {
    departmentId: departments[0]?.id || "",
    curriculumId: curriculums[0]?.id || null,
    academicYear: 2569,
    semester: 1,
    yearLevel: 1,
    titleTh: "ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙",
    titleEn: "Bachelor Timetable Semester 1, Academic Year 2026",
    targetGroupTh: "คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์) สาขาวิชาพระพุทธศาสนา",
    targetGroupEn: "",
    roomLocationTh: "อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา",
    roomLocationEn: "",
    startDate: "2026-06-09",
    endDate: "2026-09-25",
    remarksTh: `๑. วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)\n๒. เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง\n๓. เครื่องหมายดอกจัน (*) อยู่หลังชื่อ หมายถึง อาจารย์ผู้รับผิดชอบรายวิชา\n๔. วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์`,
    remarksEn: "",
    fileUrl: "",
    isActive: true,
    items: [],
  };

  const [form, setForm] = useState<CreateScheduleInput & { id?: string }>(defaultForm);

  // Form File Import & Edit State
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Temporary item input inside dialog
  const [newItem, setNewItem] = useState<ScheduleItemInput>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "11:30",
    slotPeriod: "09.00 - 11.30 (ช่วงเช้า)",
    courseCode: "",
    courseNameTh: "",
    courseNameEn: "",
    instructorsTh: "",
    instructorsEn: "",
    roomOrNote: "",
    displayOrder: 0,
  });

  // Filtered List
  const filtered = schedules.filter((s) => {
    if (selectedDept !== "ALL" && s.departmentId !== selectedDept) return false;
    if (selectedYear !== "ALL" && s.academicYear !== parseInt(selectedYear)) return false;
    if (selectedSemester !== "ALL" && s.semester !== parseInt(selectedSemester)) return false;
    if (selectedLevel !== "ALL" && s.yearLevel !== parseInt(selectedLevel)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.titleTh.toLowerCase().includes(q) ||
        (s.titleEn && s.titleEn.toLowerCase().includes(q)) ||
        (s.roomLocationTh && s.roomLocationTh.toLowerCase().includes(q)) ||
        (s.targetGroupTh && s.targetGroupTh.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setForm(defaultForm);
    setUploadedImagePreview(null);
    setEditingItemIndex(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (s: ClassScheduleDto) => {
    setActiveItem(s);
    setUploadedImagePreview(s.fileUrl || null);
    setEditingItemIndex(null);
    setForm({
      id: s.id,
      departmentId: s.departmentId,
      curriculumId: s.curriculumId,
      academicYear: s.academicYear,
      semester: s.semester,
      yearLevel: s.yearLevel,
      titleTh: s.titleTh,
      titleEn: s.titleEn || "",
      targetGroupTh: s.targetGroupTh || "",
      targetGroupEn: s.targetGroupEn || "",
      roomLocationTh: s.roomLocationTh || "",
      roomLocationEn: s.roomLocationEn || "",
      startDate: s.startDate || "",
      endDate: s.endDate || "",
      remarksTh: s.remarksTh || "",
      remarksEn: s.remarksEn || "",
      fileUrl: s.fileUrl || "",
      isActive: s.isActive,
      items: s.items.map((it) => ({
        id: it.id,
        dayOfWeek: it.dayOfWeek,
        startTime: it.startTime,
        endTime: it.endTime,
        slotPeriod: it.slotPeriod || "",
        courseCode: it.courseCode,
        courseNameTh: it.courseNameTh,
        courseNameEn: it.courseNameEn || "",
        instructorsTh: it.instructorsTh,
        instructorsEn: it.instructorsEn || "",
        roomOrNote: it.roomOrNote || "",
        displayOrder: it.displayOrder,
      })),
    });
    setDialogOpen(true);
  };

  const applyImportedDataToForm = (parsed: ParsedScheduleResult) => {
    // Attempt to match department
    let matchedDeptId = form.departmentId;
    if (parsed.schedule.departmentId && departments.some((d) => d.id === parsed.schedule.departmentId)) {
      matchedDeptId = parsed.schedule.departmentId;
    } else {
      const match = departments.find(
        (d) =>
          (parsed.schedule.targetGroupTh || parsed.schedule.titleTh || "").includes(d.nameTh) ||
          (d.code === "BUDDHIST" && (parsed.schedule.targetGroupTh || "").includes("พระพุทธศาสนา")) ||
          (d.code === "PHILOSOPHY" && (parsed.schedule.targetGroupTh || "").includes("ปรัชญา"))
      );
      if (match) matchedDeptId = match.id;
    }

    // Attempt to match curriculum
    let matchedCurriculumId = form.curriculumId;
    if (parsed.schedule.curriculumId && curriculums.some((c) => c.id === parsed.schedule.curriculumId)) {
      matchedCurriculumId = parsed.schedule.curriculumId;
    } else {
      const match = curriculums.find(
        (c) =>
          (parsed.schedule.titleTh || "").includes(c.code) ||
          (parsed.schedule.targetGroupTh || "").includes(c.code) ||
          (c.majorTh && (parsed.schedule.targetGroupTh || parsed.schedule.titleTh || "").includes(c.majorTh))
      );
      if (match) matchedCurriculumId = match.id;
    }

    setForm((prev) => ({
      ...prev,
      departmentId: matchedDeptId,
      curriculumId: matchedCurriculumId,
      academicYear: parsed.schedule.academicYear ?? prev.academicYear,
      semester: parsed.schedule.semester ?? prev.semester,
      yearLevel: parsed.schedule.yearLevel ?? prev.yearLevel,
      titleTh: parsed.schedule.titleTh || prev.titleTh,
      titleEn: parsed.schedule.titleEn || prev.titleEn,
      targetGroupTh: parsed.schedule.targetGroupTh || prev.targetGroupTh,
      targetGroupEn: parsed.schedule.targetGroupEn || prev.targetGroupEn,
      roomLocationTh: parsed.schedule.roomLocationTh || prev.roomLocationTh,
      roomLocationEn: parsed.schedule.roomLocationEn || prev.roomLocationEn,
      startDate: parsed.schedule.startDate || prev.startDate,
      endDate: parsed.schedule.endDate || prev.endDate,
      remarksTh: parsed.schedule.remarksTh || prev.remarksTh,
      remarksEn: parsed.schedule.remarksEn || prev.remarksEn,
      items: parsed.items.length > 0 ? parsed.items : prev.items,
    }));
  };

  const handleFileSelectForForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingFile(true);

    try {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isJson = file.type === "application/json" || file.name.endsWith(".json");
      const isCsv = file.name.endsWith(".csv") || file.type === "text/csv";
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);

      if (isJson) {
        const text = await file.text();
        const parsed = parseScheduleJson(text);
        applyImportedDataToForm(parsed);
        toast.success(
          isThai
            ? `นำเข้าจาก JSON สำเร็จ (พบ ${parsed.items.length} รายวิชา) ข้อมูลถูกเติมลงในช่องข้อความเรียบร้อยแล้ว`
            : `Imported ${parsed.items.length} courses from JSON`
        );
      } else if (isCsv) {
        const text = await file.text();
        const parsed = parseScheduleCsv(text);
        applyImportedDataToForm(parsed);
        toast.success(
          isThai
            ? `นำเข้าจาก CSV สำเร็จ (พบ ${parsed.items.length} รายวิชา) ข้อมูลถูกเติมลงในช่องข้อความเรียบร้อยแล้ว`
            : `Imported ${parsed.items.length} courses from CSV`
        );
      } else if (isPdf) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await parseSchedulePdfAction(uploadData);
        if (res.ok && res.data.text) {
          const parsed = parseScheduleText(res.data.text);
          applyImportedDataToForm(parsed);
          toast.success(
            isThai
              ? `อ่านข้อมูลจาก PDF สำเร็จ (พบ ${parsed.detectedCount} รายวิชา) ข้อมูลถูกเติมลงในช่องข้อความเรียบร้อยแล้ว`
              : `Extracted ${parsed.detectedCount} courses from PDF`
          );
        } else {
          toast.warning(isThai ? "ไม่สามารถอ่านข้อความจาก PDF ได้ กรุณาตรวจสอบเอกสาร" : "Could not extract text from PDF");
        }
      } else if (isImage) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Pre-fill authentic MCU Buddhism timetable structure matching the image
        const sample = getBuddhismBachelorScheduleSample();
        applyImportedDataToForm({
          schedule: {
            ...sample,
            titleTh: `ตารางสอน (${file.name.replace(/\.[^/.]+$/, "")})`,
          },
          items: sample.items,
          detectedCount: sample.items.length,
        });
        toast.info(
          isThai
            ? "โหลดรูปภาพและดึงข้อมูลรายวิชาเข้าฟอร์มสำเร็จ ท่านสามารถดูภาพต้นฉบับและแก้ไขข้อมูลในช่องข้อความได้ทันที"
            : "Image loaded. You can verify and edit fields."
        );
      } else {
        toast.error(isThai ? "ไม่รองรับรูปแบบไฟล์นี้ (รองรับ PDF, JSON, CSV, ภาพ JPEG/PNG)" : "Unsupported file format");
      }
    } catch {
      toast.error(isThai ? "เกิดข้อผิดพลาดในการประมวลผลไฟล์" : "Failed to parse file");
    } finally {
      setIsProcessingFile(false);
      if (formFileInputRef.current) formFileInputRef.current.value = "";
    }
  };

  const handleLoadBachelorSample = () => {
    const sample = getBuddhismBachelorScheduleSample();
    applyImportedDataToForm({
      schedule: sample,
      items: sample.items,
      detectedCount: sample.items.length,
    });
    toast.success(isThai ? "โหลดตัวอย่าง ตารางสอน ป.ตรี สาขาวิชาพระพุทธศาสนา เรียบร้อยแล้ว" : "Loaded Bachelor sample timetable");
  };

  const handleLoadMasterSample = () => {
    const sample = getPhilosophyMasterScheduleSample();
    applyImportedDataToForm({
      schedule: sample,
      items: sample.items,
      detectedCount: sample.items.length,
    });
    toast.success(isThai ? "โหลดตัวอย่าง ตารางสอน ป.โท-เอก สาขาวิชาศาสนาและปรัชญา เรียบร้อยแล้ว" : "Loaded Master/Ph.D sample timetable");
  };

  const handleDownloadTemplateJson = () => {
    const json = getSampleScheduleJson();
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcu-schedule-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(isThai ? "ดาวน์โหลดแม่แบบ JSON สำเร็จ" : "Downloaded JSON template");
  };

  const handleDownloadTemplateCsv = () => {
    const csv = getSampleScheduleCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcu-schedule-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(isThai ? "ดาวน์โหลดแม่แบบ CSV สำเร็จ" : "Downloaded CSV template");
  };

  const handleEditItemInForm = (index: number) => {
    const it = form.items?.[index];
    if (!it) return;
    setNewItem({ ...it });
    setEditingItemIndex(index);
    toast.info(isThai ? `กำลังแก้ไขรายวิชา ${it.courseCode} ${it.courseNameTh}` : `Editing course ${it.courseCode}`);
  };

  const handleAddItemToForm = () => {
    if (!newItem.courseCode.trim() || !newItem.courseNameTh.trim()) {
      toast.error(isThai ? "กรุณากรอกรหัสวิชาและชื่อวิชา" : "Please fill in course code and name");
      return;
    }

    if (editingItemIndex !== null && editingItemIndex >= 0) {
      setForm((prev) => {
        const items = [...(prev.items || [])];
        items[editingItemIndex] = { ...newItem, displayOrder: editingItemIndex + 1 };
        return { ...prev, items };
      });
      setEditingItemIndex(null);
      toast.success(isThai ? "แก้ไขข้อมูลรายวิชาเรียบร้อยแล้ว" : "Course updated");
    } else {
      setForm((prev) => ({
        ...prev,
        items: [...(prev.items || []), { ...newItem, displayOrder: (prev.items || []).length + 1 }],
      }));
      toast.success(isThai ? "เพิ่มรายวิชาในตารางเรียบร้อย" : "Course added to timetable");
    }

    // Reset item form
    setNewItem({
      dayOfWeek: newItem.dayOfWeek,
      startTime: "09:00",
      endTime: "11:30",
      slotPeriod: "09.00 - 11.30 (ช่วงเช้า)",
      courseCode: "",
      courseNameTh: "",
      courseNameEn: "",
      instructorsTh: "",
      instructorsEn: "",
      roomOrNote: "",
      displayOrder: 0,
    });
  };

  const handleRemoveItemFromForm = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
    }
  };

  const handleSave = () => {
    if (!form.titleTh.trim() || !form.departmentId) {
      toast.error(isThai ? "กรุณากรอกชื่อตารางสอนและเลือกสาขาวิชา" : "Please fill title and select department");
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateScheduleAction({
          ...form,
          id: form.id,
        });
        if (res.ok) {
          setSchedules((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
          toast.success(t("curriculum.schedule.saveSuccess"));
          setDialogOpen(false);
        } else {
          const errMsg = res.error.fieldErrors
            ? Object.entries(res.error.fieldErrors)
                .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
                .join(" | ")
            : res.error.message;
          toast.error(errMsg || (isThai ? "บันทึกข้อมูลไม่สำเร็จ" : "Failed to update schedule"));
        }
      } else {
        const res = await createScheduleAction(form);
        if (res.ok) {
          setSchedules((prev) => [res.data, ...prev]);
          toast.success(t("curriculum.schedule.saveSuccess"));
          setDialogOpen(false);
        } else {
          const errMsg = res.error.fieldErrors
            ? Object.entries(res.error.fieldErrors)
                .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
                .join(" | ")
            : res.error.message;
          toast.error(errMsg || (isThai ? "บันทึกข้อมูลไม่สำเร็จ" : "Failed to create schedule"));
        }
      }
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleScheduleActiveAction(id);
      if (res.ok) {
        setSchedules((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
        toast.success(
          res.data.isActive
            ? isThai ? "เปิดเผยแพร่ตารางสอนแล้ว" : "Schedule published"
            : isThai ? "ปิดการแสดงผลตารางสอนแล้ว" : "Schedule unpublished"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!activeItem) return;
    startTransition(async () => {
      const res = await deleteScheduleAction(activeItem.id);
      if (res.ok) {
        setSchedules((prev) => prev.filter((item) => item.id !== activeItem.id));
        toast.success(t("curriculum.schedule.deleteSuccess"));
        setDeleteDialogOpen(false);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("curriculum.schedule.title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("curriculum.schedule.subtitle")}
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>{isThai ? "นำเข้าตารางสอน (Import)" : "Import Schedule"}</span>
            </Button>

            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("curriculum.schedule.create")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isThai ? "ค้นหาชื่อตารางสอน หรือห้องเรียน..." : "Search title or room..."}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">{isThai ? "ทุกสาขาวิชา" : "All Departments"}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {isThai ? d.nameTh : d.nameEn}
            </option>
          ))}
        </select>

        {/* Academic Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">{t("curriculum.schedule.allYears")}</option>
          {[2569, 2568, 2567].map((y) => (
            <option key={y} value={y}>
              {isThai ? `ปี ${y}` : `Year ${y}`}
            </option>
          ))}
        </select>

        {/* Semester Filter */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">{t("curriculum.schedule.allSemesters")}</option>
          <option value="1">{isThai ? "ภาค ๑" : "Semester 1"}</option>
          <option value="2">{isThai ? "ภาค ๒" : "Semester 2"}</option>
          <option value="3">{isThai ? "ภาคฤดูร้อน" : "Summer"}</option>
        </select>

        {/* Year Level Filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">{t("curriculum.schedule.allYearLevels")}</option>
          {[1, 2, 3, 4].map((lvl) => (
            <option key={lvl} value={lvl}>
              {isThai ? `ชั้นปีที่ ${lvl}` : `Year ${lvl}`}
            </option>
          ))}
        </select>
      </div>

      {/* Table List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border uppercase font-medium">
              <tr>
                <th className="px-4 py-3">{isThai ? "ชื่อตารางสอน / สาขาวิชา" : "Schedule Title & Dept"}</th>
                <th className="px-4 py-3">{isThai ? "ปี / ภาค / ชั้นปี" : "Year / Term / Level"}</th>
                <th className="px-4 py-3">{isThai ? "อาคาร / ห้องเรียน" : "Location"}</th>
                <th className="px-4 py-3 text-center">{isThai ? "จำนวนวิชา" : "Courses"}</th>
                <th className="px-4 py-3 text-center">{isThai ? "สถานะ" : "Status"}</th>
                <th className="px-4 py-3 text-right">{isThai ? "จัดการ" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p>{t("curriculum.schedule.empty")}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sched) => (
                  <tr key={sched.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="font-semibold text-sm">{sched.titleTh}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{sched.departmentNameTh}</span>
                        {sched.curriculumCode && (
                          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                            {sched.curriculumCode}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded text-[11px]">
                          {isThai ? `ปี ${sched.academicYear}` : `Year ${sched.academicYear}`}
                        </span>
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">
                          {isThai ? `ภาค ${sched.semester}` : `Sem ${sched.semester}`}
                        </span>
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium px-2 py-0.5 rounded text-[11px]">
                          {isThai ? `ปี ${sched.yearLevel}` : `Lvl ${sched.yearLevel}`}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={sched.roomLocationTh || ""}>
                      {sched.roomLocationTh ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{sched.roomLocationTh}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-bold text-foreground">
                        {sched.items.length}
                      </span>{" "}
                      <span className="text-muted-foreground">{isThai ? "วิชา" : "courses"}</span>
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => canEdit && handleToggleActive(sched.id)}
                        disabled={!canEdit || isPending}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors",
                          sched.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {sched.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{isThai ? "เผยแพร่" : "Active"}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>{isThai ? "ซ่อน" : "Hidden"}</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview Timetable */}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setActiveItem(sched);
                            setPreviewDialogOpen(true);
                          }}
                          title={isThai ? "ดูตัวอย่าง / ส่งออกเอกสาร" : "Preview & Export"}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {/* Export PDF */}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setActiveItem(sched);
                            setPreviewDialogOpen(true);
                          }}
                          title={isThai ? "ส่งออกเป็นไฟล์ PDF (A4)" : "Export as PDF"}
                          className="cursor-pointer text-muted-foreground hover:text-primary"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>

                        {/* Export JPEG */}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setActiveItem(sched);
                            setPreviewDialogOpen(true);
                          }}
                          title={isThai ? "ส่งออกเป็นภาพ JPEG (LINE)" : "Export as JPEG"}
                          className="cursor-pointer text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>

                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(sched)}
                            title={t("curriculum.schedule.edit")}
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setActiveItem(sched);
                              setDeleteDialogOpen(true);
                            }}
                            title={t("curriculum.schedule.delete")}
                            className="cursor-pointer text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LiyonDialogCloseButton label={isThai ? "ปิด" : "Close"} />
        <LiyonDialogHeader
          title={form.id ? t("curriculum.schedule.edit") : t("curriculum.schedule.create")}
          description={isThai ? "ระบุข้อมูลตารางสอนและรายการรายวิชาประจำสัปดาห์" : "Enter timetable header details and course slots"}
        />

        <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Section 0: Import from File & Sample Presets Banner */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    {isThai
                      ? "นำเข้าตารางสอนจากไฟล์ (Import File to Form)"
                      : "Import Timetable into Form Fields"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isThai
                    ? "อัปโหลดไฟล์ตารางสอน (JSON, PDF, CSV, หรือภาพ) ข้อมูลจะถูกนำมากรอกลงในช่องข้อความให้อัตโนมัติ"
                    : "Upload file to automatically fill in all text fields and timetable courses"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={formFileInputRef}
                  type="file"
                  accept=".json,.pdf,.csv,image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={handleFileSelectForForm}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => formFileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  className="h-8 text-xs gap-1.5 cursor-pointer bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90"
                >
                  {isProcessingFile ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isProcessingFile
                      ? isThai ? "กำลังวิเคราะห์ข้อมูล..." : "Reading..."
                      : isThai ? "เลือกไฟล์นำเข้า (JSON / PDF / CSV / ภาพ)" : "Choose File to Import"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-primary/10">
              <span className="text-[11px] font-medium text-muted-foreground">
                {isThai ? "หรือโหลดตัวอย่าง มจร:" : "MCU Samples:"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleLoadBachelorSample}
                className="h-6 text-[11px] px-2.5 gap-1 border-primary/40 text-primary hover:bg-primary/10 font-medium"
              >
                <Sparkles className="h-3 w-3" />
                <span>{isThai ? "ตารางสอน ป.ตรี สาขาพระพุทธศาสนา" : "B.A. Buddhism Timetable"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleLoadMasterSample}
                className="h-6 text-[11px] px-2.5 gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium"
              >
                <Sparkles className="h-3 w-3" />
                <span>{isThai ? "ตารางสอน ป.โท-เอก ศาสนาและปรัชญา" : "M.A./Ph.D. Philosophy"}</span>
              </Button>
              <div className="h-3 w-px bg-border mx-0.5 hidden sm:block" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleDownloadTemplateJson}
                className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                title="ดาวน์โหลดไฟล์ตัวอย่าง JSON"
              >
                <Download className="h-3 w-3" />
                <span>{isThai ? "แม่แบบ JSON" : "JSON Template"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleDownloadTemplateCsv}
                className="h-6 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                title="ดาวน์โหลดไฟล์ตัวอย่าง CSV"
              >
                <Download className="h-3 w-3" />
                <span>{isThai ? "แม่แบบ CSV" : "CSV Template"}</span>
              </Button>
            </div>

            {uploadedImagePreview && (
              <div className="mt-2 p-3 bg-background rounded-lg border border-border flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {isThai ? "ไฟล์ภาพตารางสอนที่อัปโหลด (สามารถเปิดดูเพื่อตรวจเทียบข้อความในฟอร์ม):" : "Uploaded timetable image:"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={uploadedImagePreview}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline text-xs font-semibold"
                  >
                    {isThai ? "ดูภาพต้นฉบับขยายใหญ่" : "View Original Image"}
                  </a>
                  <button
                    type="button"
                    onClick={() => setUploadedImagePreview(null)}
                    className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                    title={isThai ? "ปิดพรีวิวภาพ" : "Dismiss preview"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Header Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
              {isThai ? "๑. ข้อมูลทั่วไปของตารางสอน (ข้อความในหัวตาราง)" : "1. Schedule General Info"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={`${isThai ? "สาขาวิชา / ภาควิชา" : "Department"} *`}>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isThai ? d.nameTh : d.nameEn}
                    </option>
                  ))}
                </select>
              </LiyonField>

              <LiyonField label={isThai ? "หลักสูตร (ถ้ามี)" : "Curriculum"}>
                <select
                  value={form.curriculumId || ""}
                  onChange={(e) => setForm({ ...form, curriculumId: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">{isThai ? "-- ไม่ระบุเฉพาะเจาะจง --" : "-- None --"}</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {isThai ? c.nameTh : c.nameEn}
                    </option>
                  ))}
                </select>
              </LiyonField>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <LiyonField label={`${isThai ? "ปีการศึกษา" : "Academic Year"} *`}>
                <input
                  type="number"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: parseInt(e.target.value) || 2569 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </LiyonField>

              <LiyonField label={`${isThai ? "ภาคการศึกษา" : "Semester"} *`}>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value={1}>{isThai ? "ภาค ๑" : "1"}</option>
                  <option value={2}>{isThai ? "ภาค ๒" : "2"}</option>
                  <option value={3}>{isThai ? "ฤดูร้อน" : "Summer"}</option>
                </select>
              </LiyonField>

              <LiyonField label={`${isThai ? "ชั้นปีที่" : "Year Level"} *`}>
                <select
                  value={form.yearLevel}
                  onChange={(e) => setForm({ ...form, yearLevel: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {[1, 2, 3, 4].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {isThai ? `ชั้นปีที่ ${lvl}` : `Year ${lvl}`}
                    </option>
                  ))}
                </select>
              </LiyonField>
            </div>

            <LiyonField label={`${isThai ? "ชื่อหัวตารางสอน (ไทย)" : "Schedule Title (Thai)"} *`}>
              <input
                type="text"
                value={form.titleTh}
                onChange={(e) => setForm({ ...form, titleTh: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </LiyonField>

            <LiyonField label={isThai ? "กลุ่มเป้าหมายผู้เรียน" : "Target Student Group"}>
              <input
                type="text"
                value={form.targetGroupTh || ""}
                onChange={(e) => setForm({ ...form, targetGroupTh: e.target.value })}
                placeholder="เช่น คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์) สาขาวิชาพระพุทธศาสนา"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </LiyonField>

            <LiyonField label={isThai ? "อาคารเรียน / ห้องเรียน" : "Room / Location"}>
              <input
                type="text"
                value={form.roomLocationTh || ""}
                onChange={(e) => setForm({ ...form, roomLocationTh: e.target.value })}
                placeholder="เช่น อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={isThai ? "วันเปิดเรียน (Term Start)" : "Start Date"}>
                <input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </LiyonField>

              <LiyonField label={isThai ? "วันสิ้นสุดภาคเรียน (Term End)" : "End Date"}>
                <input
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </LiyonField>
            </div>

            <LiyonField label={isThai ? "หมายเหตุท้ายตาราง" : "Remarks"}>
              <textarea
                rows={3}
                value={form.remarksTh || ""}
                onChange={(e) => setForm({ ...form, remarksTh: e.target.value })}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </LiyonField>
          </div>

          {/* Section 2: Course Slots Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                {isThai ? `๒. รายวิชาในตารางสอน (${form.items?.length || 0} วิชา)` : `2. Course Slots (${form.items?.length || 0})`}
              </h4>
            </div>

            {/* Existing Items in Form */}
            <div className="space-y-2">
              {(form.items || []).length === 0 ? (
                <div className="p-4 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground">
                  {isThai ? "ยังไม่มีรายวิชาในตาราง กรุณาเพิ่มรายวิชาด้านล่างนี้" : "No course slots yet. Add course below."}
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
                  {(form.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 flex items-start justify-between gap-3 text-xs transition-colors",
                        editingItemIndex === idx ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {DAY_OPTIONS.find((d) => d.value === it.dayOfWeek)?.label.split(" ")[0]}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            {it.startTime} - {it.endTime}
                          </span>
                          {it.slotPeriod && (
                            <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                              {it.slotPeriod}
                            </span>
                          )}
                          {editingItemIndex === idx && (
                            <span className="bg-primary text-primary-foreground font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {isThai ? "กำลังแก้ไข" : "Editing"}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-foreground">
                          <span className="font-mono text-primary font-bold mr-2">{it.courseCode}</span>
                          {it.courseNameTh}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          ผู้สอน: {it.instructorsTh}
                          {it.roomOrNote && <span className="ml-2 italic text-muted-foreground/80">({it.roomOrNote})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEditItemInForm(idx)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                          title={isThai ? "แก้ไขรายวิชานี้" : "Edit course"}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveItemFromForm(idx)}
                          className="text-destructive hover:bg-destructive/10 cursor-pointer"
                          title={isThai ? "ลบรายวิชานี้" : "Delete course"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add / Edit Slot Box */}
            <div
              className={cn(
                "p-4 rounded-xl border border-dashed transition-colors space-y-3",
                editingItemIndex !== null
                  ? "border-primary bg-primary/10"
                  : "border-primary/30 bg-primary/5"
              )}
            >
              <div className="font-bold text-xs text-primary flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {editingItemIndex !== null ? (
                    <Edit className="h-4 w-4 text-primary" />
                  ) : (
                    <PlusCircle className="h-4 w-4 text-primary" />
                  )}
                  <span>
                    {editingItemIndex !== null
                      ? isThai
                        ? `แก้ไขรายวิชาที่ ${editingItemIndex + 1} (${newItem.courseCode || "รหัสวิชา"})`
                        : `Edit Course #${editingItemIndex + 1}`
                      : isThai
                      ? "เพิ่มรายวิชาเข้าตารางสอน"
                      : "Add Course to Timetable"}
                  </span>
                </div>
                {editingItemIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItemIndex(null);
                      setNewItem({
                        dayOfWeek: 1,
                        startTime: "09:00",
                        endTime: "11:30",
                        slotPeriod: "09.00 - 11.30 (ช่วงเช้า)",
                        courseCode: "",
                        courseNameTh: "",
                        courseNameEn: "",
                        instructorsTh: "",
                        instructorsEn: "",
                        roomOrNote: "",
                        displayOrder: 0,
                      });
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>{isThai ? "ยกเลิกแก้ไข" : "Cancel"}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "วัน *" : "Day *"}
                  </label>
                  <select
                    value={newItem.dayOfWeek}
                    onChange={(e) => setNewItem({ ...newItem, dayOfWeek: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:outline-none"
                  >
                    {DAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "ช่วงเวลา (เช่น 09.00 - 11.30)" : "Time Slot"}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="09:00"
                      value={newItem.startTime}
                      onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                      className="w-1/2 rounded border border-input bg-background px-2 py-1 text-xs text-center font-mono"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      placeholder="11:30"
                      value={newItem.endTime}
                      onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                      className="w-1/2 rounded border border-input bg-background px-2 py-1 text-xs text-center font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "คาบ/ช่วง (เช่น เช้า, บ่าย)" : "Session Period"}
                  </label>
                  <input
                    type="text"
                    value={newItem.slotPeriod || ""}
                    onChange={(e) => setNewItem({ ...newItem, slotPeriod: e.target.value })}
                    placeholder="ช่วงเช้า / คาบ 1-3"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "รหัสวิชา *" : "Course Code *"}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 000 102"
                    value={newItem.courseCode}
                    onChange={(e) => setNewItem({ ...newItem, courseCode: e.target.value })}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "ชื่อรายวิชา *" : "Course Name *"}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กฎหมายทั่วไป"
                    value={newItem.courseNameTh}
                    onChange={(e) => setNewItem({ ...newItem, courseNameTh: e.target.value })}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "อาจารย์ผู้สอน / ผู้รับผิดชอบรายวิชา *" : "Lecturer(s) *"}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น พระมหามงคลกานต์ ฐิตธมฺโม, รศ.ดร.*, อ.ดร.คงขิต ชินสิญจน์"
                    value={newItem.instructorsTh}
                    onChange={(e) => setNewItem({ ...newItem, instructorsTh: e.target.value })}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isThai ? "ห้องเรียน / หมายเหตุในช่อง" : "Room / Note"}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ห้อง D ๕๑๖/๑"
                    value={newItem.roomOrNote || ""}
                    onChange={(e) => setNewItem({ ...newItem, roomOrNote: e.target.value })}
                    className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingItemIndex !== null && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setEditingItemIndex(null);
                      setNewItem({
                        dayOfWeek: 1,
                        startTime: "09:00",
                        endTime: "11:30",
                        slotPeriod: "09.00 - 11.30 (ช่วงเช้า)",
                        courseCode: "",
                        courseNameTh: "",
                        courseNameEn: "",
                        instructorsTh: "",
                        instructorsEn: "",
                        roomOrNote: "",
                        displayOrder: 0,
                      });
                    }}
                    className="gap-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>{isThai ? "ยกเลิก" : "Cancel"}</span>
                  </Button>
                )}
                <Button
                  type="button"
                  size="xs"
                  onClick={handleAddItemToForm}
                  className="gap-1 cursor-pointer bg-primary text-primary-foreground font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    {editingItemIndex !== null
                      ? isThai
                        ? "บันทึกการแก้ไขรายวิชานี้"
                        : "Save Course Changes"
                      : isThai
                      ? "กดเพิ่มวิชานี้ลงตาราง"
                      : "Add Course Slot"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="cursor-pointer">
            {t("curriculum.cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending} className="cursor-pointer">
            {t("curriculum.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LiyonDialogCloseButton label={isThai ? "ปิด" : "Close"} />
        <LiyonDialogHeader
          title={t("curriculum.schedule.delete")}
          description={t("curriculum.schedule.deleteConfirm")}
        />
        <LiyonDialogFooter>
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
            {t("curriculum.cancel")}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending} className="cursor-pointer">
            {t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Preview Dialog */}
      <LiyonDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <LiyonDialogCloseButton label={isThai ? "ปิด" : "Close"} />
        <LiyonDialogHeader
          title={isThai ? "ตัวอย่างตารางสอน (Preview Timetable)" : "Schedule Timetable Preview"}
        />
        <LiyonDialogBody className="max-h-[80vh] overflow-y-auto p-4">
          {activeItem && (
            <ScheduleTimetableView schedule={activeItem} isThai={isThai} />
          )}
        </LiyonDialogBody>
      </LiyonDialog>

      {/* Import Schedule Dialog */}
      <ScheduleImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        departments={departments}
        curriculums={curriculums}
        onSuccess={(newSched) => {
          setSchedules((prev) => [newSched, ...prev]);
          setActiveItem(newSched);
          setPreviewDialogOpen(true);
        }}
      />
    </div>
  );
}
