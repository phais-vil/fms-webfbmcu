import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "studentServices.nav": { th: "บริการนิสิต & คำร้อง", en: "Student Services & Requests" },
  "studentServices.portalTitle": { th: "บริการนิสิตออนไลน์ คณะพุทธศาสตร์", en: "FMS Student Online Services" },
  "studentServices.portalSubtitle": {
    th: "ยื่นคำร้องขอใบรับรองออนไลน์ ติดตามสถานะคำร้อง และตรวจสอบความถูกต้องของเอกสารด้วย QR Code",
    en: "Submit online certificate requests, track request status, and verify document authenticity via QR Code",
  },
  "studentServices.verifyTitle": { th: "ตรวจสอบเอกสาร & วุฒิบัตร (QR Verification)", en: "Document & Certificate Verification" },
  "studentServices.verifySubtitle": {
    th: "ระบบตรวจสอบความถูกต้องของเอกสารที่ออกโดยคณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
    en: "Authenticity verification system for official documents issued by the Faculty of Buddhism, MCU",
  },
  "studentServices.searchPlaceholder": { th: "ระบุรหัสเอกสาร เช่น MCU-FMS-2026-XXXX", en: "Enter verification code e.g. MCU-FMS-2026-XXXX" },
  "studentServices.trackRequests": { th: "ติดตามสถานะคำร้องของฉัน", en: "Track My Requests" },
  "studentServices.studentCodePlaceholder": { th: "กรอกรหัสนิสิต เช่น 6601001001", en: "Enter student code e.g. 6601001001" },
  "studentServices.requestCertBtn": { th: "ยื่นคำร้องขอเอกสาร", en: "Request Certificate" },
  "studentServices.submitSuccess": { th: "ยื่นคำร้องสำเร็จ ระบบกำลังดำเนินการตรวจสอบ", en: "Request submitted successfully. Processing underway." },
  "studentServices.approvedSuccess": { th: "อนุมัติคำร้องและออกรหัสยืนยันเรียบร้อยแล้ว", en: "Request approved and verification code issued." },
  "studentServices.rejectedSuccess": { th: "ปฏิเสธคำร้องเรียบร้อยแล้ว", en: "Request has been rejected." },
  "studentServices.typeCreated": { th: "เพิ่มประเภทเอกสารเรียบร้อยแล้ว", en: "Certificate type created successfully." },
  "studentServices.verifiedValid": { th: "เอกสารนี้ถูกต้องและออกโดยคณะพุทธศาสตร์จริง", en: "This document is genuine and officially issued by Faculty of Buddhism." },
  "studentServices.notFound": { th: "ไม่พบข้อมูลเอกสารหรือรหัสตรวจสอบนี้ในระบบ", en: "Document or verification code not found in the system." },
  "studentServices.pendingCount": { th: "คำร้องรอพิจารณา", en: "Pending Requests" },
  "studentServices.approvedCount": { th: "อนุมัติแล้ว", en: "Approved Requests" },
  "studentServices.totalTypes": { th: "ประเภทเอกสารทั้งหมด", en: "Total Certificate Types" },
  "roles.module.student-services": {
    th: "ระบบบริการคำร้องนิสิต & QR Verification",
    en: "Student Services & QR Verification Module",
  },
  "perm.student:read": {
    th: "ดูรายการคำร้องนิสิตและเอกสาร",
    en: "View student requests and documents",
  },
  "perm.student:manage": {
    th: "อนุมัติ/ปฏิเสธคำร้อง และจัดการแบบเอกสารคำร้อง",
    en: "Approve/Reject requests and manage certificate types",
  },
};
