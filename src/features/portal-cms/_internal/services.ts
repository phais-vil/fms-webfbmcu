import { prisma } from "@/shared/lib/infra/prisma";
import type { PortalBanner, Prisma } from "@/generated/prisma";
import type { CreateBannerInput, UpdateBannerInput } from "./validations";

export type PortalBannerDto = PortalBanner;

export async function listAdminBanners(tenantId: string): Promise<PortalBannerDto[]> {
  return prisma.portalBanner.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listActivePublicBanners(tenantId: string): Promise<PortalBannerDto[]> {
  return prisma.portalBanner.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getBannerById(tenantId: string, id: string): Promise<PortalBannerDto | null> {
  return prisma.portalBanner.findFirst({
    where: { id, tenantId },
  });
}

export async function createBanner(
  tenantId: string,
  input: CreateBannerInput
): Promise<PortalBannerDto> {
  return prisma.portalBanner.create({
    data: {
      tenantId,
      titleTh: input.titleTh.trim(),
      titleEn: input.titleEn.trim(),
      subtitleTh: input.subtitleTh?.trim() || null,
      subtitleEn: input.subtitleEn?.trim() || null,
      tagTh: input.tagTh?.trim() || null,
      tagEn: input.tagEn?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      linkUrl: input.linkUrl?.trim() || null,
      buttonTextTh: input.buttonTextTh?.trim() || null,
      buttonTextEn: input.buttonTextEn?.trim() || null,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
}

export async function updateBanner(
  tenantId: string,
  input: UpdateBannerInput
): Promise<PortalBannerDto> {
  const data: Prisma.PortalBannerUpdateInput = {};
  if (input.titleTh !== undefined) data.titleTh = input.titleTh.trim();
  if (input.titleEn !== undefined) data.titleEn = input.titleEn.trim();
  if (input.subtitleTh !== undefined) data.subtitleTh = input.subtitleTh?.trim() || null;
  if (input.subtitleEn !== undefined) data.subtitleEn = input.subtitleEn?.trim() || null;
  if (input.tagTh !== undefined) data.tagTh = input.tagTh?.trim() || null;
  if (input.tagEn !== undefined) data.tagEn = input.tagEn?.trim() || null;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl.trim();
  if (input.linkUrl !== undefined) data.linkUrl = input.linkUrl?.trim() || null;
  if (input.buttonTextTh !== undefined) data.buttonTextTh = input.buttonTextTh?.trim() || null;
  if (input.buttonTextEn !== undefined) data.buttonTextEn = input.buttonTextEn?.trim() || null;
  if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return prisma.portalBanner.update({
    where: { id: input.id, tenantId },
    data,
  });
}

export async function deleteBanner(tenantId: string, id: string): Promise<PortalBannerDto> {
  return prisma.portalBanner.delete({
    where: { id, tenantId },
  });
}

export async function toggleBannerActive(
  tenantId: string,
  id: string,
  isActive: boolean
): Promise<PortalBannerDto> {
  return prisma.portalBanner.update({
    where: { id, tenantId },
    data: { isActive },
  });
}
