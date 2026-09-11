import { requireSession } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { LiyonCard } from "@/shared/components/liyon";
import { FileText, FileCheck2, Users, Receipt, Briefcase, Activity, AlertCircle } from "lucide-react";
import { formatDate } from "@/shared/lib/format";
import Link from "next/link";

export const metadata = { title: "Executive Dashboard - FMS" };

export default async function DashboardPage() {
  const ctx = await requireSession();
  const t = await getT();
  const tenantId = ctx.tenantId;

  // 1. Fetch Aggregated Metrics
  const [
    projectsData,
    pendingDocs,
    pendingRequests,
    publishedNews,
    totalStaff,
    attendanceToday,
    auditLogs
  ] = await Promise.all([
    // Projects & Budget
    prisma.annualProject.aggregate({
      where: { tenantId, fiscalYear: 2569 },
      _sum: { allocatedBudget: true, spentBudget: true },
      _count: { id: true },
    }),
    // Documents
    prisma.facultyDocument.count({
      where: { tenantId, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
    }),
    // Student Requests
    prisma.studentRequest.count({
      where: { tenantId, status: "PENDING" },
    }),
    // News
    prisma.newsArticle.count({
      where: { tenantId, status: "PUBLISHED" },
    }),
    // Staff
    prisma.staffProfile.count({
      where: { tenantId, isActive: true },
    }),
    // Attendance (Today)
    prisma.attendanceRecord.count({
      where: {
        tenantId,
        checkInTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        }
      },
    }),
    // Activity Stream (Audit Logs)
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true, imageUrl: true } } },
    })
  ]);

  const allocated = Number(projectsData._sum.allocatedBudget || 0);
  const spent = Number(projectsData._sum.spentBudget || 0);
  const burnRate = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : "0.0";
  const projectCount = projectsData._count.id;

  const kpis = [
    { label: "งบประมาณประจำปี (บาท)", value: allocated.toLocaleString(), sub: `ใช้ไปแล้ว ${spent.toLocaleString()} บ.`, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "อัตราการเบิกจ่าย (Burn Rate)", value: `${burnRate}%`, sub: `จาก ${projectCount} โครงการ`, icon: Activity, color: "text-cyan-600", bg: "bg-cyan-500/10" },
    { label: "เอกสารรออนุมัติ", value: pendingDocs.toLocaleString(), sub: "E-Approval Workflow", icon: FileText, color: "text-amber-600", bg: "bg-amber-500/10", link: "/admin/documents" },
    { label: "คำร้องนิสิตใหม่", value: pendingRequests.toLocaleString(), sub: "Student Services", icon: FileCheck2, color: "text-rose-600", bg: "bg-rose-500/10", link: "/admin/student-services" },
    { label: "การเข้าเรียนวันนี้", value: attendanceToday.toLocaleString(), sub: "Smart Attendance", icon: Users, color: "text-purple-600", bg: "bg-purple-500/10", link: "/admin/attendance" },
    { label: "บุคลากรสายวิชาการ", value: totalStaff.toLocaleString(), sub: "Staff Directory", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-500/10", link: "/admin/staff" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Executive Cockpit
        </h1>
        <p className="text-sm text-slate-500">
          {t("dash.welcome", { name: ctx.userName })} · สรุปภาพรวมสถานะการดำเนินงานของคณะ
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <LiyonCard key={idx} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              {kpi.link && (
                <Link href={kpi.link} className="text-xs font-medium text-brand-600 hover:underline">
                  ดูรายละเอียด &rarr;
                </Link>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {kpi.value}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          </LiyonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-600" />
            Live Audit Trail (Activity Stream)
          </h2>
          <LiyonCard className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">ไม่มีความเคลื่อนไหวล่าสุด</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {log.actor?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={log.actor.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        {log.actor?.name.charAt(0) || "S"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      {log.actor?.name || "System"} <span className="text-slate-500 font-normal">performed</span> <span className="text-brand-600 font-mono text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10">{log.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono">{log.entity}</span>
                      <span>&bull;</span>
                      <span>ID: {log.entityId}</span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {formatDate(log.createdAt, ctx.locale ?? "th")}
                  </div>
                </div>
              ))
            )}
          </LiyonCard>
        </div>

        {/* System Health / Quick Alerts */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            System Highlights
          </h2>
          <LiyonCard className="p-5 space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Public Portal (News)</p>
                <p className="text-lg font-bold">{publishedNews} <span className="text-xs font-normal text-slate-500">Active</span></p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">E-Approval Bottlenecks</p>
                <p className="text-lg font-bold text-amber-600">{pendingDocs} <span className="text-xs font-normal text-slate-500">Pending</span></p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${pendingDocs > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: pendingDocs > 10 ? '100%' : `${pendingDocs * 10}%` }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/admin/projects" className="block w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 py-2.5 rounded-lg transition-colors">
                View Strategic Projects
              </Link>
            </div>
          </LiyonCard>
        </div>
      </div>
    </div>
  );
}
