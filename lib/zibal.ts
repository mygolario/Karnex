
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

const ZIBAL_API_URL = "https://gateway.zibal.ir/v1";

export const zibalRequest = async (amount: number, description: string, callbackUrl: string, mobile?: string, orderId?: string): Promise<string | null> => {
  const merchant = process.env.ZIBAL_MERCHANT || "zibal"; // 'zibal' is sandbox
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

    try {
      const res = await fetch(`${ZIBAL_API_URL}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          merchant,
          amount, // In Rials
          callbackUrl,
          description,
          mobile,
          orderId
        })
      });
      clearTimeout(timeoutId);

      const data: ZibalRequestResult = await res.json();
    
    if (data.result === 100) {
      return `https://gateway.zibal.ir/start/${data.trackId}`;
    } else {
        console.error("Zibal Request Error:", data);
        return null;
    }
  } catch (error) {
    console.error("Zibal Network Error:", error);
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
