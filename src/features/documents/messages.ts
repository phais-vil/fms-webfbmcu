import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Module & Permissions
  "roles.module.document": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "Document & E-Approval Workflow" },
  "perm.document:read": { th: "ดูรายการและติดตามเอกสาร", en: "View & Track Documents" },
  "perm.document:create": { th: "เสนอเอกสาร/ร่างบันทึกข้อความ", en: "Submit Document / Proposal" },
  "perm.document:approve": { th: "ตรวจสอบและลงนามอนุมัติเอกสาร", en: "Review & Approve Documents" },

  // Navigation & General
  "documents.nav": { th: "สารบรรณ & อนุมัติเอกสาร", en: "Document Workflow" },
  "documents.title": { th: "ระบบบริหารจัดการและอนุมัติเอกสาร", en: "Document E-Approval System" },
  "documents.subtitle": {
    th: "สารบรรณอิเล็กทรอนิกส์ เสนอเรื่อง บันทึกข้อความ ขออนุมัติโครงการ และงบประมาณ",
    en: "Electronic document system, memo, project proposals, and budget approval workflow",
  },
  "documents.trackTitle": { th: "ติดตามสถานะการเดินเรื่องเอกสาร", en: "Track Document Status" },
  "documents.trackSubtitle": {
    th: "กรอกเลขที่หนังสือราชการเพื่อติดตามลำดับขั้นตอนและการพิจารณา",
    en: "Enter official document number to track workflow progress and review history",
  },

  // Document Types
  "documents.type.MEMO": { th: "บันทึกข้อความ", en: "Official Memo" },
  "documents.type.PROJECT_PROPOSAL": { th: "ขออนุมัติโครงการ", en: "Project Proposal" },
  "documents.type.BUDGET_REQUEST": { th: "ขอเบิกจ่าย/งบประมาณ", en: "Budget Request" },
  "documents.type.GENERAL_REQUEST": { th: "หนังสือราชการทั่วไป", en: "General Official Letter" },

  // Urgency
  "documents.urgency.NORMAL": { th: "ปกติ", en: "Normal" },
  "documents.urgency.URGENT": { th: "ด่วน", en: "Urgent" },
  "documents.urgency.VERY_URGENT": { th: "ด่วนมาก", en: "Very Urgent" },
  "documents.urgency.EXPEDITE": { th: "ด่วนที่สุด", en: "Expedite" },

  // Statuses
  "documents.status.DRAFT": { th: "ร่างเอกสาร", en: "Draft" },
  "documents.status.SUBMITTED": { th: "เสนอเรื่องแล้ว (รอตรวจสอบ)", en: "Submitted (Pending Review)" },
  "documents.status.UNDER_REVIEW": { th: "กำลังตรวจสอบ", en: "Under Review" },
  "documents.status.APPROVED": { th: "อนุมัติ / ลงนามแล้ว", en: "Approved / Signed" },
  "documents.status.REJECTED": { th: "ส่งกลับแก้ไข / ไม่อนุมัติ", en: "Rejected / Returned" },
  "documents.status.COMPLETED": { th: "เสร็จสิ้นสมบูรณ์", en: "Completed" },

  // Form & Action Labels
  "documents.newDoc": { th: "เสนอเอกสารใหม่", en: "New Document" },
  "documents.docNumber": { th: "เลขที่หนังสือ", en: "Document No." },
  "documents.subject": { th: "เรื่อง / หัวข้อ", en: "Subject / Title" },
  "documents.docType": { th: "ประเภทเอกสาร", en: "Document Type" },
  "documents.urgency": { th: "ความเร่งด่วน", en: "Urgency" },
  "documents.status": { th: "สถานะ", en: "Status" },
  "documents.submitter": { th: "ผู้เสนอเรื่อง", en: "Submitter" },
  "documents.department": { th: "ส่วนงาน / ภาควิชา", en: "Department / Unit" },
  "documents.budget": { th: "วงเงินงบประมาณ (บาท)", en: "Budget Amount (THB)" },
  "documents.content": { th: "สาระสำคัญ / รายละเอียด", en: "Content / Summary" },
  "documents.attachment": { th: "เอกสารแนบ (URL)", en: "Attachment (URL)" },
  "documents.actions": { th: "การจัดการ", en: "Actions" },
  "documents.review": { th: "พิจารณา / อนุมัติ", en: "Review / Approve" },
  "documents.approve": { th: "อนุมัติ / ลงนาม", en: "Approve / Sign" },
  "documents.reject": { th: "ส่งกลับแก้ไข", en: "Return for Edit" },
  "documents.comment": { th: "ความเห็น / ข้อสั่งการ", en: "Comment / Order" },
  "documents.workflowHistory": { th: "ประวัติการเดินเรื่อง (Workflow Log)", en: "Workflow History" },
  "documents.searchPlaceholder": { th: "ค้นหาตามเลขที่หนังสือ, หัวข้อ หรือผู้เสนอ...", en: "Search by number, subject, or submitter..." },
  "documents.empty": { th: "ไม่พบเอกสารสารบรรณ", en: "No documents found" },
} as const;

export const messages = MESSAGES;
