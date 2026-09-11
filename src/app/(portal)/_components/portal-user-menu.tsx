"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, User, Lock, LogOut, ChevronDown } from "lucide-react";
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
  };
  isThai: boolean;
}

export function PortalUserMenu({ user, isThai }: PortalUserMenuProps) {
  const initials = (user.name ?? user.email ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-full hover:bg-muted/80 transition-colors border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "User"}
              className="h-8 w-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs border border-primary/20">
              {initials}
            </div>
          )}
          <span className="text-xs font-medium text-foreground max-w-[120px] truncate hidden sm:inline-block">
            {user.name || user.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline-block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 mt-1">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
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
          <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {isThai ? "ระบบหลังบ้าน (Console)" : "Staff Console"}
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/me" className="cursor-pointer flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{isThai ? "ข้อมูลส่วนตัว" : "My Profile"}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/change-password" className="cursor-pointer flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span>{isThai ? "เปลี่ยนรหัสผ่าน" : "Change Password"}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>{isThai ? "ออกจากระบบ" : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
