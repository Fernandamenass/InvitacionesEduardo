/**
 * Unit tests for utility functions
 * Requirements: 3.1 - Extract guest ID from URL and validate forms
 */

import { describe, it, expect } from 'vitest';
import { extractGuestIdFromUrl, validateConfirmationForm } from './utils.js';

describe('extractGuestIdFromUrl', () => {
  it('should extract ID from path-based URL format /invite/:id', () => {
    const pathname = '/invite/abc-123-def';
    const search = '';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('abc-123-def');
  });

  it('should extract ID from query parameter format ?id=:id', () => {
    const pathname = '/';
    const search = '?id=xyz-789-uvw';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('xyz-789-uvw');
  });

  it('should extract ID from hash format #:id', () => {
    const pathname = '/';
    const search = '';
    const hash = '#hash-id-456';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('hash-id-456');
  });

  it('should prioritize path-based ID over query parameter', () => {
    const pathname = '/invite/path-id';
    const search = '?id=query-id';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('path-id');
  });

  it('should prioritize path-based ID over hash', () => {
    const pathname = '/invite/path-id';
    const search = '';
    const hash = '#hash-id';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('path-id');
  });

  it('should prioritize query parameter over hash', () => {
    const pathname = '/';
    const search = '?id=query-id';
    const hash = '#hash-id';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('query-id');
  });

  it('should return null when no ID is present', () => {
    const pathname = '/';
    const search = '';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBeNull();
  });

  it('should handle UUID format IDs', () => {
    const pathname = '/invite/a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const search = '';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('should handle IDs with special characters in path', () => {
    const pathname = '/invite/test_id-123';
    const search = '';
    const hash = '';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBe('test_id-123');
  });

  it('should return null for empty hash', () => {
    const pathname = '/';
    const search = '';
    const hash = '#';
    
    const result = extractGuestIdFromUrl(pathname, search, hash);
    
    expect(result).toBeNull();
  });
});

describe('validateConfirmationForm', () => {
  it('should validate successfully when companions count is within limit', () => {
    const companionsCount = 1;
    const maxCompanions = 3; // Guest + 2 companions allowed
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('should validate successfully when companions count equals limit', () => {
    const companionsCount = 2;
    const maxCompanions = 3; // Guest + 2 companions allowed
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(true);
  });

  it('should validate successfully with zero companions', () => {
    const companionsCount = 0;
    const maxCompanions = 1; // Guest only
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(true);
  });

  it('should fail validation when companions count exceeds limit', () => {
    const companionsCount = 3;
    const maxCompanions = 2; // Guest + 1 companion allowed
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('No puedes agregar más de 1 acompañante(s)');
  });

  it('should fail validation when companions count exceeds limit by multiple', () => {
    const companionsCount = 5;
    const maxCompanions = 3; // Guest + 2 companions allowed
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('No puedes agregar más de 2 acompañante(s)');
  });

  it('should handle maxCompanions of 1 (guest only, no companions)', () => {
    const companionsCount = 1;
    const maxCompanions = 1;
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('No puedes agregar más de 0 acompañante(s)');
  });

  it('should handle large maxCompanions values', () => {
    const companionsCount = 10;
    const maxCompanions = 15; // Guest + 14 companions allowed
    
    const result = validateConfirmationForm(companionsCount, maxCompanions);
    
    expect(result.valid).toBe(true);
  });
});
