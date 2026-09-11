import { describe, it, expect } from "vitest";
import { registerSchema } from "./auth";

describe("registerSchema validation", () => {
  it("validates student registration payload successfully", () => {
    const validStudent = {
      userType: "STUDENT",
      name: "นายสมชาย ใจดี",
      email: "somchai@mcu.ac.th",
      password: "Password123!",
      confirmPassword: "Password123!",
      phone: "0812345678",
      studentCode: "6401201001",
      degreeLevel: "BACHELOR",
      department: "สาขาวิชาพระพุทธศาสนา",
      services: ["rooms", "certificates"],
    };
    const res = registerSchema.safeParse(validStudent);
    expect(res.success).toBe(true);
  });

  it("validates faculty registration payload successfully", () => {
    const validFaculty = {
      userType: "INSTRUCTOR",
      name: "ผศ.ดร.วิชัย รักเรียน",
      email: "wichai@mcu.ac.th",
      password: "Password123!",
      confirmPassword: "Password123!",
      phone: "0898765432",
      academicTitle: "ผู้ช่วยศาสตราจารย์ ดร.",
      department: "ภาควิชาพระพุทธศาสนา",
      services: ["rooms", "documents"],
    };
    const res = registerSchema.safeParse(validFaculty);
    expect(res.success).toBe(true);
  });

  it("fails when passwords do not match", () => {
    const mismatch = {
      userType: "STUDENT",
      name: "นิสิต ทดสอบ",
      email: "test@mcu.ac.th",
      password: "Password123!",
      confirmPassword: "DifferentPassword!",
      studentCode: "6401201002",
    };
    const res = registerSchema.safeParse(mismatch);
    expect(res.success).toBe(false);
    expect(res.error?.issues.some((i) => i.message === "passwords_mismatch")).toBe(true);
  });

  it("fails when password is too short", () => {
    const tooShort = {
      userType: "STUDENT",
      name: "นิสิต สั้น",
      email: "short@mcu.ac.th",
      password: "short",
      confirmPassword: "short",
    };
    const res = registerSchema.safeParse(tooShort);
    expect(res.success).toBe(false);
  });

  it("fails when email is invalid", () => {
    const badEmail = {
      userType: "STUDENT",
      name: "นิสิต อีเมลผิด",
      email: "not-an-email",
      password: "Password123!",
      confirmPassword: "Password123!",
    };
    const res = registerSchema.safeParse(badEmail);
    expect(res.success).toBe(false);
  });
});
