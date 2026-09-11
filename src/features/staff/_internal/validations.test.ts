import { describe, it, expect } from "vitest";
import { createStaffProfileSchema, updateStaffProfileSchema } from "./validations";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("staff validations", () => {
  it("passes validation with valid staff profile data", () => {
    const validData = {
      departmentId: VALID_UUID,
      prefixTh: "ศ.ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "สมจินต์",
      lastNameTh: "สมฺมาปญฺโญ",
      firstNameEn: "Somjin",
      lastNameEn: "Sammapanno",
      academicRankTh: "ศาสตราจารย์",
      academicRankEn: "Professor",
      adminPositionTh: "คณบดี",
      adminPositionEn: "Dean",
      email: "dean@mcu.ac.th",
      phone: "035-248-000",
      officeRoom: "401",
      avatarUrl: "https://example.com/avatar.jpg",
      isExecutive: true,
      isActive: true,
      displayOrder: 1,
    };

    const parsed = createStaffProfileSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("fails when bilingual names are missing or too short", () => {
    const invalidData = {
      departmentId: "invalid-uuid",
      prefixTh: "",
      prefixEn: "",
      firstNameTh: "ก",
      lastNameTh: "",
      firstNameEn: "A",
      lastNameEn: "",
    };

    const parsed = createStaffProfileSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.departmentId).toBeDefined();
      expect(fieldErrors.prefixTh).toBeDefined();
      expect(fieldErrors.firstNameTh).toBeDefined();
      expect(fieldErrors.lastNameTh).toBeDefined();
      expect(fieldErrors.firstNameEn).toBeDefined();
    }
  });

  it("validates update schema for staff profile", () => {
    const updateData = {
      id: VALID_UUID,
      phone: "081-234-5678",
      officeRoom: "ห้อง 405",
      isExecutive: false,
    };

    const parsed = updateStaffProfileSchema.safeParse(updateData);
    expect(parsed.success).toBe(true);
  });
});
