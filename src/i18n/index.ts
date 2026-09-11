import type { Dictionary } from "@/shared/lib/i18n/translate";
import { MESSAGES as core } from "./messages/core";
import { MESSAGES as identity } from "@/features/identity/messages";
import { MESSAGES as sample } from "@/features/sample/messages";
import { MESSAGES as news } from "@/features/news/messages";
import { MESSAGES as staff } from "@/features/staff/messages";
import { MESSAGES as curriculum } from "@/features/curriculum/messages";
import { MESSAGES as rooms } from "@/features/rooms/messages";
import { MESSAGES as studentServices } from "@/features/student-services/messages";
import { MESSAGES as attendance } from "@/features/attendance/messages";
import { MESSAGES as documents } from "@/features/documents/messages";
import { MESSAGES as projects } from "@/features/projects/messages";
import { MESSAGES as cms } from "@/features/portal-cms/messages";

/** พจนานุกรม UI ทั้งระบบ — feature ใหม่เพิ่มบรรทัด import ที่นี่ · key ต้องไม่ซ้ำข้าม feature */
export const UI_MESSAGES: Dictionary = { ...core, ...identity, ...sample, ...news, ...staff, ...curriculum, ...rooms, ...studentServices, ...attendance, ...documents, ...projects, ...cms };

