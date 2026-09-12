import { describe, it, expect } from "vitest";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./validations";

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
});

