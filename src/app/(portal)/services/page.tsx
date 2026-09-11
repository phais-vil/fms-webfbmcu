import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { prisma } from "@/shared/lib/infra/prisma";
import { listCertificateTypes } from "@/features/student-services/server";
import type { CertificateTypeDto } from "@/features/student-services";
import { ServicesClient } from "./_components/services-client";

export const metadata = {
  title: "บริการนิสิต & คำร้องออนไลน์ | คณะพุทธศาสตร์ มจร",
  description: "ระบบยื่นคำร้องขอหนังสือรับรองออนไลน์ ติดตามสถานะ และตรวจสอบเอกสารผ่าน QR Code",
};

export default async function ServicesPage() {
  const cookieLocale = await getLocaleCookie();
  const locale = cookieLocale ?? DEFAULT_LOCALE;

  const tenant = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const types = tenant
    ? (await listCertificateTypes(tenant.id, { activeOnly: true })).map((t) => ({
        ...t,
        fee: Number(t.fee),
      }))
    : [];

  return <ServicesClient initialTypes={types as unknown as CertificateTypeDto[]} locale={locale} />;
}
