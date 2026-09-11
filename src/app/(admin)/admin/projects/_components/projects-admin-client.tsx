"use client";

import * as React from "react";
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonField,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import {
  getAdminProjectsAction,
  getAdminBudgetStatsAction,
  createProjectAction,
  reportProjectProgressAction,
} from "@/features/projects/actions";
import type {
  AnnualProjectDto,
  StrategicPillar,
  ProjectQuarter,
  ProjectPlanStatus,
  CreateProjectInput,
  ReportProgressInput,
} from "@/features/projects";

interface ProjectsAdminClientProps {
  initialProjects: AnnualProjectDto[];
  initialStats: {
    fiscalYear: number;
    totalProjects: number;
    totalAllocated: number;
    totalSpent: number;
    overallBurnRate: number;
    completedCount: number;
    inProgressCount: number;
    delayedCount: number;
    pillarBreakdown: Record<string, { allocated: number; spent: number; count: number }>;
  };
  canManage: boolean;
  canReport: boolean;
}

export function ProjectsAdminClient({
  initialProjects,
  initialStats,
  canManage,
  canReport,
}: ProjectsAdminClientProps) {
  const [projects, setProjects] = React.useState<AnnualProjectDto[]>(initialProjects);
  const [stats, setStats] = React.useState(initialStats);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pillarFilter, setPillarFilter] = React.useState<string>("ALL");
  const [quarterFilter, setQuarterFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<AnnualProjectDto | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = React.useState<CreateProjectInput>({
    title: "",
    fiscalYear: 2569,
    pillar: "DHAMMA_STUDY",
    quarter: "Q1",
    department: "ภาควิชาพระพุทธศาสนา",
    responsiblePerson: "",
    responsibleEmail: "",
    allocatedBudget: 100000,
    targetKpi: "",
    startDate: "",
    endDate: "",
    remarks: "",
  });

  // Report Form State
  const [reportForm, setReportForm] = React.useState<ReportProgressInput>({
    projectId: "",
    progressPercent: 0,
    spentAmount: 0,
    reportNote: "",
    reporterName: "",
    actualResult: "",
    status: "IN_PROGRESS",
  });

  const reloadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        getAdminProjectsAction({ fiscalYear: 2569 }),
        getAdminBudgetStatsAction(2569),
      ]);
      if (pRes.ok) setProjects(pRes.data);
      if (sRes.ok) setStats(sRes.data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createProjectAction(createForm);
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถจัดทำโครงการได้");
        return;
      }
      toast.success("จัดทำโครงการใหม่ในแผนประจำปีเรียบร้อยแล้ว");
      setIsCreateOpen(false);
      setCreateForm({
        title: "",
        fiscalYear: 2569,
        pillar: "DHAMMA_STUDY",
        quarter: "Q1",
        department: "ภาควิชาพระพุทธศาสนา",
        responsiblePerson: "",
        responsibleEmail: "",
        allocatedBudget: 100000,
        targetKpi: "",
        startDate: "",
        endDate: "",
        remarks: "",
      });
      await reloadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReportModal = (project: AnnualProjectDto) => {
    setSelectedProject(project);
    setReportForm({
      projectId: project.id,
      progressPercent: project.progressPercent,
      spentAmount: 0,
      reportNote: "",
      reporterName: project.responsiblePerson,
      actualResult: project.actualResult || "",
      status: project.status,
    });
    setIsReportOpen(true);
  };

  const handleSaveProgressReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await reportProjectProgressAction(reportForm);
      if (!res.ok) {
        toast.error(res.error.message || "ไม่สามารถบันทึกรายงานความก้าวหน้าได้");
        return;
      }
      toast.success("บันทึกความก้าวหน้าและการเบิกจ่ายงบประมาณสำเร็จ");
      setIsReportOpen(false);
      await reloadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (pillarFilter !== "ALL" && p.pillar !== pillarFilter) return false;
    if (quarterFilter !== "ALL" && p.quarter !== quarterFilter) return false;
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = p.projectCode.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchPerson = p.responsiblePerson.toLowerCase().includes(q);
      const matchDept = (p.department || "").toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchPerson && !matchDept) return false;
    }
    return true;
  });

  const getPillarBadge = (pillar: StrategicPillar) => {
    switch (pillar) {
      case "DHAMMA_STUDY":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            ยุทธศาสตร์ที่ 1: พระพุทธศาสนา
          </span>
        );
      case "RESEARCH_INNOVATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20">
            ยุทธศาสตร์ที่ 2: วิจัยนวัตกรรม
          </span>
        );
      case "ACADEMIC_SERVICES":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            ยุทธศาสตร์ที่ 3: บริการวิชาการ
          </span>
        );
      case "CULTURE_PRESERVATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            ยุทธศาสตร์ที่ 4: ศิลปวัฒนธรรม
          </span>
        );
      case "ORGANIZATION_EXCELLENCE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            ยุทธศาสตร์ที่ 5: การบริหารสู่เลิศ
          </span>
        );
      default:
        return <span className="text-xs">{pillar}</span>;
    }
  };

  const getStatusBadge = (status: ProjectPlanStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            เสร็จสิ้น (100%)
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Clock className="h-3.5 w-3.5" />
            กำลังดำเนินการ
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <FileCheck className="h-3.5 w-3.5" />
            อนุมัติในแผน
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            ล่าช้ากว่าแผน
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
            เสนอแผนงาน
          </span>
        );
    }
  };

  const getQuarterBadge = (quarter: ProjectQuarter) => {
    switch (quarter) {
      case "Q1": return <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">Q1 (ต.ค.-ธ.ค.)</span>;
      case "Q2": return <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Q2 (ม.ค.-มี.ค.)</span>;
      case "Q3": return <span className="font-bold text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">Q3 (เม.ย.-มิ.ย.)</span>;
      case "Q4": return <span className="font-bold text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">Q4 (ก.ค.-ก.ย.)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            แผนโครงการและงบประมาณประจำปี {stats.fiscalYear}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            บริหารจัดการแผนงานโครงการ การจัดสรรงบประมาณรายไตรมาส อัตราการเบิกจ่าย (Burn Rate) และผลสัมฤทธิ์ตัวชี้วัด (KPIs)
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            จัดทำโครงการใหม่
          </Button>
        )}
      </div>

      {/* KPI & Budget Burn Rate Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-2">
          <div className="text-xs font-medium text-muted-foreground">งบประมาณจัดสรรทั้งสิ้น</div>
          <div className="text-2xl font-bold text-foreground">
            ฿{stats.totalAllocated.toLocaleString("th-TH")}
          </div>
          <div className="text-[11px] text-muted-foreground">รวม {stats.totalProjects} โครงการในแผนงาน</div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-2">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">เบิกจ่ายแล้วจริง (Spent)</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ฿{stats.totalSpent.toLocaleString("th-TH")}
          </div>
          <div className="text-[11px] text-muted-foreground">
            คงเหลือ ฿{(stats.totalAllocated - stats.totalSpent).toLocaleString("th-TH")}
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-2">
          <div className="text-xs font-medium text-primary flex items-center justify-between">
            <span>อัตราการเบิกจ่าย (Burn Rate)</span>
            <span className="font-bold">{stats.overallBurnRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                stats.overallBurnRate >= 80
                  ? "bg-emerald-500"
                  : stats.overallBurnRate >= 50
                  ? "bg-amber-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(stats.overallBurnRate, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground">เป้าหมายขั้นต่ำ 85% ต่อปีงบประมาณ</div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 backdrop-blur-sm space-y-2">
          <div className="text-xs font-medium text-muted-foreground">สถานะโครงการ</div>
          <div className="flex items-center gap-3 pt-1">
            <div>
              <div className="text-lg font-bold text-emerald-600">{stats.completedCount}</div>
              <div className="text-[10px] text-muted-foreground">เสร็จสิ้น</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.inProgressCount}</div>
              <div className="text-[10px] text-muted-foreground">ดำเนินการ</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-lg font-bold text-rose-600">{stats.delayedCount}</div>
              <div className="text-[10px] text-muted-foreground">ล่าช้า</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Pillars Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(stats.pillarBreakdown).map(([pillarKey, pStats]) => (
          <div
            key={pillarKey}
            className={`p-3 rounded-xl border bg-card cursor-pointer transition-all hover:border-primary/50 ${
              pillarFilter === pillarKey ? "ring-2 ring-primary border-primary" : ""
            }`}
            onClick={() => setPillarFilter(pillarFilter === pillarKey ? "ALL" : pillarKey)}
          >
            <div className="text-xs font-bold text-foreground truncate">
              {pillarKey === "DHAMMA_STUDY"
                ? "1. พระพุทธศาสนา"
                : pillarKey === "RESEARCH_INNOVATION"
                ? "2. วิจัยนวัตกรรม"
                : pillarKey === "ACADEMIC_SERVICES"
                ? "3. บริการวิชาการ"
                : pillarKey === "CULTURE_PRESERVATION"
                ? "4. ศิลปวัฒนธรรม"
                : "5. บริหารสู่เลิศ"}
            </div>
            <div className="text-sm font-semibold text-primary mt-1">
              ฿{pStats.allocated.toLocaleString("th-TH")}
            </div>
            <div className="text-[11px] text-muted-foreground flex justify-between items-center mt-0.5">
              <span>{pStats.count} โครงการ</span>
              <span>ใช้ไป {pStats.allocated > 0 ? Math.round((pStats.spent / pStats.allocated) * 100) : 0}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl border bg-card space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาตามรหัสโครงการ, ชื่อโครงการ, ผู้รับผิดชอบ หรือส่วนงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">ไตรมาสทั้งหมด</option>
              <option value="Q1">ไตรมาส 1 (ต.ค. - ธ.ค.)</option>
              <option value="Q2">ไตรมาส 2 (ม.ค. - มี.ค.)</option>
              <option value="Q3">ไตรมาส 3 (เม.ย. - มิ.ย.)</option>
              <option value="Q4">ไตรมาส 4 (ก.ค. - ก.ย.)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PROPOSED">เสนอแผนงาน</option>
              <option value="APPROVED">อนุมัติในแผน</option>
              <option value="IN_PROGRESS">กำลังดำเนินการ</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="DELAYED">ล่าช้ากว่าแผน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">รหัส / ไตรมาส</th>
                <th className="py-3.5 px-4 font-semibold">โครงการ / ยุทธศาสตร์</th>
                <th className="py-3.5 px-4 font-semibold">งบประมาณ / เบิกจ่าย</th>
                <th className="py-3.5 px-4 font-semibold">ความก้าวหน้า</th>
                <th className="py-3.5 px-4 font-semibold">เป้าหมายตัวชี้วัด (KPI)</th>
                <th className="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Target className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    ไม่พบโครงการตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{p.projectCode}</div>
                      <div className="mt-1">{getQuarterBadge(p.quarter)}</div>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <div className="mb-1">{getPillarBadge(p.pillar)}</div>
                      <div className="font-semibold text-foreground truncate" title={p.title}>
                        {p.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.responsiblePerson} ({p.department || "คณะพุทธศาสตร์"})
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        จัดสรร: ฿{p.allocatedBudget.toLocaleString("th-TH")}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        ใช้ไป: ฿{p.spentBudget.toLocaleString("th-TH")} ({p.burnRate}%)
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-foreground">{p.progressPercent}%</span>
                        {getStatusBadge(p.status)}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            p.progressPercent >= 100
                              ? "bg-emerald-500"
                              : p.status === "DELAYED"
                              ? "bg-rose-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs text-xs">
                      <div className="text-foreground line-clamp-2" title={p.targetKpi}>
                        {p.targetKpi}
                      </div>
                      {p.actualResult && (
                        <div className="text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-1">
                          ผลจริง: {p.actualResult}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(p);
                          setIsDetailOpen(true);
                        }}
                      >
                        รายละเอียด
                      </Button>
                      {canReport && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenReportModal(p)}
                          className="gap-1"
                        >
                          รายงานผล
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Project Detail */}
      {selectedProject && (
        <LiyonDialog open={isDetailOpen} onOpenChange={setIsDetailOpen} wide>
          <LiyonDialogCloseButton label="ปิด" />
          <LiyonDialogHeader
            title={
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {selectedProject.projectCode}
                </span>
                <span>{selectedProject.title}</span>
              </span>
            }
            description={`ปีงบประมาณ ${selectedProject.fiscalYear} · ${selectedProject.responsiblePerson} (${selectedProject.department || "คณะพุทธศาสตร์"})`}
          />

          <LiyonDialogBody>
            <div className="space-y-6 text-sm">
              <div className="flex flex-wrap gap-2">
                {getPillarBadge(selectedProject.pillar)}
                {getQuarterBadge(selectedProject.quarter)}
                {getStatusBadge(selectedProject.status)}
              </div>

              {/* Budget & Progress Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="text-xs text-muted-foreground">งบประมาณที่จัดสรร</div>
                  <div className="text-lg font-bold text-foreground">
                    ฿{selectedProject.allocatedBudget.toLocaleString("th-TH")}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="text-xs text-muted-foreground">งบประมาณที่เบิกจ่ายแล้ว</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ฿{selectedProject.spentBudget.toLocaleString("th-TH")} ({selectedProject.burnRate}%)
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="text-xs text-muted-foreground">ความก้าวหน้าโครงการ</div>
                  <div className="text-lg font-bold text-primary">
                    {selectedProject.progressPercent}%
                  </div>
                </div>
              </div>

              {/* KPI Description */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  เป้าหมายตัวชี้วัดความสำเร็จ (Target KPI)
                </div>
                <div className="text-foreground leading-relaxed">
                  {selectedProject.targetKpi}
                </div>
                {selectedProject.actualResult && (
                  <div className="pt-2 border-t mt-2">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      ผลการดำเนินงานจริง (Actual Result)
                    </div>
                    <div className="text-foreground mt-0.5">
                      {selectedProject.actualResult}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress History Updates */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ประวัติการรายงานความก้าวหน้าและการเบิกจ่าย (Updates)
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedProject.updates && selectedProject.updates.length > 0 ? (
                    selectedProject.updates.map((u) => (
                      <div key={u.id} className="p-3 rounded-lg border bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            รายงานโดย: {u.reporterName} (ก้าวหน้า {u.progressPercent}%)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(u.createdAt).toLocaleString("th-TH")}
                          </span>
                        </div>
                        {u.spentAmount > 0 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            เบิกจ่ายเพิ่มในรอบนี้: ฿{u.spentAmount.toLocaleString("th-TH")} บาท
                          </div>
                        )}
                        <div className="text-foreground bg-muted/40 p-2 rounded mt-1">
                          &ldquo;{u.reportNote}&rdquo;
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      ยังไม่มีรายการบันทึกรายงานความก้าวหน้า
                    </div>
                  )}
                </div>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              ปิดหน้าต่าง
            </Button>
          </LiyonDialogFooter>
        </LiyonDialog>
      )}

      {/* Modal: Report Progress & Spending */}
      {selectedProject && (
        <LiyonDialog open={isReportOpen} onOpenChange={setIsReportOpen} wide>
          <LiyonDialogCloseButton label="ปิด" />
          <LiyonDialogHeader
            title={`รายงานความก้าวหน้า: ${selectedProject.title}`}
            description={`รหัสโครงการ ${selectedProject.projectCode} · งบจัดสรร ฿${selectedProject.allocatedBudget.toLocaleString("th-TH")}`}
          />

          <form onSubmit={handleSaveProgressReport}>
            <LiyonDialogBody>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiyonField label="ความก้าวหน้ารวม (%)">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={reportForm.progressPercent}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, progressPercent: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                  <LiyonField label="จำนวนเงินที่เบิกจ่ายเพิ่มในรอบนี้ (บาท)">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={reportForm.spentAmount}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, spentAmount: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LiyonField label="สถานะโครงการปัจจุบัน">
                    <select
                      value={reportForm.status}
                      onChange={(e) =>
                        setReportForm((f) => ({
                          ...f,
                          status: e.target.value as ProjectPlanStatus,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    >
                      <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                      <option value="COMPLETED">เสร็จสิ้นสมบูรณ์ (100%)</option>
                      <option value="DELAYED">ล่าช้ากว่าแผน</option>
                    </select>
                  </LiyonField>
                  <LiyonField label="ชื่อผู้รายงาน">
                    <input
                      type="text"
                      required
                      value={reportForm.reporterName}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, reporterName: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                    />
                  </LiyonField>
                </div>

                <LiyonField label="บันทึกรายละเอียดความก้าวหน้า">
                  <textarea
                    rows={3}
                    required
                    value={reportForm.reportNote}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, reportNote: e.target.value }))
                    }
                    placeholder="ระบุกิจกรรมที่ได้ดำเนินการเสร็จแล้ว ผลการจัดงาน หรืออุปสรรค..."
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground leading-relaxed"
                  />
                </LiyonField>

                <LiyonField label="ผลสัมฤทธิ์ตามตัวชี้วัดจริง (Actual Result)">
                  <input
                    type="text"
                    value={reportForm.actualResult || ""}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, actualResult: e.target.value }))
                    }
                    placeholder="เช่น ผู้เข้าร่วมประชุมวิชาการ 240 รูป/คน บรรลุตามเป้าหมาย"
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReportOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกรายงานความก้าวหน้า
              </Button>
            </LiyonDialogFooter>
          </form>
        </LiyonDialog>
      )}

      {/* Modal: Create Project */}
      <LiyonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} wide>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title="จัดทำโครงการใหม่ในแผนประจำปี"
          description={`ปีงบประมาณ 2569 · ระบบจะกำหนดรหัสโครงการ PRJ-2569-XXX ให้อัตโนมัติ`}
        />

        <form onSubmit={handleCreateProject}>
          <LiyonDialogBody>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LiyonField label="ยุทธศาสตร์หลัก">
                  <select
                    value={createForm.pillar}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, pillar: e.target.value as StrategicPillar }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  >
                    <option value="DHAMMA_STUDY">ยุทธศาสตร์ที่ 1: พระพุทธศาสนาและวิชาการ</option>
                    <option value="RESEARCH_INNOVATION">ยุทธศาสตร์ที่ 2: การวิจัยและนวัตกรรม</option>
                    <option value="ACADEMIC_SERVICES">ยุทธศาสตร์ที่ 3: การบริการวิชาการแก่สังคม</option>
                    <option value="CULTURE_PRESERVATION">ยุทธศาสตร์ที่ 4: ศิลปวัฒนธรรมและภูมิปัญญา</option>
                    <option value="ORGANIZATION_EXCELLENCE">ยุทธศาสตร์ที่ 5: การบริหารสู่ความเป็นเลิศ</option>
                  </select>
                </LiyonField>
                <LiyonField label="กำหนดไตรมาสที่ดำเนินงาน">
                  <select
                    value={createForm.quarter}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, quarter: e.target.value as ProjectQuarter }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  >
                    <option value="Q1">ไตรมาส 1 (ตุลาคม - ธันวาคม)</option>
                    <option value="Q2">ไตรมาส 2 (มกราคม - มีนาคม)</option>
                    <option value="Q3">ไตรมาส 3 (เมษายน - มิถุนายน)</option>
                    <option value="Q4">ไตรมาส 4 (กรกฎาคม - กันยายน)</option>
                  </select>
                </LiyonField>
              </div>

              <LiyonField label="ชื่อโครงการ">
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="เช่น โครงการสัมมนาพระไตรปิฎกศึกษาและวิชาการพุทธศาสตร์นานาชาติ"
                  className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                />
              </LiyonField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <LiyonField label="ผู้รับผิดชอบโครงการ">
                  <input
                    type="text"
                    required
                    value={createForm.responsiblePerson}
                    onChange={(e) => setCreateForm((f) => ({ ...f, responsiblePerson: e.target.value }))}
                    placeholder="รศ.ดร. ..."
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>
                <LiyonField label="ส่วนงาน / ภาควิชา">
                  <input
                    type="text"
                    value={createForm.department || ""}
                    onChange={(e) => setCreateForm((f) => ({ ...f, department: e.target.value }))}
                    placeholder="ภาควิชาพระพุทธศาสนา"
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>
                <LiyonField label="งบประมาณจัดสรร (บาท)">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={createForm.allocatedBudget}
                    onChange={(e) => setCreateForm((f) => ({ ...f, allocatedBudget: Number(e.target.value) }))}
                    placeholder="เช่น 250000"
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground"
                  />
                </LiyonField>
              </div>

              <LiyonField label="เป้าหมายตัวชี้วัดความสำเร็จ (KPI)">
                <textarea
                  rows={3}
                  required
                  value={createForm.targetKpi}
                  onChange={(e) => setCreateForm((f) => ({ ...f, targetKpi: e.target.value }))}
                  placeholder="เช่น ผู้เข้าร่วมไม่น้อยกว่า 200 รูป/คน และระดับความพึงพอใจเฉลี่ย 4.5 ขึ้นไป"
                  className="w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground leading-relaxed"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Plus className="h-4 w-4" />
              บันทึกโครงการเข้าแผนงาน
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
