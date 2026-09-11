import { describe, it, expect } from "vitest";
import { createBannerSchema } from "./validations";

describe("portal-cms validations", () => {
  it("validate createBannerSchema passes with valid banner data", () => {
    const valid = {
      titleTh: "ยินดีต้อนรับสู่คณะพุทธศาสตร์ มจร",
      titleEn: "Welcome to Faculty of Buddhism, MCU",
      subtitleTh: "ศูนย์กลางการศึกษาพระพุทธศาสนาระดับสากล",
      subtitleEn: "A Leading Center for International Buddhist Studies",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363",
      linkUrl: "/curriculum",
      buttonTextTh: "ดูหลักสูตรทั้งหมด",
      buttonTextEn: "Explore Programs",
      displayOrder: 1,
      isActive: true,
    };
    const parsed = createBannerSchema.parse(valid);
    expect(parsed.titleTh).toBe("ยินดีต้อนรับสู่คณะพุทธศาสตร์ มจร");
    expect(parsed.displayOrder).toBe(1);
    expect(parsed.isActive).toBe(true);
  });

  it("validate createBannerSchema rejects invalid image URL", () => {
    expect(() =>
      createBannerSchema.parse({
        titleTh: "หัวข้อ",
        titleEn: "Title",
        imageUrl: "not-a-valid-url",
      })
    ).toThrow();
  });
});
