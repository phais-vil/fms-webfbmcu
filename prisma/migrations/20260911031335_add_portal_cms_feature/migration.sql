-- CreateTable
CREATE TABLE "portal_banners" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "subtitle_th" TEXT,
    "subtitle_en" TEXT,
    "tag_th" VARCHAR(100),
    "tag_en" VARCHAR(100),
    "image_url" VARCHAR(500) NOT NULL,
    "link_url" VARCHAR(500),
    "button_text_th" VARCHAR(100),
    "button_text_en" VARCHAR(100),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "portal_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portal_banners_tenant_id_is_active_display_order_idx" ON "portal_banners"("tenant_id", "is_active", "display_order");

-- AddForeignKey
ALTER TABLE "portal_banners" ADD CONSTRAINT "portal_banners_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
