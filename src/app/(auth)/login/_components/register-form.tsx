"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getCsrfToken } from "next-auth/react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { safeCallbackUrl } from "@/shared/lib/security/callback-url";
import { registerUserAction } from "@/features/identity/actions";
import {
  MailIcon,
  LockIcon,
  PersonIcon,
  EyeOnIcon,
  EyeOffIcon,
  PlusIcon,
} from "../../_components/icons";

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl");
  const t = useT();

  const [userType, setUserType] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [phone, setPhone] = useState("");

  // Student-specific
  const [studentCode, setStudentCode] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("BACHELOR");

  // Faculty-specific
  const [academicTitle, setAcademicTitle] = useState("");

  // Common department
  const [department, setDepartment] = useState("");

  // Services requested
  const [services, setServices] = useState<string[]>([
    "rooms",
    "certificates",
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getCsrfToken();
  }, []);

  const toggleService = (svc: string) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("auth.register.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("reset.desc"));
      return;
    }

    if (userType === "STUDENT" && !studentCode.trim()) {
      toast.error(t("auth.register.studentCode"));
      return;
    }

    setLoading(true);
    try {
      const res = await registerUserAction({
        userType,
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: phone.trim(),
        studentCode: userType === "STUDENT" ? studentCode.trim() : "",
        degreeLevel: userType === "STUDENT" ? degreeLevel : "",
        department: department.trim(),
        academicTitle: userType === "INSTRUCTOR" ? academicTitle.trim() : "",
        services,
      });

      if (!res.ok) {
        if (res.error.code === "conflict" || res.error.message?.includes("email")) {
          toast.error(t("auth.register.emailTaken"));
        } else {
          toast.error(res.error.message || t("auth.errorRetry"));
        }
        return;
      }

      toast.success(t("auth.register.success"));

      // Sign in immediately with newly created credentials
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        if (onSwitchToLogin) onSwitchToLogin();
        else router.push("/login");
      } else {
        router.push(safeCallbackUrl(callbackUrl));
        router.refresh();
      }
    } catch {
      toast.error(t("auth.errorRetry"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pane-register">
      {/* Type Switcher */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, marginBottom: "8px" }}>
          {t("auth.register.userType")}
        </label>
        <div className="auth-tabs" role="tablist" style={{ marginBottom: 0 }}>
          <button
            type="button"
            role="tab"
            aria-selected={userType === "STUDENT"}
            onClick={() => setUserType("STUDENT")}
          >
            🎓 {t("auth.register.type.student")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={userType === "INSTRUCTOR"}
            onClick={() => setUserType("INSTRUCTOR")}
          >
            👨‍🏫 {t("auth.register.type.instructor")}
          </button>
        </div>
      </div>

      <div className="fields">
        {/* Full Name */}
        <div className="field">
          <label htmlFor="reg-name">{t("auth.register.fullName")}</label>
          <span className="wrap">
            <PersonIcon />
            <input
              id="reg-name"
              type="text"
              required
              placeholder={t("auth.register.fullNamePh")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </div>

        {/* Email */}
        <div className="field">
          <label htmlFor="reg-email">{t("auth.register.email")}</label>
          <span className="wrap">
            <MailIcon />
            <input
              id="reg-email"
              type="email"
              autoComplete="username"
              required
              placeholder={t("auth.register.emailPh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </span>
        </div>

        {/* Password & Confirm Password */}
        <div className="field-row">
          <div className="field">
            <label htmlFor="reg-password">{t("auth.register.password")}</label>
            <span className="wrap">
              <LockIcon />
              <input
                id="reg-password"
                type={showPw ? "text" : "password"}
                className="pw"
                autoComplete="new-password"
                required
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="peek"
                aria-pressed={showPw}
                aria-label={showPw ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowPw((v) => !v)}
              >
                <EyeOnIcon />
                <EyeOffIcon />
              </button>
            </span>
          </div>

          <div className="field">
            <label htmlFor="reg-confirm-password">{t("auth.register.confirmPassword")}</label>
            <span className="wrap">
              <LockIcon />
              <input
                id="reg-confirm-password"
                type={showConfirmPw ? "text" : "password"}
                className="pw"
                autoComplete="new-password"
                required
                placeholder={t("auth.passwordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="peek"
                aria-pressed={showConfirmPw}
                aria-label={showConfirmPw ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowConfirmPw((v) => !v)}
              >
                <EyeOnIcon />
                <EyeOffIcon />
              </button>
            </span>
          </div>
        </div>

        {/* Role Specific Fields */}
        {userType === "STUDENT" ? (
          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-student-code">{t("auth.register.studentCode")} *</label>
              <input
                id="reg-student-code"
                type="text"
                required
                placeholder={t("auth.register.studentCodePh")}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-degree">{t("auth.register.degreeLevel")}</label>
              <select
                id="reg-degree"
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
              >
                <option value="BACHELOR">{t("auth.register.degree.bachelor")}</option>
                <option value="MASTER">{t("auth.register.degree.master")}</option>
                <option value="DOCTORAL">{t("auth.register.degree.doctoral")}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="reg-academic-title">{t("auth.register.academicTitle")}</label>
            <input
              id="reg-academic-title"
              type="text"
              placeholder={t("auth.register.academicTitlePh")}
              value={academicTitle}
              onChange={(e) => setAcademicTitle(e.target.value)}
            />
          </div>
        )}

        {/* Department & Phone */}
        <div className="field-row">
          <div className="field">
            <label htmlFor="reg-dept">{t("auth.register.department")}</label>
            <input
              id="reg-dept"
              type="text"
              placeholder={t("auth.register.departmentPh")}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reg-phone">{t("auth.register.phone")}</label>
            <input
              id="reg-phone"
              type="tel"
              placeholder={t("auth.register.phonePh")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Services Interest */}
        <div className="field">
          <label style={{ marginBottom: "2px" }}>{t("auth.register.servicesTitle")}</label>
          <div
            style={{
              display: "grid",
              gap: "8px",
              padding: "12px",
              borderRadius: "var(--r-md)",
              background: "var(--glass-strong)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.86rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={services.includes("rooms")}
                onChange={() => toggleService("rooms")}
                style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }}
              />
              <span>{t("auth.register.service.rooms")}</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.86rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={services.includes("certificates")}
                onChange={() => toggleService("certificates")}
                style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }}
              />
              <span>{t("auth.register.service.certificates")}</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.86rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={services.includes("documents")}
                onChange={() => toggleService("documents")}
                style={{ width: "16px", height: "16px", accentColor: "var(--brand)" }}
              />
              <span>{t("auth.register.service.documents")}</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button className="btn-wide" type="submit" disabled={loading} style={{ marginTop: "6px" }}>
          <PlusIcon />
          {loading ? t("auth.register.submitting") : t("auth.register.submit")}
        </button>
      </div>
    </form>
  );
}
