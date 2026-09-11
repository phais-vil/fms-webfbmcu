import { describe, it, expect } from "vitest";
import {
  createCourseSchema,
  createSessionSchema,
  studentCheckInSchema,
  openSessionSchema,
} from "./validations";

describe("attendance validations", () => {
  it("validate createCourseSchema passes with complete course details", () => {
    const valid = {
      courseCode: "พธ101",
      courseNameTh: "พระไตรปิฎกศึกษา",
      courseNameEn: "Tipitaka Studies",
      section: "1",
      semester: "1/2569",
      instructorName: "พระครูปลัดสุวัฒนบัณฑิตคุณ, ดร.",
      roomNumber: "ห้อง 401",
      totalSessions: 16,
      isActive: true,
    };
    const parsed = createCourseSchema.parse(valid);
    expect(parsed.courseCode).toBe("พธ101");
    expect(parsed.section).toBe("1");
  });

  it("validate createSessionSchema fails with invalid time format", () => {
    expect(() =>
      createSessionSchema.parse({
        courseId: "123e4567-e89b-12d3-a456-426614174000",
        sessionNumber: 1,
        title: "บทนำพระไตรปิฎก",
        sessionType: "LECTURE",
        sessionDate: "2026-09-10",
        startTime: "9:0", // Invalid HH:mm
        endTime: "12:00",
      })
    ).toThrow();
  });

  it("validate studentCheckInSchema passes with valid QR token and student code", () => {
    const valid = {
      qrToken: "ATT-A8K9Z2",
      studentCode: "6601201001",
      studentName: "พระมหาชัชวาลย์ ญาณเมธี",
      majorProgram: "พุทธศาสตร์",
    };
    const parsed = studentCheckInSchema.parse(valid);
    expect(parsed.qrToken).toBe("ATT-A8K9Z2");
    expect(parsed.studentCode).toBe("6601201001");
  });

  it("validate openSessionSchema defaults expirySeconds to 60", () => {
    const valid = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const parsed = openSessionSchema.parse(valid);
    expect(parsed.expirySeconds).toBe(60);
  });
});
