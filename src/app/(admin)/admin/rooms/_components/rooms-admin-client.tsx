"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Check,
  X,
  DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonSelect,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { RoomDto, RoomBookingDto, RoomType } from "@/features/rooms";
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  toggleRoomActiveAction,
  approveBookingAction,
  rejectBookingAction,
  cancelBookingAction,
} from "@/features/rooms/actions";

interface RoomsAdminClientProps {
  initialRooms: RoomDto[];
  initialBookings: RoomBookingDto[];
  canManage: boolean;
}

interface RoomFormData {
  id?: string;
  code: string;
  nameTh: string;
  nameEn: string;
  building: string;
  floor: string;
  capacity: number;
  roomType: RoomType;
  facilities: string;
  coverImage: string;
  isActive: boolean;
  displayOrder: number;
}

export function RoomsAdminClient({
  initialRooms,
  initialBookings,
  canManage,
}: RoomsAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const isThai = locale === "th";

  const [activeTab, setActiveTab] = useState<"bookings" | "rooms" | "schedule">("bookings");
  const [rooms, setRooms] = useState<RoomDto[]>(initialRooms);
  const [bookings, setBookings] = useState<RoomBookingDto[]>(initialBookings);

  // Filter states for bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingRoomFilter, setBookingRoomFilter] = useState("ALL");
  const [bookingSearch, setBookingSearch] = useState("");

  // Filter states for rooms
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [roomSearch, setRoomSearch] = useState("");

  // Schedule date filter
  const todayStr = new Date().toISOString().split("T")[0];
  const [scheduleDate, setScheduleDate] = useState(todayStr);

  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<RoomDto | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RoomBookingDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const initialRoomForm: RoomFormData = {
    code: "",
    nameTh: "",
    nameEn: "",
    building: "อาคารเรียนรวม มจร",
    floor: "ชั้น 4",
    capacity: 30,
    roomType: "MEETING",
    facilities: "โปรเจกเตอร์, ไมโครโฟนไร้สาย 2 ตัว, ระบบปรับอากาศ, จอภาพ LCD",
    coverImage: "",
    isActive: true,
    displayOrder: 0,
  };

  const [roomForm, setRoomForm] = useState<RoomFormData>(initialRoomForm);

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === "ALL" || b.status === bookingStatusFilter;
    const matchesRoom = bookingRoomFilter === "ALL" || b.roomId === bookingRoomFilter;
    const matchesSearch =
      bookingSearch.trim() === "" ||
      b.title.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.organizerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.department && b.department.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      b.roomNameTh.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesRoom && matchesSearch;
  });

  // Filtered Rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesType = roomTypeFilter === "ALL" || r.roomType === roomTypeFilter;
    const matchesSearch =
      roomSearch.trim() === "" ||
      r.code.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.nameTh.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.building.toLowerCase().includes(roomSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Schedule Bookings
  const scheduleBookings = bookings.filter(
    (b) => b.bookingDate === scheduleDate && (b.status === "APPROVED" || b.status === "PENDING")
  );

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  // Booking Actions
  const handleApproveBooking = (id: string) => {
    startTransition(async () => {
      const res = await approveBookingAction(id);
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === res.data.id ? res.data : b)));
        toast.success(isThai ? "อนุมัติการจองห้องเรียบร้อยแล้ว" : "Booking approved successfully");
      } else {
        toast.error(res.error.message || "Failed to approve booking");
      }
    });
  };

  const handleOpenRejectDialog = (b: RoomBookingDto) => {
    setSelectedBooking(b);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectBooking = () => {
    if (!selectedBooking) return;
    if (!rejectionReason.trim()) {
      toast.error(isThai ? "กรุณาระบุเหตุผลที่ไม่อนุมัติ" : "Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      const res = await rejectBookingAction(selectedBooking.id, rejectionReason);
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === res.data.id ? res.data : b)));
        toast.success(isThai ? "ปฏิเสธคำขอจองห้องแล้ว" : "Booking rejected");
        setRejectDialogOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error(res.error.message || "Failed to reject booking");
      }
    });
  };

  const handleCancelBooking = (id: string) => {
    startTransition(async () => {
      const res = await cancelBookingAction(id);
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as const } : b))
        );
        toast.success(isThai ? "ยกเลิกการจองเรียบร้อยแล้ว" : "Booking cancelled");
      } else {
        toast.error(res.error.message || "Failed to cancel booking");
      }
    });
  };

  // Room Actions
  const openCreateRoomDialog = () => {
    setRoomForm(initialRoomForm);
    setSelectedRoom(null);
    setRoomDialogOpen(true);
  };

  const openEditRoomDialog = (r: RoomDto) => {
    setSelectedRoom(r);
    setRoomForm({
      id: r.id,
      code: r.code,
      nameTh: r.nameTh,
      nameEn: r.nameEn,
      building: r.building,
      floor: r.floor || "",
      capacity: r.capacity,
      roomType: r.roomType,
      facilities: r.facilities || "",
      coverImage: r.coverImage || "",
      isActive: r.isActive,
      displayOrder: r.displayOrder,
    });
    setRoomDialogOpen(true);
  };

  const handleSaveRoom = () => {
    if (!roomForm.code.trim() || !roomForm.nameTh.trim() || !roomForm.nameEn.trim()) {
      toast.error(isThai ? "กรุณากรอกรหัสและชื่อห้องทั้งไทย-อังกฤษ" : "Please fill in code and room name in both languages");
      return;
    }

    startTransition(async () => {
      if (roomForm.id) {
        const res = await updateRoomAction(roomForm);
        if (res.ok) {
          setRooms((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
          toast.success(isThai ? "บันทึกข้อมูลห้องสำเร็จ" : "Room updated successfully");
          setRoomDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to update room");
        }
      } else {
        const res = await createRoomAction(roomForm);
        if (res.ok) {
          setRooms((prev) => [...prev, res.data]);
          toast.success(isThai ? "เพิ่มห้องใหม่สำเร็จ" : "Room created successfully");
          setRoomDialogOpen(false);
        } else {
          toast.error(res.error.message || "Failed to create room");
        }
      }
    });
  };

  const handleToggleRoomActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleRoomActiveAction(id);
      if (res.ok) {
        setRooms((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
        toast.success(
          res.data.isActive
            ? isThai ? "เปิดให้บริการห้องนี้แล้ว" : "Room is now active"
            : isThai ? "ปิดการให้บริการห้องนี้แล้ว" : "Room is now inactive"
        );
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDeleteRoom = () => {
    if (!selectedRoom) return;
    startTransition(async () => {
      const res = await deleteRoomAction(selectedRoom.id);
      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
        setBookings((prev) => prev.filter((b) => b.roomId !== selectedRoom.id));
        toast.success(isThai ? "ลบห้องเรียบร้อยแล้ว" : "Room deleted");
        setDeleteRoomDialogOpen(false);
        setSelectedRoom(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <StatusPill tone="ok">{t("rooms.status.approved")}</StatusPill>;
      case "PENDING":
        return <StatusPill tone="warn">{t("rooms.status.pending")}</StatusPill>;
      case "REJECTED":
        return <StatusPill tone="bad">{t("rooms.status.rejected")}</StatusPill>;
      case "CANCELLED":
        return <StatusPill tone="off">{t("rooms.status.cancelled")}</StatusPill>;
      default:
        return <StatusPill tone="off">{status}</StatusPill>;
    }
  };

  const getRoomTypeBadge = (type: RoomType) => {
    switch (type) {
      case "MEETING":
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-2 py-0.5 rounded font-medium">{t("rooms.type.meeting")}</span>;
      case "CLASSROOM":
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2 py-0.5 rounded font-medium">{t("rooms.type.classroom")}</span>;
      case "SEMINAR":
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs px-2 py-0.5 rounded font-medium">{t("rooms.type.seminar")}</span>;
      case "MEDITATION":
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs px-2 py-0.5 rounded font-medium">{t("rooms.type.meditation")}</span>;
      case "AUDITORIUM":
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs px-2 py-0.5 rounded font-medium">{t("rooms.type.auditorium")}</span>;
      default:
        return <span>{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("rooms.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("rooms.subtitle")}</p>
        </div>
        {canManage && activeTab === "rooms" && (
          <Button onClick={openCreateRoomDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("rooms.createRoom")}
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "bookings"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("rooms.tab.bookings")}</span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "rooms"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("rooms.tab.rooms")}</span>
          <span className="text-xs text-muted-foreground">({rooms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "schedule"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{t("rooms.tab.schedule")}</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isThai ? "ค้นหาหัวข้อ, ผู้จอง หรือหน่วยงาน..." : "Search title, organizer..."}
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="w-full sm:w-48">
                <LiyonSelect
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="ALL">{isThai ? "ทุกสถานะ" : "All Statuses"}</option>
                  <option value="PENDING">{t("rooms.status.pending")}</option>
                  <option value="APPROVED">{t("rooms.status.approved")}</option>
                  <option value="REJECTED">{t("rooms.status.rejected")}</option>
                  <option value="CANCELLED">{t("rooms.status.cancelled")}</option>
                </LiyonSelect>
              </div>
              <div className="w-full sm:w-64">
                <LiyonSelect
                  value={bookingRoomFilter}
                  onChange={(e) => setBookingRoomFilter(e.target.value)}
                >
                  <option value="ALL">{isThai ? "ทุกห้อง" : "All Rooms"}</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {isThai ? r.nameTh : r.nameEn}
                    </option>
                  ))}
                </LiyonSelect>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
                  <tr>
                    <th className="py-3.5 px-4">{isThai ? "สถานะ" : "Status"}</th>
                    <th className="py-3.5 px-4">{isThai ? "ห้องประชุม" : "Room"}</th>
                    <th className="py-3.5 px-4">{isThai ? "หัวข้อการประชุม / กิจกรรม" : "Meeting / Title"}</th>
                    <th className="py-3.5 px-4">{isThai ? "วันและเวลา" : "Date & Time"}</th>
                    <th className="py-3.5 px-4">{isThai ? "ผู้จอง / สังกัด" : "Organizer"}</th>
                    <th className="py-3.5 px-4 text-center">{isThai ? "จำนวน" : "Attendees"}</th>
                    <th className="py-3.5 px-4 text-right">{isThai ? "การดำเนินการ" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        {t("rooms.portal.empty")}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          {getStatusBadge(b.status)}
                          {b.status === "REJECTED" && b.rejectionReason && (
                            <p className="text-[11px] text-destructive mt-1 max-w-[150px] truncate" title={b.rejectionReason}>
                              {b.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">
                            {isThai ? b.roomNameTh : b.roomNameEn}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {b.roomCode} ({b.building} {b.floor})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="font-medium text-foreground truncate" title={b.title}>
                            {b.title}
                          </div>
                          {b.description && (
                            <div className="text-xs text-muted-foreground truncate" title={b.description}>
                              {b.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{b.bookingDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{b.startTime} - {b.endTime} น.</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-foreground">{b.organizerName}</div>
                          <div className="text-muted-foreground">{b.department || b.organizerEmail}</div>
                          <div className="text-muted-foreground">{b.organizerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-semibold">{b.attendeesCount}</span>
                          <span className="text-xs text-muted-foreground ml-1">{isThai ? "คน" : "pax"}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canManage && b.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveBooking(b.id)}
                                  disabled={isPending}
                                  className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  title={t("rooms.approve")}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="text-xs">{t("rooms.approve")}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleOpenRejectDialog(b)}
                                  disabled={isPending}
                                  className="h-8 gap-1"
                                  title={t("rooms.reject")}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="text-xs">{t("rooms.reject")}</span>
                                </Button>
                              </>
                            )}
                            {canManage && b.status === "APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBooking(b.id)}
                                disabled={isPending}
                                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                              >
                                {isThai ? "ยกเลิก" : "Cancel"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOMS LIST */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isThai ? "ค้นหารหัส, ชื่อห้อง หรืออาคาร..." : "Search room code, name, building..."}
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="w-full sm:w-56">
                <LiyonSelect
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                >
                  <option value="ALL">{t("rooms.portal.allTypes")}</option>
                  <option value="MEETING">{t("rooms.type.meeting")}</option>
                  <option value="CLASSROOM">{t("rooms.type.classroom")}</option>
                  <option value="SEMINAR">{t("rooms.type.seminar")}</option>
                  <option value="MEDITATION">{t("rooms.type.meditation")}</option>
                  <option value="AUDITORIUM">{t("rooms.type.auditorium")}</option>
                </LiyonSelect>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
                  <tr>
                    <th className="py-3.5 px-4">{t("rooms.field.code")}</th>
                    <th className="py-3.5 px-4">{isThai ? "ชื่อห้อง" : "Room Name"}</th>
                    <th className="py-3.5 px-4">{t("rooms.field.roomType")}</th>
                    <th className="py-3.5 px-4">{isThai ? "อาคาร / ชั้น" : "Building / Floor"}</th>
                    <th className="py-3.5 px-4 text-center">{t("rooms.field.capacity")}</th>
                    <th className="py-3.5 px-4">{t("rooms.field.facilities")}</th>
                    <th className="py-3.5 px-4 text-center">{isThai ? "สถานะ" : "Status"}</th>
                    <th className="py-3.5 px-4 text-right">{isThai ? "จัดการ" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <DoorOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        {t("rooms.portal.empty")}
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          {r.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">
                            {isThai ? r.nameTh : r.nameEn}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isThai ? r.nameEn : r.nameTh}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getRoomTypeBadge(r.roomType)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {r.building} {r.floor && `(${r.floor})`}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-semibold">{r.capacity}</span>
                          <span className="text-xs text-muted-foreground ml-1">{isThai ? "ที่นั่ง" : "seats"}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[200px] truncate" title={r.facilities || ""}>
                          {r.facilities || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {canManage ? (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleToggleRoomActive(r.id)}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {r.isActive ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {isThai ? "เปิดให้จอง" : "Active"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                                  <XCircle className="h-3.5 w-3.5" />
                                  {isThai ? "ปิดปรับปรุง" : "Inactive"}
                                </span>
                              )}
                            </button>
                          ) : (
                            r.isActive ? (
                              <span className="text-xs text-emerald-600 font-medium">{isThai ? "เปิดให้จอง" : "Active"}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{isThai ? "ปิดปรับปรุง" : "Inactive"}</span>
                            )
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canManage && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditRoomDialog(r)}
                                  className="h-8 w-8 p-0"
                                  title={t("rooms.editRoom")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRoom(r);
                                    setDeleteRoomDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                  title={t("rooms.deleteRoom")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE OVERVIEW */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">{isThai ? "เลือกวันที่ดูตารางการใช้ห้อง:" : "Select Date:"}</span>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="px-3 py-1.5 border rounded-md bg-background text-sm font-medium"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {isThai ? `พบการใช้งาน ${scheduleBookings.length} รายการ ในวันที่เลือก` : `${scheduleBookings.length} events on this date`}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const roomEvents = scheduleBookings.filter((b) => b.roomId === room.id);
              return (
                <div key={room.id} className="card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">{room.code}</span>
                      <h3 className="font-bold text-base text-foreground mt-0.5">
                        {isThai ? room.nameTh : room.nameEn}
                      </h3>
                      <p className="text-xs text-muted-foreground">{room.building} {room.floor}</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded font-medium text-foreground">
                      {room.capacity} {isThai ? "ที่นั่ง" : "seats"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {roomEvents.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                        {isThai ? "ไม่มีการใช้งานในวันนี้ (ห้องว่าง)" : "No events scheduled (Available)"}
                      </div>
                    ) : (
                      roomEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            evt.status === "APPROVED"
                              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {evt.startTime} - {evt.endTime} น.
                            </span>
                            {getStatusBadge(evt.status)}
                          </div>
                          <p className="font-semibold text-foreground text-sm">{evt.title}</p>
                          <p className="text-muted-foreground">{evt.organizerName} ({evt.department || evt.organizerPhone})</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialog: Create / Edit Room */}
      <LiyonDialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen} wide>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={roomForm.id ? t("rooms.editRoom") : t("rooms.createRoom")}
          description={t("rooms.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("rooms.field.code")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={roomForm.code}
                onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                placeholder="เช่น RM-401, CONF-DEAN"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm font-mono"
              />
            </LiyonField>
            <LiyonField label={<>{t("rooms.field.roomType")} <span className="text-destructive">*</span></>}>
              <LiyonSelect
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value as RoomType })}
              >
                <option value="MEETING">{t("rooms.type.meeting")}</option>
                <option value="CLASSROOM">{t("rooms.type.classroom")}</option>
                <option value="SEMINAR">{t("rooms.type.seminar")}</option>
                <option value="MEDITATION">{t("rooms.type.meditation")}</option>
                <option value="AUDITORIUM">{t("rooms.type.auditorium")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={<>{t("rooms.field.nameTh")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={roomForm.nameTh}
                onChange={(e) => setRoomForm({ ...roomForm, nameTh: e.target.value })}
                placeholder="เช่น ห้องประชุม 401 สำนักงานคณบดี"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("rooms.field.nameEn")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={roomForm.nameEn}
                onChange={(e) => setRoomForm({ ...roomForm, nameEn: e.target.value })}
                placeholder="e.g. Meeting Room 401 (Dean's Office)"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LiyonField label={<>{t("rooms.field.building")} <span className="text-destructive">*</span></>}>
              <input
                type="text"
                value={roomForm.building}
                onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                placeholder="เช่น อาคารเรียนรวม มจร"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={t("rooms.field.floor")}>
              <input
                type="text"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                placeholder="เช่น ชั้น 4"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={<>{t("rooms.field.capacity")} <span className="text-destructive">*</span></>}>
              <input
                type="number"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <LiyonField label={t("rooms.field.facilities")}>
            <textarea
              rows={3}
              value={roomForm.facilities}
              onChange={(e) => setRoomForm({ ...roomForm, facilities: e.target.value })}
              placeholder="เช่น โปรเจกเตอร์ 4K, ไมโครโฟนไร้สาย 4 ตัว, ระบบ Zoom Rooms Hybrid, จอสัมผัสอัจฉริยะ"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("rooms.field.coverImage")}>
              <input
                type="url"
                value={roomForm.coverImage}
                onChange={(e) => setRoomForm({ ...roomForm, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
            <LiyonField label={isThai ? "ลำดับการแสดงผล" : "Display Order"}>
              <input
                type="number"
                value={roomForm.displayOrder}
                onChange={(e) => setRoomForm({ ...roomForm, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
            </LiyonField>
          </div>

          <div className="pt-2 border-t">
            <LiyonSwitchRow
              id="isRoomActiveSwitch"
              checked={roomForm.isActive}
              onCheckedChange={(checked) => setRoomForm({ ...roomForm, isActive: checked })}
              label={t("rooms.field.isActive")}
            />
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)} disabled={isPending}>
              {t("rooms.cancel")}
            </Button>
            <Button onClick={handleSaveRoom} disabled={isPending}>
              {t("rooms.save")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog: Reject Booking */}
      <LiyonDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen} danger>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("rooms.reject")}
          description={isThai ? "กรุณาระบุเหตุผลการไม่อนุมัติคำขอจองห้อง" : "Please provide rejection reason"}
        />
        <LiyonDialogBody className="space-y-4">
          {selectedBooking && (
            <div className="p-3 bg-muted rounded-md text-xs space-y-1">
              <p className="font-semibold text-foreground">{selectedBooking.title}</p>
              <p className="text-muted-foreground">{selectedBooking.roomNameTh} | {selectedBooking.bookingDate} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
              <p className="text-muted-foreground">{selectedBooking.organizerName} ({selectedBooking.organizerPhone})</p>
            </div>
          )}
          <LiyonField label={<>{t("rooms.field.rejectionReason")} <span className="text-destructive">*</span></>}>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="เช่น มีภารกิจด่วนของผู้บริหาร, ห้องอยู่ในช่วงบำรุงรักษาอุปกรณ์..."
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isPending}>
              {t("rooms.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRejectBooking} disabled={isPending}>
              {t("rooms.reject")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog: Delete Room */}
      <LiyonDialog open={deleteRoomDialogOpen} onOpenChange={setDeleteRoomDialogOpen} danger>
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={t("rooms.deleteRoom")}
          description={t("rooms.deleteRoomConfirm")}
        />
        <LiyonDialogBody>
          {selectedRoom && (
            <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono">
              <p className="font-semibold text-foreground">{selectedRoom.code}: {selectedRoom.nameTh}</p>
              <p className="text-muted-foreground">{selectedRoom.building} {selectedRoom.floor}</p>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setDeleteRoomDialogOpen(false)} disabled={isPending}>
              {t("rooms.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom} disabled={isPending}>
              {t("rooms.deleteRoom")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
