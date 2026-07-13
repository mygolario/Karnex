"use client";

import type { Appointment, AppointmentInput } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const appointmentsApi = {
  async list(projectId: string): Promise<{ appointments: Appointment[] }> {
    return json(fetch(`/api/projects/${projectId}/appointments`));
  },
  async create(projectId: string, input: AppointmentInput): Promise<{ appointment: Appointment }> {
    return json(
      fetch(`/api/projects/${projectId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
  async update(
    projectId: string,
    id: string,
    input: Partial<AppointmentInput>
  ): Promise<{ appointment: Appointment }> {
    return json(
      fetch(`/api/projects/${projectId}/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type { Appointment, AppointmentInput };
