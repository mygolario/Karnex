"use client";

import type {
  Staff,
  StaffInput,
  Shift,
  ShiftInput,
  AttendanceEntry,
  AttendanceInput,
  PayrollSummary,
} from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const staffApi = {
  async list(projectId: string): Promise<{
    staff: Staff[];
    payroll: PayrollSummary;
  }> {
    return json(fetch(`/api/projects/${projectId}/staff`));
  },

  async create(projectId: string, input: StaffInput): Promise<{ staff: Staff }> {
    return json(
      fetch(`/api/projects/${projectId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },

  async update(
    projectId: string,
    staffId: string,
    input: Partial<StaffInput>
  ): Promise<{ staff: Staff }> {
    return json(
      fetch(`/api/projects/${projectId}/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },

  async remove(projectId: string, staffId: string): Promise<{ success: boolean }> {
    return json(
      fetch(`/api/projects/${projectId}/staff/${staffId}`, { method: "DELETE" })
    );
  },

  async listShifts(
    projectId: string,
    weekStart?: string
  ): Promise<{ shifts: Shift[] }> {
    const q = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : "";
    return json(fetch(`/api/projects/${projectId}/staff/shifts${q}`));
  },

  async createShift(projectId: string, input: ShiftInput): Promise<{ shift: Shift }> {
    return json(
      fetch(`/api/projects/${projectId}/staff/shifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },

  async attendance(
    projectId: string,
    input: AttendanceInput
  ): Promise<{ entry: AttendanceEntry }> {
    return json(
      fetch(`/api/projects/${projectId}/staff/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type {
  Staff,
  StaffInput,
  Shift,
  ShiftInput,
  AttendanceEntry,
  AttendanceInput,
  PayrollSummary,
};
