import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimiter } from '@/lib/rate-limiter'
import { NextRequest } from 'next/server'

// Create a mock NextRequest
function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return {
    headers: new Map([['x-forwarded-for', ip]]) as any
  } as NextRequest
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit map before each test
    vi.useFakeTimers()
  })

  it('should allow requests under the limit', () => {
    const req = createMockRequest('192.168.1.1')
    
    // First request should be allowed
    const result = rateLimiter(req)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })

  it('should track requests per IP', () => {
    const req1 = createMockRequest('192.168.1.1')
    const req2 = createMockRequest('192.168.1.2')
    
    // Requests from different IPs should be tracked separately
    const result1 = rateLimiter(req1)
    const result2 = rateLimiter(req2)
    
    expect(result1.remaining).toBe(result2.remaining)
  })

  it('should block after exceeding limit', () => {
    const req = createMockRequest('192.168.1.100')
    
    // Make 31 requests (limit is 30)
    for (let i = 0; i < 30; i++) {
      rateLimiter(req)
    }
    
    const result = rateLimiter(req)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})
