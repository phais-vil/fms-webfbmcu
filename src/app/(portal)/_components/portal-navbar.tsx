"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  LogIn,
  Sun,
  Moon,
  Menu,
  X,
  Newspaper,
  BookOpen,
  Users,
  CalendarDays,
  FileCheck2,
  QrCode,
  Target,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { PortalUserMenu } from "./portal-user-menu";

interface PortalNavbarProps {
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isThai: boolean;
}

export function PortalNavbar({ sessionUser, isThai }: PortalNavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMobileMenuOpen(false);
  }

  const navLinks = [
    { href: "/", labelTh: "หน้าแรก", labelEn: "Home", icon: Home },
    { href: "/news", labelTh: "ข่าวสาร", labelEn: "News", icon: Newspaper },
    { href: "/curriculum", labelTh: "หลักสูตร", labelEn: "Curriculum", icon: BookOpen },
    { href: "/staff", labelTh: "คณาจารย์", labelEn: "Staff", icon: Users },
    { href: "/rooms", labelTh: "จองห้อง", labelEn: "Rooms", icon: CalendarDays },
    { href: "/services", labelTh: "บริการนิสิต", labelEn: "Services", icon: FileCheck2 },
    { href: "/attendance/checkin", labelTh: "เช็คชื่อ", labelEn: "Attendance", icon: QrCode },
    { href: "/projects", labelTh: "ยุทธศาสตร์", labelEn: "Projects", icon: Target },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-xs transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2">
        {/* Left: Brand / Faculty Logo (Admin Style) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs ring-1 ring-primary/20 transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base leading-tight tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              {isThai ? "คณะพุทธศาสตร์" : "Faculty of Buddhism"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline-block">
              {isThai ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)" : "Mahachulalongkornrajavidyalaya University"}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Pills (Admin style) */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{isThai ? item.labelTh : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Medium Screen Menu (Laptop / Tablet) - compact text */}
        <nav className="hidden md:flex xl:hidden items-center gap-0.5">
          {navLinks.slice(0, 6).map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {isThai ? item.labelTh : item.labelEn}
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls (Theme Toggle, Language Switcher, Account Avatar / Sign In) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button (Admin Style) */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={isThai ? "เปลี่ยนธีม" : "Toggle Theme"}
              title={isThai ? "เปลี่ยนโหมดสี (สว่าง/มืด)" : "Toggle theme (Light/Dark)"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher className="h-9 w-9" />

          {/* User Avatar Menu or Sign In Button */}
          {sessionUser ? (
            <PortalUserMenu user={sessionUser} isThai={isThai} />
          ) : (
            <Button asChild size="sm" className="gap-1.5 h-9 shadow-xs">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span>{isThai ? "เข้าสู่ระบบ" : "Sign In"}</span>
              </Link>
            </Button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide-down with backdrop) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md p-4 shadow-xl md:hidden flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 py-1">
              {isThai ? "เมนูหลัก คณะพุทธศาสตร์" : "Faculty Navigation"}
            </p>
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{isThai ? item.labelTh : item.labelEn}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </header>
  );
}
