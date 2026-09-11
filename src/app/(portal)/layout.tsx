import { auth } from "@/features/identity/server";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieLocale] = await Promise.all([
    auth().catch(() => null),
    getLocaleCookie(),
  ]);
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  const isThai = locale === "th";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar (Admin Theme Style with Portal Menus) */}
      <PortalNavbar sessionUser={session?.user ?? null} isThai={isThai} />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Faculty Portal Footer */}
      <PortalFooter isThai={isThai} />
    </div>
  );
}
