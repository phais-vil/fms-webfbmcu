import { describe, it, expect } from "vitest";
import { createRoomSchema, createBookingSchema } from "./validations";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("rooms validations", () => {
  it("passes validation with valid room data", () => {
    const validData = {
      code: "RM-401",
      nameTh: "ห้องประชุม 401 สำนักงานคณบดี",
      nameEn: "Meeting Room 401",
      building: "อาคารเรียนรวม",
      floor: "ชั้น 4",
      capacity: 30,
      roomType: "MEETING" as const,
      facilities: "โปรเจกเตอร์, จอสัมผัส",
      isActive: true,
      displayOrder: 1,
    };

    const parsed = createRoomSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("fails room validation when required fields are missing", () => {
    const invalidData = {
      code: "",
      nameTh: "",
      nameEn: "",
      building: "",
      capacity: 0,
    };

    const parsed = createRoomSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.code).toBeDefined();
      expect(fieldErrors.nameTh).toBeDefined();
      expect(fieldErrors.capacity).toBeDefined();
    }
  });

  it("passes booking validation with valid times", () => {
    const validBooking = {
      roomId: VALID_UUID,
      title: "การประชุมคณะกรรมการบริหารคณะ",
      bookingDate: "2026-10-15",
      startTime: "09:00",
      endTime: "12:00",
      attendeesCount: 15,
      organizerName: "พระมหาธีระ ปญฺญาธีโร",
      organizerEmail: "teera@mcu.ac.th",
      organizerPhone: "081-234-5678",
      department: "สำนักงานคณบดี",
    };

    const parsed = createBookingSchema.safeParse(validBooking);
    expect(parsed.success).toBe(true);
  });

  it("fails booking validation when startTime >= endTime", () => {
    const invalidBooking = {
      roomId: VALID_UUID,
      title: "การประชุมผิดเวลา",
      bookingDate: "2026-10-15",
      startTime: "14:00",
      endTime: "10:00", // invalid: end before start
      attendeesCount: 5,
      organizerName: "ทดสอบ",
      organizerEmail: "test@mcu.ac.th",
      organizerPhone: "081-234-5678",
    };

    const parsed = createBookingSchema.safeParse(invalidBooking);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path.includes("endTime"))).toBe(true);
    }
  });
});
