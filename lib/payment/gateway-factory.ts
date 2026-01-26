/**
 * Payment Gateway Factory
 * 
 * Factory pattern for creating payment gateway instances.
 * Makes it easy to switch between gateways or use multiple gateways.
 */

import { PaymentGateway, PaymentParams, PaymentSession, PaymentResult, RefundResult } from './types';

// Inline Mock Gateway to avoid module resolution issues
class MockGateway implements PaymentGateway {
  name = 'mock';
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  async createSession(params: PaymentParams): Promise<PaymentSession> {
    const sessionId = this.generateId();
    return {
      sessionId,
      redirectUrl: `/pay/mock?sessionId=${sessionId}&amount=${params.amount}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }
  
  async verifyPayment(token: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: this.generateId().toUpperCase(),
      refId: Math.random().toString().slice(2, 12),
    };
  }
  
  async refund(transactionId: string): Promise<RefundResult> {
    return { success: true, refundId: `REF_${this.generateId()}` };
  }
}

export type GatewayProvider = 'mock' | 'zarinpal' | 'zibal' | 'idpay' | 'stripe';

interface GatewayConfig {
  // Zarinpal
  zarinpalMerchantId?: string;
  zarinpalSandbox?: boolean;
  
  // Stripe
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  
  // Generic
  callbackBaseUrl?: string;
}

let defaultGateway: GatewayProvider = 'mock';
let gatewayConfig: GatewayConfig = {};

/**
 * Configure the payment system
 */
export function configurePayment(config: {
  defaultGateway?: GatewayProvider;
  config?: GatewayConfig;
}) {
  if (config.defaultGateway) {
    defaultGateway = config.defaultGateway;
  }
  if (config.config) {
    gatewayConfig = { ...gatewayConfig, ...config.config };
  }
}

/**
 * Create a payment gateway instance
 */
export function createGateway(provider?: GatewayProvider): PaymentGateway {
  const selectedProvider = provider || defaultGateway;
  
  switch (selectedProvider) {
    case 'mock':
      return new MockGateway();
      
    case 'zarinpal':
      // Placeholder - will be implemented when credentials are available
      throw new Error(
        'Zarinpal gateway not yet implemented. ' +
        'Please use mock gateway for testing.'
      );
      
    case 'zibal':
      throw new Error(
        'Zibal gateway not yet implemented. ' +
        'Please use mock gateway for testing.'
      );
      
    case 'idpay':
      throw new Error(
        'IDPay gateway not yet implemented. ' +
        'Please use mock gateway for testing.'
      );
      
    case 'stripe':
      throw new Error(
        'Stripe gateway not yet implemented. ' +
        'Please use mock gateway for testing.'
      );
      
    default:
      throw new Error(`Unknown gateway provider: ${selectedProvider}`);
  }
}

/**
 * Get the current default gateway provider
 */
export function getDefaultGateway(): GatewayProvider {
  return defaultGateway;
}

/**
 * Check if a gateway is available/configured
 */
export function isGatewayAvailable(provider: GatewayProvider): boolean {
  switch (provider) {
    case 'mock':
      return true;
    case 'zarinpal':
      return !!gatewayConfig.zarinpalMerchantId;
    case 'stripe':
      return !!gatewayConfig.stripeSecretKey;
    default:
      return false;
  }
}

/**
 * Get list of available gateways
 */
export function getAvailableGateways(): GatewayProvider[] {
  const gateways: GatewayProvider[] = ['mock'];
  
  if (gatewayConfig.zarinpalMerchantId) {
    gateways.push('zarinpal');
  }
  if (gatewayConfig.stripeSecretKey) {
    gateways.push('stripe');
  }
  
  return gateways;
}
