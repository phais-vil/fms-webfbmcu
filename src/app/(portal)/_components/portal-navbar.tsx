"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  X,
  Newspaper,
  BookOpen,
  Users,
  CalendarDays,
  FileCheck2,
  QrCode,
  Target,
  Home,
  ChevronDown,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useAppSession } from "@/hooks/use-session";
import { PortalUserMenu } from "./portal-user-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface PortalNavbarProps {
  sessionUser: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isThai: boolean;
  tenantNameTh?: string | null;
  tenantNameEn?: string | null;
  logoUrl?: string | null;
}

export function PortalNavbar({
  sessionUser,
  isThai,
  tenantNameTh,
  tenantNameEn,
  logoUrl,
}: PortalNavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user: clientUser } = useAppSession();
  const activeUser = clientUser ?? sessionUser;
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

  // All 8 Core Portal Menus preserved
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

  const facultyTitle = isThai
    ? tenantNameTh || "คณะพุทธศาสตร์"
    : tenantNameEn || "Faculty of Buddhism";
  const universitySubtitle = isThai
    ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
    : "Mahachulalongkornrajavidyalaya University";

  return (
    <header className="adm-head sticky top-0 z-50 w-full">
      {/* Brand Block (Admin Shell Style: <i> icon + <b> title + <span> subtitle) */}
      <Link href="/" className="brand-blk w-auto shrink-0 mr-2 xl:mr-4">
        <i>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={facultyTitle}
              className="w-full h-full object-contain p-0.5 rounded-[var(--r-sm)]"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          )}
        </i>
        <div className="t">
          <b>{facultyTitle}</b>
          <span>{universitySubtitle}</span>
        </div>
      </Link>

      {/* Desktop Navigation (All 8 items visible side-by-side on xl) */}
      <nav className="hidden xl:flex items-center gap-1 min-w-0" aria-label="Portal Navigation">
        {navLinks.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.84rem] font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-[var(--brand-bg)] text-[var(--brand-ink)] font-semibold shadow-[var(--shadow-xs)]"
                  : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{isThai ? item.labelTh : item.labelEn}</span>
            </Link>
          );
        })}
      </nav>

      {/* Medium Screen Navigation (Top 5 items + More dropdown on md-lg) */}
      <nav className="hidden md:flex xl:hidden items-center gap-1 min-w-0" aria-label="Portal Navigation Compact">
        {navLinks.slice(0, 5).map((item) => {
          const active = isLinkActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.82rem] font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-[var(--brand-bg)] text-[var(--brand-ink)] font-semibold"
                  : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
              )}
            >
              {isThai ? item.labelTh : item.labelEn}
            </Link>
          );
        })}

        {/* More Dropdown for remaining items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--r-sm)] text-[0.82rem] font-medium transition-colors whitespace-nowrap cursor-pointer",
                navLinks.slice(5).some((i) => isLinkActive(i.href))
                  ? "bg-[var(--brand-bg)] text-[var(--brand-ink)] font-semibold"
                  : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
              )}
            >
              <span>{isThai ? "เพิ่มเติม" : "More"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-md">
            {navLinks.slice(5).map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md cursor-pointer",
                      active && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>{isThai ? item.labelTh : item.labelEn}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Spacer pushing right-hand utilities */}
      <span className="sp" />

      {/* Role / Portal Pill (Admin Shell Style) */}
      <span className="pill role hidden sm:inline-flex">
        {isThai ? "คณะพุทธศาสตร์" : "Portal"}
      </span>

      {/* Theme Toggle Button (Admin Shell Style) */}
      {mounted && (
        <button
          type="button"
          className="icon-btn"
          aria-label={isThai ? "เปลี่ยนธีม" : "Toggle theme"}
          title={isThai ? "เปลี่ยนโหมดสี (สว่าง/มืด)" : "Toggle theme (Light/Dark)"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
          </svg>
        </button>
      )}

      {/* Language Switcher (Admin Shell Style) */}
      <LanguageSwitcher className="lang" />

      {/* Staff Console / User Menu Avatar (Admin Account Style) */}
      <PortalUserMenu user={activeUser} isThai={isThai} />

      {/* Mobile Drawer Hamburger Trigger (Admin Style icon-btn) */}
      <button
        type="button"
        className="icon-btn md:hidden"
        aria-label={isThai ? "เปิดเมนู" : "Open menu"}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {/* Mobile Drawer Navigation (Slide-down with backdrop blur) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[var(--adm-head-h)] z-40 bg-black/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-[var(--adm-head-h)] left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md p-4 shadow-xl md:hidden flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-var(--adm-head-h))] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-muted-foreground uppercase border-b border-border/50 pb-2 mb-1">
              <span>{isThai ? "เมนูหลัก คณะพุทธศาสตร์" : "Faculty Navigation"}</span>
              <span className="pill role text-[10px]">Portal</span>
            </div>
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-sm)] text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--brand-bg)] text-[var(--brand-ink)] font-semibold shadow-[var(--shadow-xs)]"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
