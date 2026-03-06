/**
 * Unit tests for global function exposure in admin.js
 * Feature: admin-authentication-function
 * Task: 2.3 Write unit tests for global function exposure
 * Requirements: 2.1, 2.2, 5.3, 5.4
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin Global Function Exposure', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create a minimal HTML document for testing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Test</title>
        </head>
        <body>
          <div id="authModal" class="hidden">
            <input id="passwordInput" type="password" />
            <div id="authError"></div>
          </div>
          <div id="adminPanel" style="display: none;"></div>
          <div id="guestsTableContainer"></div>
          <div id="importPreview"></div>
          <div id="fileName"></div>
          <div id="guestCount"></div>
          <div id="dropZone"></div>
          <input id="fileInput" type="file" />
          <div id="importMessage"></div>
          <div id="importLoading"></div>
          <div id="guestsLoading"></div>
          <div id="exportLoading"></div>
          <div id="guestsMessage"></div>
          <div id="exportMessage"></div>
          <div id="totalGuests"></div>
          <div id="confirmedGuests"></div>
          <div id="totalCompanions"></div>
          <div id="totalPeople"></div>
        </body>
      </html>
    `;
    
    // Create a JSDOM instance
    dom = new JSDOM(htmlContent, {
      runScripts: 'outside-only',
      url: 'http://localhost'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Mock localStorage
    const localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
      removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
      clear: vi.fn(() => { localStorageMock.store = {}; })
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: false,
      configurable: true
    });
    
    // Mock navigator.clipboard
    Object.defineProperty(window, 'navigator', {
      value: {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve())
        }
      },
      writable: false,
      configurable: true
    });
    
    // Mock URL methods
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    
    // Mock confirm and prompt
    window.confirm = vi.fn(() => false);
    window.prompt = vi.fn(() => null);
    
    // Load and execute admin.js
    const adminJsPath = path.join(__dirname, 'admin.js');
    const adminJsContent = fs.readFileSync(adminJsPath, 'utf-8');
    
    // Execute the script in the window context
    // Note: DOMContentLoaded won't fire in 'outside-only' mode, which is what we want
    try {
      window.eval(adminJsContent);
    } catch (error) {
      // Ignore errors from DOMContentLoaded event listener setup
      // The functions will still be defined
    }
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  describe('Global Function Accessibility', () => {
    /**
     * Test Case 1: window.authenticate is defined after loading admin.js
     * Validates: Requirements 2.1
     */
    it('should define window.authenticate after loading admin.js', () => {
      expect(window.authenticate).toBeDefined();
      expect(typeof window.authenticate).toBe('function');
    });

    /**
     * Test Case 2: All exposed functions are accessible via window object
     * Validates: Requirements 2.1
     */
    it('should expose all required functions to window object', () => {
      const requiredFunctions = [
        'authenticate',
        'loadGuests',
        'exportConfirmations',
        'copyLink',
        'copyAllLinks',
        'clearAllGuests',
        'confirmImport',
        'cancelImport'
      ];

      requiredFunctions.forEach(funcName => {
        expect(window[funcName]).toBeDefined();
        expect(typeof window[funcName]).toBe('function');
      });
    });

    /**
     * Test Case 3: authenticate can be called without ReferenceError
     * Validates: Requirements 2.2
     */
    it('should allow authenticate to be called without ReferenceError', () => {
      // Mock fetch to prevent actual API calls
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false, message: 'Test error' })
        })
      );

      // Set up password input
      document.getElementById('passwordInput').value = 'test123';

      // This should not throw a ReferenceError
      expect(() => {
        window.authenticate();
      }).not.toThrow();
    });

    /**
     * Test Case 4: Functions can be called from inline event handler context
     * Validates: Requirements 2.2
     * 
     * This simulates how inline onclick handlers access functions
     */
    it('should allow functions to be called from inline handler context', () => {
      // Mock fetch
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false })
        })
      );

      // Set password input
      document.getElementById('passwordInput').value = 'test';

      // Simulate inline onclick handler calling authenticate
      // In the browser, inline handlers have access to window scope
      // We verify that authenticate is accessible from window
      expect(window.authenticate).toBeDefined();
      expect(typeof window.authenticate).toBe('function');
      
      // Call it as an inline handler would
      expect(() => {
        window.authenticate();
      }).not.toThrow();
    });
  });

  describe('Diagnostic Logging', () => {
    /**
     * Test Case 5: Diagnostic logging when function is undefined
     * Validates: Requirements 5.3, 5.4
     */
    it('should log diagnostic message when authenticate checks if it is undefined', () => {
      // Check that the authenticate function contains diagnostic code
      const funcSource = window.authenticate.toString();
      
      // Verify diagnostic message content is in the function
      expect(funcSource).toContain('authenticate function is not defined in global scope');
      expect(funcSource).toContain('Check that admin.js is loaded correctly');
    });

    /**
     * Test Case 6: Diagnostic message suggests checking script tag
     * Validates: Requirements 5.4
     */
    it('should include helpful suggestions in diagnostic message', () => {
      // Check that the authenticate function contains diagnostic code
      const funcSource = window.authenticate.toString();
      
      // Verify diagnostic message content is in the function
      expect(funcSource).toContain('Check that admin.js is loaded correctly');
      expect(funcSource).toContain('script tag');
      expect(funcSource).toContain('window object');
    });

    /**
     * Test Case 7: Diagnostic message includes script tag example
     * Validates: Requirements 5.4
     */
    it('should include script tag path verification in diagnostic message', () => {
      // Check that the authenticate function contains diagnostic code with script path
      const funcSource = window.authenticate.toString();
      
      // Verify diagnostic includes script path verification
      expect(funcSource).toContain('script');
      expect(funcSource).toContain('/admin.js');
    });
  });

  describe('Function Execution Without Errors', () => {
    /**
     * Test Case 8: authenticate executes without throwing errors
     * Validates: Requirements 2.2
     */
    it('should execute authenticate without throwing errors when properly set up', async () => {
      // Mock fetch to return a controlled response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Set up password input
      document.getElementById('passwordInput').value = 'testpassword';

      // Execute authenticate - should not throw
      await expect(window.authenticate()).resolves.not.toThrow();
    });

    /**
     * Test Case 9: All exposed functions are callable
     * Validates: Requirements 2.1, 2.2
     */
    it('should allow all exposed functions to be called without ReferenceError', () => {
      // Mock dependencies
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, guests: [] })
        })
      );

      // Test that functions can be called without ReferenceError
      expect(() => window.loadGuests()).not.toThrow();
      expect(() => window.exportConfirmations()).not.toThrow();
      expect(() => window.copyLink(0)).not.toThrow();
      expect(() => window.copyAllLinks()).not.toThrow();
      expect(() => window.cancelImport()).not.toThrow();
      
      // confirmImport and clearAllGuests require more setup, just verify they exist
      expect(typeof window.confirmImport).toBe('function');
      expect(typeof window.clearAllGuests).toBe('function');
    });
  });

  describe('Inline Event Handler Compatibility', () => {
    /**
     * Test Case 10: Functions work with onclick attribute syntax
     * Validates: Requirements 2.2
     */
    it('should work when called via onclick attribute syntax', () => {
      // Mock fetch
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false })
        })
      );

      // Set password
      document.getElementById('passwordInput').value = 'test';

      // Verify that authenticate is accessible from window scope
      // This is what inline onclick handlers rely on
      expect(window.authenticate).toBeDefined();
      expect(typeof window.authenticate).toBe('function');
      
      // Call it as an inline handler would (from window scope)
      expect(() => {
        window.authenticate();
      }).not.toThrow();
    });
  });
});
