/**
 * Payment Module Index
 * 
 * Public exports for the payment system.
 */

// Types
export * from './types';

// Gateway Factory
export { 
  createGateway, 
  configurePayment, 
  getDefaultGateway,
  isGatewayAvailable,
  getAvailableGateways,
  type GatewayProvider,
} from './gateway-factory';

// Gateways
export { MockGateway, mockGateway } from './gateways/mock';
export { 
  ZarinpalGateway, 
  tomansToRials, 
  rialsToTomans, 
  formatPricePersian 
} from './gateways/zarinpal';
