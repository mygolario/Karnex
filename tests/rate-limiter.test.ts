import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rateLimiter } from '@/lib/rate-limiter'
import { clearRateLimits } from '@/lib/rate-limiter-memory'
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
    clearRateLimits()
    vi.useFakeTimers()
  })

  it('should allow requests under the limit', async () => {
    const req = createMockRequest('192.168.1.10')
    
    // First request should be allowed
    const result = await rateLimiter(req)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })

  it('should track requests per IP', async () => {
    const req1 = createMockRequest('192.168.1.21')
    const req2 = createMockRequest('192.168.1.22')
    
    // Requests from different IPs should be tracked separately
    const result1 = await rateLimiter(req1)
    const result2 = await rateLimiter(req2)
    
    expect(result1.remaining).toBe(result2.remaining)
  })

  it('should block after exceeding limit', async () => {
    const req = createMockRequest('192.168.1.30')
    
    // Make 31 requests (limit is 30)
    for (let i = 0; i < 30; i++) {
      await rateLimiter(req)
    }
    
    const result = await rateLimiter(req)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})
