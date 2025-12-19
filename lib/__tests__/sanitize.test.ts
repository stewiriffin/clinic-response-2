import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  sanitizeText,
  isValidEmail,
  isValidPhone,
  containsSQLInjection,
  containsNoSQLInjection,
  isSafeInput,
} from '../sanitize'

describe('Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should escape HTML characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toContain('&lt;')
      expect(sanitizeString('<script>alert("xss")</script>')).toContain('&gt;')
    })

    it('should return empty string for null/undefined', () => {
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString(undefined)).toBe('')
    })
  })

  describe('sanitizeEmail', () => {
    it('should normalize email', () => {
      const email = sanitizeEmail('  TEST@EXAMPLE.COM  ')
      expect(email).toBe('test@example.com')
    })

    it('should return empty string for invalid input', () => {
      expect(sanitizeEmail(null)).toBe('')
      expect(sanitizeEmail(undefined)).toBe('')
    })
  })

  describe('sanitizePhone', () => {
    it('should remove non-digit characters', () => {
      expect(sanitizePhone('(123) 456-7890')).toBe('1234567890')
    })

    it('should preserve leading +', () => {
      expect(sanitizePhone('+254712345678')).toBe('+254712345678')
    })

    it('should handle Kenya format', () => {
      expect(sanitizePhone('0712345678')).toBe('0712345678')
    })

    it('should return empty string for null/undefined', () => {
      expect(sanitizePhone(null)).toBe('')
      expect(sanitizePhone(undefined)).toBe('')
    })
  })

  describe('sanitizeName', () => {
    it('should allow valid names', () => {
      expect(sanitizeName("John O'Brien")).toBe("John O&#x27;Brien")
    })

    it('should remove special characters', () => {
      expect(sanitizeName('John@Doe123')).toBe('JohnDoe')
    })

    it('should collapse multiple spaces', () => {
      expect(sanitizeName('John    Doe')).toBe('John Doe')
    })

    it('should escape HTML', () => {
      const result = sanitizeName('<script>alert</script>')
      expect(result).toContain('&lt;')
    })
  })

  describe('sanitizeText', () => {
    it('should escape HTML', () => {
      const result = sanitizeText('<b>Bold</b>')
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('should limit text length', () => {
      const longText = 'a'.repeat(15000)
      const result = sanitizeText(longText)
      expect(result.length).toBeLessThanOrEqual(10000)
    })

    it('should return empty string for null/undefined', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('no@domain')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('0712345678')).toBe(true)
      expect(isValidPhone('+254712345678')).toBe(true)
    })

    it('should handle formatted numbers', () => {
      expect(isValidPhone('(123) 456-7890')).toBe(true)
    })
  })

  describe('containsSQLInjection', () => {
    it('should detect SQL injection patterns', () => {
      expect(containsSQLInjection("SELECT * FROM users")).toBe(true)
      expect(containsSQLInjection("' OR '1'='1")).toBe(true)
      expect(containsSQLInjection("DROP TABLE users")).toBe(true)
    })

    it('should allow safe input', () => {
      expect(containsSQLInjection('Normal text input')).toBe(false)
    })
  })

  describe('containsNoSQLInjection', () => {
    it('should detect NoSQL injection patterns', () => {
      expect(containsNoSQLInjection('{"$where": "1==1"}')).toBe(true)
      expect(containsNoSQLInjection('{ $ne: null }')).toBe(true)
    })

    it('should allow safe input', () => {
      expect(containsNoSQLInjection('Normal text input')).toBe(false)
    })
  })

  describe('isSafeInput', () => {
    it('should return true for safe input', () => {
      expect(isSafeInput('Hello World')).toBe(true)
      expect(isSafeInput('Patient has fever')).toBe(true)
    })

    it('should return false for SQL injection', () => {
      expect(isSafeInput("SELECT * FROM users")).toBe(false)
    })

    it('should return false for NoSQL injection', () => {
      expect(isSafeInput('{"$where": "1==1"}')).toBe(false)
    })
  })
})
