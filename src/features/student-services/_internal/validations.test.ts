import { describe, it, expect } from "vitest";
import {
  createCertificateTypeSchema,
  submitStudentRequestSchema,
  reviewStudentRequestSchema,
} from "./validations";

describe("student services validations", () => {
  it("validate createCertificateTypeSchema passes with correct payload", () => {
    const valid = {
      code: "CERT-01",
      nameTh: "หนังสือรับรองการเป็นนิสิต",
      nameEn: "Certificate of Student Status",
      category: "ENROLLMENT" as const,
      processingDays: 3,
      fee: 0,
      requiresDoc: false,
      isActive: true,
      displayOrder: 1,
    };
    const parsed = createCertificateTypeSchema.parse(valid);
    expect(parsed.code).toBe("CERT-01");
    expect(parsed.nameTh).toBe("หนังสือรับรองการเป็นนิสิต");
  });

  it("validate submitStudentRequestSchema fails when required fields are missing", () => {
    expect(() =>
      submitStudentRequestSchema.parse({
        studentCode: "",
      })
    ).toThrow();
  });

  it("validate submitStudentRequestSchema passes with full student data", () => {
    const valid = {
      certificateTypeId: "123e4567-e89b-12d3-a456-426614174000",
      studentCode: "6601201001",
      titleTh: "พระ",
      firstNameTh: "สมชาย",
      lastNameTh: "ญาณสํวโร",
      degreeLevel: "BACHELOR" as const,
      majorProgram: "พุทธศาสตร์",
      yearLevel: 2,
      email: "somchai@mcu.ac.th",
      phone: "0812345678",
      purpose: "ขอเปิดบัญชีธนาคารกรุงไทยเพื่อรับเงินอุดหนุนการศึกษา",
      copies: 1,
    };
    const parsed = submitStudentRequestSchema.parse(valid);
    expect(parsed.studentCode).toBe("6601201001");
    expect(parsed.copies).toBe(1);
  });

  it("validate reviewStudentRequestSchema handles APPROVED status", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "APPROVED" as const,
      approverNotes: "อนุมัติคำร้องเรียบร้อย",
    };
    const parsed = reviewStudentRequestSchema.parse(valid);
    expect(parsed.status).toBe("APPROVED");
  });
});
