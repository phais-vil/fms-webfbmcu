import "server-only";

export {
  listAdminCurriculums,
  listPublicCurriculums,
  getPublicCurriculumByCode,
  type CurriculumDto,
  listAdminDepartments,
  getDepartmentById,
  type AcademicDepartmentDto,
} from "./_internal/services";

export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";

