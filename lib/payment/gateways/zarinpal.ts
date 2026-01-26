/**
 * Zarinpal Payment Gateway (Placeholder)
 * 
 * This is a placeholder implementation for when Zarinpal credentials are available.
 * Implements the PaymentGateway interface for seamless switching.
 * 
 * Zarinpal API Documentation: https://docs.zarinpal.com/
 */

import { 
  PaymentGateway, 
  PaymentParams, 
  PaymentSession, 
  PaymentResult, 
  RefundResult 
} from '../types';

interface ZarinpalConfig {
  merchantId: string;
  sandbox?: boolean;
}

export class ZarinpalGateway implements PaymentGateway {
  name = 'zarinpal';
  private config: ZarinpalConfig;
  
  constructor(config: ZarinpalConfig) {
    this.config = config;
  }
  
  private get baseUrl(): string {
    return this.config.sandbox 
      ? 'https://sandbox.zarinpal.com/pg'
      : 'https://api.zarinpal.com/pg';
  }
  
  private get paymentUrl(): string {
    return this.config.sandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://www.zarinpal.com/pg/StartPay';
  }
  
  async createSession(params: PaymentParams): Promise<PaymentSession> {
    // TODO: Implement when Zarinpal credentials are available
    // 
    // API Endpoint: POST /v4/payment/request.json
    // Request Body:
    // {
    //   "merchant_id": this.config.merchantId,
    //   "amount": params.amount, // In Rials
    //   "callback_url": params.callbackUrl,
    //   "description": params.description,
    //   "metadata": {
    //     "email": params.userEmail,
    //     "order_id": params.metadata?.orderId
    //   }
    // }
    //
    // Response:
    // {
    //   "data": {
    //     "authority": "A00000000000000000000000000217885159",
    //     "code": 100,
    //     "message": "Success"
    //   }
    // }
    
    throw new Error(
      'Zarinpal gateway is not yet configured. ' +
      'Please provide merchantId in payment configuration.'
    );
  }
  
  async verifyPayment(authority: string): Promise<PaymentResult> {
    // TODO: Implement when Zarinpal credentials are available
    //
    // API Endpoint: POST /v4/payment/verify.json
    // Request Body:
    // {
    //   "merchant_id": this.config.merchantId,
    //   "authority": authority,
    //   "amount": amount // Must match original amount
    // }
    //
    // Response:
    // {
    //   "data": {
    //     "code": 100, // or 101 for already verified
    //     "ref_id": 1234567890,
    //     "card_pan": "6037998123456789",
    //     "card_hash": "..."
    //   }
    // }
    
    throw new Error(
      'Zarinpal gateway is not yet configured. ' +
      'Please provide merchantId in payment configuration.'
    );
  }
  
  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    // Note: Zarinpal requires contacting support for refunds
    // This is a placeholder for the API if they add automated refunds
    
    return {
      success: false,
      error: {
        code: 'REFUND_NOT_SUPPORTED',
        message: 'Zarinpal refunds require manual processing. Please contact support.',
      },
    };
  }
}

// Helper to convert Tomans to Rials (Zarinpal uses Rials)
export function tomansToRials(tomans: number): number {
  return tomans * 10;
}

// Helper to convert Rials to Tomans
export function rialsToTomans(rials: number): number {
  return Math.floor(rials / 10);
}

// Format price for display (Persian format)
export function formatPricePersian(amount: number, currency: 'IRR' | 'IRT' = 'IRT'): string {
  const formatter = new Intl.NumberFormat('fa-IR');
  const suffix = currency === 'IRR' ? 'ریال' : 'تومان';
  return `${formatter.format(amount)} ${suffix}`;
}
