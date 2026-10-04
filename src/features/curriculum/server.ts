import "server-only";

export {
  listAdminCurriculums,
  listPublicCurriculums,
  getPublicCurriculumByCode,
  type CurriculumDto,
  listAdminDepartments,
  getDepartmentById,
  type AcademicDepartmentDto,
  listAdminSchedules,
  getScheduleById,
  listPublicSchedules,
  getPublicScheduleById,
  getPublicSchedulesByCurriculum,
  type ClassScheduleDto,
  type ClassScheduleItemDto,
} from "./_internal/services";

export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";

