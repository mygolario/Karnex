/**
 * Zibal Payment Gateway
 * 
 * Implements the PaymentGateway interface using the existing lib/zibal.ts functions.
 * Connects to Zibal's API for payment processing in Iran.
 * 
 * API Documentation: https://docs.zibal.ir/IPG/API
 */

import { 
  PaymentGateway, 
  PaymentParams, 
  PaymentSession, 
  PaymentResult, 
  RefundResult 
} from '../types';
import { zibalRequest, zibalVerify } from '@/lib/zibal';

interface ZibalConfig {
  merchant?: string; // Falls back to env ZIBAL_MERCHANT
}

export class ZibalGateway implements PaymentGateway {
  name = 'zibal';
  private config: ZibalConfig;
  
  constructor(config: ZibalConfig = {}) {
    this.config = config;
  }
  
  /**
   * Create a payment session with Zibal
   * Amount in PaymentParams should be in Tomans — we convert to Rials for Zibal
   */
  async createSession(params: PaymentParams): Promise<PaymentSession> {
    // Zibal expects Rials, our prices are in Tomans
    const amountInRials = params.amount * 10;
    
    const description = params.description || `خرید پلن - کارنکس`;
    
    // Build callback URL with metadata
    const callbackUrl = params.callbackUrl || params.returnUrl;
    
    // Generate an orderId for tracking
    const orderId = `${params.planId}_${params.userId.slice(0, 8)}_${Date.now()}`;
    
    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl,
      undefined, // mobile
      orderId
    );
    
    if (!paymentUrl) {
      throw new Error('Zibal payment request failed. Try again later.');
    }
    
    // Extract trackId from the payment URL (format: https://gateway.zibal.ir/start/{trackId})
    const trackId = paymentUrl.split('/start/')[1];
    
    return {
      sessionId: trackId,
      redirectUrl: paymentUrl,
      authority: trackId, // Store trackId as authority for compatibility
    };
  }
  
  /**
   * Verify a payment using the trackId returned by Zibal callback
   */
  async verifyPayment(trackId: string): Promise<PaymentResult> {
    const verifyResult = await zibalVerify(trackId);
    
    if (!verifyResult) {
      return {
        success: false,
        error: {
          code: 'VERIFY_FAILED',
          message: 'خطا در تأیید پرداخت. لطفاً با پشتیبانی تماس بگیرید.',
        },
      };
    }
    
    // Zibal result codes:
    // 100 = Success
    // 201 = Already verified
    const isSuccess = verifyResult.result === 100 || verifyResult.result === 201;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: trackId,
        refId: verifyResult.refNumber?.toString(),
        cardPan: verifyResult.cardNumber,
      };
    }
    
    return {
      success: false,
      error: {
        code: `ZIBAL_${verifyResult.result}`,
        message: verifyResult.message || 'پرداخت ناموفق بود.',
        details: `Status: ${verifyResult.status}, Result: ${verifyResult.result}`,
      },
    };
  }
  
  /**
   * Refund is not supported via Zibal API — requires manual processing
   */
  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    return {
      success: false,
      error: {
        code: 'REFUND_NOT_SUPPORTED',
        message: 'بازگشت وجه نیاز به پردازش دستی دارد. لطفاً با پشتیبانی تماس بگیرید.',
      },
    };
  }
}
