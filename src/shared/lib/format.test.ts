import { describe, it, expect } from "vitest";
import {
  formatDate,
  localizedName,
  academicYearLabel,
  toThaiNumerals,
  formatThaiDateFull,
} from "./format";

const d = new Date("2026-09-07T03:04:00Z");

describe("formatDate", () => {
  it("ไทยแสดง พ.ศ. อังกฤษแสดง ค.ศ.", () => {
    expect(formatDate(d, "th")).toContain("2569");
    expect(formatDate(d, "en")).toContain("2026");
  });
  it("null/undefined ให้ขีด", () => {
    expect(formatDate(null, "th")).toBe("—");
  });
  it("รับสตริง ISO ได้", () => {
    expect(formatDate(d.toISOString(), "en")).toContain("2026");
  });
  it("{ time: true } แสดงเวลาด้วย (03:04 UTC = 10:04 เวลาไทย)", () => {
    const dateOnly = formatDate(d, "en");
    const withTime = formatDate(d, "en", { time: true });
    expect(withTime).toContain("10");
    expect(withTime).toContain("04");
    expect(withTime.length).toBeGreaterThan(dateOnly.length);
  });
});

describe("toThaiNumerals", () => {
  it("แปลงเลขอารบิกเป็นเลขไทยอย่างถูกต้อง", () => {
    expect(toThaiNumerals(2569)).toBe("๒๕๖๙");
    expect(toThaiNumerals("26")).toBe("๒๖");
    expect(toThaiNumerals(0)).toBe("๐");
  });
});

describe("formatThaiDateFull", () => {
  it("แปลงวันที่เป็น วัน เดือน ปี ไทยพร้อมเลขไทย เช่น ๒๖ กันยายน ๒๕๖๙", () => {
    expect(formatThaiDateFull("2026-09-26", "th")).toBe("๒๖ กันยายน ๒๕๖๙");
    expect(formatThaiDateFull("2026-06-09", "th")).toBe("๙ มิถุนายน ๒๕๖๙");
    expect(formatThaiDateFull("2026-09-25", "th")).toBe("๒๕ กันยายน ๒๕๖๙");
  });

  it("แปลงเป็นภาษาอังกฤษเมื่อ locale = en เช่น 26 September 2026", () => {
    expect(formatThaiDateFull("2026-09-26", "en")).toBe("26 September 2026");
    expect(formatThaiDateFull("2026-06-09", "en")).toBe("9 June 2026");
  });

  it("แปลงข้อความที่มีชื่อเดือนไทยและเลขอารบิกเป็นเลขไทย", () => {
    expect(formatThaiDateFull("26 กันยายน 2569", "th")).toBe("๒๖ กันยายน ๒๕๖๙");
  });

  it("คืนค่าว่างเมื่อเป็น null หรือ undefined", () => {
    expect(formatThaiDateFull(null, "th")).toBe("");
    expect(formatThaiDateFull(undefined, "th")).toBe("");
  });
});

describe("localizedName", () => {
  const e = { nameTh: "คณะวิศวกรรมศาสตร์", nameEn: "Faculty of Engineering" };
  it("เลือกตามภาษา", () => {
    expect(localizedName(e, "th")).toBe(e.nameTh);
    expect(localizedName(e, "en")).toBe(e.nameEn);
  });
  it("ไม่มีอังกฤษถอยไปไทย", () => {
    expect(localizedName({ nameTh: "ก", nameEn: null }, "en")).toBe("ก");
    expect(localizedName({ nameTh: "ก", nameEn: "" }, "en")).toBe("ก");
    expect(localizedName({ nameTh: "ก", nameEn: undefined }, "en")).toBe("ก");
  });
});

describe("academicYearLabel", () => {
  it("ไทย = ปีการศึกษา พ.ศ. · อังกฤษ = AY ค.ศ.", () => {
    expect(academicYearLabel(2569, "th")).toBe("ปีการศึกษา 2569");
    expect(academicYearLabel(2569, "en")).toBe("AY 2026");
  });
});
