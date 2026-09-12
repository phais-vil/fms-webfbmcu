import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

describe("updateSettingsSchema", () => {
  const validBase = {
    nameTh: "มหาวิทยาลัย",
    nameEn: "University",
    palette: "blue" as const,
  };

  it("ยอมรับ URL ว่าง", () => {
    const res = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.logoUrl).toBe("");
  });

  it("ยอมรับ URL สัมบูรณ์ (http / https)", () => {
    const resHttps = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "https://example.com/logo.png" });
    expect(resHttps.success).toBe(true);

    const resHttp = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "http://example.com/logo.png" });
    expect(resHttp.success).toBe(true);
  });

  it("ยอมรับ Relative Path จากการอัปโหลด (/uploads/...)", () => {
    const res = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "/uploads/logos/logo-tenant1-12345.png" });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.logoUrl).toBe("/uploads/logos/logo-tenant1-12345.png");
  });

  it("ยอมรับ data URI สำหรับรูปภาพ", () => {
    const res = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==" });
    expect(res.success).toBe(true);
  });

  it("ปฏิเสธ scheme ที่ไม่ปลอดภัย หรือข้อความที่ไม่ใช่ path / URL", () => {
    const resXss = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "javascript:alert(1)" });
    expect(resXss.success).toBe(false);

    const resFtp = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "ftp://example.com/file" });
    expect(resFtp.success).toBe(false);

    const resRandom = updateSettingsSchema.safeParse({ ...validBase, logoUrl: "not-a-path-or-url" });
    expect(resRandom.success).toBe(false);
  });

  it("ปฏิเสธสตริงที่ยาวเกิน 500 ตัวอักษร", () => {
    const longPath = "/" + "a".repeat(505);
    const res = updateSettingsSchema.safeParse({ ...validBase, logoUrl: longPath });
    expect(res.success).toBe(false);
  });

  it("ยอมรับการตั้งค่า SMTP Gmail และ Custom", () => {
    const resGmail = updateSettingsSchema.safeParse({
      ...validBase,
      smtp: {
        enabled: true,
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: "test@gmail.com",
        pass: "abcd efgh ijkl mnop",
        fromName: "FMS Org",
      },
    });
    expect(resGmail.success).toBe(true);
    if (resGmail.success) {
      expect(resGmail.data.smtp?.service).toBe("gmail");
      expect(resGmail.data.smtp?.port).toBe(465);
    }

    const resCustom = updateSettingsSchema.safeParse({
      ...validBase,
      smtp: {
        enabled: false,
        service: "custom",
        host: "mail.myorg.ac.th",
        port: 587,
        secure: false,
        user: "admin@myorg.ac.th",
      },
    });
    expect(resCustom.success).toBe(true);
  });

  it("ยอมรับการตั้งค่า Gemini AI", () => {
    const resGemini = updateSettingsSchema.safeParse({
      ...validBase,
      gemini: {
        enabled: true,
        apiKey: "AIzaSyDummyApiKeyForTesting123",
        model: "gemini-2.5-flash",
      },
    });
    expect(resGemini.success).toBe(true);
    if (resGemini.success) {
      expect(resGemini.data.gemini?.enabled).toBe(true);
      expect(resGemini.data.gemini?.model).toBe("gemini-2.5-flash");
    }
  });

  it("ยอมรับการตั้งค่าข้อมูลการติดต่อองค์กร (Contact Info)", () => {
    const resContact = updateSettingsSchema.safeParse({
      ...validBase,
      contact: {
        phone: "035-248-000",
        email: "contact@mcu.ac.th",
        addressTh: "79 หมู่ 1 วังน้อย อยุธยา",
        addressEn: "79 Moo 1 Wang Noi Ayutthaya",
        workingHoursTh: "จันทร์ - ศุกร์ 08:30 - 16:30 น.",
        workingHoursEn: "Mon - Fri 08:30 - 16:30",
        website: "https://www.mcu.ac.th",
        facebook: "https://facebook.com/mcuthailand",
        lineId: "@mcuofficial",
        mapUrl: "https://maps.google.com/?cid=12345",
      },
    });
    expect(resContact.success).toBe(true);
    if (resContact.success) {
      expect(resContact.data.contact?.phone).toBe("035-248-000");
      expect(resContact.data.contact?.email).toBe("contact@mcu.ac.th");
      expect(resContact.data.contact?.facebook).toBe("https://facebook.com/mcuthailand");
      expect(resContact.data.contact?.lineId).toBe("@mcuofficial");
    }
  });

  it("ยอมรับฟิลด์ contact ว่างหรือระบุบางส่วน", () => {
    const resEmpty = updateSettingsSchema.safeParse({
      ...validBase,
      contact: {},
    });
    expect(resEmpty.success).toBe(true);

    const resPartial = updateSettingsSchema.safeParse({
      ...validBase,
      contact: {
        phone: "02-123-4567",
        email: "",
      },
    });
    expect(resPartial.success).toBe(true);
    if (resPartial.success) {
      expect(resPartial.data.contact?.phone).toBe("02-123-4567");
    }
  });
});

