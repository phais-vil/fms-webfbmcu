"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Pin, Eye, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonSelect,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  togglePinNewsArticleAction,
  togglePublishNewsArticleAction,
} from "@/features/news/actions";

interface NewsClientProps {
  categories: NewsCategoryDto[];
  initialArticles: NewsArticleDto[];
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

interface ArticleFormData {
  id?: string;
  categoryId: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  contentTh: string;
  contentEn: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPinned: boolean;
}

export function NewsAdminClient({
  categories,
  initialArticles,
  canCreate,
  canEdit,
  canPublish,
  canDelete,
}: NewsClientProps) {
  const t = useT();
  const locale = useLocale();

  const [articles, setArticles] = useState<NewsArticleDto[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsArticleDto | null>(null);

  const initialForm: ArticleFormData = {
    categoryId: categories[0]?.id || "",
    titleTh: "",
    titleEn: "",
    summaryTh: "",
    summaryEn: "",
    contentTh: "",
    contentEn: "",
    coverImage: "",
    status: "PUBLISHED",
    isPinned: false,
  };

  const [form, setForm] = useState<ArticleFormData>(initialForm);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      search.trim() === "" ||
      a.titleTh.toLowerCase().includes(search.toLowerCase()) ||
      a.titleEn.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || a.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || a.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openCreateDialog = () => {
    setForm({
      ...initialForm,
      categoryId: categories[0]?.id || "",
    });
    setActiveArticle(null);
    setDialogOpen(true);
  };

  const openEditDialog = (article: NewsArticleDto) => {
    setActiveArticle(article);
    setForm({
      id: article.id,
      categoryId: article.categoryId,
      titleTh: article.titleTh,
      titleEn: article.titleEn,
      summaryTh: article.summaryTh || "",
      summaryEn: article.summaryEn || "",
      contentTh: article.contentTh,
      contentEn: article.contentEn,
      coverImage: article.coverImage || "",
      status: article.status,
      isPinned: article.isPinned,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.titleTh.trim() || !form.titleEn.trim() || !form.contentTh.trim() || !form.contentEn.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" : "Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      if (form.id) {
        const res = await updateNewsArticleAction({
          id: form.id,
          categoryId: form.categoryId,
          titleTh: form.titleTh,
          titleEn: form.titleEn,
          summaryTh: form.summaryTh,
          summaryEn: form.summaryEn,
          contentTh: form.contentTh,
          contentEn: form.contentEn,
          coverImage: form.coverImage,
          status: form.status,
          isPinned: form.isPinned,
        });

        if (res.ok) {
          setArticles((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
          toast.success(locale === "th" ? "แก้ไขข่าวสารสำเร็จ" : "News updated successfully");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to update news");
        }
      } else {
        const res = await createNewsArticleAction({
          categoryId: form.categoryId,
          titleTh: form.titleTh,
          titleEn: form.titleEn,
          summaryTh: form.summaryTh,
          summaryEn: form.summaryEn,
          contentTh: form.contentTh,
          contentEn: form.contentEn,
          coverImage: form.coverImage,
          status: form.status,
          isPinned: form.isPinned,
        });

        if (res.ok) {
          setArticles((prev) => [res.data, ...prev]);
          toast.success(locale === "th" ? "สร้างข่าวสารสำเร็จ" : "News created successfully");
          setDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to create news");
        }
      }
    });
  };

  const handleTogglePin = (id: string) => {
    startTransition(async () => {
      const res = await togglePinNewsArticleAction(id);
      if (res.ok) {
        setArticles((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
        toast.success(
          res.data.isPinned
            ? locale === "th" ? "ปักหมุดข่าวแล้ว" : "Article pinned"
            : locale === "th" ? "ปลดหมุดข่าวแล้ว" : "Article unpinned"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleTogglePublish = (id: string) => {
    startTransition(async () => {
      const res = await togglePublishNewsArticleAction(id);
      if (res.ok) {
        setArticles((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
        toast.success(
          res.data.status === "PUBLISHED"
            ? locale === "th" ? "เผยแพร่ข่าวแล้ว" : "Article published"
            : locale === "th" ? "เปลี่ยนเป็นแบบร่างแล้ว" : "Set to draft"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!activeArticle) return;
    startTransition(async () => {
      const res = await deleteNewsArticleAction(activeArticle.id);
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== activeArticle.id));
        toast.success(locale === "th" ? "ลบข่าวเรียบร้อยแล้ว" : "Article deleted");
        setDeleteDialogOpen(false);
        setActiveArticle(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("news.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("news.create")}
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("news.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="w-full sm:w-56">
            <LiyonSelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">{t("news.filter.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "th" ? c.nameTh : c.nameEn}
                </option>
              ))}
            </LiyonSelect>
          </div>
          <div className="w-full sm:w-44">
            <LiyonSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">{t("news.filter.allStatuses")}</option>
              <option value="PUBLISHED">{t("news.status.published")}</option>
              <option value="DRAFT">{t("news.status.draft")}</option>
              <option value="ARCHIVED">{t("news.status.archived")}</option>
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* Articles List Table */}
      <div className="card overflow-hidden border border-border">
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-base">{t("news.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">{t("news.field.titleTh")}</th>
                  <th className="py-3 px-4">{t("news.field.category")}</th>
                  <th className="py-3 px-4">{t("news.field.status")}</th>
                  <th className="py-3 px-4">{t("news.field.viewCount")}</th>
                  <th className="py-3 px-4">{t("news.field.publishedAt")}</th>
                  <th className="py-3 px-4 text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {article.isPinned && (
                          <span title="Pinned" className="text-amber-500 shrink-0">
                            <Pin className="h-4 w-4 fill-amber-500" />
                          </span>
                        )}
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">
                            {locale === "th" ? article.titleTh : article.titleEn}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">/news/{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        {locale === "th" ? article.categoryNameTh : article.categoryNameEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {article.status === "PUBLISHED" ? (
                        <StatusPill tone="ok">{t("news.status.published")}</StatusPill>
                      ) : article.status === "DRAFT" ? (
                        <StatusPill tone="warn">{t("news.status.draft")}</StatusPill>
                      ) : (
                        <StatusPill tone="off">{t("news.status.archived")}</StatusPill>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {article.viewCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1">
                      {canPublish && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={article.isPinned ? t("news.action.unpin") : t("news.action.pin")}
                            onClick={() => handleTogglePin(article.id)}
                            disabled={isPending}
                            className={article.isPinned ? "text-amber-500" : "text-muted-foreground"}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={article.status === "PUBLISHED" ? t("news.action.unpublish") : t("news.action.publish")}
                            onClick={() => handleTogglePublish(article.id)}
                            disabled={isPending}
                            className={article.status === "PUBLISHED" ? "text-emerald-600" : "text-amber-600"}
                          >
                            {article.status === "PUBLISHED" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(article)}
                          disabled={isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveArticle(article);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={activeArticle ? t("news.edit") : t("news.create")}
          description={t("news.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("news.field.category")} htmlFor="category-select">
              <LiyonSelect
                id="category-select"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "th" ? c.nameTh : c.nameEn}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("news.field.titleTh")} htmlFor="title-th">
                <input
                  id="title-th"
                  type="text"
                  value={form.titleTh}
                  onChange={(e) => setForm((f) => ({ ...f, titleTh: e.target.value }))}
                  placeholder="เช่น เปิดรับสมัครนิสิตใหม่ ประจำปีการศึกษา 2568"
                  className="w-full p-2 border rounded bg-background"
                  required
                />
              </LiyonField>
              <LiyonField label={t("news.field.titleEn")} htmlFor="title-en">
                <input
                  id="title-en"
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                  placeholder="e.g. New Student Admissions Academic Year 2025"
                  className="w-full p-2 border rounded bg-background"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("news.field.summaryTh")} htmlFor="summary-th">
                <textarea
                  id="summary-th"
                  rows={2}
                  value={form.summaryTh}
                  onChange={(e) => setForm((f) => ({ ...f, summaryTh: e.target.value }))}
                  placeholder="บทคัดย่อสั้น ๆ สำหรับแสดงในการ์ดข่าว"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
              <LiyonField label={t("news.field.summaryEn")} htmlFor="summary-en">
                <textarea
                  id="summary-en"
                  rows={2}
                  value={form.summaryEn}
                  onChange={(e) => setForm((f) => ({ ...f, summaryEn: e.target.value }))}
                  placeholder="Brief summary for news preview card"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("news.field.contentTh")} htmlFor="content-th">
              <textarea
                id="content-th"
                rows={5}
                value={form.contentTh}
                onChange={(e) => setForm((f) => ({ ...f, contentTh: e.target.value }))}
                placeholder="เนื้อหาข่าวแบบละเอียด..."
                className="w-full p-2 border rounded bg-background text-sm"
                required
              />
            </LiyonField>

            <LiyonField label={t("news.field.contentEn")} htmlFor="content-en">
              <textarea
                id="content-en"
                rows={5}
                value={form.contentEn}
                onChange={(e) => setForm((f) => ({ ...f, contentEn: e.target.value }))}
                placeholder="Full article content in English..."
                className="w-full p-2 border rounded bg-background text-sm"
                required
              />
            </LiyonField>

            <LiyonField label={t("news.field.coverImage")} htmlFor="cover-image">
              <input
                id="cover-image"
                type="url"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 border rounded bg-background text-sm"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <LiyonField label={t("news.field.status")} htmlFor="status-select">
                <LiyonSelect
                  id="status-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED" }))
                  }
                >
                  <option value="PUBLISHED">{t("news.status.published")}</option>
                  <option value="DRAFT">{t("news.status.draft")}</option>
                  <option value="ARCHIVED">{t("news.status.archived")}</option>
                </LiyonSelect>
              </LiyonField>

              <div className="pt-5">
                <LiyonSwitchRow
                  id="news-is-pinned"
                  checked={form.isPinned}
                  onCheckedChange={(checked: boolean) => setForm((f) => ({ ...f, isPinned: checked }))}
                  label={t("news.field.isPinned")}
                />
              </div>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {t("news.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirm Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader title={t("news.delete")} description={t("news.deleteConfirm")} />
        <LiyonDialogFooter>
          <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isPending}>
            {t("news.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
