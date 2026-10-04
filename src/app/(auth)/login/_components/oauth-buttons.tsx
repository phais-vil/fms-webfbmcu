"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Copy, Check, ExternalLink, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { GoogleIcon } from "../../_components/icons";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogPrimitive,
} from "@/shared/components/liyon/liyon-dialog";
import { ensureGoogleDemoUserAction } from "@/features/identity/actions";

const PROVIDER_ID = { google: "google", microsoft: "microsoft-entra-id" } as const;

export function OAuthButtons({
  providers,
  mode = "login",
}: {
  providers: ("google" | "microsoft")[];
  mode?: "login" | "register";
}) {
  const t = useT();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const isGoogleConfigured = providers.includes("google");
  const callbackUrl = "http://localhost:3010/api/auth/callback/google";

  const handleGoogleClick = () => {
    if (isGoogleConfigured) {
      void signIn("google", { callbackUrl: "/dashboard" });
    } else {
      setModalOpen(true);
    }
  };

  const handleCopyCallback = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      toast.success("คัดลอก Authorized redirect URI เรียบร้อยแล้ว");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง");
    }
  };

  const handleDemoGoogleLogin = async () => {
    try {
      setIsDemoLoading(true);
      const res = await ensureGoogleDemoUserAction();
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้างบัญชีจำลอง");
        return;
      }

      const loginRes = await signIn("credentials", {
        email: res.data.email,
        password: res.data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        toast.error("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
      } else {
        toast.success("เข้าสู่ระบบด้วยบัญชี Google จำลองเรียบร้อยแล้ว");
        setModalOpen(false);
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <>
      <div className="oauth">
        {/* Google OAuth Button - Always visible */}
        <button
          type="button"
          className="btn-oauth btn-oauth-google"
          onClick={handleGoogleClick}
        >
          <GoogleIcon />
          <span>
            {mode === "register"
              ? t("auth.registerWithGoogle")
              : t("auth.signInWithGoogle")}
          </span>
        </button>

        {/* Microsoft OAuth Button (when configured) */}
        {providers.includes("microsoft") && (
          <button
            type="button"
            className="btn-oauth btn-oauth-microsoft"
            onClick={() => signIn(PROVIDER_ID.microsoft, { callbackUrl: "/dashboard" })}
          >
            <span>{t("auth.provider.microsoft")}</span>
          </button>
        )}
      </div>

      {/* Google OAuth Setup & Demo Login Dialog */}
      <LiyonDialog open={modalOpen} onOpenChange={setModalOpen} wide>
        <div className="hd flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center p-1.5 border border-red-200 dark:border-red-800">
              <GoogleIcon />
            </div>
            <div>
              <LiyonDialogPrimitive.Title asChild>
                <h2 className="text-base font-bold text-foreground">
                  การเข้าสู่ระบบด้วย Google (Google Sign-In)
                </h2>
              </LiyonDialogPrimitive.Title>
              <LiyonDialogPrimitive.Description asChild>
                <p className="text-xs text-muted-foreground">
                  คำแนะนำการตั้งค่า Google OAuth หรือทดสอบด้วยบัญชีจำลอง
                </p>
              </LiyonDialogPrimitive.Description>
            </div>
          </div>
          <LiyonDialogCloseButton label="ปิด" />
        </div>

        <div className="bd py-4 space-y-4 text-xs sm:text-sm text-foreground">
          {/* Status Alert */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs space-y-1">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <span>⚠️ ยังไม่ได้ระบุ Google Client ID ในไฟล์ .env</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              เพื่อให้ปุ่ม Google เชื่อมต่อกับระบบจริงของ Google โดยตรง กรุณาสร้าง OAuth Client ID บน Google Cloud Console และนำคีย์มาระบุในไฟล์ <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-3 rounded-lg border border-border p-3.5 bg-muted/20">
            <div className="font-bold text-xs text-foreground uppercase tracking-wider">
              ขั้นตอนการตั้งค่า Google Cloud Console:
            </div>

            <ol className="space-y-2.5 text-xs text-muted-foreground list-decimal pl-4">
              <li>
                <span>ไปที่ </span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console &gt; Credentials
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span>กดปุ่ม <strong>Create Credentials &gt; OAuth client ID</strong> เลือกประเภท <strong>Web application</strong></span>
              </li>
              <li>
                <div className="space-y-1">
                  <span>กำหนดช่อง <strong>Authorized redirect URIs</strong> เป็น:</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] bg-background border border-border rounded p-1.5">
                    <span className="flex-1 select-all truncate text-foreground">{callbackUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyCallback}
                      className="p-1 hover:bg-muted rounded text-xs inline-flex items-center gap-1 shrink-0 font-sans cursor-pointer text-primary"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="text-[10px]">{copied ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                    </button>
                  </div>
                </div>
              </li>
              <li>
                <span>นำค่าที่ได้มาวางในไฟล์ <code className="font-mono bg-muted px-1 py-0.5 rounded">.env</code> ของโปรเจกต์:</span>
                <pre className="mt-1 p-2 rounded bg-background border border-border text-[11px] font-mono select-all overflow-x-auto text-foreground">
{`GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key`}
                </pre>
              </li>
            </ol>
          </div>

          {/* Quick Demo Login Option */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>หรือทดลองเข้าสู่ระบบทันทีด้วยบัญชี Google จำลอง (Demo Account)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              สำหรับทดสอบการเข้าสู่ระบบ บทบาทนิสิต (<code className="font-mono text-[11px]">STUDENT</code>) และสิทธิ์การใช้งานของระบบ โดยไม่ต้องรอการเชื่อมต่อกับ Google Cloud Console
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleDemoGoogleLogin}
                disabled={isDemoLoading}
                className="w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isDemoLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังเข้าสู่ระบบจำลอง...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>เข้าสู่ระบบด้วยบัญชี Google จำลอง (google.demo@mcu.ac.th)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="ft flex justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </LiyonDialog>
    </>
  );
}

