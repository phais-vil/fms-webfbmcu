-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "sample_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sample_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "summary_th" TEXT,
    "summary_en" TEXT,
    "content_th" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "cover_image" VARCHAR(500),
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "author_id" UUID,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_attachments" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "file_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_items_tenant_id_idx" ON "sample_items"("tenant_id");

-- CreateIndex
CREATE INDEX "news_categories_tenant_id_idx" ON "news_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_tenant_id_code_key" ON "news_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "news_articles_tenant_id_status_published_at_idx" ON "news_articles"("tenant_id", "status", "published_at");

-- CreateIndex
CREATE INDEX "news_articles_tenant_id_is_pinned_idx" ON "news_articles"("tenant_id", "is_pinned");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_tenant_id_slug_key" ON "news_articles"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "news_attachments_article_id_idx" ON "news_attachments"("article_id");

-- AddForeignKey
ALTER TABLE "sample_items" ADD CONSTRAINT "sample_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_categories" ADD CONSTRAINT "news_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_attachments" ADD CONSTRAINT "news_attachments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
