/**
 * Unit tests for admin.html script loading modifications
 * Feature: admin-authentication-function
 * Requirements: 1.1, 1.2, 1.4, 1.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin Script Loading Modifications', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load admin.html file
    const htmlPath = path.join(__dirname, 'admin.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    // Create a JSDOM instance
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost'
    });
    
    document = dom.window.document;
    window = dom.window;
  });

  describe('Script Tag Configuration', () => {
    /**
     * Test Case 1: Script tag is in head with defer attribute
     * Validates: Requirements 1.1
     */
    it('should have admin.js script tag in head section with defer attribute', () => {
      const headScripts = document.head.querySelectorAll('script[src="/admin.js"]');
      
      expect(headScripts.length).toBeGreaterThan(0);
      
      const adminScript = headScripts[0];
      expect(adminScript.hasAttribute('defer')).toBe(true);
    });

    /**
     * Test Case 2: Script tag has correct path
     * Validates: Requirements 1.2
     */
    it('should reference admin.js with correct path (/admin.js)', () => {
      const adminScript = document.head.querySelector('script[src="/admin.js"]');
      
      expect(adminScript).not.toBeNull();
      expect(adminScript.getAttribute('src')).toBe('/admin.js');
    });

    /**
     * Test Case 3: onerror handler is present
     * Validates: Requirements 1.4
     */
    it('should have onerror handler attribute on script tag', () => {
      const adminScript = document.head.querySelector('script[src="/admin.js"]');
      
      expect(adminScript).not.toBeNull();
      expect(adminScript.hasAttribute('onerror')).toBe(true);
      expect(adminScript.getAttribute('onerror')).toBe('handleScriptError()');
    });
  });

  describe('Error Handler Function', () => {
    /**
     * Test Case 4: handleScriptError displays error message
     * Validates: Requirements 1.3
     */
    it('should define handleScriptError function that displays error message', () => {
      expect(typeof window.handleScriptError).toBe('function');
    });

    /**
     * Test Case 5: handleScriptError updates auth modal with error content
     * Validates: Requirements 1.3, 5.1
     */
    it('should display error message in auth modal when handleScriptError is called', () => {
      const authModal = document.getElementById('authModal');
      expect(authModal).not.toBeNull();
      
      // Call the error handler
      window.handleScriptError();
      
      // Check that error message is displayed
      const errorHeading = authModal.querySelector('h2');
      expect(errorHeading).not.toBeNull();
      expect(errorHeading.textContent).toContain('Error: Script Load Failed');
      
      // Check that Spanish error message is present
      const modalContent = authModal.innerHTML;
      expect(modalContent).toContain('No se pudo cargar admin.js');
      expect(modalContent).toContain('Verifica la ruta del archivo y la conexión');
    });

    /**
     * Test Case 6: handleScriptError includes script path in error message
     * Validates: Requirements 5.2
     */
    it('should include script path in error message', () => {
      const authModal = document.getElementById('authModal');
      
      window.handleScriptError();
      
      const modalContent = authModal.innerHTML;
      expect(modalContent).toContain('Ruta esperada: /admin.js');
    });

    /**
     * Test Case 7: handleScriptError logs error to console
     * Validates: Requirements 5.1
     */
    it('should log error to console when script fails to load', () => {
      // Mock console.error
      const consoleErrors = [];
      const originalConsoleError = window.console.error;
      window.console.error = (...args) => {
        consoleErrors.push(args.join(' '));
      };
      
      window.handleScriptError();
      
      // Restore console.error
      window.console.error = originalConsoleError;
      
      // Check that error was logged
      expect(consoleErrors.length).toBeGreaterThan(0);
      expect(consoleErrors[0]).toContain('Failed to load admin.js');
      expect(consoleErrors[0]).toContain('/admin.js');
    });
  });

  describe('Script Loading Order', () => {
    /**
     * Test Case 8: Error handler script is accessible when needed
     * Validates: Requirements 1.1
     * 
     * Note: The inline script defining handleScriptError comes after the admin.js
     * script tag in the HTML, but this works because:
     * 1. The inline script executes immediately when encountered
     * 2. The onerror handler only triggers if admin.js fails to load
     * 3. By the time onerror could trigger, handleScriptError is already defined
     */
    it('should have handleScriptError defined in head section', () => {
      const scripts = Array.from(document.head.querySelectorAll('script'));
      
      // Find the inline script that defines handleScriptError
      const errorHandlerScript = scripts.find(script => 
        !script.src && script.textContent.includes('function handleScriptError')
      );
      
      // Find the admin.js script
      const adminScript = scripts.find(script => 
        script.getAttribute('src') === '/admin.js'
      );
      
      // Both scripts should exist in the head
      expect(errorHandlerScript).toBeDefined();
      expect(adminScript).toBeDefined();
      
      // The error handler function should be defined and callable
      expect(typeof window.handleScriptError).toBe('function');
    });
  });
});
