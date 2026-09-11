"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, Loader2, Building2, Mail, Send, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSelect, LiyonSwitchRow, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nameTh: initial.nameTh, nameEn: initial.nameEn, logoUrl: initial.logoUrl ?? "", palette: initial.palette as PaletteId });
  const [smtp, setSmtp] = useState({
    enabled: initial.smtp?.enabled ?? false,
    service: (initial.smtp?.service ?? "gmail") as "gmail" | "custom",
    host: initial.smtp?.host || "smtp.gmail.com",
    port: initial.smtp?.port || 465,
    secure: initial.smtp?.secure ?? true,
    user: initial.smtp?.user || "",
    pass: "",
    fromName: initial.smtp?.fromName || "",
  });
  const [hasPassword, setHasPassword] = useState(initial.smtp?.hasPassword ?? false);
  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.fileTooLarge"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadLogoAction(fd);
      if (!res.ok) {
        toast.error(t(`error.${res.error.code}`) || res.error.message);
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
      toast.success(t("settings.uploadSuccess"));
    } catch {
      toast.error(t("settings.uploadError") || t("common.error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction({
        ...form,
        smtp: {
          enabled: smtp.enabled,
          service: smtp.service,
          host: smtp.host,
          port: Number(smtp.port),
          secure: smtp.secure,
          user: smtp.user,
          pass: smtp.pass,
          fromName: smtp.fromName,
        },
      });
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      if (smtp.pass.trim() !== "") setHasPassword(true);
      setSmtp((prev) => ({ ...prev, pass: "" }));
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  async function handleTestSmtp() {
    if (!testEmail.trim()) {
      toast.error(t("settings.smtpTestRecipient"));
      return;
    }
    setTestingSmtp(true);
    try {
      const res = await testSmtpAction({
        recipient: testEmail.trim(),
        smtp: {
          enabled: true,
          service: smtp.service,
          host: smtp.host,
          port: Number(smtp.port),
          secure: smtp.secure,
          user: smtp.user,
          pass: smtp.pass,
          fromName: smtp.fromName,
        },
      });
      if (res.ok && res.data.ok) {
        toast.success(t("settings.smtpTestOk"));
      } else {
        const err = (res.ok ? res.data.error : res.error.message) || t("common.error");
        toast.error(`${t("settings.smtpTestFail")}: ${err}`);
      }
    } catch (e) {
      toast.error(`${t("settings.smtpTestFail")}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTestingSmtp(false);
    }
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.logoHint")} error={errors.logoUrl?.[0]}>
              <div className="logo-up mb-2">
                <div className="prev" aria-label={t("settings.logoPreview")}>
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt={t("settings.logoPreview")}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="h-7 w-7 opacity-60" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || pending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("settings.uploading")}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {t("settings.uploadLogo")}
                        </>
                      )}
                    </Button>
                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading || pending}
                        onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                      >
                        <X className="mr-1 h-4 w-4" />
                        {t("settings.removeLogo")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <input
                id="s-logo"
                type="text"
                value={form.logoUrl}
                placeholder="https://... หรือ /uploads/..."
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              />
            </LiyonField>
          </div>
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
          {form.palette === "mourning" && <p className="warn" role="note">{t("settings.mourningNote")}</p>}
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.smtpTitle")}</h2>
          <p>{t("settings.smtpDesc")}</p>

          <div className="mt-4 mb-4">
            <LiyonSwitchRow
              id="smtp-enabled"
              label={t("settings.smtpEnabled")}
              checked={smtp.enabled}
              onCheckedChange={(c) => setSmtp({ ...smtp, enabled: c })}
            />
          </div>

          {smtp.enabled && (
            <div className="fields mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label={t("settings.smtpService")} htmlFor="smtp-service">
                  <LiyonSelect
                    id="smtp-service"
                    value={smtp.service}
                    onChange={(e) => {
                      const service = e.target.value as "gmail" | "custom";
                      if (service === "gmail") {
                        setSmtp({ ...smtp, service, host: "smtp.gmail.com", port: 465, secure: true });
                      } else {
                        setSmtp({ ...smtp, service });
                      }
                    }}
                  >
                    <option value="gmail">{t("settings.smtpServiceGmail")}</option>
                    <option value="custom">{t("settings.smtpServiceCustom")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={t("settings.smtpFromName")} htmlFor="smtp-from-name" error={errors["smtp.fromName"]?.[0]}>
                  <input
                    id="smtp-from-name"
                    value={smtp.fromName}
                    placeholder={t("settings.smtpFromNamePh")}
                    onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                  />
                </LiyonField>
              </div>

              {smtp.service === "gmail" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 p-3.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-950 dark:text-blue-200">
                        {t("settings.smtpServiceGmail")}
                      </span>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {t("settings.smtpPassHint")}
                      </p>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1.5 font-medium"
                      >
                        Google App Passwords <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField
                  label={t("settings.smtpUser")}
                  htmlFor="smtp-user"
                  error={errors["smtp.user"]?.[0]}
                >
                  <input
                    id="smtp-user"
                    type="email"
                    value={smtp.user}
                    placeholder={smtp.service === "gmail" ? "your-org@gmail.com" : "user@domain.com"}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    required={smtp.enabled}
                  />
                </LiyonField>

                <LiyonField
                  label={t("settings.smtpPass")}
                  htmlFor="smtp-pass"
                  hint={hasPassword && !smtp.pass ? t("settings.smtpPassKeep") : undefined}
                  error={errors["smtp.pass"]?.[0]}
                >
                  <div className="relative">
                    <input
                      id="smtp-pass"
                      type={showPass ? "text" : "password"}
                      value={smtp.pass}
                      placeholder={hasPassword ? "••••••••••••••••" : t("settings.smtpPassPh")}
                      onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </LiyonField>
              </div>

              {smtp.service === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <LiyonField label={t("settings.smtpHost")} htmlFor="smtp-host" error={errors["smtp.host"]?.[0]}>
                    <input
                      id="smtp-host"
                      value={smtp.host}
                      placeholder="smtp.example.com"
                      onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                    />
                  </LiyonField>

                  <LiyonField label={t("settings.smtpPort")} htmlFor="smtp-port" error={errors["smtp.port"]?.[0]}>
                    <input
                      id="smtp-port"
                      type="number"
                      value={smtp.port}
                      onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                    />
                  </LiyonField>

                  <div className="flex items-center pt-6">
                    <LiyonSwitchRow
                      id="smtp-secure"
                      label={t("settings.smtpSecure")}
                      checked={smtp.secure}
                      onCheckedChange={(c) => setSmtp({ ...smtp, secure: c })}
                    />
                  </div>
                </div>
              )}

              {/* ส่วนทดสอบการส่งอีเมล */}
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{t("settings.smtpTestTitle")}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{t("settings.smtpTestDesc")}</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    id="smtp-test-email"
                    type="email"
                    value={testEmail}
                    placeholder="recipient@example.com"
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={testingSmtp || !testEmail.trim() || !smtp.user}
                    onClick={handleTestSmtp}
                  >
                    {testingSmtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.smtpTesting")}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("settings.smtpTestBtn")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </LiyonCard>
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}
