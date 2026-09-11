"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalBannerDto } from "@/features/portal-cms";

export function HeroCarousel({ banners, isThai }: { banners: PortalBannerDto[], isThai: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isThai
                ? "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย"
                : "Faculty of Buddhism, MCU"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {isThai ? (
              <>
                แหล่งรวมปัญญาวิชาการ <br className="hidden sm:inline" />
                <span className="text-primary">พัฒนาจิตใจสู่สังคมสากล</span>
              </>
            ) : (
              <>
                Wisdom & Buddhist Studies <br className="hidden sm:inline" />
                <span className="text-primary">for Global Harmony</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isThai
              ? "มุ่งผลิตบัณฑิตให้มีความรู้เชี่ยวชาญในพระไตรปิฎก มีคุณธรรม จริยธรรม พร้อมประยุกต์หลักพุทธธรรมเพื่อแก้ไขปัญหาสังคมยุคดิจิทัล"
              : "Dedicated to fostering scholars in Tipitaka studies, ethics, and mindfulness, integrating Buddhist wisdom to enrich contemporary society."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="gap-2 shadow-md">
              <Link href="/news">
                <span>{isThai ? "อ่านข่าวสารประชาสัมพันธ์" : "Explore News"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/curriculum">
                {isThai ? "ดูหลักสูตรการศึกษา" : "Academic Programs"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <section className="relative w-full h-[500px] lg:h-[600px] overflow-hidden bg-slate-900 border-b border-border/50 group">
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            {banner.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.imageUrl}
                alt={isThai ? banner.titleTh : banner.titleEn}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}

            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center sm:text-left">
                {(banner.tagTh || banner.tagEn) && (
                  <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-primary/90 text-white text-xs font-semibold tracking-wide">
                    {isThai ? banner.tagTh : banner.tagEn}
                  </span>
                )}
                
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4 drop-shadow-md">
                  {isThai ? banner.titleTh : banner.titleEn}
                </h1>
                
                {(banner.subtitleTh || banner.subtitleEn) && (
                  <p className="text-base sm:text-xl text-slate-200 max-w-2xl mb-8 drop-shadow leading-relaxed">
                    {isThai ? banner.subtitleTh : banner.subtitleEn}
                  </p>
                )}

                {banner.linkUrl && (
                  <Button asChild size="lg" className="gap-2 shadow-lg">
                    <a href={banner.linkUrl} target="_blank" rel="noreferrer">
                      <span>{isThai ? (banner.buttonTextTh || "ดูรายละเอียด") : (banner.buttonTextEn || "Learn More")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-primary w-6" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
