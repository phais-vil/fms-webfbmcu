import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsCreate: "news:create",
  newsEdit: "news:edit",
  newsPublish: "news:publish",
  newsDelete: "news:delete",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "ดูรายการและรายละเอียดข่าวสารในระบบหลังบ้าน" },
  { code: NEWS_P.newsCreate, module: "news", action: "create", description: "สร้างข่าวสารใหม่และบันทึกแบบร่าง" },
  { code: NEWS_P.newsEdit, module: "news", action: "edit", description: "แก้ไขข่าวสาร" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "อนุมัติเผยแพร่/ยกเลิกการเผยแพร่ และปักหมุดข่าว" },
  { code: NEWS_P.newsDelete, module: "news", action: "delete", description: "ลบข่าวสารและหมวดหมู่" },
];
