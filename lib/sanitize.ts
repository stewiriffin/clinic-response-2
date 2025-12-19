import validator from 'validator';

/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by escaping HTML and trimming
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';

  // Trim whitespace
  let sanitized = input.trim();

  // Escape HTML to prevent XSS
  sanitized = validator.escape(sanitized);

  return sanitized;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string | undefined | null): string {
  if (!email) return '';

  // Normalize and validate email
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
  });

  return normalized || '';
}

/**
 * Sanitize phone number (removes non-digit characters except +)
 */
export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';

  // Remove all non-digit characters except leading +
  let sanitized = phone.trim();

  // Keep only digits and leading +
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }

  return sanitized;
}

/**
 * Validate and sanitize a full name
 */
export function sanitizeName(name: string | undefined | null): string {
  if (!name) return '';

  let sanitized = name.trim();

  // Escape HTML
  sanitized = validator.escape(sanitized);

  // Remove any remaining special characters except spaces, hyphens, apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');

  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Sanitize text content (allows basic formatting but prevents XSS)
 */
export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';

  let sanitized = text.trim();

  // Escape HTML to prevent XSS
  sanitized = validator.escape(sanitized);

  // Limit length to prevent DOS attacks
  const MAX_TEXT_LENGTH = 10000;
  if (sanitized.length > MAX_TEXT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_TEXT_LENGTH);
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
  });
}

/**
 * Validate phone number (flexible for international formats)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s\-]/g, '');

  return validator.isMobilePhone(cleaned, 'any', { strictMode: false });
}

/**
 * Sanitize an object of form data
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, 'string' | 'email' | 'phone' | 'name' | 'text'>
): T {
  const sanitized: any = {};

  for (const key in schema) {
    const value = data[key];
    const type = schema[key];

    switch (type) {
      case 'string':
        sanitized[key] = sanitizeString(value);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhone(value);
        break;
      case 'name':
        sanitized[key] = sanitizeName(value);
        break;
      case 'text':
        sanitized[key] = sanitizeText(value);
        break;
      default:
        sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Check for SQL injection patterns (basic detection)
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\bOR\b.*=.*|1=1|' OR ')/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for NoSQL injection patterns (for MongoDB)
 */
export function containsNoSQLInjection(input: string): boolean {
  const noSqlPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$regex|\$nin)/i,
    /({\s*\$)/,
  ];

  return noSqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate that input doesn't contain malicious patterns
 */
export function isSafeInput(input: string): boolean {
  return !containsSQLInjection(input) && !containsNoSQLInjection(input);
}
