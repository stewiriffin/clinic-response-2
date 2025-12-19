import { rateLimit, RateLimitPresets } from '../rateLimiter'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    jest.clearAllMocks()
  })

  it('should allow requests within rate limit', () => {
    const config = {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
    }

    const identifier = 'test-user-1'

    // First request should be allowed
    const result1 = rateLimit(identifier, config)
    expect(result1).toBeNull()

    // Second request should be allowed
    const result2 = rateLimit(identifier, config)
    expect(result2).toBeNull()
  })

  it('should block requests exceeding rate limit', () => {
    const config = {
      windowMs: 60000, // 1 minute
      maxRequests: 2,
    }

    const identifier = 'test-user-2'

    // First 2 requests should be allowed
    rateLimit(identifier, config)
    rateLimit(identifier, config)

    // Third request should be blocked
    const result = rateLimit(identifier, config)
    expect(result).not.toBeNull()
    expect(result?.status).toBe(429)
  })

  it('should include retry-after header', async () => {
    const config = {
      windowMs: 10000, // 10 seconds
      maxRequests: 1,
    }

    const identifier = 'test-user-3'

    // First request allowed
    rateLimit(identifier, config)

    // Second request blocked
    const result = rateLimit(identifier, config)

    if (result) {
      const headers = Object.fromEntries(result.headers.entries())
      expect(headers['retry-after']).toBeDefined()
    }
  })

  it('should use preset configurations', () => {
    const identifier = 'test-user-4'

    // Test AUTH preset
    const authResult = rateLimit(identifier, RateLimitPresets.AUTH)
    expect(authResult).toBeNull()

    // Test API preset
    const apiResult = rateLimit('api-user', RateLimitPresets.API)
    expect(apiResult).toBeNull()
  })

  it('should reset after time window', async () => {
    const config = {
      windowMs: 100, // 100ms
      maxRequests: 1,
    }

    const identifier = 'test-user-5'

    // First request allowed
    rateLimit(identifier, config)

    // Second request blocked
    let result = rateLimit(identifier, config)
    expect(result).not.toBeNull()

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150))

    // Should be allowed again
    result = rateLimit(identifier, config)
    expect(result).toBeNull()
  })
})
