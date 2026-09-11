"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Lock,
  LogOut,
  ChevronDown,
  LogIn,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PortalUserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isThai: boolean;
}

export function PortalUserMenu({ user, isThai }: PortalUserMenuProps) {
  // If user is logged in
  if (user) {
    const initials = (user.name ?? user.email ?? "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-muted/80 transition-all border border-border/80 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs group cursor-pointer"
            aria-label="User Account Menu"
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="h-8 w-8 rounded-full object-cover border border-border ring-1 ring-primary/20"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20">
                {initials}
              </div>
            )}
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-foreground max-w-[130px] truncate leading-tight">
                {user.name || user.email}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Staff Console
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 mt-1 p-1.5 shadow-lg">
          <DropdownMenuLabel className="font-normal px-2 py-1.5">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  {isThai ? "บัญชีบุคลากร" : "Staff Account"}
                </p>
              </div>
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {user.name || (isThai ? "ผู้ใช้งาน" : "User")}
              </p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer flex items-center gap-2.5 py-2 font-medium">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>{isThai ? "ระบบหลังบ้าน (Staff Console)" : "Staff Console"}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/me" className="cursor-pointer flex items-center gap-2.5 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{isThai ? "ข้อมูลส่วนตัว (My Profile)" : "My Profile"}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/change-password" className="cursor-pointer flex items-center gap-2.5 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>{isThai ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2.5 py-2 font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>{isThai ? "ออกจากระบบ (Sign Out)" : "Sign Out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If user is NOT logged in: Show Avatar Menu for [Staff Console] with Sign In options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-muted/50 hover:bg-muted transition-all border border-border/80 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs group cursor-pointer"
          aria-label="Staff Console Menu"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <User className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            {isThai ? "Staff Console" : "Staff Console"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 mt-1 p-1.5 shadow-lg">
        <DropdownMenuLabel className="font-normal px-2 py-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Staff Console
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isThai
                ? "สำหรับผู้บริหาร คณาจารย์ และเจ้าหน้าที่คณะพุทธศาสตร์"
                : "For Faculty Executives, Lecturers & Staff"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/login"
            className="cursor-pointer flex items-center gap-2.5 py-2 font-medium text-primary hover:text-primary"
          >
            <LogIn className="h-4 w-4" />
            <span>{isThai ? "เข้าสู่ระบบหลังบ้าน (Sign In)" : "Sign In to Console"}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="cursor-pointer flex items-center gap-2.5 py-2 text-muted-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{isThai ? "ไปที่ Dashboard" : "Open Dashboard"}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
