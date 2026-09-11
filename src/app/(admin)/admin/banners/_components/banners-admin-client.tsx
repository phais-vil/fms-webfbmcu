"use client";

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  StatusPill,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { PortalBannerDto } from "@/features/portal-cms";
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  toggleBannerActiveAction,
} from "@/features/portal-cms/actions";

interface BannersAdminClientProps {
  initialData: PortalBannerDto[];
  canManage: boolean;
}

interface BannerFormData {
  id?: string;
  titleTh: string;
  titleEn: string;
  subtitleTh: string;
  subtitleEn: string;
  tagTh: string;
  tagEn: string;
  imageUrl: string;
  linkUrl: string;
  buttonTextTh: string;
  buttonTextEn: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm: BannerFormData = {
  titleTh: "",
  titleEn: "",
  subtitleTh: "",
  subtitleEn: "",
  tagTh: "",
  tagEn: "",
  imageUrl: "",
  linkUrl: "",
  buttonTextTh: "",
  buttonTextEn: "",
  displayOrder: 0,
  isActive: true,
};

export function BannersAdminClient({ initialData, canManage }: BannersAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const [banners, setBanners] = useState<PortalBannerDto[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [isPending, startTransition] = useTransition();

  const openCreateDialog = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = (banner: PortalBannerDto) => {
    setForm({
      id: banner.id,
      titleTh: banner.titleTh,
      titleEn: banner.titleEn,
      subtitleTh: banner.subtitleTh || "",
      subtitleEn: banner.subtitleEn || "",
      tagTh: banner.tagTh || "",
      tagEn: banner.tagEn || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      buttonTextTh: banner.buttonTextTh || "",
      buttonTextEn: banner.buttonTextEn || "",
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    startTransition(async () => {
      if (isEditing && form.id) {
        const res = await updateBannerAction({
          id: form.id,
          titleTh: form.titleTh,
          titleEn: form.titleEn,
          subtitleTh: form.subtitleTh || null,
          subtitleEn: form.subtitleEn || null,
          tagTh: form.tagTh || null,
          tagEn: form.tagEn || null,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl || null,
          buttonTextTh: form.buttonTextTh || null,
          buttonTextEn: form.buttonTextEn || null,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
        if (res.ok) {
          setBanners((prev) => prev.map((b) => (b.id === res.data.id ? res.data : b)));
          toast.success(t("core.saveSuccess"));
          setDialogOpen(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createBannerAction({
          titleTh: form.titleTh,
          titleEn: form.titleEn,
          subtitleTh: form.subtitleTh || null,
          subtitleEn: form.subtitleEn || null,
          tagTh: form.tagTh || null,
          tagEn: form.tagEn || null,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl || null,
          buttonTextTh: form.buttonTextTh || null,
          buttonTextEn: form.buttonTextEn || null,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
        if (res.ok) {
          setBanners((prev) => [res.data, ...prev]);
          toast.success(t("core.saveSuccess"));
          setDialogOpen(false);
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canManage) return;
    if (!confirm(t("core.confirmDelete"))) return;

    startTransition(async () => {
      const res = await deleteBannerAction(id);
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        toast.success(t("core.saveSuccess"));
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    if (!canManage) return;

    startTransition(async () => {
      const res = await toggleBannerActiveAction(id, !current);
      if (res.ok) {
        setBanners((prev) => prev.map((b) => (b.id === id ? res.data : b)));
        toast.success(t("core.saveSuccess"));
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("cms.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("cms.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("cms.newBanner")}
          </Button>
        )}
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 w-32">รูปภาพ</th>
                <th className="px-4 py-3">หัวข้อและรายละเอียด</th>
                <th className="px-4 py-3 text-center w-24">{t("cms.displayOrder")}</th>
                <th className="px-4 py-3 text-center w-28">{t("cms.isActive")}</th>
                {canManage && <th className="px-4 py-3 text-right w-28">{t("core.actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-12 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p>{t("cms.empty")}</p>
                  </td>
                </tr>
              ) : (
                banners
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((banner) => (
                    <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-16 w-24 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
                          {banner.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={banner.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {locale === "th" ? banner.titleTh : banner.titleEn}
                          </p>
                          {(banner.tagTh || banner.tagEn) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {locale === "th" ? banner.tagTh : banner.tagEn}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {locale === "th" ? banner.subtitleTh : banner.subtitleEn}
                        </p>
                        {banner.linkUrl && (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline block truncate max-w-md"
                          >
                            {banner.linkUrl}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {banner.displayOrder}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          disabled={!canManage || isPending}
                          onClick={() => handleToggleActive(banner.id, banner.isActive)}
                          className="inline-flex cursor-pointer disabled:cursor-not-allowed items-center"
                        >
                          {banner.isActive ? (
                            <StatusPill tone="ok">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t("core.status.active")}
                            </StatusPill>
                          ) : (
                            <StatusPill tone="off">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("core.status.inactive")}
                            </StatusPill>
                          )}
                        </button>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(banner)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(banner.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Form */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <LiyonDialogHeader
          title={isEditing ? t("cms.editBanner") : t("cms.newBanner")}
        />
        <form onSubmit={handleSubmit}>
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("cms.titleTh")} htmlFor="banner-title-th">
                <input
                  id="banner-title-th"
                  type="text"
                  value={form.titleTh}
                  onChange={(e) => setForm((f) => ({ ...f, titleTh: e.target.value }))}
                  placeholder="เช่น ยินดีต้อนรับสู่ คณะพุทธศาสตร์"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
              <LiyonField label={t("cms.titleEn")} htmlFor="banner-title-en">
                <input
                  id="banner-title-en"
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                  placeholder="e.g. Welcome to Faculty of Buddhism"
                  className="w-full p-2 border rounded bg-background text-sm"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("cms.subtitleTh")} htmlFor="banner-sub-th">
                <input
                  id="banner-sub-th"
                  type="text"
                  value={form.subtitleTh}
                  onChange={(e) => setForm((f) => ({ ...f, subtitleTh: e.target.value }))}
                  placeholder="คำบรรยายย่อยภาษาไทย"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("cms.subtitleEn")} htmlFor="banner-sub-en">
                <input
                  id="banner-sub-en"
                  type="text"
                  value={form.subtitleEn}
                  onChange={(e) => setForm((f) => ({ ...f, subtitleEn: e.target.value }))}
                  placeholder="Subtitle in English"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("cms.tagTh")} htmlFor="banner-tag-th">
                <input
                  id="banner-tag-th"
                  type="text"
                  value={form.tagTh}
                  onChange={(e) => setForm((f) => ({ ...f, tagTh: e.target.value }))}
                  placeholder="เช่น ข่าวด่วน, ประชาสัมพันธ์"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("cms.tagEn")} htmlFor="banner-tag-en">
                <input
                  id="banner-tag-en"
                  type="text"
                  value={form.tagEn}
                  onChange={(e) => setForm((f) => ({ ...f, tagEn: e.target.value }))}
                  placeholder="e.g. Urgent, Notice"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("cms.imageUrl")} htmlFor="banner-image">
              <input
                id="banner-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full p-2 border rounded bg-background text-sm"
                required
              />
            </LiyonField>

            <LiyonField label={t("cms.linkUrl")} htmlFor="banner-link">
              <input
                id="banner-link"
                type="text"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/news หรือ https://..."
                className="w-full p-2 border rounded bg-background text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("cms.buttonTextTh")} htmlFor="banner-btn-th">
                <input
                  id="banner-btn-th"
                  type="text"
                  value={form.buttonTextTh}
                  onChange={(e) => setForm((f) => ({ ...f, buttonTextTh: e.target.value }))}
                  placeholder="เช่น อ่านต่อ, ดูหลักสูตร"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("cms.buttonTextEn")} htmlFor="banner-btn-en">
                <input
                  id="banner-btn-en"
                  type="text"
                  value={form.buttonTextEn}
                  onChange={(e) => setForm((f) => ({ ...f, buttonTextEn: e.target.value }))}
                  placeholder="e.g. Read More, View Programs"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <LiyonField label={t("cms.displayOrder")} htmlFor="banner-order">
                <input
                  id="banner-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <div className="pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">{t("cms.isActive")}</span>
                </label>
              </div>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <LiyonDialogCloseButton label={t("core.cancel")} />
            <Button type="submit" disabled={isPending}>
              {isPending ? t("core.loading") : t("core.save")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
