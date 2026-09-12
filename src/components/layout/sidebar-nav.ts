import { LayoutDashboard, Users, Settings, Layers, Newspaper, UserCheck, GraduationCap, CalendarCheck, FileCheck, QrCode, FileText, Target, Image as ImageIcon, type LucideIcon } from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { SAMPLE_P } from "@/features/sample";
import { NEWS_P } from "@/features/news";
import { STAFF_P } from "@/features/staff";
import { CURRICULUM_P } from "@/features/curriculum";
import { ROOMS_P } from "@/features/rooms";
import { STUDENT_SERVICES_P } from "@/features/student-services";
import { ATTENDANCE_P } from "@/features/attendance";
import { DOCUMENT_P } from "@/features/documents";
import { PROJECT_P } from "@/features/projects";
import { CMS_P } from "@/features/portal-cms";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  { label: "nav.group.overview", items: [{ title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "news.nav",
    items: [{ title: "news.nav", href: "/admin/news", icon: Newspaper, permission: NEWS_P.newsRead }],
  },
  {
    label: "staff.nav",
    items: [{ title: "staff.nav", href: "/admin/staff", icon: UserCheck, permission: STAFF_P.staffRead }],
  },
  {
    label: "curriculum.nav",
    items: [
      {
        title: "curriculum.nav",
        href: "/admin/curriculum",
        icon: GraduationCap,
        permission: CURRICULUM_P.curriculumRead,
        children: [
          {
            title: "curriculum.tab.curriculums",
            href: "/admin/curriculum",
            permission: CURRICULUM_P.curriculumRead,
          },
          {
            title: "curriculum.tab.departments",
            href: "/admin/departments",
            permission: CURRICULUM_P.curriculumRead,
          },
        ],
      },
    ],
  },
  {
    label: "rooms.nav",
    items: [{ title: "rooms.nav", href: "/admin/rooms", icon: CalendarCheck, permission: ROOMS_P.roomsRead }],
  },
  {
    label: "studentServices.nav",
    items: [{ title: "studentServices.nav", href: "/admin/student-services", icon: FileCheck, permission: STUDENT_SERVICES_P.studentRead }],
  },
  {
    label: "attendance.nav",
    items: [{ title: "attendance.nav", href: "/admin/attendance", icon: QrCode, permission: ATTENDANCE_P.attendanceRead }],
  },
  {
    label: "documents.nav",
    items: [{ title: "documents.nav", href: "/admin/documents", icon: FileText, permission: DOCUMENT_P.documentRead }],
  },
  {
    label: "projects.nav",
    items: [{ title: "projects.nav", href: "/admin/projects", icon: Target, permission: PROJECT_P.projectRead }],
  },
  {
    label: "cms.nav",
    items: [{ title: "cms.nav", href: "/admin/banners", icon: ImageIcon, permission: CMS_P.cmsRead }],
  },
  {
    label: "nav.group.sample",
    items: [{ title: "sample.nav", href: "/sample", icon: Layers, permission: SAMPLE_P.sampleRead }],
  },
  {
    label: "nav.group.users",
    items: [{
      title: "nav.users", href: "/users", icon: Users, permission: P.usersRead,
      children: [
        { title: "nav.users", href: "/users", permission: P.usersRead },
        { title: "nav.roles", href: "/users/roles", permission: P.rolesManage },
      ],
    }],
  },
  { label: "nav.group.settings", items: [{ title: "nav.settings", href: "/settings", icon: Settings, permission: P.settingsManage }] },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
