import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface ZibalRequestResult {
  trackId: number;
  result: number;
  message: string;
}

interface ZibalVerifyResult {
  paidAt?: string;
  amount?: number;
  result: number;
  status?: number;
  refNumber?: number;
  description?: string;
  cardNumber?: string;
  orderId?: string;
  message?: string;
}

// Zibal error code descriptions
const ZIBAL_ERROR_CODES: Record<number, string> = {
  100: "عملیات موفق",
  102: "مرچنت یافت نشد",
  103: "مرچنت غیرفعال است",
  104: "مرچنت نامعتبر است",
  105: "مبلغ باید بیشتر از ۱۰۰۰ ریال باشد",
  106: "callbackUrl نامعتبر است (باید با http شروع شود)",
  113: "مبلغ تراکنش از سقف مجاز بیشتر است",
  201: "قبلاً تأیید شده است",
  202: "سفارش پرداخت نشده یا ناموفق بوده است",
  203: "trackId نامعتبر است"
};

const ZIBAL_API_URL = "https://gateway.zibal.ir/v1";

// Build an axios client scoped to Zibal. When FIXIE_URL is set, outbound calls are
// routed through the Fixie static-IP proxy so they originate from the IPs whitelisted
// in the Zibal gateway panel. When FIXIE_URL is absent, calls go direct (local dev).
function createZibalClient(timeoutMs: number): AxiosInstance {
  const client = axios.create({
    baseURL: ZIBAL_API_URL,
    timeout: timeoutMs,
    headers: { "Content-Type": "application/json" },
  });

  const fixieUrl = process.env.FIXIE_URL;
  if (fixieUrl) {
    client.defaults.httpsAgent = new HttpsProxyAgent(fixieUrl);
    // Disable axios' own proxy/env handling so our custom agent is actually used.
    client.defaults.proxy = false;
  }

  return client;
}

export const zibalRequest = async (amount: number, description: string, callbackUrl: string, mobile?: string, orderId?: string): Promise<string | null> => {
  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) {
    console.error("[Zibal] ❌ ZIBAL_MERCHANT env var is not set. Cannot process payment.");
    return null;
  }

  try {
    const requestBody = {
      merchant,
      amount, // In Rials
      callbackUrl,
      description,
      mobile,
      orderId
    };

    const client = createZibalClient(60000); // 60 seconds timeout
    const response = await client.post<ZibalRequestResult>("/request", requestBody);
    const data = response.data;

    if (data.result === 100) {
      const paymentUrl = `https://gateway.zibal.ir/start/${data.trackId}`;
      return paymentUrl;
    } else {
      console.error("[Zibal] ❌ Payment request failed:", ZIBAL_ERROR_CODES[data.result] || data.message, "| Code:", data.result);
      return null;
    }
  } catch (error) {
    console.error("[Zibal] ❌ Network Error:", error);
    return null;
  }
};


export const zibalVerify = async (trackId: string): Promise<ZibalVerifyResult | null> => {
  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) {
    console.error("[Zibal] ❌ ZIBAL_MERCHANT env var is not set. Cannot verify payment.");
    return null;
  }

  try {
    const client = createZibalClient(30000); // 30 seconds timeout
    const response = await client.post<ZibalVerifyResult>("/verify", {
      merchant,
      trackId
    });

    return response.data;
  } catch (error) {
    console.error("Zibal Verify Error:", error);
    return null;
  }
};
