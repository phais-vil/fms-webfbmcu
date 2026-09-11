import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Module & Permissions
  "roles.module.project": { th: "ระบบแผนโครงการและงบประมาณ", en: "Annual Project & Budget Planning" },
  "perm.project:read": { th: "ดูแผนโครงการและงบประมาณ", en: "View Projects & Budget" },
  "perm.project:manage": { th: "จัดการและอนุมัติแผนโครงการ", en: "Manage & Approve Projects" },
  "perm.project:report": { th: "รายงานความก้าวหน้าและการเบิกจ่าย", en: "Report Progress & Spending" },

  // Navigation & General
  "projects.nav": { th: "แผนโครงการ & งบประมาณ", en: "Projects & Budget" },
  "projects.title": { th: "ระบบบริหารแผนโครงการและงบประมาณประจำปี", en: "Annual Project & Budget Planning System" },
  "projects.subtitle": {
    th: "ติดตามแผนงานโครงการ การจัดสรรงบประมาณรายไตรมาส อัตราการเบิกจ่าย และผลสัมฤทธิ์ตัวชี้วัด (KPIs)",
    en: "Track annual projects, quarterly budget allocation, burn rate, and strategic KPI achievements",
  },
  "projects.portalTitle": { th: "แผนยุทธศาสตร์และโครงการสำคัญ", en: "Strategic Plan & Key Projects" },
  "projects.portalSubtitle": {
    th: "ความโปร่งใสและผลสัมฤทธิ์การดำเนินงานตามแผนยุทธศาสตร์ 5 ด้าน คณะพุทธศาสตร์ มจร",
    en: "Transparency and strategic achievement across 5 core pillars of Faculty of Buddhism, MCU",
  },

  // Strategic Pillars
  "projects.pillar.DHAMMA_STUDY": { th: "การศึกษาพระพุทธศาสนาและวิชาการ", en: "Buddhist & Academic Studies" },
  "projects.pillar.RESEARCH_INNOVATION": { th: "การวิจัยและนวัตกรรมทางพุทธศาสตร์", en: "Buddhist Research & Innovation" },
  "projects.pillar.ACADEMIC_SERVICES": { th: "การบริการวิชาการแก่สังคมและพระพุทธศาสนา", en: "Academic & Social Services" },
  "projects.pillar.CULTURE_PRESERVATION": { th: "การทำนุบำรุงศิลปวัฒนธรรมและภูมิปัญญา", en: "Art & Cultural Preservation" },
  "projects.pillar.ORGANIZATION_EXCELLENCE": { th: "การบริหารจัดการองค์กรสู่ความเป็นเลิศ", en: "Organizational Excellence" },

  // Quarters
  "projects.quarter.Q1": { th: "ไตรมาส 1 (ต.ค. - ธ.ค.)", en: "Quarter 1 (Oct - Dec)" },
  "projects.quarter.Q2": { th: "ไตรมาส 2 (ม.ค. - มี.ค.)", en: "Quarter 2 (Jan - Mar)" },
  "projects.quarter.Q3": { th: "ไตรมาส 3 (เม.ย. - มิ.ย.)", en: "Quarter 3 (Apr - Jun)" },
  "projects.quarter.Q4": { th: "ไตรมาส 4 (ก.ค. - ก.ย.)", en: "Quarter 4 (Jul - Sep)" },

  // Statuses
  "projects.status.DRAFT": { th: "ร่างโครงการ", en: "Draft" },
  "projects.status.PROPOSED": { th: "เสนอแผนงาน", en: "Proposed" },
  "projects.status.APPROVED": { th: "อนุมัติในแผนงบประมาณ", en: "Approved" },
  "projects.status.IN_PROGRESS": { th: "กำลังดำเนินการ", en: "In Progress" },
  "projects.status.COMPLETED": { th: "ดำเนินการเสร็จสิ้น", en: "Completed" },
  "projects.status.DELAYED": { th: "ล่าช้ากว่าแผน", en: "Delayed" },

  // Fields & Buttons
  "projects.newProject": { th: "จัดทำโครงการใหม่", en: "New Project" },
  "projects.reportProgress": { th: "รายงานความก้าวหน้า", en: "Report Progress" },
  "projects.code": { th: "รหัสโครงการ", en: "Project Code" },
  "projects.projectName": { th: "ชื่อโครงการ", en: "Project Title" },
  "projects.pillar": { th: "ยุทธศาสตร์", en: "Strategic Pillar" },
  "projects.quarter": { th: "ไตรมาส", en: "Quarter" },
  "projects.allocatedBudget": { th: "งบประมาณจัดสรร (บาท)", en: "Allocated Budget (THB)" },
  "projects.spentBudget": { th: "เบิกจ่ายแล้ว (บาท)", en: "Spent Budget (THB)" },
  "projects.burnRate": { th: "อัตราการเบิกจ่าย", en: "Burn Rate" },
  "projects.progress": { th: "ความก้าวหน้า", en: "Progress" },
  "projects.targetKpi": { th: "เป้าหมายตัวชี้วัด (KPI)", en: "Target KPI" },
  "projects.actualResult": { th: "ผลสัมฤทธิ์ที่ได้", en: "Actual Result" },
  "projects.responsible": { th: "ผู้รับผิดชอบโครงการ", en: "Responsible Person" },
  "projects.empty": { th: "ไม่พบโครงการตามเงื่อนไข", en: "No projects found" },
} as const;

export const messages = MESSAGES;
