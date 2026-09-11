import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import { auth } from "@/features/identity/server";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { PortalUserMenu } from "./_components/portal-user-menu";
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
      {/* Top Banner / Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg leading-tight text-foreground">
                {isThai ? "คณะพุทธศาสตร์" : "Faculty of Buddhism"}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isThai ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" : "Mahachulalongkornrajavidyalaya University"}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "หน้าแรก" : "Home"}
            </Link>
            <Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "ข่าวสารประชาสัมพันธ์" : "News & PR"}
            </Link>
            <Link href="/curriculum" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "หลักสูตร" : "Curriculum"}
            </Link>
            <Link href="/staff" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "บุคลากร" : "Faculty Staff"}
            </Link>
            <Link href="/rooms" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "จองห้องประชุม" : "Room Booking"}
            </Link>
            <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "บริการนิสิต" : "Student Services"}
            </Link>
            <Link href="/attendance/checkin" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "เช็คชื่อเข้าเรียน" : "Attendance"}
            </Link>
            <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "แผนยุทธศาสตร์" : "Strategic Plan"}
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              {isThai ? "เกี่ยวกับคณะ" : "About Us"}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="h-9 w-9" />
            {session?.user ? (
              <PortalUserMenu user={session.user} isThai={isThai} />
            ) : (
              <Button asChild size="sm" variant="default" className="gap-2">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  <span>{isThai ? "เข้าสู่ระบบ" : "Sign In"}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Faculty Portal Footer */}
      <PortalFooter isThai={isThai} />
    </div>
  );
}
