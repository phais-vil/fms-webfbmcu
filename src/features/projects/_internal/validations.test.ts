import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  reportProgressSchema,
} from "./validations";

describe("project validations", () => {
  it("validate createProjectSchema passes with valid annual project", () => {
    const valid = {
      title: "โครงการผลิตตำราพระพุทธศาสนาสู่สากล",
      fiscalYear: 2569,
      pillar: "DHAMMA_STUDY" as const,
      quarter: "Q1" as const,
      department: "ภาควิชาพระพุทธศาสนา",
      responsiblePerson: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
      responsibleEmail: "surasak@mcu.ac.th",
      allocatedBudget: 250000,
      targetKpi: "ตำราวิชาการตีพิมพ์ 3 เล่ม",
    };
    const parsed = createProjectSchema.parse(valid);
    expect(parsed.title).toBe("โครงการผลิตตำราพระพุทธศาสนาสู่สากล");
    expect(parsed.pillar).toBe("DHAMMA_STUDY");
    expect(parsed.allocatedBudget).toBe(250000);
  });

  it("validate createProjectSchema fails when budget is negative", () => {
    expect(() =>
      createProjectSchema.parse({
        title: "โครงการตัวอย่าง",
        pillar: "RESEARCH_INNOVATION",
        responsiblePerson: "อาจารย์",
        allocatedBudget: -500,
        targetKpi: "ผลงาน",
      })
    ).toThrow();
  });

  it("validate reportProgressSchema validates percentage within 0-100", () => {
    const valid = {
      projectId: "123e4567-e89b-12d3-a456-426614174000",
      progressPercent: 75,
      spentAmount: 50000,
      reportNote: "จัดพิมพ์ต้นฉบับเสร็จสมบูรณ์",
      reporterName: "นายเจ้าหน้าที่",
    };
    const parsed = reportProgressSchema.parse(valid);
    expect(parsed.progressPercent).toBe(75);
    expect(parsed.spentAmount).toBe(50000);

    expect(() =>
      reportProgressSchema.parse({
        ...valid,
        progressPercent: 120, // Invalid > 100
      })
    ).toThrow();
  });
});
