"use client";

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
  MessageCircle,
} from "lucide-react";
import type { TenantContactSettingsView } from "@/features/identity";

interface PortalFooterProps {
  isThai: boolean;
  tenantNameTh?: string;
  tenantNameEn?: string;
  logoUrl?: string | null;
  contact?: TenantContactSettingsView;
}

export function PortalFooter({
  isThai,
  tenantNameTh,
  tenantNameEn,
  logoUrl,
  contact,
}: PortalFooterProps) {
  const orgName = isThai
    ? (tenantNameTh || "คณะพุทธศาสตร์ มจร")
    : (tenantNameEn || "Faculty of Buddhism, MCU");
  const phone = contact?.phone || "035-248-000 ต่อ 8100, 8102 (สำนักงานคณบดี)";
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const email = contact?.email || "buddhism@mcu.ac.th";
  const address = isThai
    ? (contact?.addressTh || "79 หมู่ที่ 1 ถนนพหลโยธิน ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170")
    : (contact?.addressEn || "79 Moo 1, Phahonyothin Rd., Lam Sai, Wang Noi, Phra Nakhon Si Ayutthaya 13170 Thailand");
  const workingHours = isThai
    ? (contact?.workingHoursTh || "วันจันทร์ - วันศุกร์ เวลา 08:30 - 16:30 น. (ยกเว้นวันหยุดราชการ)")
    : (contact?.workingHoursEn || "Monday - Friday 08:30 - 16:30 (Excluding Public Holidays)");
  const website = contact?.website || "https://www.mcu.ac.th";
  const facebook = contact?.facebook;
  const lineId = contact?.lineId;
  const mapUrl = contact?.mapUrl;

  const highlights = [
    {
      icon: ShieldCheck,
      titleTh: "มาตรฐานการศึกษาสากล",
      titleEn: "Quality Accreditations",
      descTh: "เกณฑ์คุณภาพ AUN-QA & EdPEx",
      descEn: "Aligned with AUN-QA & EdPEx",
    },
    {
      icon: BookOpen,
      titleTh: "เชี่ยวชาญพระไตรปิฎก",
      titleEn: "Tipitaka Studies",
      descTh: "สืบทอดหลักพุทธธรรมและวิปัสสนา",
      descEn: "Canonical Pali & Vipassana mastery",
    },
    {
      icon: QrCode,
      titleTh: "บริการดิจิทัลครบวงจร",
      titleEn: "Smart Digital Services",
      descTh: "คำร้องออนไลน์ & QR Verification",
      descEn: "Online Services & Digital Attendance",
    },
    {
      icon: Globe,
      titleTh: "เครือข่ายพุทธศาสตร์สากล",
      titleEn: "Global Buddhist Network",
      descTh: "ร่วมมือกับองค์กรพุทธศาสนาทั่วโลก",
      descEn: "Partnerships with IABU & WBU",
    },
  ];

  return (
    <footer className="relative mt-auto border-t border-slate-700/60 bg-[var(--ink-band,#0F172A)] text-[var(--ink-band-text,#F8FAFC)] transition-colors shadow-2xl">
      {/* 1. Value Proposition Highlights Strip (Dark Contrast) */}
      <div className="border-b border-white/10 bg-black/25">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 p-3.5 rounded-[var(--r-md)] border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-[var(--r-sm)] bg-[var(--brand)] text-[var(--on-brand,#FFFFFF)] flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight truncate">
                      {isThai ? item.titleTh : item.titleEn}
                    </p>
                    <p className="text-xs text-[var(--ink-band-muted,#94A3B8)] mt-0.5 truncate">
                      {isThai ? item.descTh : item.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Columns */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Identity & Official Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <i className="w-11 h-11 rounded-[var(--r-sm)] flex items-center justify-center bg-[var(--brand)] text-[var(--on-brand,#FFFFFF)] shadow-md overflow-hidden transition-transform duration-200 group-hover:scale-105 shrink-0 not-italic border border-white/15">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={orgName}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <GraduationCap className="h-6 w-6" aria-hidden="true" />
                )}
              </i>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-lg leading-tight tracking-tight text-white group-hover:text-[var(--brand2-light,#F0C070)] transition-colors">
                  {orgName}
                </span>
                <span className="text-xs text-[var(--ink-band-muted,#94A3B8)] mt-0.5">
                  {isThai
                    ? "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)"
                    : "Mahachulalongkornrajavidyalaya University"}
                </span>
              </div>
            </Link>

            <p className="text-sm text-[var(--ink-band-muted,#94A3B8)] leading-relaxed max-w-md">
              {isThai
                ? "มุ่งผลิตบัณฑิตให้มีความรู้เชี่ยวชาญในพระไตรปิฎก มีคุณธรรม จริยธรรม นำหลักพุทธธรรมบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาจิตใจและสังคมอย่างยั่งยืน"
                : "Dedicated to fostering scholars in Tipitaka studies, ethics, and mindfulness, integrating Buddhist wisdom to enrich contemporary global society."}
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-[var(--ink-band-muted,#94A3B8)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--brand-light,#60A5FA)] shrink-0 mt-0.5" />
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1 group/map"
                  >
                    <span className="leading-relaxed">{address}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-70 group-hover/map:opacity-100" />
                  </a>
                ) : (
                  <span className="leading-relaxed">{address}</span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--brand-light,#60A5FA)] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--brand-light,#60A5FA)] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[var(--brand-light,#60A5FA)] shrink-0" />
                <span>{workingHours}</span>
              </div>
            </div>

            {/* Social Media & Action Links */}
            {(facebook || lineId || mapUrl) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {facebook && (
                  <a
                    href={facebook.startsWith("http") ? facebook : `https://${facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-ctl)] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30 text-xs font-medium transition-colors"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {lineId && (
                  <a
                    href={lineId.startsWith("http") ? lineId : `https://line.me/R/ti/p/~${lineId.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-ctl)] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 text-xs font-medium transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>LINE {lineId.startsWith("@") ? lineId : `@${lineId}`}</span>
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-ctl)] bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs font-medium transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[var(--brand-light,#60A5FA)]" />
                    <span>Google Maps</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: หลักสูตรการศึกษา (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-light,#60A5FA)]" />
              <span>{isThai ? "หลักสูตรการศึกษา" : "Academic"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-band-muted,#94A3B8)]">
              <li>
                <Link
                  href="/curriculum/B.A.-BUDDHISM"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ปริญญาตรี (พธ.บ.)" : "Bachelor (B.A.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum/M.A.-BUDDHISM"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ปริญญาโท (พธ.ม.)" : "Master (M.A.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum/PH.D.-BUDDHISM"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ปริญญาเอก (พธ.ด.)" : "Doctoral (Ph.D.)"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "หลักสูตรทั้งหมด" : "All Programs"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ทุนการศึกษา" : "Scholarships"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: บริการดิจิทัล (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5 text-[var(--brand-light,#60A5FA)]" />
              <span>{isThai ? "บริการดิจิทัล" : "Digital Services"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-band-muted,#94A3B8)]">
              <li>
                <Link
                  href="/services"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ขอหนังสือรับรองนิสิต" : "Student Requests"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/attendance/checkin"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "เช็คชื่อเข้าชั้นเรียน QR" : "QR Check-in"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ระบบจองห้องประชุม" : "Room Reservations"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/documents/track"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ติดตามเอกสารสารบรรณ" : "Track E-Approval"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ติดตามแผนยุทธศาสตร์" : "Strategic Projects"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: องค์กร & เครือข่าย (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[var(--brand-light,#60A5FA)]" />
              <span>{isThai ? "องค์กร & เครือข่าย" : "Network Links"}</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--ink-band-muted,#94A3B8)]">
              <li>
                <Link
                  href="/staff"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ทำเนียบคณาจารย์" : "Faculty Staff"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 group-hover:text-[var(--brand-light,#60A5FA)] group-hover:translate-x-0.5 transition-all" />
                  <span>{isThai ? "ข่าวสารและกิจกรรม" : "Press & Events"}</span>
                </Link>
              </li>
              <li>
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="truncate">{isThai ? "เว็บไซต์ทางการ" : "Official Website"}</span>
                  <ExternalLink className="h-3 w-3 text-white/50 group-hover:text-white shrink-0 ml-0.5" />
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-[var(--brand2-light,#F0C070)] hover:text-white font-semibold group pt-1 transition-colors"
                >
                  <span>{isThai ? "ระบบหลังบ้าน" : "Staff Console"}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar (Contrast Dark) */}
      <div className="border-t border-white/10 bg-black/40 py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-band-muted,#94A3B8)]">
          <div className="text-center sm:text-left">
            <p>
              © 2026 {orgName}.{" "}
              {isThai ? "สงวนลิขสิทธิ์ทั้งหมด" : "All rights reserved."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              {isThai ? "หน้าแรก" : "Home"}
            </Link>
            <span className="text-white/20">&bull;</span>
            <Link href="/news" className="hover:text-white transition-colors">
              {isThai ? "ประชาสัมพันธ์" : "PR"}
            </Link>
            <span className="text-white/20">&bull;</span>
            <Link href="/staff" className="hover:text-white transition-colors">
              {isThai ? "ติดต่อคณะ" : "Contact"}
            </Link>
            <span className="text-white/20">&bull;</span>
            <span className="text-[var(--brand2-light,#F0C070)] font-semibold">
              VibeCore Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
