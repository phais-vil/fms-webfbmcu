export {
  SessionTypeEnum,
  AttendanceStatusEnum,
  SessionStatusEnum,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CreateSessionInput,
  type OpenSessionInput,
  type StudentCheckInInput,
  type UpdateRecordStatusInput,
} from "./_internal/validations";
export type {
  AttendanceCourseDto,
  AttendanceSessionDto,
  AttendanceRecordDto,
} from "./_internal/services";
export type {
  SessionType,
  AttendanceStatus,
  SessionStatus,
} from "@/generated/prisma";
export { ATTENDANCE_P } from "./permissions";
