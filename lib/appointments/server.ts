import "server-only";
import prisma from "@/lib/prisma";
import type { Appointment, AppointmentInput, AppointmentStatus } from "./types";

function toAppointment(a: {
  id: string;
  projectId: string;
  customerName: string;
  customerPhone: string | null;
  service: string | null;
  startAt: Date;
  endAt: Date | null;
  status: string;
  note: string | null;
  createdAt: Date;
}): Appointment {
  return {
    id: a.id,
    projectId: a.projectId,
    customerName: a.customerName,
    customerPhone: a.customerPhone ?? null,
    service: a.service ?? null,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt ? a.endAt.toISOString() : null,
    status: a.status as AppointmentStatus,
    note: a.note ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function listAppointments(projectId: string): Promise<Appointment[]> {
  const rows = await prisma.appointment.findMany({
    where: { projectId },
    orderBy: { startAt: "asc" },
    take: 300,
  });
  return rows.map(toAppointment);
}

export async function createAppointment(projectId: string, input: AppointmentInput): Promise<Appointment> {
  if (!input.customerName?.trim()) throw new Error("نام مشتری الزامی است");
  if (!input.startAt) throw new Error("زمان شروع الزامی است");

  const row = await prisma.appointment.create({
    data: {
      projectId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone?.trim() || null,
      service: input.service?.trim() || null,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      status: input.status || "booked",
      note: input.note?.trim() || null,
    },
  });
  return toAppointment(row);
}

export async function updateAppointment(
  projectId: string,
  id: string,
  input: Partial<AppointmentInput>
): Promise<Appointment> {
  const existing = await prisma.appointment.findFirst({ where: { id, projectId } });
  if (!existing) throw new Error("نوبت یافت نشد");

  const data: Record<string, unknown> = {};
  if (input.customerName !== undefined) data.customerName = input.customerName.trim();
  if (input.customerPhone !== undefined) data.customerPhone = input.customerPhone?.trim() || null;
  if (input.service !== undefined) data.service = input.service?.trim() || null;
  if (input.startAt !== undefined) data.startAt = new Date(input.startAt);
  if (input.endAt !== undefined) data.endAt = input.endAt ? new Date(input.endAt) : null;
  if (input.status !== undefined) data.status = input.status;
  if (input.note !== undefined) data.note = input.note?.trim() || null;

  const row = await prisma.appointment.update({ where: { id }, data });
  return toAppointment(row);
}
