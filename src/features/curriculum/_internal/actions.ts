"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./validations";
import {
  listAdminCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  toggleCurriculumActive,
  type CurriculumDto,
  listAdminDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentActive,
  type AcademicDepartmentDto,
} from "./services";

export async function getAdminCurriculumsAction(filter?: {
  degreeLevel?: string;
  departmentId?: string;
  search?: string;
}): Promise<ActionResult<CurriculumDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listAdminCurriculums(ctx.tenantId, filter);
  });
}

export async function createCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const parsed = createCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function updateCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumEdit);
    const parsed = updateCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculum(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function deleteCurriculumAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumDelete);
    await deleteCurriculum(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
  });
}

export async function toggleCurriculumActiveAction(id: string): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumEdit);
    const result = await toggleCurriculumActive(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function getAdminDepartmentsAction(
  search?: string
): Promise<ActionResult<AcademicDepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return listAdminDepartments(ctx.tenantId, search);
  });
}

export async function createDepartmentAction(
  input: unknown
): Promise<ActionResult<AcademicDepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function updateDepartmentAction(
  input: unknown
): Promise<ActionResult<AcademicDepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumEdit);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumDelete);
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
  });
}

export async function toggleDepartmentActiveAction(
  id: string
): Promise<ActionResult<AcademicDepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumEdit);
    const result = await toggleDepartmentActive(ctx.tenantId, id);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

