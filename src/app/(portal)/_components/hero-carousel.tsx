"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Globe2,
  Scroll,
  Compass,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalBannerDto } from "@/features/portal-cms";

interface HeroCarouselProps {
  banners: PortalBannerDto[];
  isThai: boolean;
}

export function HeroCarousel({ banners, isThai }: HeroCarouselProps) {
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners, isHovered]);

  const activeBanner = banners && banners.length > 0 ? banners[currentBannerIdx] : null;

  return (
    <section className="relative w-full overflow-hidden bg-[#030305] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-white/[0.08]">
      {/* ── Background Glows & Spatial Depth ── */}
      {/* Golden Bodhi Atmospheric Glow (Centered Behind Monk) */}
      <div
        className="absolute top-1/3 right-1/4 w-[500px] sm:w-[750px] h-[500px] bg-gradient-to-tr from-amber-500/25 via-amber-700/15 to-transparent blur-[140px] rounded-full pointer-events-none opacity-70 animate-pulse"
        style={{ animationDuration: "8s" }}
        aria-hidden="true"
      />

      {/* Cool Indigo Ambient Light (Left Side for Editorial Contrast) */}
      <div
        className="absolute top-1/4 left-1/10 w-[400px] sm:w-[600px] h-[400px] bg-gradient-to-br from-indigo-600/20 via-primary/15 to-transparent blur-[130px] rounded-full pointer-events-none opacity-60"
        aria-hidden="true"
      />

      {/* Subtle Dot Grid Matrix */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Top & Bottom Soft Vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#030305] via-transparent to-[#030305] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* ── Main Hero Row (Editorial Split Layout) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Creative Designer Portfolio Typography & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Top Status Capsule */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/[0.05] backdrop-blur-md text-xs font-medium text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:border-amber-400/50 transition-all cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-100/90 font-semibold tracking-wide uppercase text-[11px]">
                {isThai ? "คณะพุทธศาสตร์ มจร" : "Faculty of Buddhism • MCU"}
              </span>
              <span className="text-amber-400/40">•</span>
              <span className="text-amber-300/80 font-light">
                {isThai ? "Creative Buddhist Studies" : "Sanctuary of Wisdom"}
              </span>
            </div>

            {/* Kinetic Hero Display Headline */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium">
                {isThai ? "ศาสตร์แห่งจิตปัญญา เพื่อสันติภาพสากล" : "Contemplative Wisdom • Modern Creation"}
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                {isThai ? (
                  <>
                    ผสานปัญญา <br className="hidden sm:inline" />
                    <span className="font-serif italic font-normal bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                      พระพุทธศาสนา
                    </span>
                    <br />
                    สู่โลกยุคดิจิทัล
                  </>
                ) : (
                  <>
                    Illuminating <br className="hidden sm:inline" />
                    <span className="font-serif italic font-normal bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                      The Human Mind
                    </span>
                    <br />
                    Through Wisdom
                  </>
                )}
              </h1>
            </div>

            {/* Description Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              {isThai
                ? "ศูนย์กลางการศึกษาพระไตรปิฎก คัมภีร์โบราณ และการวิจัยจิตปัญญาบูรณาการ เพื่อสรรค์สร้างบัณฑิตผู้เปี่ยมปัญญา คุณธรรม และความเป็นผู้นำทางจิตวิญญาณสู่ประชาคมโลก"
                : "A world-renowned sanctuary for Tipitaka archives, meditative insight, and interdisciplinary Buddhist scholarship fostering global harmony and compassion."}
            </p>

            {/* Interactive Domain Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
                {isThai ? "✦ พระไตรปิฎกศึกษา" : "✦ Tipitaka Canon"}
              </span>
              <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
                {isThai ? "✦ จิตตปัญญานวัตกรรม" : "✦ Mindfulness Innovation"}
              </span>
              <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
                {isThai ? "✦ วิปัสสนากรรมฐาน" : "✦ Meditation Studies"}
              </span>
              <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
                {isThai ? "✦ ปรัชญาและศาสนศาสตร์" : "✦ Philosophy & Ethics"}
              </span>
            </div>

            {/* Mindloop / Portfolio Liquid-Glass CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-semibold hover:brightness-110 shadow-[0_0_35px_rgba(251,191,36,0.35)] hover:shadow-[0_0_45px_rgba(251,191,36,0.5)] transition-all gap-2.5 cursor-pointer group"
              >
                <Link href="/curriculum">
                  <span>{isThai ? "สำรวจหลักสูตรการศึกษา" : "Explore Curriculums"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-lg text-white hover:bg-white/[0.12] hover:border-white/30 hover:text-white transition-all gap-2 cursor-pointer"
              >
                <Link href="/news">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>{isThai ? "ข่าวสารและงานวิจัย" : "Research & News"}</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: The Silhouette of Buddhist Monk Reading Book (5 Cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Liquid-Glass Showcase Frame */}
            <div
              className="relative w-full max-w-[460px] rounded-3xl p-3 sm:p-4 border border-white/15 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 group transition-all duration-500 hover:border-amber-500/30"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Inner Picture Canvas */}
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-inner">
                {/* The Monk Silhouette Image */}
                <Image
                  src="/images/monk-reading-hero.jpg"
                  alt={
                    isThai
                      ? "ภาพเงาพระภิกษุกำลังศึกษาคัมภีร์พระธรรม"
                      : "Silhouette of a Buddhist monk reading sacred scripture"
                  }
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 460px"
                />

                {/* Animated Luminous Light Cone Emitted from the Scripture */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Golden Halo Breathing Beam (Animated light ray) */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/20 blur-3xl rounded-full pointer-events-none animate-pulse"
                  style={{ animationDuration: "5s" }}
                  aria-hidden="true"
                />

                {/* Floating Glass Pill 1: Top Right Scripture Tag */}
                <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-black/60 backdrop-blur-md text-[11px] font-medium text-amber-200 shadow-lg">
                  <Scroll className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isThai ? "๘๔,๐๐๐ พระธรรมขันธ์" : "84,000 Dharma Sections"}</span>
                </div>

                {/* Floating Glass Card 2: Bottom Insight Card */}
                <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-white/15 bg-black/70 backdrop-blur-xl p-3.5 space-y-1 text-left shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                      {isThai ? "แสงแห่งปัญญาธรรม" : "The Light of Dhamma"}
                    </span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-xs text-white/95 font-medium leading-snug">
                    {isThai
                      ? "“ปญฺญา โลกสฺมิ ปชฺโชโต — ปัญญาเป็นแสงสว่างในโลก”"
                      : "“Wisdom is the brightest light in the world.”"}
                  </p>
                </div>
              </div>

              {/* External CMS Banner Switcher Capsule (If banners exist) */}
              {activeBanner && (
                <div className="mt-3 px-2 py-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                      {isThai ? activeBanner.tagTh || "ข่าวเด่น" : activeBanner.tagEn || "Banner"}
                    </span>
                    <span className="truncate text-neutral-300">
                      {isThai ? activeBanner.titleTh : activeBanner.titleEn}
                    </span>
                  </div>
                  {activeBanner.linkUrl && (
                    <Link
                      href={activeBanner.linkUrl}
                      className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium shrink-0"
                    >
                      <span>{isThai ? "เปิดดู" : "View"}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Animated Infinite Marquee Ribbon (Signature Creative Portfolio Style) ── */}
        <div className="mt-14 sm:mt-16 py-3 border-y border-white/[0.08] bg-white/[0.01] backdrop-blur-sm overflow-hidden whitespace-nowrap">
          <div className="inline-flex gap-8 items-center animate-[marquee_28s_linear_infinite]">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-400">
              {isThai ? "คณะพุทธศาสตร์ มจร" : "FACULTY OF BUDDHISM"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-200">
              {isThai ? "พระไตรปิฎกศึกษาและคัมภีร์โบราณ" : "TIPITAKA & PALM LEAF STUDIES"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-400">
              {isThai ? "ปริญญาตรี • ปริญญาโท • ปริญญาเอก" : "B.A. • M.A. • PH.D. PROGRAMS"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-200">
              {isThai ? "เครือข่ายสถาบันพุทธศาสนานานาชาติ 30+ ประเทศ" : "30+ GLOBAL PARTNERSHIPS"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-400">
              {isThai ? "นวัตกรรมจิตตปัญญาและสังคมดิจิทัล" : "MINDFULNESS & DIGITAL SOCIETY"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>

            {/* Loop duplicate for smooth infinite continuous animation */}
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-400">
              {isThai ? "คณะพุทธศาสตร์ มจร" : "FACULTY OF BUDDHISM"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-200">
              {isThai ? "พระไตรปิฎกศึกษาและคัมภีร์โบราณ" : "TIPITAKA & PALM LEAF STUDIES"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-neutral-400">
              {isThai ? "ปริญญาตรี • ปริญญาโท • ปริญญาเอก" : "B.A. • M.A. • PH.D. PROGRAMS"}
            </span>
            <span className="text-amber-400 text-xs">✦</span>
          </div>
        </div>

        {/* ── 4 Creative Designer Portfolio Feature Highlights ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/curriculum"
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all group block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-400 font-semibold">01 / PROGRAMS</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {isThai ? "หลักสูตรมาตรฐานสากล" : "Academic Curriculums"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isThai
                ? "เปิดสอนระดับตรี โท เอก บูรณาการหลักพุทธธรรมสู่สากล"
                : "Bachelor, Master and Doctoral degrees in Buddhist Studies"}
            </p>
          </Link>

          <Link
            href="/staff"
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all group block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-400 font-semibold">02 / FACULTY</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {isThai ? "คณาจารย์และผู้ทรงคุณวุฒิ" : "Scholars & Faculty"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isThai
                ? "ทีมอาจารย์ผู้เชี่ยวชาญพระไตรปิฎก ภาษาบาลี และสันสกฤต"
                : "Distinguished scholars in Pali, Sanskrit and Buddhist Philosophy"}
            </p>
          </Link>

          <Link
            href="/news"
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all group block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-400 font-semibold">03 / RESEARCH</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {isThai ? "งานวิจัยและคัมภีร์พุทธธรรม" : "Research & Archives"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isThai
                ? "ผลงานตีพิมพ์ระดับนานาชาติ คลังคัมภีร์ใบลาน และวารสารวิชาการ"
                : "International research publications, palm-leaf manuscripts & journals"}
            </p>
          </Link>

          <Link
            href="/services"
            className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all group block"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-400 font-semibold">04 / E-SERVICES</span>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe2 className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {isThai ? "บริการดิจิทัลคณะ 24 ชม." : "Smart Digital Services"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {isThai
                ? "ระบบขอหนังสือรับรอง ตรวจสอบวุฒิ และจองห้องประชุมออนไลน์"
                : "Online certificate issuance, credential verification & room booking"}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
