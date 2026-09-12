"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonCard,
  LiyonField,
  LiyonSelect,
  StatusPill,
  useBreadcrumbTail,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { localizedName } from "@/shared/lib/format";
import { parseCsv } from "@/shared/lib/csv";
import {
  getUsersCsvTemplateAction,
  importUsersCsvAction,
  listRolesForPickerAction,
} from "@/features/identity/actions";
import {
  csvUserRowSchema,
  type ImportResult,
} from "@/features/identity";

interface ParsedPreviewRow {
  rowNum: number;
  name: string;
  email: string;
  roles: string;
  phone: string;
  status: string;
  isValid: boolean;
  errorMessage?: string;
}

export function UsersImportClient() {
  const t = useT();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useBreadcrumbTail([
    { label: t("users.title"), href: "/users" },
    { label: t("users.importTitle"), href: "/users/import" },
  ]);

  const [roles, setRoles] = useState<
    Array<{ id: string; code: string; nameTh: string; nameEn: string }>
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mode, setMode] = useState<"skip" | "update">("skip");
  const [defaultRoleId, setDefaultRoleId] = useState<string>("");
  const [defaultPassword, setDefaultPassword] = useState<string>("");
  const [previewTab, setPreviewTab] = useState<"all" | "valid" | "errors">("all");
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load roles on mount
  useEffect(() => {
    listRolesForPickerAction().then((r) => {
      if (r.ok) {
        setRoles(r.data);
        const student = r.data.find((role) => role.code === "STUDENT");
        if (student) setDefaultRoleId(student.id);
        else if (r.data[0]) setDefaultRoleId(r.data[0].id);
      }
    });
  }, []);

  // Parse & validate rows for preview
  const previewRows = useMemo<ParsedPreviewRow[]>(() => {
    return rawRows.map((raw, idx) => {
      const name =
        raw["ชื่อ-นามสกุล *"] ||
        raw["ชื่อ-นามสกุล"] ||
        raw["Full Name *"] ||
        raw["Full Name"] ||
        raw["name"] ||
        "";
      const email =
        raw["อีเมล *"] ||
        raw["อีเมล"] ||
        raw["Email *"] ||
        raw["Email"] ||
        raw["email"] ||
        "";
      const rolesStr =
        raw["บทบาท (เช่น STUDENT, INSTRUCTOR)"] ||
        raw["บทบาท"] ||
        raw["Roles (e.g. STUDENT, INSTRUCTOR)"] ||
        raw["Roles"] ||
        raw["roles"] ||
        "";
      const phone =
        raw["เบอร์โทรศัพท์"] || raw["Phone"] || raw["phone"] || "";
      const statusStr =
        raw["สถานะ (active/inactive)"] ||
        raw["สถานะ"] ||
        raw["Status (active/inactive)"] ||
        raw["Status"] ||
        raw["isActive"] ||
        "active";

      const parsed = csvUserRowSchema.safeParse({
        name,
        email,
        roles: rolesStr,
        phone,
        isActive: statusStr,
      });

      return {
        rowNum: idx + 2,
        name,
        email,
        roles: rolesStr,
        phone,
        status: statusStr,
        isValid: parsed.success,
        errorMessage: !parsed.success
          ? parsed.error.issues.map((e) => e.message).join(", ")
          : undefined,
      };
    });
  }, [rawRows]);

  const validCount = previewRows.filter((r) => r.isValid).length;
  const errorCount = previewRows.filter((r) => !r.isValid).length;

  const filteredPreviewRows = useMemo(() => {
    if (previewTab === "valid") return previewRows.filter((r) => r.isValid);
    if (previewTab === "errors") return previewRows.filter((r) => !r.isValid);
    return previewRows;
  }, [previewRows, previewTab]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error(t("users.dropzoneHint"));
      return;
    }

    setFile(selectedFile);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const parsed = parseCsv(text);
      if (parsed.rows.length === 0) {
        toast.warning(t("users.emptyCsv"));
        setRawRows([]);
        return;
      }
      setRawRows(parsed.rows);
      toast.success(t("users.fileLoaded"));
    } catch {
      toast.error(t("users.loadFail"));
    }
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const res = await getUsersCsvTemplateAction();
      if (!res.ok) {
        toast.error(t("users.exportError"));
        return;
      }
      const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("users.exportError"));
    } finally {
      setDownloadingTemplate(false);
    }
  }

  function handleExecuteImport() {
    if (rawRows.length === 0) {
      toast.warning(t("users.noFileSelected"));
      return;
    }

    startTransition(async () => {
      const res = await importUsersCsvAction({
        options: {
          mode,
          defaultRoleId: defaultRoleId || undefined,
          defaultPassword: defaultPassword.trim() || undefined,
        },
        rows: rawRows,
      });

      if (!res.ok) {
        toast.error(t("users.importFailed"));
        return;
      }

      setResult(res.data);
      toast.success(
        t("users.importSuccess", {
          created: res.data.created,
          updated: res.data.updated,
        })
      );
    });
  }

  function handleReset() {
    setFile(null);
    setRawRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href="/users">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("users.backToUsers")}
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("users.importTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("users.importDesc")}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={downloadingTemplate}
          onClick={handleDownloadTemplate}
          className="shrink-0"
        >
          {downloadingTemplate ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {t("users.downloadTemplate")}
        </Button>
      </div>

      {/* Result Summary Card (Shown after import execution) */}
      {result && (
        <LiyonCard>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("users.summaryTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("users.importSuccess", {
                  created: result.created,
                  updated: result.updated,
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-xs text-muted-foreground block mb-1">
                {t("users.summaryCreated")}
              </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {result.created}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
              <span className="text-xs text-muted-foreground block mb-1">
                {t("users.summaryUpdated")}
              </span>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {result.updated}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
              <span className="text-xs text-muted-foreground block mb-1">
                {t("users.summarySkipped")}
              </span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {result.skipped}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
              <span className="text-xs text-muted-foreground block mb-1">
                {t("users.summaryErrors")}
              </span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {result.errors.length}
              </span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-6 border border-rose-200 dark:border-rose-900/50 rounded-lg p-3 bg-rose-50/50 dark:bg-rose-950/20 max-h-48 overflow-y-auto">
              <h3 className="text-xs font-semibold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("users.summaryErrors")} ({result.errors.length})
              </h3>
              <ul className="text-xs space-y-1 text-rose-700 dark:text-rose-400">
                {result.errors.map((err, i) => (
                  <li key={i}>
                    • แถวที่ {err.row}: {err.email ? `[${err.email}] ` : ""}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button asChild variant="default">
              <Link href="/users">
                <Users className="h-4 w-4 mr-2" />
                {t("users.backToUsers")}
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t("users.importAgain")}
            </Button>
          </div>
        </LiyonCard>
      )}

      {/* Main Upload & Configuration Flow */}
      {!result && (
        <div className="space-y-6">
          {/* Step 1: File Dropzone */}
          <LiyonCard>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              1. {t("users.dropzoneTitle")}
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {t("users.dropzoneTitle")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("users.dropzoneHint")}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {rawRows.length} รายการ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("users.changeFile")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </LiyonCard>

          {/* Step 2: Settings */}
          {file && (
            <LiyonCard>
              <h2 className="text-base font-semibold text-foreground mb-4">
                2. {t("users.importSettings")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label={t("users.importMode")} htmlFor="import-mode">
                  <LiyonSelect
                    id="import-mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "skip" | "update")}
                  >
                    <option value="skip">{t("users.importModeSkip")}</option>
                    <option value="update">{t("users.importModeUpdate")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField
                  label={t("users.importDefaultRole")}
                  htmlFor="import-default-role"
                >
                  <LiyonSelect
                    id="import-default-role"
                    value={defaultRoleId}
                    onChange={(e) => setDefaultRoleId(e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {localizedName(r, locale)} ({r.code})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <div className="md:col-span-2">
                  <LiyonField
                    label={t("users.defaultPasswordLabel")}
                    htmlFor="import-password"
                    hint={t("users.defaultPasswordPlaceholder")}
                  >
                    <input
                      id="import-password"
                      type="text"
                      value={defaultPassword}
                      onChange={(e) => setDefaultPassword(e.target.value)}
                      placeholder="Mcu@2026! (เว้นว่างไว้เพื่อสร้างลิงก์ตั้งรหัสผ่าน)"
                      className="w-full text-sm"
                    />
                  </LiyonField>
                </div>
              </div>
            </LiyonCard>
          )}

          {/* Step 3: Data Preview */}
          {file && previewRows.length > 0 && (
            <LiyonCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    3. {t("users.previewTitle")}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusPill tone="ok">
                      {t("users.validRows", { n: validCount })}
                    </StatusPill>
                    {errorCount > 0 && (
                      <StatusPill tone="bad">
                        {t("users.errorRows", { n: errorCount })}
                      </StatusPill>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30 self-start">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("all")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      previewTab === "all"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ทั้งหมด ({previewRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("valid")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      previewTab === "valid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ถูกต้อง ({validCount})
                  </button>
                  {errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab("errors")}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                        previewTab === "errors"
                          ? "bg-background text-foreground shadow-xs text-rose-600 dark:text-rose-400 font-semibold"
                          : "text-rose-600/80 dark:text-rose-400/80"
                      }`}
                    >
                      ข้อผิดพลาด ({errorCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="border border-border rounded-lg overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 sticky top-0 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2.5 w-12 text-center">#</th>
                      <th className="p-2.5">{t("users.colName")}</th>
                      <th className="p-2.5">{t("users.email")}</th>
                      <th className="p-2.5">{t("users.colRoles")}</th>
                      <th className="p-2.5">{t("users.filterStatus")}</th>
                      <th className="p-2.5">สถานะข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPreviewRows.slice(0, 50).map((row) => (
                      <tr
                        key={row.rowNum}
                        className={
                          !row.isValid
                            ? "bg-rose-50/40 dark:bg-rose-950/20"
                            : undefined
                        }
                      >
                        <td className="p-2.5 text-center text-muted-foreground font-mono">
                          {row.rowNum}
                        </td>
                        <td className="p-2.5 font-medium text-foreground">
                          {row.name || <span className="text-muted-foreground italic">(ว่าง)</span>}
                        </td>
                        <td className="p-2.5 font-mono text-muted-foreground">
                          {row.email || <span className="text-muted-foreground italic">(ว่าง)</span>}
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {row.roles || "(ใช้ค่าเริ่มต้น)"}
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {row.status}
                        </td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 gap-1 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              พร้อมนำเข้า
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-600 dark:text-rose-400 gap-1 font-medium">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {row.errorMessage}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPreviewRows.length > 50 && (
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  แสดง 50 รายการแรกจากทั้งหมด {filteredPreviewRows.length} รายการ
                </p>
              )}

              {/* Execution Action Button */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Button asChild variant="outline">
                  <Link href="/users">{t("users.backToUsers")}</Link>
                </Button>

                <Button
                  type="button"
                  disabled={isPending || validCount === 0}
                  onClick={handleExecuteImport}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("users.importing")}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("users.executeImport", { n: rawRows.length })}
                    </>
                  )}
                </Button>
              </div>
            </LiyonCard>
          )}
        </div>
      )}
    </div>
  );
}
