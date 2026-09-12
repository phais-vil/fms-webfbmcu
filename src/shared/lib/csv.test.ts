import { describe, it, expect } from "vitest";
import { generateCsv, parseCsv, tokenizeCsv, UTF8_BOM } from "./csv";

describe("csv utilities", () => {
  it("generates CSV with UTF-8 BOM and escapes special characters", () => {
    const headers = [
      { key: "name", label: "ชื่อ" },
      { key: "email", label: "อีเมล" },
      { key: "note", label: "หมายเหตุ" },
    ];
    const data = [
      { name: "สมชาย ใจดี", email: "somchai@example.com", note: "ไม่มี" },
      { name: "วิชัย, ชาญฉลาด", email: "wichai@example.com", note: 'มี "เครื่องหมายคำพูด"' },
      { name: "สายฝน", email: "saifon@example.com", note: "บรรทัดที่ 1\nบรรทัดที่ 2" },
    ];

    const csv = generateCsv(headers, data);
    expect(csv.startsWith(UTF8_BOM)).toBe(true);
    expect(csv).toContain('"วิชัย, ชาญฉลาด"');
    expect(csv).toContain('"มี ""เครื่องหมายคำพูด"""');
    expect(csv).toContain('"บรรทัดที่ 1\nบรรทัดที่ 2"');
  });

  it("parses CSV correctly handling BOM, commas, quotes and newlines", () => {
    const csvContent = `${UTF8_BOM}name,email,role\r\n"สมชาย ใจดี",somchai@example.com,STUDENT\r\n"ดร.วิชัย, มจร",wichai@example.com,"INSTRUCTOR,STAFF"`;

    const { headers, rows } = parseCsv(csvContent);
    expect(headers).toEqual(["name", "email", "role"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      name: "สมชาย ใจดี",
      email: "somchai@example.com",
      role: "STUDENT",
    });
    expect(rows[1]).toEqual({
      name: "ดร.วิชัย, มจร",
      email: "wichai@example.com",
      role: "INSTRUCTOR,STAFF",
    });
  });

  it("handles empty rows and whitespace gracefully", () => {
    const csvContent = `name,email\r\nสมชาย,somchai@example.com\r\n\r\n`;
    const tokenized = tokenizeCsv(csvContent);
    expect(tokenized).toHaveLength(2);
  });
});
