"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CMS_P } from "../permissions";
import {
  createBannerSchema,
  updateBannerSchema,
  type CreateBannerInput,
  type UpdateBannerInput,
} from "./validations";
import {
  listAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  type PortalBannerDto,
} from "./services";

export async function getAdminBannersAction(): Promise<ActionResult<PortalBannerDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CMS_P.cmsRead);
    return listAdminBanners(ctx.tenantId);
  });
}

export async function createBannerAction(
  rawInput: CreateBannerInput
): Promise<ActionResult<PortalBannerDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CMS_P.cmsManage);
    const locale = await getLocale();
    const input = createBannerSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const created = await createBanner(ctx.tenantId, input);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return created;
  });
}

export async function updateBannerAction(
  rawInput: UpdateBannerInput
): Promise<ActionResult<PortalBannerDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CMS_P.cmsManage);
    const locale = await getLocale();
    const input = updateBannerSchema.parse(rawInput, {
      error: zodErrorMap(locale),
    });

    const updated = await updateBanner(ctx.tenantId, input);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return updated;
  });
}

export async function deleteBannerAction(id: string): Promise<ActionResult<PortalBannerDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CMS_P.cmsManage);
    const deleted = await deleteBanner(ctx.tenantId, id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return deleted;
  });
}

export async function toggleBannerActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<PortalBannerDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CMS_P.cmsManage);
    const updated = await toggleBannerActive(ctx.tenantId, id, isActive);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return updated;
  });
}
