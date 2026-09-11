"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  Users,
  Building,
  CheckCircle2,
  CalendarPlus,
  DoorOpen,
  Sparkles,
  Info,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  LiyonSelect,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { RoomDto, RoomBookingDto, RoomType } from "@/features/rooms";
import { submitBookingRequestAction } from "@/features/rooms/actions";

interface RoomsPortalClientProps {
  rooms: RoomDto[];
  bookings: RoomBookingDto[];
}

export function RoomsPortalClient({ rooms, bookings }: RoomsPortalClientProps) {
  const t = useT();
  const locale = useLocale();
  const isThai = locale === "th";

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const todayStr = new Date().toISOString().split("T")[0];
  const [scheduleDate, setScheduleDate] = useState(todayStr);

  const [isPending, startTransition] = useTransition();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccessOpen, setBookingSuccessOpen] = useState(false);

  // Booking Form State
  const initialBookingForm = {
    roomId: rooms[0]?.id || "",
    title: "",
    description: "",
    bookingDate: todayStr,
    startTime: "09:00",
    endTime: "12:00",
    attendeesCount: 10,
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    department: "",
  };

  const [bookingForm, setBookingForm] = useState(initialBookingForm);

  const filteredRooms = rooms.filter((r) => {
    const matchesType = selectedType === "ALL" || r.roomType === selectedType;
    const matchesSearch =
      search.trim() === "" ||
      r.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeDayBookings = bookings.filter(
    (b) => b.bookingDate === scheduleDate && (b.status === "APPROVED" || b.status === "PENDING")
  );

  const openBookModal = (room?: RoomDto) => {
    setBookingForm({
      ...initialBookingForm,
      roomId: room ? room.id : rooms[0]?.id || "",
      bookingDate: scheduleDate,
    });
    setBookingDialogOpen(true);
  };

  const handleSubmitBooking = () => {
    if (
      !bookingForm.roomId ||
      !bookingForm.title.trim() ||
      !bookingForm.organizerName.trim() ||
      !bookingForm.organizerEmail.trim() ||
      !bookingForm.organizerPhone.trim()
    ) {
      toast.error(
        isThai
          ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (หัวข้อ, ผู้จอง, อีเมล, เบอร์โทร)"
          : "Please fill in all required fields"
      );
      return;
    }

    if (bookingForm.startTime >= bookingForm.endTime) {
      toast.error(isThai ? "เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด" : "Start time must be before end time");
      return;
    }

    startTransition(async () => {
      const res = await submitBookingRequestAction(bookingForm);
      if (res.ok) {
        setBookingDialogOpen(false);
        setBookingSuccessOpen(true);
        toast.success(
          isThai
            ? "ยื่นคำขอจองห้องสำเร็จ เจ้าหน้าที่จะดำเนินการตรวจสอบและอนุมัติ"
            : "Booking request submitted successfully"
        );
      } else {
        toast.error(res.error.message || "Failed to submit booking request");
      }
    });
  };

  const getRoomTypeBadge = (type: RoomType) => {
    switch (type) {
      case "MEETING":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{t("rooms.type.meeting")}</span>;
      case "CLASSROOM":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{t("rooms.type.classroom")}</span>;
      case "SEMINAR":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{t("rooms.type.seminar")}</span>;
      case "MEDITATION":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{t("rooms.type.meditation")}</span>;
      case "AUDITORIUM":
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs px-2.5 py-0.5 rounded-full font-medium">{t("rooms.type.auditorium")}</span>;
      default:
        return <span>{type}</span>;
    }
  };

  const selectedRoomObj = rooms.find((r) => r.id === bookingForm.roomId);

  return (
    <div className="space-y-12">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["ALL", "MEETING", "CLASSROOM", "SEMINAR", "MEDITATION", "AUDITORIUM"].map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type === "ALL"
                  ? t("rooms.portal.allTypes")
                  : t(`rooms.type.${type.toLowerCase()}`)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isThai ? "ค้นหาห้อง หรืออาคาร..." : "Search room or building..."}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button onClick={() => openBookModal()} className="gap-1.5 shrink-0 rounded-full text-xs">
            <CalendarPlus className="h-4 w-4" />
            <span>{t("rooms.requestReservation")}</span>
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-primary" />
            <span>{isThai ? "ห้องประชุมและห้องบรรยายที่เปิดให้บริการ" : "Available Rooms & Facilities"}</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {isThai ? `ทั้งหมด ${filteredRooms.length} ห้อง` : `${filteredRooms.length} rooms`}
          </span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl p-8 space-y-3">
            <DoorOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">{t("rooms.portal.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Room Cover or Placeholder */}
                  <div className="relative h-44 w-full bg-muted/60 overflow-hidden">
                    {room.coverImage ? (
                      <img
                        src={room.coverImage}
                        alt={isThai ? room.nameTh : room.nameEn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-primary/5 via-muted to-primary/10">
                        <DoorOpen className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-xs font-bold bg-background/90 backdrop-blur-xs text-foreground px-2.5 py-1 rounded shadow-xs">
                        {room.code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {getRoomTypeBadge(room.roomType)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-foreground line-clamp-1">
                        {isThai ? room.nameTh : room.nameEn}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {room.building} {room.floor && `(${room.floor})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{room.capacity} {isThai ? "ที่นั่ง" : "seats"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{room.building}</span>
                      </div>
                    </div>

                    {room.facilities && (
                      <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>{t("rooms.field.facilities")}</span>
                        </div>
                        <p className="text-[11px] line-clamp-2 leading-relaxed">{room.facilities}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isThai ? "พร้อมให้บริการ" : "Available"}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openBookModal(room)}
                    className="gap-1.5 text-xs rounded-lg"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span>{t("rooms.book")}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Calendar Viewer */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{isThai ? "ตรวจสอบตารางการใช้งานห้องประจำวัน" : "Daily Facility Schedule"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isThai
                ? "เลือกวันที่เพื่อดูตารางการจองและเวลาว่างของแต่ละห้อง"
                : "Select a date to inspect reserved times and real-time availability"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">{isThai ? "วันที่:" : "Date:"}</span>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg bg-background text-sm font-medium shadow-xs"
            />
          </div>
        </div>

        {/* Daily Schedule List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const roomEvents = activeDayBookings.filter((b) => b.roomId === room.id);
            return (
              <div key={room.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{isThai ? room.nameTh : room.nameEn}</h4>
                    <span className="text-[11px] font-mono text-muted-foreground">{room.code}</span>
                  </div>
                  <span className="text-xs bg-background px-2 py-0.5 rounded border text-muted-foreground">
                    {room.capacity} {isThai ? "ที่นั่ง" : "seats"}
                  </span>
                </div>

                <div className="space-y-2">
                  {roomEvents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900 font-medium">
                      {isThai ? "ว่างตลอดทั้งวัน" : "Available all day"}
                    </div>
                  ) : (
                    roomEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          evt.status === "APPROVED"
                            ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200"
                            : "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1 text-primary">
                            <Clock className="h-3 w-3" />
                            {evt.startTime} - {evt.endTime} น.
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              evt.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {evt.status === "APPROVED"
                              ? isThai ? "อนุมัติแล้ว" : "Approved"
                              : isThai ? "รออนุมัติ" : "Pending"}
                          </span>
                        </div>
                        <p className="font-medium text-foreground line-clamp-1">{evt.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {evt.organizerName} {evt.department && `(${evt.department})`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Form Dialog */}
      <LiyonDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} wide>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("rooms.requestReservation")}
          description={t("rooms.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* Room Selection */}
          <LiyonField label={<>{isThai ? "เลือกห้องที่ต้องการจอง" : "Select Room"} <span className="text-destructive">*</span></>}>
            <LiyonSelect
              value={bookingForm.roomId}
              onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {isThai ? r.nameTh : r.nameEn} ({r.building} | {r.capacity} {isThai ? "ที่นั่ง" : "seats"})
                </option>
              ))}
            </LiyonSelect>
          </LiyonField>

          {selectedRoomObj && (
            <div className="p-3 bg-muted/50 rounded-lg text-xs flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>
                {selectedRoomObj.building} {selectedRoomObj.floor} | {t("rooms.field.capacity")}: {selectedRoomObj.capacity} {isThai ? "ที่นั่ง" : "seats"}
                {selectedRoomObj.facilities && ` | ${selectedRoomObj.facilities}`}
              </span>
            </div>
          )}

          {/* Title */}
          <LiyonField label={<>{t("rooms.field.title")} <span className="text-destructive">*</span></>}>
            <input
              type="text"
              value={bookingForm.title}
              onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
              placeholder="เช่น การประชุมคณะกรรมการประจำคณะพุทธศาสตร์ ครั้งที่ 4/2568"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LiyonField label={<>{t("rooms.field.bookingDate")} <span className="text-destructive">*</span></>}>
              <input
                type="date"
                value={bookingForm.bookingDate}
                onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-medium"
              />
            </LiyonField>

            <LiyonField label={<>{t("rooms.field.startTime")} <span className="text-destructive">*</span></>}>
              <input
                type="time"
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>

            <LiyonField label={<>{t("rooms.field.endTime")} <span className="text-destructive">*</span></>}>
              <input
                type="time"
                value={bookingForm.endTime}
                onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>
          </div>

          {/* Organizer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("rooms.field.organizerName")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={bookingForm.organizerName}
                onChange={(e) => setBookingForm({ ...bookingForm, organizerName: e.target.value })}
                placeholder="เช่น พระมหาวีรชัย วีรชโย / ผศ.ดร."
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>

            <LiyonField label={<>{t("rooms.field.attendeesCount")} <span className="text-destructive">*</span></>}>
              <input
                type="number"
                value={bookingForm.attendeesCount}
                onChange={(e) => setBookingForm({ ...bookingForm, attendeesCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("rooms.field.organizerEmail")} <span className="text-destructive">*</span></>}>
              <input
                type="email"
                value={bookingForm.organizerEmail}
                onChange={(e) => setBookingForm({ ...bookingForm, organizerEmail: e.target.value })}
                placeholder="example@mcu.ac.th"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>

            <LiyonField label={<>{t("rooms.field.organizerPhone")} <span className="text-destructive">*</span></>}>
              <input
                type="tel"
                value={bookingForm.organizerPhone}
                onChange={(e) => setBookingForm({ ...bookingForm, organizerPhone: e.target.value })}
                placeholder="081-234-5678"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("rooms.field.department")}>
            <input
              type="text"
              value={bookingForm.department}
              onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
              placeholder="เช่น ภาควิชาพระพุทธศาสนา, สำนักงานคณบดี"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <LiyonField label={t("rooms.field.description")}>
            <textarea
              rows={2}
              value={bookingForm.description}
              onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
              placeholder="รายละเอียดการจัดงาน หรืออุปกรณ์พิเศษที่ต้องการให้เจ้าหน้าที่เตรียมพร้อม..."
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)} disabled={isPending}>
              {t("rooms.cancel")}
            </Button>
            <Button onClick={handleSubmitBooking} disabled={isPending}>
              {t("rooms.requestReservation")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Success Notification Dialog */}
      <LiyonDialog open={bookingSuccessOpen} onOpenChange={setBookingSuccessOpen}>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={isThai ? "ยื่นคำขอจองห้องสำเร็จ" : "Reservation Request Submitted"}
          description={
            isThai
              ? "ระบบได้บันทึกคำขอจองห้องเรียบร้อยแล้ว เจ้าหน้าที่ผู้ดูแลห้องจะทำการตรวจสอบและอนุมัติผ่านระบบต่อไป"
              : "Your room booking request has been received and is pending administrative approval."
          }
        />
        <LiyonDialogBody>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              {isThai ? "สถานะคำขอ: รอการตรวจสอบและอนุมัติ (Pending)" : "Status: Pending Approval"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isThai
                ? "ท่านสามารถตรวจสอบตารางห้องได้ที่หน้านี้ หรือติดต่อสำนักงานคณบดีคณะพุทธศาสตร์"
                : "You can track room availability on this schedule or contact Dean's Office."}
            </p>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex justify-end w-full">
            <Button onClick={() => setBookingSuccessOpen(false)}>
              {isThai ? "ตกลง" : "OK"}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
