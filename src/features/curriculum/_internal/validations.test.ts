import { describe, it, expect } from "vitest";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from "./validations";
import {
  parseScheduleText,
  parseScheduleJson,
  getSampleScheduleJson,
} from "./schedule-import-parser";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("curriculum validations", () => {
  it("passes validation with valid curriculum data", () => {
    const validData = {
      departmentId: VALID_UUID,
      code: "B.A.-BUDDHISM",
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
      nameEn: "Bachelor of Arts in Buddhist Studies",
      degreeTh: "พุทธศาสตรบัณฑิต",
      degreeEn: "Bachelor of Arts",
      degreeAbbrTh: "พธ.บ.",
      degreeAbbrEn: "B.A.",
      degreeLevel: "BACHELOR" as const,
      totalCredits: 136,
      durationYears: 4,
      philosophyTh: "มุ่งพัฒนาผู้เรียนให้มีความรู้ความเข้าใจในพระไตรปิฎกอย่างลึกซึ้ง",
      effectiveYear: 2568,
      isActive: true,
      displayOrder: 1,
    };

    const parsed = createCurriculumSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("fails when code is too short or credits are 0", () => {
    const invalidData = {
      departmentId: "invalid-uuid",
      code: "B",
      nameTh: "",
      nameEn: "",
      degreeTh: "",
      degreeEn: "",
      degreeAbbrTh: "",
      degreeAbbrEn: "",
      totalCredits: 0,
      durationYears: 0,
    };

    const parsed = createCurriculumSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.departmentId).toBeDefined();
      expect(fieldErrors.code).toBeDefined();
      expect(fieldErrors.totalCredits).toBeDefined();
      expect(fieldErrors.durationYears).toBeDefined();
    }
  });

  it("validates update schema with partial fields", () => {
    const updateData = {
      id: VALID_UUID,
      totalCredits: 140,
      tuitionFees: "18,000 บาท",
    };

    const parsed = updateCurriculumSchema.safeParse(updateData);
    expect(parsed.success).toBe(true);
  });

  it("passes validation with valid department data", () => {
    const validDept = {
      code: "DEPT_BUDDHIST",
      nameTh: "ภาควิชาพระพุทธศาสนา",
      nameEn: "Department of Buddhist Studies",
      description: "จัดการเรียนการสอนและวิจัยทางพระพุทธศาสนา",
      displayOrder: 1,
      isActive: true,
    };

    const parsed = createDepartmentSchema.safeParse(validDept);
    expect(parsed.success).toBe(true);
  });

  it("fails when department code or name is missing", () => {
    const invalidDept = {
      code: "A",
      nameTh: "",
      nameEn: "",
    };

    const parsed = createDepartmentSchema.safeParse(invalidDept);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.code).toBeDefined();
      expect(fieldErrors.nameTh).toBeDefined();
      expect(fieldErrors.nameEn).toBeDefined();
    }
  });

  it("validates department update schema", () => {
    const updateDept = {
      id: VALID_UUID,
      nameTh: "ภาควิชาปรัชญาและศาสนา",
    };

    const parsed = updateDepartmentSchema.safeParse(updateDept);
    expect(parsed.success).toBe(true);
  });

  it("passes validation with valid class schedule and timetable items", () => {
    const validSchedule = {
      departmentId: VALID_UUID,
      curriculumId: VALID_UUID,
      academicYear: 2569,
      semester: 1,
      yearLevel: 1,
      titleTh: "ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙",
      titleEn: "Bachelor Timetable 2026",
      roomLocationTh: "อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑",
      targetGroupTh: "คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์)",
      items: [
        {
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "11:30",
          slotPeriod: "ช่วงเช้า",
          courseCode: "000 102",
          courseNameTh: "กฎหมายทั่วไป",
          instructorsTh: "พระมหามงคลกานต์ ฐิตธมฺโม, รศ.ดร.*",
          displayOrder: 1,
        },
      ],
    };

    const parsed = createScheduleSchema.safeParse(validSchedule);
    expect(parsed.success).toBe(true);
  });

  it("fails when schedule title or departmentId is invalid", () => {
    const invalidSchedule = {
      departmentId: "not-a-uuid",
      titleTh: "ab",
    };

    const parsed = createScheduleSchema.safeParse(invalidSchedule);
    expect(parsed.success).toBe(false);
  });

  it("validates schedule update schema", () => {
    const updateSchedule = {
      id: VALID_UUID,
      titleTh: "ตารางสอนฉบับแก้ไข",
      academicYear: 2570,
    };

    const parsed = updateScheduleSchema.safeParse(updateSchedule);
    expect(parsed.success).toBe(true);
  });

  it("parses schedule raw text with year, semester, and course codes", () => {
    const sampleText = `
      ตารางสอนปริญญาตรี ภาคการศึกษาที่ ๑ ปีการศึกษา ๒๕๖๙
      คณะพุทธศาสตร์ ชั้นปีที่ ๑ (พระภิกษุ สามเณร และคฤหัสถ์) สาขาวิชาพระพุทธศาสนา
      อาคารเรียนรวม ชั้น ๕ ห้อง D ๕๑๖/๑
      000 139 จิตวิทยาทั่วไป
      ผศ.ดร.บุญมี พวงเพชร*, ดร.ณรงค์ ปั้นงาม
      000 115 ภาษาอังกฤษเบื้องต้น
      ผศ.ดร.ระพิน พุทธิสรรค์*
    `;

    const result = parseScheduleText(sampleText);
    expect(result.schedule.academicYear).toBe(2569);
    expect(result.schedule.semester).toBe(1);
    expect(result.schedule.yearLevel).toBe(1);
    expect(result.items.length).toBe(2);
    expect(result.items[0].courseCode).toBe("000 139");
    expect(result.items[1].courseCode).toBe("000 115");
  });

  it("parses schedule JSON payload and generates sample template", () => {
    const jsonTemplate = getSampleScheduleJson();
    expect(jsonTemplate).toContain("000 102");
    expect(jsonTemplate).toContain("0SP 101");

    const parsed = parseScheduleJson(jsonTemplate);
    expect(parsed.schedule.academicYear).toBe(2569);
    expect(parsed.items.length).toBeGreaterThanOrEqual(1);
    expect(parsed.items[0].courseCode).toBe("000 102");
  });
});

