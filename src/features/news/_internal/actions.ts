"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";
import {
  listNewsCategories,
  listAdminNewsArticles,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  togglePinNewsArticle,
  togglePublishNewsArticle,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./services";

export async function getNewsCategoriesAction(): Promise<ActionResult<NewsCategoryDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNewsCategories(ctx.tenantId);
  });
}

export async function getAdminNewsArticlesAction(filter?: {
  search?: string;
  categoryId?: string;
  status?: string;
}): Promise<ActionResult<NewsArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listAdminNewsArticles(ctx.tenantId, filter);
  });
}

export async function createNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function updateNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsEdit);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsDelete);
    await deleteNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

export async function togglePinNewsArticleAction(id: string): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const result = await togglePinNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function togglePublishNewsArticleAction(id: string): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const result = await togglePublishNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}
