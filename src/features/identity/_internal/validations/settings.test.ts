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
});
