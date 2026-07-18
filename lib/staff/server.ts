import "server-only";
import prisma from "@/lib/prisma";
import type {
  Staff,
  StaffInput,
  Shift,
  ShiftInput,
  AttendanceEntry,
  AttendanceInput,
  PayrollSummary,
} from "./types";

function toStaff(s: {
  id: string;
  projectId: string;
  name: string;
  role: string | null;
  phone: string | null;
  hourlyRate: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Staff {
  return {
    id: s.id,
    projectId: s.projectId,
    name: s.name,
    role: s.role ?? null,
    phone: s.phone ?? null,
    hourlyRate: s.hourlyRate ?? null,
    active: s.active,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

function toShift(s: {
  id: string;
  staffId: string;
  projectId: string;
  startAt: Date;
  endAt: Date;
  note: string | null;
  createdAt: Date;
  staff?: { name: string } | null;
}): Shift {
  return {
    id: s.id,
    staffId: s.staffId,
    projectId: s.projectId,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    note: s.note ?? null,
    createdAt: s.createdAt.toISOString(),
    staffName: s.staff?.name,
  };
}

function toAttendance(a: {
  id: string;
  staffId: string;
  projectId: string;
  checkIn: Date;
  checkOut: Date | null;
  note: string | null;
  createdAt: Date;
  staff?: { name: string } | null;
}): AttendanceEntry {
  return {
    id: a.id,
    staffId: a.staffId,
    projectId: a.projectId,
    checkIn: a.checkIn.toISOString(),
    checkOut: a.checkOut ? a.checkOut.toISOString() : null,
    note: a.note ?? null,
    createdAt: a.createdAt.toISOString(),
    staffName: a.staff?.name,
  };
}

export async function listStaff(projectId: string): Promise<Staff[]> {
  const rows = await prisma.staff.findMany({
    where: { projectId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return rows.map(toStaff);
}

export async function createStaff(projectId: string, input: StaffInput): Promise<Staff> {
  const row = await prisma.staff.create({
    data: {
      projectId,
      name: input.name.trim(),
      role: input.role?.trim() || null,
      phone: input.phone?.trim() || null,
      hourlyRate: input.hourlyRate != null ? Number(input.hourlyRate) : null,
      active: input.active !== false,
    },
  });
  return toStaff(row);
}

export async function updateStaff(
  projectId: string,
  staffId: string,
  input: Partial<StaffInput>
): Promise<Staff> {
  const existing = await prisma.staff.findFirst({ where: { id: staffId, projectId } });
  if (!existing) throw new Error("پرسنل یافت نشد");

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.role !== undefined) data.role = input.role?.trim() || null;
  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.hourlyRate !== undefined) {
    data.hourlyRate = input.hourlyRate != null ? Number(input.hourlyRate) : null;
  }
  if (input.active !== undefined) data.active = !!input.active;

  const row = await prisma.staff.update({ where: { id: staffId }, data });
  return toStaff(row);
}

export async function deleteStaff(projectId: string, staffId: string): Promise<void> {
  const existing = await prisma.staff.findFirst({ where: { id: staffId, projectId } });
  if (!existing) throw new Error("پرسنل یافت نشد");
  await prisma.staff.delete({ where: { id: staffId } });
}

export async function listShifts(
  projectId: string,
  opts?: { weekStart?: string }
): Promise<Shift[]> {
  let start: Date;
  let end: Date;

  if (opts?.weekStart) {
    start = new Date(opts.weekStart);
    if (Number.isNaN(start.getTime())) throw new Error("تاریخ هفته نامعتبر است");
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diffToSat = (day + 1) % 7; // Saturday start of Persian week-ish
    start = new Date(now);
    start.setDate(now.getDate() - diffToSat);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  }

  const rows = await prisma.shift.findMany({
    where: {
      projectId,
      startAt: { gte: start, lt: end },
    },
    include: { staff: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });
  return rows.map(toShift);
}

export async function createShift(projectId: string, input: ShiftInput): Promise<Shift> {
  const staff = await prisma.staff.findFirst({
    where: { id: input.staffId, projectId },
    select: { id: true, name: true },
  });
  if (!staff) throw new Error("پرسنل یافت نشد");

  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new Error("زمان شیفت نامعتبر است");
  }
  if (endAt <= startAt) throw new Error("پایان شیفت باید بعد از شروع باشد");

  const row = await prisma.shift.create({
    data: {
      projectId,
      staffId: staff.id,
      startAt,
      endAt,
      note: input.note?.trim() || null,
    },
    include: { staff: { select: { name: true } } },
  });
  return toShift(row);
}

export async function checkIn(
  projectId: string,
  input: AttendanceInput
): Promise<AttendanceEntry> {
  const staff = await prisma.staff.findFirst({
    where: { id: input.staffId, projectId },
    select: { id: true, name: true },
  });
  if (!staff) throw new Error("پرسنل یافت نشد");

  const open = await prisma.attendanceEntry.findFirst({
    where: { staffId: staff.id, projectId, checkOut: null },
  });
  if (open) throw new Error("ورود باز قبلی هنوز بسته نشده است");

  const row = await prisma.attendanceEntry.create({
    data: {
      projectId,
      staffId: staff.id,
      checkIn: new Date(),
      note: input.note?.trim() || null,
    },
    include: { staff: { select: { name: true } } },
  });
  return toAttendance(row);
}

export async function checkOut(
  projectId: string,
  input: AttendanceInput
): Promise<AttendanceEntry> {
  const staff = await prisma.staff.findFirst({
    where: { id: input.staffId, projectId },
    select: { id: true, name: true },
  });
  if (!staff) throw new Error("پرسنل یافت نشد");

  const open = await prisma.attendanceEntry.findFirst({
    where: { staffId: staff.id, projectId, checkOut: null },
    orderBy: { checkIn: "desc" },
  });
  if (!open) throw new Error("ورود بازی برای این پرسنل یافت نشد");

  const row = await prisma.attendanceEntry.update({
    where: { id: open.id },
    data: {
      checkOut: new Date(),
      note: input.note?.trim() || open.note,
    },
    include: { staff: { select: { name: true } } },
  });
  return toAttendance(row);
}

/**
 * Payroll = sum of (attendance hours * hourlyRate) for each staff in the period.
 * Open check-ins (no checkOut) are ignored.
 */
export async function payrollSummary(
  projectId: string,
  opts?: { start?: string; end?: string }
): Promise<PayrollSummary> {
  const end = opts?.end ? new Date(opts.end) : new Date();
  const start = opts?.start
    ? new Date(opts.start)
    : (() => {
        const d = new Date(end);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("بازه زمانی نامعتبر است");
  }

  const staff = await prisma.staff.findMany({
    where: { projectId },
    select: { id: true, name: true, hourlyRate: true },
  });

  const entries = await prisma.attendanceEntry.findMany({
    where: {
      projectId,
      checkIn: { gte: start, lte: end },
      checkOut: { not: null },
    },
  });

  const hoursByStaff = new Map<string, number>();
  for (const e of entries) {
    if (!e.checkOut) continue;
    const ms = e.checkOut.getTime() - e.checkIn.getTime();
    const hours = Math.max(0, ms / (1000 * 60 * 60));
    hoursByStaff.set(e.staffId, (hoursByStaff.get(e.staffId) || 0) + hours);
  }

  const lines = staff
    .map((s) => {
      const hours = hoursByStaff.get(s.id) || 0;
      const rate = s.hourlyRate ?? 0;
      return {
        staffId: s.id,
        staffName: s.name,
        hourlyRate: rate,
        hours: Math.round(hours * 100) / 100,
        amount: Math.round(hours * rate),
      };
    })
    .filter((l) => l.hours > 0 || l.hourlyRate > 0);

  const totalHours = lines.reduce((a, l) => a + l.hours, 0);
  const totalAmount = lines.reduce((a, l) => a + l.amount, 0);

  return {
    period: { start: start.toISOString(), end: end.toISOString() },
    lines,
    totalHours: Math.round(totalHours * 100) / 100,
    totalAmount,
  };
}
