import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Module & Permissions
  "roles.module.cms": { th: "ระบบจัดการแบนเนอร์และเนื้อหาหน้าบ้าน", en: "Portal CMS & Banners" },
  "perm.cms:read": { th: "ดูรายการแบนเนอร์หน้าแรก", en: "View Portal Banners" },
  "perm.cms:manage": { th: "จัดการแบนเนอร์และไฮไลต์", en: "Manage Banners & Highlights" },

  // Navigation & General
  "cms.nav": { th: "แบนเนอร์ & ไฮไลต์", en: "Banners & Highlights" },
  "cms.title": { th: "ระบบจัดการแบนเนอร์และสื่อไฮไลต์หน้าแรก", en: "Portal Banners & Highlights Management" },
  "cms.subtitle": {
    th: "จัดการภาพ Hero Carousel กิจกรรมสำคัญ ประกาศด่วน และลิงก์ด่วนบนหน้าเว็บหลักของคณะ",
    en: "Manage Hero Carousel banners, highlighted events, emergency notices, and quick links",
  },

  // Form Fields
  "cms.newBanner": { th: "เพิ่มแบนเนอร์ใหม่", en: "Add New Banner" },
  "cms.editBanner": { th: "แก้ไขแบนเนอร์", en: "Edit Banner" },
  "cms.titleTh": { th: "หัวข้อแบนเนอร์ (ภาษาไทย)", en: "Banner Title (Thai)" },
  "cms.titleEn": { th: "หัวข้อแบนเนอร์ (English)", en: "Banner Title (English)" },
  "cms.subtitleTh": { th: "คำบรรยายสั้น (ภาษาไทย)", en: "Subtitle (Thai)" },
  "cms.subtitleEn": { th: "คำบรรยายสั้น (English)", en: "Subtitle (English)" },
  "cms.tagTh": { th: "ป้ายกำกับ/หมวดหมู่ (ไทย)", en: "Badge / Tag (Thai)" },
  "cms.tagEn": { th: "ป้ายกำกับ/หมวดหมู่ (English)", en: "Badge / Tag (English)" },
  "cms.imageUrl": { th: "ลิงก์รูปภาพ (Image URL)", en: "Image URL" },
  "cms.linkUrl": { th: "ลิงก์ปลายทางเมื่อคลิก (Link URL)", en: "Target Link URL" },
  "cms.buttonTextTh": { th: "ข้อความบนปุ่ม (ไทย)", en: "Button Text (Thai)" },
  "cms.buttonTextEn": { th: "ข้อความบนปุ่ม (English)", en: "Button Text (English)" },
  "cms.displayOrder": { th: "ลำดับการแสดงผล", en: "Display Order" },
  "cms.isActive": { th: "สถานะการแสดงผล", en: "Active Status" },
  "cms.empty": { th: "ไม่พบข้อมูลแบนเนอร์", en: "No banners found" },
} as const;

export const messages = MESSAGES;
