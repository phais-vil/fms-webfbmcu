import type { PermissionDef } from "@/shared/lib/permission-def";

export const ROOMS_P = {
  roomsRead: "rooms:read",
  roomsBook: "rooms:book",
  roomsManage: "rooms:manage",
} as const;

export const ROOMS_PERMISSIONS: readonly PermissionDef[] = [
  { code: ROOMS_P.roomsRead, module: "rooms", action: "read", description: "ดูข้อมูลห้องประชุมและตารางการใช้งานในระบบหลังบ้าน" },
  { code: ROOMS_P.roomsBook, module: "rooms", action: "book", description: "ยื่นคำขอจองห้องประชุมและห้องเรียน" },
  { code: ROOMS_P.roomsManage, module: "rooms", action: "manage", description: "จัดการข้อมูลห้อง อนุมัติหรือปฏิเสธคำขอจองห้อง" },
];
