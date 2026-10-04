import type { Locale } from "./i18n/config";

export interface FormatDateOptions { time?: boolean }

/** DB เก็บ ค.ศ. เสมอ — การแสดง พ.ศ. เกิดที่นี่ที่เดียว (Intl ใช้ปฏิทินพุทธเมื่อ locale th-TH-u-ca-buddhist) */
export function formatDate(value: Date | string | null | undefined, locale: Locale, opts: FormatDateOptions = {}): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const tag = locale === "th" ? "th-TH-u-ca-buddhist" : "en-GB";
  return new Intl.DateTimeFormat(tag, {
    year: "numeric", month: "short", day: "numeric",
    ...(opts.time ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Bangkok",
  }).format(date);
}

export interface Bilingual { nameTh: string; nameEn?: string | null }

export function localizedName(entity: Bilingual, locale: Locale): string {
  if (locale === "en" && entity.nameEn && entity.nameEn.trim() !== "") return entity.nameEn;
  return entity.nameTh;
}

/** ปีการศึกษาเก็บเป็นตัวเลข พ.ศ. (เป็นชื่อ ไม่ใช่วันที่) */
export function academicYearLabel(yearBE: number, locale: Locale): string {
  return locale === "th" ? `ปีการศึกษา ${yearBE}` : `AY ${yearBE - 543}`;
}

export const THAI_FULL_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

export const ENGLISH_FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** แปลงตัวเลขอารบิกเป็นเลขไทย เช่น 2569 -> ๒๕๖๙ */
export function toThaiNumerals(val: string | number): string {
  const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
  return String(val).replace(/[0-9]/g, (d) => thaiDigits[parseInt(d, 10)]);
}

/**
 * แปลงวันที่เป็น วัน เดือน ปี แบบไทยเต็มพร้อมเลขไทย เช่น ๒๖ กันยายน ๒๕๖๙
 * หรือภาษาอังกฤษ เช่น 26 September 2026
 */
export function formatThaiDateFull(
  value: Date | string | null | undefined,
  locale: Locale = "th"
): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    // รูปแบบ YYYY-MM-DD หรือ YYYY/MM/DD
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const mIdx = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);

      if (locale === "th") {
        const yearBE = y < 2400 ? y + 543 : y;
        const monthName = THAI_FULL_MONTHS[mIdx] || "";
        return `${toThaiNumerals(d)} ${monthName} ${toThaiNumerals(yearBE)}`;
      } else {
        const yearCE = y < 2400 ? y : y - 543;
        const monthName = ENGLISH_FULL_MONTHS[mIdx] || "";
        return `${d} ${monthName} ${yearCE}`;
      }
    }

    // กรณีเป็นข้อความระบุชื่อเดือนไทยอยู่แล้ว
    const hasThaiMonth = THAI_FULL_MONTHS.some((m) => trimmed.includes(m));
    if (hasThaiMonth) {
      if (locale === "th") {
        // หากมี ค.ศ. 20xx ให้แปลงเป็น พ.ศ. 25xx
        const converted = trimmed.replace(/\b20(\d{2})\b/g, (_, yy) =>
          String(2500 + parseInt(yy, 10) + 43)
        );
        return toThaiNumerals(converted);
      }
      return trimmed;
    }
  }

  // แปลงจาก Date object
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return typeof value === "string" ? value : "";

  // จัดการเวลาโซน Asia/Bangkok
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(d);
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
  const monthIdx = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10) - 1;
  const year = parseInt(parts.find((p) => p.type === "year")?.value || "2026", 10);

  if (locale === "th") {
    const yearBE = year < 2400 ? year + 543 : year;
    const monthName = THAI_FULL_MONTHS[monthIdx] || "";
    return `${toThaiNumerals(day)} ${monthName} ${toThaiNumerals(yearBE)}`;
  } else {
    const yearCE = year < 2400 ? year : year - 543;
    const monthName = ENGLISH_FULL_MONTHS[monthIdx] || "";
    return `${day} ${monthName} ${yearCE}`;
  }
}
