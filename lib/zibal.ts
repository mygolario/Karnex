
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

export const zibalRequest = async (amount: number, description: string, callbackUrl: string, mobile?: string, orderId?: string): Promise<string | null> => {
  const merchant = process.env.ZIBAL_MERCHANT;
  if (!merchant) {
    console.error("[Zibal] ❌ ZIBAL_MERCHANT env var is not set. Cannot process payment.");
    return null;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

  try {
    const requestBody = {
      merchant,
      amount, // In Rials
      callbackUrl,
      description,
      mobile,
      orderId
    };
    
    const res = await fetch(`${ZIBAL_API_URL}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
    clearTimeout(timeoutId);

    const data: ZibalRequestResult = await res.json();
  
    if (data.result === 100) {
      const paymentUrl = `https://gateway.zibal.ir/start/${data.trackId}`;
      return paymentUrl;
    } else {
      console.error("[Zibal] ❌ Payment request failed:", ZIBAL_ERROR_CODES[data.result] || data.message, "| Code:", data.result);
      return null;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[Zibal] ❌ Network Error:", error);
    return null;
  }
};


export const zibalVerify = async (trackId: string): Promise<ZibalVerifyResult | null> => {
    const merchant = process.env.ZIBAL_MERCHANT || "zibal";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${ZIBAL_API_URL}/verify`, { // ...
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          merchant,
          trackId
        })
      });
      clearTimeout(timeoutId);
  
      const data: ZibalVerifyResult = await res.json();
      return data;

    } catch (error) {
      console.error("Zibal Verify Error:", error);
      return null;
    }
  };
