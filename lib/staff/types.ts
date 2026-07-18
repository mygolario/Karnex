export interface Staff {
  id: string;
  projectId: string;
  name: string;
  role: string | null;
  phone: string | null;
  hourlyRate: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffInput {
  name: string;
  role?: string | null;
  phone?: string | null;
  hourlyRate?: number | null;
  active?: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  projectId: string;
  startAt: string;
  endAt: string;
  note: string | null;
  createdAt: string;
  staffName?: string;
}

export interface ShiftInput {
  staffId: string;
  startAt: string;
  endAt: string;
  note?: string | null;
}

export interface AttendanceEntry {
  id: string;
  staffId: string;
  projectId: string;
  checkIn: string;
  checkOut: string | null;
  note: string | null;
  createdAt: string;
  staffName?: string;
}

export type AttendanceAction = "in" | "out";

export interface AttendanceInput {
  staffId: string;
  action: AttendanceAction;
  note?: string | null;
}

export interface StaffPayrollLine {
  staffId: string;
  staffName: string;
  hourlyRate: number;
  hours: number;
  amount: number;
}

export interface PayrollSummary {
  period: { start: string; end: string };
  lines: StaffPayrollLine[];
  totalHours: number;
  totalAmount: number;
}
