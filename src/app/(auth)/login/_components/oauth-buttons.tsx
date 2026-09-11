"use client";
import { signIn } from "next-auth/react";
import { useT } from "@/shared/lib/i18n/client";
import { GoogleIcon } from "../../_components/icons";

const PROVIDER_ID = { google: "google", microsoft: "microsoft-entra-id" } as const;

export function OAuthButtons({
  providers,
  mode = "login",
}: {
  providers: ("google" | "microsoft")[];
  mode?: "login" | "register";
}) {
  const t = useT();
  return (
    <div className="oauth">
      {providers.map((p) => (
        <button
          key={p}
          type="button"
          className={`btn-oauth btn-oauth-${p}`}
          onClick={() => signIn(PROVIDER_ID[p], { callbackUrl: "/dashboard" })}
        >
          {p === "google" && <GoogleIcon />}
          <span>
            {p === "google"
              ? mode === "register"
                ? t("auth.registerWithGoogle")
                : t("auth.signInWithGoogle")
              : t(`auth.provider.${p}`)}
          </span>
        </button>
      ))}
    </div>
  );
}
