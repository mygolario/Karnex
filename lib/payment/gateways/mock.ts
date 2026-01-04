/**
 * Mock Payment Gateway
 * 
 * Simulates payment flow for development and testing.
 * Mimics the behavior of Iranian payment gateways (Shaparak-style).
 */

import { 
  PaymentGateway, 
  PaymentParams, 
  PaymentSession, 
  PaymentResult, 
  RefundResult 
} from '../types';

export class MockGateway implements PaymentGateway {
  name = 'mock';
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  private generateAuthority(): string {
    // Zarinpal-style authority format
    return 'A000000000' + this.generateId().toUpperCase();
  }
  
  async createSession(params: PaymentParams): Promise<PaymentSession> {
    // Simulate network delay
    await this.delay(300);
    
    const sessionId = this.generateId();
    const authority = this.generateAuthority();
    
    // Store session data in memory for verification
    // In production, this would be stored in a database
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`mock_payment_${sessionId}`, JSON.stringify({
        ...params,
        authority,
        createdAt: new Date().toISOString(),
      }));
    }
    
    return {
      sessionId,
      authority,
      redirectUrl: `/pay/mock?sessionId=${sessionId}&authority=${authority}&amount=${params.amount}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }
  
  async verifyPayment(token: string): Promise<PaymentResult> {
    // Simulate network delay
    await this.delay(500);
    
    // Parse the token (in real gateway, this would be verified against API)
    // For mock, we just check if session exists
    
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem(`mock_payment_${token}`);
      
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        
        // Clean up
        sessionStorage.removeItem(`mock_payment_${token}`);
        
        return {
          success: true,
          transactionId: this.generateId().toUpperCase(),
          refId: Math.random().toString().slice(2, 12),
          cardPan: '6037-99**-****-' + Math.random().toString().slice(2, 6),
        };
      }
    }
    
    // Default success for server-side verification
    return {
      success: true,
      transactionId: this.generateId().toUpperCase(),
      refId: Math.random().toString().slice(2, 12),
    };
  }
  
  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    // Simulate network delay
    await this.delay(400);
    
    // Mock always succeeds
    return {
      success: true,
      refundId: `REF_${this.generateId().toUpperCase()}`,
    };
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockGateway = new MockGateway();
