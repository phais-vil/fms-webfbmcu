import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, NewsStatus } from "@/generated/prisma";
import { errors } from "@/shared/lib/errors";
import { getTenantGeminiConfig } from "@/features/identity/server";
import type { CreateNewsArticleInput, UpdateNewsArticleInput, TranslateNewsInput } from "./validations";

export interface NewsCategoryDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  displayOrder: number;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh: string;
  categoryNameEn: string;
  slug: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0E00-\u0E7F-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `article-${Date.now()}`;
}

export async function ensureDefaultNewsCategories(tenantId: string): Promise<void> {
  const count = await prisma.newsCategory.count({ where: { tenantId } });
  if (count > 0) return;

  const defaults = [
    { code: "GENERAL", nameTh: "ข่าวประชาสัมพันธ์ทั่วไป", nameEn: "General News", displayOrder: 1 },
    { code: "ACADEMIC", nameTh: "ข่าววิชาการและการวิจัย", nameEn: "Academic & Research", displayOrder: 2 },
    { code: "STUDENT", nameTh: "ข่าวกิจกรรมนิสิต", nameEn: "Student Activities", displayOrder: 3 },
    { code: "ADMISSION", nameTh: "ข่าวรับสมัครและทุนการศึกษา", nameEn: "Admissions & Scholarships", displayOrder: 4 },
  ];

  for (const cat of defaults) {
    await prisma.newsCategory.create({
      data: {
        tenantId,
        code: cat.code,
        nameTh: cat.nameTh,
        nameEn: cat.nameEn,
        displayOrder: cat.displayOrder,
      },
    });
  }
}

export async function listNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  await ensureDefaultNewsCategories(tenantId);
  const categories = await prisma.newsCategory.findMany({
    where: { tenantId, isActive: true },
    orderBy: { displayOrder: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    description: c.description,
    displayOrder: c.displayOrder,
  }));
}

