import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "attendance.nav": { th: "ระบบเช็คชื่อเข้าชั้นเรียน & QR", en: "Class Attendance & Dynamic QR" },
  "attendance.title": { th: "ระบบตรวจลงทะเบียนเข้าชั้นเรียนและกิจกรรม", en: "Class & Activity Attendance System" },
  "attendance.subtitle": {
    th: "เช็คชื่อเข้าห้องเรียนด้วย Dynamic QR Code ป้องกันการเช็คชื่อแทนกัน และคำนวณเวลาเรียนขั้นต่ำ 80% ตามเกณฑ์สิทธิ์สอบ",
    en: "Class check-in via rotating Dynamic QR Code, anti-fraud verification, and 80% exam eligibility tracking",
  },
  "attendance.portalTitle": { th: "ระบบลงทะเบียนเข้าห้องเรียนออนไลน์", en: "Online Classroom Check-In" },
  "attendance.portalSubtitle": {
    th: "สแกน QR Code หรือกรอกรหัสคาบเรียนที่ปรากฏบนจอหน้าห้อง เพื่อบันทึกเวลาเข้าเรียนของท่าน",
    en: "Scan the classroom QR Code or enter the session token shown on the screen to record your attendance",
  },
  "attendance.checkinSuccess": { th: "ลงทะเบียนเข้าชั้นเรียนเรียบร้อยแล้ว", en: "Attendance recorded successfully" },
  "attendance.qrExpired": { th: "รหัส QR Code นี้หมดอายุแล้ว กรุณาสแกนรหัสใหม่จากหน้าจออาจารย์", en: "This QR Code has expired. Please scan the newly generated QR Code from the projector screen." },
  "attendance.alreadyCheckedIn": { th: "ท่านได้ลงทะเบียนในคาบเรียนนี้ไปแล้ว", en: "You have already checked in for this session." },
  "attendance.openSession": { th: "เปิดห้องเรียน & ฉาย QR Code", en: "Open Session & Project QR" },
  "attendance.closeSession": { th: "ปิดการเช็คชื่อในคาบนี้", en: "Close Session Check-In" },
  "attendance.present": { th: "มาเรียนตรงเวลา", en: "Present" },
  "attendance.late": { th: "มาสาย", en: "Late" },
  "attendance.absent": { th: "ขาดเรียน", en: "Absent" },
  "attendance.excused": { th: "ลา (มีใบลา)", en: "Excused" },
  "attendance.eligible": { th: "มีสิทธิ์สอบ (เวลาเรียน >= 80%)", en: "Eligible for Exam (>= 80%)" },
  "attendance.ineligible": { th: "ระวัง: เวลาเรียนไม่ถึง 80%", en: "Warning: Attendance below 80%" },
  "roles.module.attendance": {
    th: "ระบบตรวจลงทะเบียนเข้าชั้นเรียน (Attendance)",
    en: "Attendance & Dynamic QR Module",
  },
  "perm.attendance:read": {
    th: "ดูข้อมูลรายวิชา คาบเรียน และสถิติการเข้าชั้นเรียน",
    en: "View courses, sessions, and attendance statistics",
  },
  "perm.attendance:manage": {
    th: "เปิด/ปิด คาบเรียน ฉาย Dynamic QR Code และปรับปรุงสถานะการเข้าเรียน",
    en: "Open/close sessions, project dynamic QR code, and update records",
  },
  "perm.attendance:checkin": {
    th: "บันทึกการเช็คชื่อเข้าชั้นเรียนหรือกิจกรรม",
    en: "Record class or activity check-in",
  },
};
