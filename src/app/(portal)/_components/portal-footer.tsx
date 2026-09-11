import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  QrCode,
  Sparkles,
  Globe,
} from "lucide-react";

interface PortalFooterProps {
  isThai: boolean;
}

export function PortalFooter({ isThai }: PortalFooterProps) {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background via-muted/20 to-muted/50 text-foreground transition-colors">
      {/* 1. Value Proposition / Quality Assurance Strip */}
      <div className="border-b border-border/70 bg-primary/[0.03]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isThai ? "มาตรฐานการศึกษาสากล" : "Quality Accreditations"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isThai ? "เกณฑ์คุณภาพ AUN-QA & EdPEx" : "Aligned with AUN-QA & EdPEx"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isThai ? "เชี่ยวชาญพระไตรปิฎก" : "Tipitaka Studies"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isThai ? "สืบทอดหลักพุทธธรรมและวิปัสสนา" : "Canonical Pali & Vipassana mastery"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isThai ? "บริการดิจิทัลครบวงจร" : "Smart Digital Services"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isThai ? "คำร้องออนไลน์ & QR Verification" : "Online Services & Digital Attendance"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isThai ? "เครือข่ายพุทธศาสตร์สากล" : "Global Buddhist Network"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isThai ? "ร่วมมือกับองค์กรพุทธศาสนาทั่วโลก" : "Partnerships with IABU & WBU"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Columns */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Identity & Official Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
                  {isThai ? "คณะพุทธศาสตร์" : "Faculty of Buddhism"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isThai
                    ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)"
                    : "Mahachulalongkornrajavidyalaya University"}
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {isThai
                ? "มุ่งผลิตบัณฑิตให้มีความรู้เชี่ยวชาญในพระไตรปิฎก มีคุณธรรม จริยธรรม นำหลักพุทธธรรมบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาจิตใจและสังคมอย่างยั่งยืน"
                : "Dedicated to fostering scholars in Tipitaka studies, ethics, and mindfulness, integrating Buddhist wisdom to enrich contemporary global society."}
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {isThai
                    ? "79 หมู่ที่ 1 ถนนพหลโยธิน ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170"
                    : "79 Moo 1, Phahonyothin Rd., Lam Sai, Wang Noi, Phra Nakhon Si Ayutthaya 13170 Thailand"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>035-248-000 {isThai ? "ต่อ 8100, 8102 (สำนักงานคณบดี)" : "Ext. 8100, 8102"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:buddhism@mcu.ac.th" className="hover:text-primary transition-colors">
                  buddhism@mcu.ac.th
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {isThai
                    ? "วันจันทร์ - วันศุกร์ เวลา 08:30 - 16:30 น. (ยกเว้นวันหยุดราชการ)"
                    : "Monday - Friday 08:30 - 16:30 (Excluding Public Holidays)"}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: หลักสูตรการศึกษา (2-3 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{isThai ? "หลักสูตรการศึกษา" : "Academic"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/curriculum/B.A.-BUDDHISM"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ปริญญาตรี (พธ.บ.)" : "Bachelor (B.A.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum/M.A.-BUDDHISM"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ปริญญาโท (พธ.ม.)" : "Master (M.A.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum/PH.D.-BUDDHISM"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ปริญญาเอก (พธ.ด.)" : "Doctoral (Ph.D.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "หลักสูตรทั้งหมด" : "All Programs"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ทุนการศึกษา" : "Scholarships"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: บริการดิจิทัล (2-3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              <span>{isThai ? "บริการดิจิทัล" : "Digital Services"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/services"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ขอหนังสือรับรองนิสิต" : "Student Requests"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/attendance/checkin"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "เช็คชื่อเข้าชั้นเรียน QR" : "QR Check-in"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ระบบจองห้องประชุม" : "Room Reservations"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/documents/track"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ติดตามเอกสารสารบรรณ" : "Track E-Approval"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ติดตามแผนยุทธศาสตร์" : "Strategic Projects"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: หน่วยงาน & ลิงก์ภายนอก (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{isThai ? "องค์กร & เครือข่าย" : "Network Links"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/staff"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ทำเนียบคณาจารย์" : "Faculty Staff"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{isThai ? "ข่าวสารและกิจกรรม" : "Press & Events"}</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.mcu.ac.th"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <span className="truncate">{isThai ? "เว็บไซต์หลัก มจร" : "MCU Portal"}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 ml-0.5" />
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-primary font-medium">{isThai ? "ระบบหลังบ้าน" : "Staff Console"}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright & Compliance Bar */}
      <div className="border-t border-border bg-background/80 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="text-center sm:text-left">
            <p>
              © 2026 {isThai ? "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" : "Faculty of Buddhism, Mahachulalongkornrajavidyalaya University"}.
              {" "}{isThai ? "สงวนลิขสิทธิ์ทั้งหมด" : "All rights reserved."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              {isThai ? "หน้าแรก" : "Home"}
            </Link>
            <span>&bull;</span>
            <Link href="/news" className="hover:text-foreground transition-colors">
              {isThai ? "ประชาสัมพันธ์" : "PR"}
            </Link>
            <span>&bull;</span>
            <Link href="/staff" className="hover:text-foreground transition-colors">
              {isThai ? "ติดต่อคณะ" : "Contact"}
            </Link>
            <span>&bull;</span>
            <span className="text-primary font-medium">
              VibeCore Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