export async function listAdminNewsArticles(
  tenantId: string,
  filter?: { search?: string; categoryId?: string; status?: string }
): Promise<NewsArticleDto[]> {
  await ensureDefaultNewsCategories(tenantId);

  const where: Prisma.NewsArticleWhereInput = { tenantId };
  if (filter?.categoryId) where.categoryId = filter.categoryId;
  if (filter?.status) where.status = filter.status as NewsStatus;
  if (filter?.search) {
    where.OR = [
      { titleTh: { contains: filter.search, mode: "insensitive" } },
      { titleEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: { category: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    slug: a.slug,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImage: a.coverImage,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function listPublicNewsArticles(
  tenantId: string,
  options?: { categoryId?: string; search?: string; limit?: number }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
  };

  if (options?.categoryId) where.categoryId = options.categoryId;
  if (options?.search) {
    where.OR = [
      { titleTh: { contains: options.search, mode: "insensitive" } },
      { titleEn: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: { category: true },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
    take: options?.limit ?? 20,
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    slug: a.slug,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImage: a.coverImage,
    status: a.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getPublicNewsArticleBySlug(
  tenantId: string,
  slug: string
): Promise<NewsArticleDto | null> {
  const article = await prisma.newsArticle.findFirst({
    where: { tenantId, slug, status: "PUBLISHED" },
    include: { category: true },
  });

  if (!article) return null;

  // Increment view count asynchronously
  await prisma.newsArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return {
    id: article.id,
    tenantId: article.tenantId,
    categoryId: article.categoryId,
    categoryNameTh: article.category.nameTh,
    categoryNameEn: article.category.nameEn,
    slug: article.slug,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    summaryTh: article.summaryTh,
    summaryEn: article.summaryEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    coverImage: article.coverImage,
    status: article.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: article.isPinned,
    viewCount: article.viewCount + 1,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export async function createNewsArticle(
  tenantId: string,
  authorId: string | null,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const baseSlug = slugify(input.titleEn || input.titleTh);
  let finalSlug = baseSlug;
  let counter = 1;

  while (await prisma.newsArticle.findFirst({ where: { tenantId, slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      categoryId: input.categoryId,
      slug: finalSlug,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImage: input.coverImage || null,
      status: input.status,
      isPinned: input.isPinned,
      authorId,
      publishedAt,
    },
    include: { category: true },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    categoryId: created.categoryId,
    categoryNameTh: created.category.nameTh,
    categoryNameEn: created.category.nameEn,
    slug: created.slug,
    titleTh: created.titleTh,
    titleEn: created.titleEn,
    summaryTh: created.summaryTh,
    summaryEn: created.summaryEn,
    contentTh: created.contentTh,
    contentEn: created.contentEn,
    coverImage: created.coverImage,
    status: created.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: created.isPinned,
    viewCount: created.viewCount,
    publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateNewsArticle(
  tenantId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirstOrThrow({
    where: { id: input.id, tenantId },
  });

  const data: Prisma.NewsArticleUncheckedUpdateInput = {};
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.titleTh !== undefined) data.titleTh = input.titleTh;
  if (input.titleEn !== undefined) data.titleEn = input.titleEn;
  if (input.summaryTh !== undefined) data.summaryTh = input.summaryTh;
  if (input.summaryEn !== undefined) data.summaryEn = input.summaryEn;
  if (input.contentTh !== undefined) data.contentTh = input.contentTh;
  if (input.contentEn !== undefined) data.contentEn = input.contentEn;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage || null;
  if (input.isPinned !== undefined) data.isPinned = input.isPinned;

  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
  }

  const updated = await prisma.newsArticle.update({
    where: { id: input.id },
    data,
    include: { category: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryNameEn: updated.category.nameEn,
    slug: updated.slug,
    titleTh: updated.titleTh,
    titleEn: updated.titleEn,
    summaryTh: updated.summaryTh,
    summaryEn: updated.summaryEn,
    contentTh: updated.contentTh,
    contentEn: updated.contentEn,
    coverImage: updated.coverImage,
    status: updated.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteNewsArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}

export async function togglePinNewsArticle(tenantId: string, id: string): Promise<NewsArticleDto> {
  const article = await prisma.newsArticle.findFirstOrThrow({
    where: { id, tenantId },
  });
  return updateNewsArticle(tenantId, { id, isPinned: !article.isPinned });
}

export async function togglePublishNewsArticle(tenantId: string, id: string): Promise<NewsArticleDto> {
  const article = await prisma.newsArticle.findFirstOrThrow({
    where: { id, tenantId },
  });
  const newStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  return updateNewsArticle(tenantId, { id, status: newStatus });
}

export interface TranslatedNewsResult {
  titleEn: string;
  summaryEn: string;
  contentEn: string;
}

export async function translateNewsWithGemini(
  tenantId: string,
  input: TranslateNewsInput
): Promise<TranslatedNewsResult> {
  const geminiConfig = await getTenantGeminiConfig(tenantId);
  if (!geminiConfig.enabled || !geminiConfig.apiKey) {
    throw errors.validation("news.geminiNotConfigured", {
      gemini: ["news.geminiNotConfigured"],
    });
  }

  const model = geminiConfig.model || "gemini-2.5-flash";
  const apiKey = geminiConfig.apiKey;

  const prompt = `You are a professional university public relations officer, translator, and editor for a prestigious Buddhist and higher education academic institution (Faculty of Buddhism, Mahachulalongkornrajavidyalaya University).
Your task is to translate and adapt the following Thai news announcement into natural, fluent, dignified, and professional English suitable for a formal academic faculty website.

=== THAI NEWS ARTICLE INPUT ===
Title (Thai):
${input.titleTh}

Summary / Excerpt (Thai):
${input.summaryTh ? input.summaryTh : "(No summary provided. Please compose a concise 1-2 sentence English summary based on the article content)"}

Content (Thai):
${input.contentTh ? input.contentTh : input.titleTh}

=== INSTRUCTIONS ===
1. Translate "Title (Thai)" into a clear, compelling, and grammatically impeccable English headline ("titleEn").
2. Translate or synthesize "Summary (Thai)" into an engaging, clear 1-2 sentence executive summary / excerpt ("summaryEn").
3. Translate "Content (Thai)" into a well-structured, polished English news article body ("contentEn"). Maintain paragraphs, academic tone, and proper naming conventions.
4. Output MUST be ONLY a valid JSON object strictly matching this schema:
{
  "titleEn": "string",
  "summaryEn": "string",
  "contentEn": "string"
}
Do not enclose in markdown code blocks if possible, or output strictly valid JSON.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (e) {
    throw errors.validation("news.geminiConnectionError", {
      gemini: [e instanceof Error ? e.message : "Failed to connect to Gemini API"],
    });
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = errBody?.error?.message || `Gemini API Error ${res.status}: ${res.statusText}`;
    throw errors.validation("news.geminiApiError", { gemini: [msg] });
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw errors.validation("news.geminiEmptyResponse", { gemini: ["Gemini returned an empty response"] });
  }

  try {
    const jsonStr = text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      titleEn: typeof parsed.titleEn === "string" ? parsed.titleEn : "",
      summaryEn: typeof parsed.summaryEn === "string" ? parsed.summaryEn : "",
      contentEn: typeof parsed.contentEn === "string" ? parsed.contentEn : "",
    };
  } catch {
    throw errors.validation("news.geminiParseError", {
      gemini: ["Failed to parse AI translation output as JSON"],
    });
  }
}

