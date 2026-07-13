export type AppointmentStatus = "booked" | "done" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  projectId: string;
  customerName: string;
  customerPhone: string | null;
  service: string | null;
  startAt: string;
  endAt: string | null;
  status: AppointmentStatus;
  note: string | null;
  createdAt: string;
}

export interface AppointmentInput {
  customerName: string;
  customerPhone?: string | null;
  service?: string | null;
  startAt: string;
  endAt?: string | null;
  status?: AppointmentStatus;
  note?: string | null;
}
