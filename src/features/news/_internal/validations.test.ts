import { describe, it, expect } from "vitest";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("news validations", () => {
  it("passes validation with valid article data", () => {
    const validData = {
      categoryId: VALID_UUID,
      titleTh: "ข่าวสัมมนาวิชาการพุทธศาสตร์ 2569",
      titleEn: "Buddhist Studies Academic Conference 2026",
      summaryTh: "สรุปรายละเอียดการจัดงานสัมมนา",
      summaryEn: "Summary of conference details",
      contentTh: "รายละเอียดเนื้อหาข่าวสัมมนาวิชาการแบบครบถ้วน",
      contentEn: "Full detailed content of the academic conference",
      coverImage: "https://example.com/cover.jpg",
      isPinned: true,
      status: "PUBLISHED" as const,
    };

    const parsed = createNewsArticleSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("fails when required fields are too short or invalid", () => {
    const invalidData = {
      categoryId: "invalid-uuid",
      titleTh: "ข", // Too short (< 3)
      titleEn: "A",
      contentTh: "สั้น",
      contentEn: "Hi",
    };

    const parsed = createNewsArticleSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.categoryId).toBeDefined();
      expect(fieldErrors.titleTh).toBeDefined();
      expect(fieldErrors.contentTh).toBeDefined();
    }
  });

  it("validates update schema with partial updates", () => {
    const updateData = {
      id: VALID_UUID,
      titleTh: "หัวข้อข่าวที่ได้รับการแก้ไขแล้ว",
      isPinned: false,
    };

    const parsed = updateNewsArticleSchema.safeParse(updateData);
    expect(parsed.success).toBe(true);
  });
});
