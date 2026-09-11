import { z } from "zod";

export const strategicPillarSchema = z.enum([
  "DHAMMA_STUDY",
  "RESEARCH_INNOVATION",
  "ACADEMIC_SERVICES",
  "CULTURE_PRESERVATION",
  "ORGANIZATION_EXCELLENCE",
]);

export const projectQuarterSchema = z.enum(["Q1", "Q2", "Q3", "Q4"]);

export const projectPlanStatusSchema = z.enum([
  "DRAFT",
  "PROPOSED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
]);

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  fiscalYear: z.number().int().min(2560).max(2600).default(2569),
  pillar: strategicPillarSchema,
  quarter: projectQuarterSchema.default("Q1"),
  department: z.string().trim().optional(),
  responsiblePerson: z.string().trim().min(2, "Responsible person is required"),
  responsibleEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  allocatedBudget: z.number().positive("Allocated budget must be positive"),
  targetKpi: z.string().trim().min(3, "Target KPI description is required"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid("Invalid project ID"),
  status: projectPlanStatusSchema.optional(),
  actualResult: z.string().optional().nullable(),
  progressPercent: z.number().int().min(0).max(100).optional(),
});

export const reportProgressSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  progressPercent: z.number().int().min(0).max(100, "Progress must be between 0 and 100"),
  spentAmount: z.number().min(0, "Spent amount must be non-negative"),
  reportNote: z.string().trim().min(3, "Report note must be at least 3 characters"),
  reporterName: z.string().trim().min(2, "Reporter name is required"),
  actualResult: z.string().trim().optional(),
  status: projectPlanStatusSchema.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ReportProgressInput = z.infer<typeof reportProgressSchema>;
