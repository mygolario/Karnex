import type { AccountBundle } from "@/app/dashboard/account/page";

export interface AccountSectionProps {
  bundle: AccountBundle;
  refresh: () => Promise<void>;
}
