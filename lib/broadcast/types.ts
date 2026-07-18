export type BroadcastChannel = "sms" | "whatsapp" | "telegram";
export type BroadcastStatus = "draft" | "scheduled" | "sent";

export interface BroadcastMessage {
  id: string;
  projectId: string;
  channel: BroadcastChannel;
  title: string;
  body: string;
  status: BroadcastStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface BroadcastInput {
  channel: BroadcastChannel;
  title: string;
  body: string;
  status?: BroadcastStatus;
  scheduledAt?: string | null;
}
