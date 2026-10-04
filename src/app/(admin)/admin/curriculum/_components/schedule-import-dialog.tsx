"use client";

import { useState, useTransition, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Loader2,
  FileSpreadsheet,
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
import {
  type AcademicDepartmentDto,
  type CurriculumDto,
  type ClassScheduleDto,
  type CreateScheduleInput,
  type ScheduleItemInput,
  parseScheduleText,
  parseScheduleJson,
  getSampleScheduleJson,
} from "@/features/curriculum";
import { createScheduleAction, parseSchedulePdfAction } from "@/features/curriculum/actions";

interface ScheduleImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: AcademicDepartmentDto[];
  curriculums: CurriculumDto[];
  onSuccess: (schedule: ClassScheduleDto) => void;
}

const DAY_OPTIONS = [
  { value: 1, label: "วันจันทร์ (Mon)" },
  { value: 2, label: "วันอังคาร (Tue)" },
  { value: 3, label: "วันพุธ (Wed)" },
  { value: 4, label: "วันพฤหัสบดี (Thu)" },
  { value: 5, label: "วันศุกร์ (Fri)" },
  { value: 6, label: "วันเสาร์ (Sat)" },
  { value: 7, label: "วันอาทิตย์ (Sun)" },
];

export function ScheduleImportDialog({
  open,
  onOpenChange,
  departments,
  curriculums,
  onSuccess,
}: ScheduleImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed Form Data
  const [formData, setFormData] = useState<CreateScheduleInput>({
    departmentId: departments[0]?.id || "",
    curriculumId: curriculums[0]?.id || null,
    academicYear: 2569,
    semester: 1,
    yearLevel: 1,
    titleTh: "ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙",
    titleEn: "",
    targetGroupTh: "คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์) สาขาวิชาพระพุทธศาสนา",
    targetGroupEn: "",
    roomLocationTh: "อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑",
    roomLocationEn: "",
    remarksTh: `๑. วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)\n๒. เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง\n๓. เครื่องหมายดอกจัน (*) อยู่หลังชื่อ หมายถึง อาจารย์ผู้รับผิดชอบรายวิชา\n๔. วันพระกับวันอาทิตย์เป็นวันหยุดประจำสัปดาห์`,
    remarksEn: "",
    isActive: true,
    items: [],
  });

  const [hasParsedData, setHasParsedData] = useState(false);

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setHasParsedData(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const json = getSampleScheduleJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule-template.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลดแบบฟอร์มตารางสอนเรียบร้อยแล้ว");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf");
    const isImage = selectedFile.type.startsWith("image/");
    const isJson = selectedFile.name.endsWith(".json") || selectedFile.type === "application/json";

    try {
      if (isImage) {
        // Image preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);

        // Pre-fill initial items structure so user can transcribe/verify with the image side-by-side
        setFormData((prev) => ({
          ...prev,
          titleTh: `ตารางสอน (${selectedFile.name.replace(/\.[^/.]+$/, "")})`,
          items: [
            {
              dayOfWeek: 1,
              startTime: "09:00",
              endTime: "11:30",
              slotPeriod: "09.00 - 11.30 (คาบเช้า)",
              courseCode: "000 139",
              courseNameTh: "จิตวิทยาทั่วไป",
              instructorsTh: "ผศ.ดร.บุญมี พวงเพชร*, ดร.ณรงค์ ปั้นงาม",
              roomOrNote: "",
              displayOrder: 1,
            },
          ],
        }));
        setHasParsedData(true);
        toast.info("โหลดรูปภาพสำเร็จ ตรวจสอบและกรอกข้อมูลรายวิชาจากภาพด้านซ้าย");
      } else if (isPdf) {
        // Send to Server Action for PDF text extraction
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        const res = await parseSchedulePdfAction(uploadData);

        if (res.ok && res.data.text) {
          const parsed = parseScheduleText(res.data.text);
          setFormData((prev) => ({
            ...prev,
            ...parsed.schedule,
            items: parsed.items.length > 0 ? parsed.items : prev.items,
          }));
          setHasParsedData(true);
          toast.success(`สกัดข้อมูลจาก PDF สำเร็จ (พบ ${parsed.detectedCount} รายวิชา)`);
        } else {
          // If pure scanned PDF without text layer
          setHasParsedData(true);
          toast.warning("PDF เป็นไฟล์ภาพสแกน กรุณาตรวจสอบและปรับปรุงข้อมูลในตาราง");
        }
      } else if (isJson) {
        const text = await selectedFile.text();
        const parsed = parseScheduleJson(text);
        setFormData((prev) => ({
          ...prev,
          ...parsed.schedule,
          items: parsed.items,
        }));
        setHasParsedData(true);
        toast.success(`นำเข้าจาก JSON สำเร็จ (${parsed.detectedCount} คาบเรียน)`);
      } else {
        toast.error("รูปแบบไฟล์ไม่รองรับ กรุณาเลือกไฟล์ PDF, JPEG, PNG หรือ JSON");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddItem = () => {
    const newItem: ScheduleItemInput = {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "11:30",
      slotPeriod: "09.00 - 11.30 (คาบเช้า)",
      courseCode: "",
      courseNameTh: "",
      courseNameEn: "",
      instructorsTh: "",
      instructorsEn: "",
      roomOrNote: "",
      displayOrder: formData.items.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof ScheduleItemInput, value: unknown) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleSubmit = () => {
    if (!formData.titleTh.trim()) {
      toast.error("กรุณาระบุชื่อตารางสอน");
      return;
    }

    startTransition(async () => {
      const res = await createScheduleAction(formData);
      if (res.ok) {
        toast.success("นำเข้าและบันทึกตารางสอนสำเร็จเรียบร้อยแล้ว");
        onSuccess(res.data);
        onOpenChange(false);
        handleReset();
      } else {
        const errMsg = res.error.fieldErrors
          ? Object.entries(res.error.fieldErrors)
              .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
              .join(" | ")
          : res.error.message;
        toast.error(errMsg || "เกิดข้อผิดพลาดในการบันทึกตารางสอน");
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogHeader
        title="นำเข้าตารางสอน / ตารางเรียน (Import Schedule)"
        description="อัปโหลดไฟล์เอกสาร PDF, ภาพ JPEG หรือไฟล์แบบฟอร์ม เพื่อนำเข้าตารางเรียนเข้าสู่ระบบ"
      />

      <LiyonDialogBody className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Advice / File Format Recommendation Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20 p-4 text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>คำแนะนำรูปแบบไฟล์สำหรับการอ่านข้อมูล (File Recommendation)</span>
          </div>
          <p className="leading-relaxed pl-6 text-muted-foreground dark:text-blue-300/80">
            • <strong>ไฟล์ PDF (แนะนำที่สุด):</strong> มีความแม่นยำในการอ่านตัวอักษร 100% ไม่เกิดปัญหาสระเพี้ยน เหมาะสำหรับตารางสอนทางการ<br />
            • <strong>ไฟล์ JPEG / PNG:</strong> รองรับภาพถ่ายตารางสอนจริง พร้อมช่องพรีวิวภาพเพื่อตรวจทานความถูกต้อง<br />
            • <strong>ไฟล์ JSON Template:</strong> รองรับการนำเข้าข้อมูลโครงสร้างแบบรวดเร็ว
          </p>
        </div>

        {/* Upload Zone */}
        {!hasParsedData ? (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-muted/10 hover:bg-primary/5 space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/jpg,.json"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  {isProcessing ? "กำลังวิเคราะห์และอ่านข้อมูลไฟล์..." : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
                </p>
                <p className="text-xs text-muted-foreground">
                  รองรับไฟล์ PDF, JPEG, JPG, PNG หรือ JSON (ขนาดไม่เกิน 10MB)
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                  <FileText className="h-3 w-3" /> PDF (แนะนำ)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <ImageIcon className="h-3 w-3" /> JPEG / PNG
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <FileSpreadsheet className="h-3 w-3" /> JSON Template
                </span>
              </div>
            </div>

            {/* Template Download Button */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card text-xs">
              <span className="text-muted-foreground">
                ต้องการแบบฟอร์มมาตรฐานสำหรับการกรอกข้อมูลล่วงหน้า?
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-1.5 cursor-pointer text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>ดาวน์โหลด JSON Template</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Parsed Data Review & Edit Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">ไฟล์ที่นำเข้า:</span>
                <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {file?.name || "Uploaded Document"}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
              >
                เปลี่ยนไฟล์ใหม่
              </Button>
            </div>

            {/* If Image was uploaded, show side-by-side preview */}
            {filePreview && (
              <div className="rounded-xl border border-border overflow-hidden bg-muted/20 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>ภาพเอกสารต้นฉบับ (ใช้เทียบเคียงข้อมูลด้านล่าง):</span>
                </div>
                <div className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-black/5 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Timetable Source"
                    className="max-w-full h-auto object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* Schedule Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label="สาขาวิชา / ภาควิชา *">
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTh}
                    </option>
                  ))}
                </select>
              </LiyonField>

              <LiyonField label="หลักสูตรที่เกี่ยวข้อง">
                <select
                  value={formData.curriculumId || ""}
                  onChange={(e) => setFormData({ ...formData, curriculumId: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">-- ไม่ระบุหลักสูตรเฉพาะ --</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameTh} ({c.code})
                    </option>
                  ))}
                </select>
              </LiyonField>

              <LiyonField label="ปีการศึกษา *">
                <input
                  type="number"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: parseInt(e.target.value) || 2569 })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </LiyonField>

              <div className="grid grid-cols-2 gap-2">
                <LiyonField label="ภาคการศึกษา *">
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value={1}>ภาคการศึกษาที่ ๑</option>
                    <option value={2}>ภาคการศึกษาที่ ๒</option>
                    <option value={3}>ภาคฤดูร้อน</option>
                  </select>
                </LiyonField>

                <LiyonField label="ชั้นปีที่ *">
                  <select
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value={1}>ชั้นปีที่ ๑</option>
                    <option value={2}>ชั้นปีที่ ๒</option>
                    <option value={3}>ชั้นปีที่ ๓</option>
                    <option value={4}>ชั้นปีที่ ๔</option>
                  </select>
                </LiyonField>
              </div>

              <div className="sm:col-span-2">
                <LiyonField label="ชื่อหัวข้อตารางสอน *">
                  <input
                    type="text"
                    value={formData.titleTh}
                    onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </LiyonField>
              </div>

              <div className="sm:col-span-2">
                <LiyonField label="กลุ่มเป้าหมาย / นิสิต">
                  <input
                    type="text"
                    value={formData.targetGroupTh || ""}
                    onChange={(e) => setFormData({ ...formData, targetGroupTh: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </LiyonField>
              </div>

              <div className="sm:col-span-2">
                <LiyonField label="สถานที่ / ห้องเรียน">
                  <input
                    type="text"
                    value={formData.roomLocationTh || ""}
                    onChange={(e) => setFormData({ ...formData, roomLocationTh: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </LiyonField>
              </div>
            </div>

            {/* Course Slots Review & Adjustment Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    รายการคาบเรียนในตาราง ({formData.items.length} รายการ)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    ตรวจทานและแก้ไขรหัสวิชา ชื่อวิชา อาจารย์ และเวลาเรียนก่อนบันทึก
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="gap-1 text-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>เพิ่มวิชา</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-card/60 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold text-primary">
                        วิชาลำดับที่ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          วันในสัปดาห์
                        </label>
                        <select
                          value={item.dayOfWeek}
                          onChange={(e) =>
                            handleItemChange(idx, "dayOfWeek", parseInt(e.target.value))
                          }
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                        >
                          {DAY_OPTIONS.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          ช่วงเวลา (เริ่ม - จบ)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={item.startTime}
                            onChange={(e) =>
                              handleItemChange(idx, "startTime", e.target.value)
                            }
                            className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">-</span>
                          <input
                            type="time"
                            value={item.endTime}
                            onChange={(e) =>
                              handleItemChange(idx, "endTime", e.target.value)
                            }
                            className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          รหัสวิชา
                        </label>
                        <input
                          type="text"
                          value={item.courseCode}
                          placeholder="เช่น 000 139"
                          onChange={(e) =>
                            handleItemChange(idx, "courseCode", e.target.value)
                          }
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          ชื่อวิชา (ภาษาไทย)
                        </label>
                        <input
                          type="text"
                          value={item.courseNameTh}
                          placeholder="เช่น จิตวิทยาทั่วไป"
                          onChange={(e) =>
                            handleItemChange(idx, "courseNameTh", e.target.value)
                          }
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          อาจารย์ผู้สอน (ใส่ * หลังชื่ออาจารย์ผู้รับผิดชอบ)
                        </label>
                        <input
                          type="text"
                          value={item.instructorsTh}
                          placeholder="เช่น ผศ.ดร.บุญมี พวงเพชร*, ดร.ณรงค์ ปั้นงาม"
                          onChange={(e) =>
                            handleItemChange(idx, "instructorsTh", e.target.value)
                          }
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          ห้องเรียน / หมายเหตุ
                        </label>
                        <input
                          type="text"
                          value={item.roomOrNote || ""}
                          placeholder="เช่น ห้องบรรยาย ๑"
                          onChange={(e) =>
                            handleItemChange(idx, "roomOrNote", e.target.value)
                          }
                          className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </LiyonDialogBody>

      <LiyonDialogFooter className="flex items-center justify-between">
        <LiyonDialogCloseButton label="ยกเลิก" />

        {hasParsedData && (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="gap-1.5 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>ยืนยันและนำเข้าตารางสอน</span>
          </Button>
        )}
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
