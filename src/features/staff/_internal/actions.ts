"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STAFF_P } from "../permissions";
import { createStaffProfileSchema, updateStaffProfileSchema } from "./validations";
import {
  listStaffDepartments,
  listAdminStaff,
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  toggleStaffActive,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

export async function getStaffDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return listStaffDepartments(ctx.tenantId);
  });
}

export async function getAdminStaffAction(filter?: {
  departmentId?: string;
  search?: string;
}): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return listAdminStaff(ctx.tenantId, filter);
  });
}

export async function createStaffProfileAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffCreate);
    const parsed = createStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}

export async function updateStaffProfileAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffEdit);
    const parsed = updateStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}

export async function deleteStaffProfileAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffDelete);
    await deleteStaffProfile(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
  });
}

export async function toggleStaffActiveAction(id: string): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffEdit);
    const result = await toggleStaffActive(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}
