import { prisma } from "@/shared/lib/infra/prisma";
import type {
  AttendanceCourse,
  AttendanceSession,
  AttendanceRecord,
  Prisma,
} from "@/generated/prisma";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateSessionInput,
  OpenSessionInput,
  StudentCheckInInput,
  UpdateRecordStatusInput,
} from "./validations";

export type AttendanceCourseDto = AttendanceCourse & {
  sessions?: AttendanceSessionDto[];
  _count?: { sessions: number };
};

export type AttendanceSessionDto = AttendanceSession & {
  course?: AttendanceCourse | null;
  records?: AttendanceRecordDto[];
  _count?: { records: number };
};

export type AttendanceRecordDto = AttendanceRecord & {
  session?: (AttendanceSession & { course?: AttendanceCourse | null }) | null;
};

export async function listAttendanceCourses(
  tenantId: string,
  options?: { semester?: string; search?: string }
): Promise<AttendanceCourseDto[]> {
  const where: Prisma.AttendanceCourseWhereInput = { tenantId };
  if (options?.semester) where.semester = options.semester;
  if (options?.search) {
    const q = options.search.trim();
    where.OR = [
      { courseCode: { contains: q, mode: "insensitive" } },
      { courseNameTh: { contains: q, mode: "insensitive" } },
      { instructorName: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.attendanceCourse.findMany({
    where,
    include: {
      sessions: {
        orderBy: { sessionNumber: "asc" },
      },
      _count: {
        select: { sessions: true },
      },
    },
    orderBy: [{ courseCode: "asc" }, { section: "asc" }],
  });
}

export async function getAttendanceCourseById(
  tenantId: string,
  id: string
): Promise<AttendanceCourseDto | null> {
  return prisma.attendanceCourse.findFirst({
    where: { id, tenantId },
    include: {
      sessions: {
        include: {
          records: true,
          _count: { select: { records: true } },
        },
        orderBy: { sessionNumber: "asc" },
      },
    },
  });
}

export async function createAttendanceCourse(
  tenantId: string,
  input: CreateCourseInput
): Promise<AttendanceCourseDto> {
  return prisma.attendanceCourse.create({
    data: {
      tenantId,
      courseCode: input.courseCode.trim().toUpperCase(),
      courseNameTh: input.courseNameTh.trim(),
      courseNameEn: input.courseNameEn.trim(),
      section: input.section.trim(),
      semester: input.semester.trim(),
      instructorName: input.instructorName.trim(),
      roomNumber: input.roomNumber?.trim() || null,
      totalSessions: input.totalSessions,
      isActive: input.isActive,
    },
  });
}

export async function updateAttendanceCourse(
  tenantId: string,
  input: UpdateCourseInput
): Promise<AttendanceCourseDto> {
  const data: Prisma.AttendanceCourseUpdateInput = {};
  if (input.courseCode !== undefined) data.courseCode = input.courseCode.trim().toUpperCase();
  if (input.courseNameTh !== undefined) data.courseNameTh = input.courseNameTh.trim();
  if (input.courseNameEn !== undefined) data.courseNameEn = input.courseNameEn.trim();
  if (input.section !== undefined) data.section = input.section.trim();
  if (input.semester !== undefined) data.semester = input.semester.trim();
  if (input.instructorName !== undefined) data.instructorName = input.instructorName.trim();
  if (input.roomNumber !== undefined) data.roomNumber = input.roomNumber?.trim() || null;
  if (input.totalSessions !== undefined) data.totalSessions = input.totalSessions;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return prisma.attendanceCourse.update({
    where: { id: input.id, tenantId },
    data,
  });
}

export async function deleteAttendanceCourse(
  tenantId: string,
  id: string
): Promise<AttendanceCourseDto> {
  return prisma.attendanceCourse.delete({
    where: { id, tenantId },
  });
}

export async function createAttendanceSession(
  tenantId: string,
  input: CreateSessionInput
): Promise<AttendanceSessionDto> {
  return prisma.attendanceSession.create({
    data: {
      tenantId,
      courseId: input.courseId,
      sessionNumber: input.sessionNumber,
      title: input.title.trim(),
      sessionType: input.sessionType,
      sessionDate: new Date(input.sessionDate),
      startTime: input.startTime,
      endTime: input.endTime,
      status: "SCHEDULED",
    },
    include: {
      course: true,
    },
  });
}

export async function getAttendanceSessionById(
  tenantId: string,
  sessionId: string
): Promise<AttendanceSessionDto | null> {
  return prisma.attendanceSession.findFirst({
    where: { id: sessionId, tenantId },
    include: {
      course: true,
      records: {
        orderBy: { checkInTime: "asc" },
      },
      _count: {
        select: { records: true },
      },
    },
  });
}

function generateDynamicToken(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  return `ATT-${rand}${time}`;
}

export async function openAttendanceSession(
  tenantId: string,
  input: OpenSessionInput
): Promise<AttendanceSessionDto> {
  const session = await prisma.attendanceSession.findFirst({
    where: { id: input.sessionId, tenantId },
  });
  if (!session) throw new Error("Session not found");

  const qrToken = generateDynamicToken();
  const qrExpiresAt = new Date(Date.now() + input.expirySeconds * 1000);

  return prisma.attendanceSession.update({
    where: { id: input.sessionId, tenantId },
    data: {
      status: "OPEN",
      qrToken,
      qrExpiresAt,
    },
    include: {
      course: true,
      records: { orderBy: { checkInTime: "asc" } },
    },
  });
}

export async function refreshSessionQRToken(
  tenantId: string,
  sessionId: string,
  expirySeconds = 60
): Promise<{ qrToken: string; qrExpiresAt: Date }> {
  const session = await prisma.attendanceSession.findFirst({
    where: { id: sessionId, tenantId },
  });
  if (!session) throw new Error("Session not found");

  const qrToken = generateDynamicToken();
  const qrExpiresAt = new Date(Date.now() + expirySeconds * 1000);

  await prisma.attendanceSession.update({
    where: { id: sessionId, tenantId },
    data: {
      status: "OPEN",
      qrToken,
      qrExpiresAt,
    },
  });

  return { qrToken, qrExpiresAt };
}

export async function closeAttendanceSession(
  tenantId: string,
  sessionId: string
): Promise<AttendanceSessionDto> {
  return prisma.attendanceSession.update({
    where: { id: sessionId, tenantId },
    data: {
      status: "CLOSED",
      qrExpiresAt: null,
    },
    include: {
      course: true,
      records: { orderBy: { checkInTime: "asc" } },
    },
  });
}

export async function recordStudentCheckIn(
  input: StudentCheckInInput
): Promise<AttendanceRecordDto> {
  const token = input.qrToken.trim().toUpperCase();

  const session = await prisma.attendanceSession.findFirst({
    where: {
      qrToken: token,
      status: "OPEN",
    },
    include: { course: true },
  });

  if (!session) {
    throw new Error("รหัสเช็คชื่อไม่ถูกต้อง หรือคาบเรียนไม่ได้เปิดรับการเช็คชื่อ");
  }

  if (session.qrExpiresAt && new Date() > new Date(session.qrExpiresAt)) {
    throw new Error("รหัส QR Code นี้หมดอายุแล้ว กรุณาสแกนรหัสใหม่จากหน้าจออาจารย์");
  }

  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      sessionId: session.id,
      studentCode: input.studentCode.trim(),
    },
  });

  if (existing) {
    throw new Error("ท่านได้ลงทะเบียนเช็คชื่อในคาบเรียนนี้เรียบร้อยแล้ว");
  }

  return prisma.attendanceRecord.create({
    data: {
      tenantId: session.tenantId,
      sessionId: session.id,
      studentCode: input.studentCode.trim(),
      studentName: input.studentName.trim(),
      majorProgram: input.majorProgram?.trim() || null,
      status: "PRESENT",
    },
    include: {
      session: {
        include: { course: true },
      },
    },
  });
}

