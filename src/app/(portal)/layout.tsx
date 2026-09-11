import Link from "next/link";
import { GraduationCap, LogIn, LayoutDashboard } from "lucide-react";
import { auth } from "@/features/identity/server";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

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
              <Button asChild size="sm" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{isThai ? "ระบบหลังบ้าน" : "Console"}</span>
                </Link>
              </Button>
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
      <footer className="border-t border-border bg-muted/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-bold text-base">
                  {isThai ? "คณะพุทธศาสตร์" : "Faculty of Buddhism"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {isThai
                  ? "ศูนย์กลางการศึกษาพระพุทธศาสนาและวิชาการระดับสากล บูรณาการพุทธธรรมสู่การพัฒนาจิตใจและสังคมอย่างยั่งยืน"
                  : "Center of Buddhist Education and International Academics, integrating Buddhist values for social and spiritual development."}
              </p>
              <p className="text-xs text-muted-foreground">
                {isThai
                  ? "79 หมู่ที่ 1 ถนนพหลโยธิน ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170"
                  : "79 Moo 1, Phahonyothin Rd., Lam Sai, Wang Noi, Phra Nakhon Si Ayutthaya 13170 Thailand"}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">{isThai ? "เมนูด่วน" : "Quick Links"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/news" className="hover:text-foreground">
                    {isThai ? "ข่าวสารและประกาศ" : "News & Announcements"}
                  </Link>
                </li>
                <li>
                  <Link href="/curriculum" className="hover:text-foreground">
                    {isThai ? "หลักสูตรปริญญาตรี-โท-เอก" : "Degree Programs"}
                  </Link>
                </li>
                <li>
                  <Link href="/staff" className="hover:text-foreground">
                    {isThai ? "ทำเนียบคณาจารย์" : "Faculty Directory"}
                  </Link>
                </li>
                <li>
                  <Link href="/rooms" className="hover:text-foreground">
                    {isThai ? "จองห้องประชุมและห้องเรียน" : "Room Reservations"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">{isThai ? "บริการออนไลน์" : "Online Services"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/services" className="hover:text-foreground">
                    {isThai ? "ระบบคำร้องนิสิต & ตรวจสอบ QR" : "Student Requests & QR Verify"}
                  </Link>
                </li>
                <li>
                  <Link href="/attendance/checkin" className="hover:text-foreground">
                    {isThai ? "ระบบเช็คชื่อเข้าเรียนออนไลน์" : "Classroom Check-In"}
                  </Link>
                </li>
                <li>
                  <Link href="/documents/track" className="hover:text-foreground">
                    {isThai ? "ติดตามเอกสารสารบรรณ" : "Document Tracking"}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/news" className="hover:text-foreground">
                    {isThai ? "ระบบจัดการข่าวสาร" : "News Management"}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    {isThai ? "ระบบสารสนเทศบุคลากร" : "Staff Intranet"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© 2026 Faculty of Buddhism. All rights reserved.</p>
            <p>Built with VibeCore Framework</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
