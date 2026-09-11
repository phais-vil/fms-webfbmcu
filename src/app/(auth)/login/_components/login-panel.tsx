"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/shared/lib/i18n/client";
import { BrandMarkIcon } from "../../_components/icons";
import { PasswordLoginForm } from "./password-login-form";
import { RegisterForm } from "./register-form";
import { OAuthButtons } from "./oauth-buttons";

export function LoginPanel({
  providers,
  defaultTab = "login",
}: {
  providers: ("google" | "microsoft")[];
  defaultTab?: "login" | "register";
}) {
  const t = useT();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const modeParam = searchParams.get("mode");
  const [tab, setTab] = useState<"login" | "register">(
    modeParam === "register" || defaultTab === "register" ? "register" : "login"
  );

  return (
    <div className="auth-box">
      <div className="auth-mark">
        <i>
          <BrandMarkIcon />
        </i>
        <div>
          <h1>{t("app.name")}</h1>
        </div>
      </div>

      <div className="auth-head">
        <h2>{tab === "login" ? t("auth.welcome") : t("auth.register.title")}</h2>
        <p>{tab === "login" ? t("auth.login.subtitle") : t("auth.register.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs" role="tablist" aria-label="Auth Mode">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          onClick={() => setTab("login")}
        >
          {t("auth.tab.signIn")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          onClick={() => setTab("register")}
        >
          {t("auth.tab.register")}
        </button>
      </div>

      {tab === "login" ? (
        <>
          {error === "NoAccount" && (
            <p className="err" role="alert">
              {t("auth.oauthNoAccount")}
            </p>
          )}
          <PasswordLoginForm />
          <div className="auth-foot">
            <p>
              <Link href="/forgot-password">{t("auth.forgot")}</Link>
            </p>
            <p style={{ marginTop: "6px" }}>
              {t("auth.register.noAccount")}{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
                style={{
                  color: "var(--brand-ink)",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {t("auth.tab.register")}
              </button>
            </p>
          </div>
          {providers.length > 0 && (
            <>
              <div className="or">
                <span>{t("auth.orContinueWith")}</span>
              </div>
              <OAuthButtons providers={providers} />
            </>
          )}
        </>
      ) : (
        <>
          <RegisterForm onSwitchToLogin={() => setTab("login")} />
          <div className="auth-foot">
            <p>
              {t("auth.register.haveAccount")}{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                style={{
                  color: "var(--brand-ink)",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {t("auth.tab.signIn")}
              </button>
            </p>
          </div>
          {providers.length > 0 && (
            <>
              <div className="or">
                <span>{t("auth.orContinueWith")}</span>
              </div>
              <OAuthButtons providers={providers} mode="register" />
            </>
          )}
        </>
      )}
    </div>
  );
}