export async function updateRecordStatus(
  tenantId: string,
  input: UpdateRecordStatusInput
): Promise<AttendanceRecordDto> {
  return prisma.attendanceRecord.update({
    where: { id: input.recordId, tenantId },
    data: {
      status: input.status,
      remarks: input.remarks?.trim() || null,
    },
    include: {
      session: {
        include: { course: true },
      },
    },
  });
}

export async function getStudentAttendanceSummary(
  studentCode: string
): Promise<{
  studentCode: string;
  courses: Array<{
    courseId: string;
    courseCode: string;
    courseNameTh: string;
    totalSessions: number;
    attendedCount: number;
    percentage: number;
    isEligible: boolean;
    records: AttendanceRecordDto[];
  }>;
}> {
  const code = studentCode.trim();

  const records = await prisma.attendanceRecord.findMany({
    where: { studentCode: code },
    include: {
      session: {
        include: { course: true },
      },
    },
    orderBy: { checkInTime: "desc" },
  });

  const courseMap: Record<string, {
    courseId: string;
    courseCode: string;
    courseNameTh: string;
    totalSessions: number;
    records: AttendanceRecordDto[];
  }> = {};

  for (const r of records) {
    const course = r.session?.course;
    if (!course) continue;
    if (!courseMap[course.id]) {
      courseMap[course.id] = {
        courseId: course.id,
        courseCode: course.courseCode,
        courseNameTh: course.courseNameTh,
        totalSessions: course.totalSessions || 16,
        records: [],
      };
    }
    courseMap[course.id].records.push(r as AttendanceRecordDto);
  }

  const courses = Object.values(courseMap).map((c) => {
    const attendedCount = c.records.filter((rec) =>
      rec.status === "PRESENT" || rec.status === "LATE" || rec.status === "EXCUSED"
    ).length;
    const percentage = Math.round((attendedCount / c.totalSessions) * 100);
    return {
      ...c,
      attendedCount,
      percentage,
      isEligible: percentage >= 80,
    };
  });

  return {
    studentCode: code,
    courses,
  };
}
