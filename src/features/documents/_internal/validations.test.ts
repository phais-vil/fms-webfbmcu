import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  reviewDocumentSchema,
} from "./validations";

describe("document validations", () => {
  it("validate createDocumentSchema passes with valid memo data", () => {
    const valid = {
      title: "โครงการสัมมนาพระไตรปิฎกศึกษา",
      docType: "PROJECT_PROPOSAL" as const,
      urgency: "URGENT" as const,
      submitterName: "รศ.ดร. สุรศักดิ์ ศรีพุทธศาสตร์",
      submitterRole: "หัวหน้าภาควิชาพระพุทธศาสนา",
      submitterEmail: "surasak@mcu.ac.th",
      department: "ภาควิชาพระพุทธศาสนา",
      content: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการระหว่างวันที่ 1-3 ตุลาคม 2569",
      budgetAmount: 150000,
    };
    const parsed = createDocumentSchema.parse(valid);
    expect(parsed.title).toBe("โครงการสัมมนาพระไตรปิฎกศึกษา");
    expect(parsed.docType).toBe("PROJECT_PROPOSAL");
    expect(parsed.urgency).toBe("URGENT");
    expect(parsed.budgetAmount).toBe(150000);
  });

  it("validate createDocumentSchema rejects invalid email format", () => {
    expect(() =>
      createDocumentSchema.parse({
        title: "บันทึกข้อความ",
        submitterName: "อาจารย์ทดสอบ",
        submitterEmail: "not-an-email",
        content: "รายละเอียดบันทึกข้อความ",
      })
    ).toThrow();
  });

  it("validate reviewDocumentSchema requires actor info and valid action", () => {
    const valid = {
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      action: "APPROVE" as const,
      actorName: "พระธรรมวัชรบัณฑิต, ศ.ดร.",
      actorRole: "คณบดีคณะพุทธศาสตร์",
      comment: "อนุมัติตามเสนอ ดำเนินการตามระเบียบ",
    };
    const parsed = reviewDocumentSchema.parse(valid);
    expect(parsed.action).toBe("APPROVE");
    expect(parsed.actorName).toBe("พระธรรมวัชรบัณฑิต, ศ.ดร.");
  });
});
