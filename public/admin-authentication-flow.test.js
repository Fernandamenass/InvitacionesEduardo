/**
 * Integration tests for authentication flow in admin.js
 * Feature: admin-authentication-function
 * Tasks: 4.1 Test initial page load behavior, 4.2 Test successful authentication flow
 * Requirements: 3.1, 3.2, 3.4, 4.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin Authentication Flow - Initial Page Load', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the actual admin.html file
    const htmlPath = path.join(__dirname, 'admin.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    // Create a JSDOM instance with the actual HTML
    dom = new JSDOM(htmlContent, {
      runScripts: 'outside-only',
      url: 'http://localhost'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Mock localStorage (initially empty - no authentication)
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
    try {
      window.eval(adminJsContent);
    } catch (error) {
      // Ignore errors from DOMContentLoaded event listener setup
    }
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  describe('Initial Page Load Behavior', () => {
    /**
     * Test Case 1: Auth modal is displayed on page load without authentication
     * Validates: Requirements 3.1
     */
    it('should display auth modal on page load without authentication', () => {
      // Get the auth modal element
      const authModal = document.getElementById('authModal');
      
      // Verify auth modal exists
      expect(authModal).toBeTruthy();
      
      // Check that auth modal does NOT have the 'hidden' class
      // (it should be visible by default)
      expect(authModal.classList.contains('hidden')).toBe(false);
      
      // Verify the modal is visible (not display: none)
      const computedStyle = window.getComputedStyle(authModal);
      expect(computedStyle.display).not.toBe('none');
    });

    /**
     * Test Case 2: Admin panel is hidden initially
     * Validates: Requirements 3.1
     */
    it('should hide admin panel on page load without authentication', () => {
      // Get the admin panel element
      const adminPanel = document.getElementById('adminPanel');
      
      // Verify admin panel exists
      expect(adminPanel).toBeTruthy();
      
      // Check that admin panel has display: none style
      const style = adminPanel.style.display;
      expect(style).toBe('none');
    });

    /**
     * Test Case 3: Auth modal contains expected elements
     * Validates: Requirements 3.1
     */
    it('should have auth modal with password input and login button', () => {
      // Verify password input exists
      const passwordInput = document.getElementById('passwordInput');
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.type).toBe('password');
      
      // Verify auth error element exists (hidden initially)
      const authError = document.getElementById('authError');
      expect(authError).toBeTruthy();
      expect(authError.classList.contains('visible')).toBe(false);
      
      // Verify login button exists with onclick handler
      const loginButton = document.querySelector('#authModal button');
      expect(loginButton).toBeTruthy();
      expect(loginButton.getAttribute('onclick')).toBe('authenticate()');
    });

    /**
     * Test Case 4: Admin panel sections exist but are hidden
     * Validates: Requirements 3.1
     */
    it('should have admin panel sections present but hidden', () => {
      const adminPanel = document.getElementById('adminPanel');
      
      // Verify admin panel is hidden
      expect(adminPanel.style.display).toBe('none');
      
      // Verify key sections exist within the hidden panel
      const dropZone = document.getElementById('dropZone');
      const guestsTableContainer = document.getElementById('guestsTableContainer');
      const exportSummary = document.getElementById('exportSummary');
      
      expect(dropZone).toBeTruthy();
      expect(guestsTableContainer).toBeTruthy();
      expect(exportSummary).toBeTruthy();
    });
  });

  describe('Successful Authentication Flow', () => {
    /**
     * Test Case 5: Successful authentication updates localStorage
     * Validates: Requirements 3.2
     */
    it('should update localStorage with authentication state on successful authentication', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Call authenticate function
      await window.authenticate();

      // Verify localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');
    });

    /**
     * Test Case 6: Successful authentication makes admin panel visible
     * Validates: Requirements 3.4
     */
    it('should make admin panel visible on successful authentication', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Get admin panel element
      const adminPanel = document.getElementById('adminPanel');
      
      // Verify it's initially hidden
      expect(adminPanel.style.display).toBe('none');

      // Call authenticate function
      await window.authenticate();

      // Verify admin panel is now visible
      expect(adminPanel.style.display).toBe('block');
    });

    /**
     * Test Case 7: Successful authentication hides auth modal
     * Validates: Requirements 3.4
     */
    it('should hide auth modal on successful authentication', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Get auth modal element
      const authModal = document.getElementById('authModal');
      
      // Verify it's initially visible (not hidden)
      expect(authModal.classList.contains('hidden')).toBe(false);

      // Call authenticate function
      await window.authenticate();

      // Verify auth modal is now hidden
      expect(authModal.classList.contains('hidden')).toBe(true);
    });

    /**
     * Test Case 8: Successful authentication clears error message
     * Validates: Requirements 4.5
     */
    it('should clear error message on successful authentication', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Get auth error element and simulate it being visible
      const authError = document.getElementById('authError');
      authError.classList.add('visible');
      authError.textContent = 'Previous error message';
      
      // Verify error is initially visible
      expect(authError.classList.contains('visible')).toBe(true);

      // Call authenticate function
      await window.authenticate();

      // Verify error message is cleared (visible class removed)
      expect(authError.classList.contains('visible')).toBe(false);
    });

    /**
     * Test Case 9: Complete successful authentication flow
     * Validates: Requirements 3.2, 3.4, 4.5
     */
    it('should complete full successful authentication flow', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Get elements
      const authModal = document.getElementById('authModal');
      const adminPanel = document.getElementById('adminPanel');
      const authError = document.getElementById('authError');
      
      // Set up initial state with error visible
      authError.classList.add('visible');
      authError.textContent = 'Previous error';

      // Call authenticate function
      await window.authenticate();

      // Verify all state changes:
      // 1. localStorage updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');
      
      // 2. Admin panel visible
      expect(adminPanel.style.display).toBe('block');
      
      // 3. Auth modal hidden
      expect(authModal.classList.contains('hidden')).toBe(true);
      
      // 4. Error message cleared
      expect(authError.classList.contains('visible')).toBe(false);
      
      // 5. loadGuests was called
      expect(window.loadGuests).toHaveBeenCalled();
    });
  });

  describe('Failed Authentication Scenarios', () => {
    /**
     * Test Case 10: Invalid password displays correct error message
     * Validates: Requirements 3.3, 4.1
     */
    it('should display "Contraseña incorrecta" for invalid password', async () => {
      // Mock API response for invalid password
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Get auth error element
      const authError = document.getElementById('authError');
      
      // Verify error is initially not visible
      expect(authError.classList.contains('visible')).toBe(false);

      // Call authenticate function
      await window.authenticate();

      // Verify error message is displayed
      expect(authError.textContent).toBe('Contraseña incorrecta');
      expect(authError.classList.contains('visible')).toBe(true);
    });

    /**
     * Test Case 11: Network error displays correct error message
     * Validates: Requirements 3.5, 4.2
     */
    it('should display "Error al autenticar. Intenta de nuevo." for network error', async () => {
      // Mock fetch to throw network error
      window.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'any-password';

      // Get auth error element
      const authError = document.getElementById('authError');
      
      // Verify error is initially not visible
      expect(authError.classList.contains('visible')).toBe(false);

      // Call authenticate function
      await window.authenticate();

      // Verify error message is displayed
      expect(authError.textContent).toBe('Error al autenticar. Intenta de nuevo.');
      expect(authError.classList.contains('visible')).toBe(true);
    });

    /**
     * Test Case 12: Password input is cleared after authentication error
     * Validates: Requirements 4.3
     */
    it('should clear password input after authentication error', async () => {
      // Mock API response for invalid password
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';
      
      // Verify password is set
      expect(passwordInput.value).toBe('wrong-password');

      // Call authenticate function
      await window.authenticate();

      // Verify password input is cleared
      expect(passwordInput.value).toBe('');
    });

    /**
     * Test Case 13: Password input is focused after authentication error
     * Validates: Requirements 4.3
     */
    it('should focus password input after authentication error', async () => {
      // Mock API response for invalid password
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Mock focus method to track if it was called
      const focusSpy = vi.spyOn(passwordInput, 'focus');

      // Call authenticate function
      await window.authenticate();

      // Verify focus was called
      expect(focusSpy).toHaveBeenCalled();
    });

    /**
     * Test Case 14: Error message persists until next authentication attempt
     * Validates: Requirements 4.4
     */
    it('should keep error message visible until next authentication attempt', async () => {
      // Mock API response for first failed attempt
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Get auth error element
      const authError = document.getElementById('authError');

      // First authentication attempt (fails)
      await window.authenticate();

      // Verify error is visible
      expect(authError.classList.contains('visible')).toBe(true);
      expect(authError.textContent).toBe('Contraseña incorrecta');

      // Simulate time passing - error should still be visible
      // (no code execution between attempts)
      expect(authError.classList.contains('visible')).toBe(true);

      // Now mock successful authentication for second attempt
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set new password
      passwordInput.value = 'correct-password';

      // Second authentication attempt (succeeds)
      await window.authenticate();

      // Verify error is now hidden
      expect(authError.classList.contains('visible')).toBe(false);
    });

    /**
     * Test Case 15: Network error clears password and focuses input
     * Validates: Requirements 4.2, 4.3
     */
    it('should clear and focus password input after network error', async () => {
      // Mock fetch to throw network error
      window.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'any-password';

      // Mock focus method to track if it was called
      const focusSpy = vi.spyOn(passwordInput, 'focus');

      // Call authenticate function
      await window.authenticate();

      // Verify password input is cleared
      expect(passwordInput.value).toBe('');
      
      // Verify focus was called
      expect(focusSpy).toHaveBeenCalled();
    });

    /**
     * Test Case 16: Complete failed authentication flow
     * Validates: Requirements 3.3, 4.1, 4.3, 4.4
     */
    it('should complete full failed authentication flow', async () => {
      // Mock API response for invalid password
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input value
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Get elements
      const authError = document.getElementById('authError');
      const authModal = document.getElementById('authModal');
      const adminPanel = document.getElementById('adminPanel');

      // Mock focus method
      const focusSpy = vi.spyOn(passwordInput, 'focus');

      // Call authenticate function
      await window.authenticate();

      // Verify all state changes:
      // 1. Error message is displayed
      expect(authError.textContent).toBe('Contraseña incorrecta');
      expect(authError.classList.contains('visible')).toBe(true);
      
      // 2. Password input is cleared
      expect(passwordInput.value).toBe('');
      
      // 3. Password input is focused
      expect(focusSpy).toHaveBeenCalled();
      
      // 4. Auth modal remains visible
      expect(authModal.classList.contains('hidden')).toBe(false);
      
      // 5. Admin panel remains hidden
      expect(adminPanel.style.display).toBe('none');
      
      // 6. localStorage was NOT updated
      expect(window.localStorage.setItem).not.toHaveBeenCalledWith('admin_authenticated', 'true');
    });
  });

  describe('Keyboard Interaction', () => {
    /**
     * Test Case 17: Pressing Enter in password field executes authenticate
     * Validates: Requirements 2.4
     */
    it('should execute authenticate when Enter key is pressed in password field', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Get password input element
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Create and dispatch Enter key event
      const enterEvent = new window.KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });

      // Dispatch the event on the password input
      passwordInput.dispatchEvent(enterEvent);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify authenticate was executed by checking its effects
      // 1. localStorage was updated
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');
      
      // 2. Admin panel is visible
      const adminPanel = document.getElementById('adminPanel');
      expect(adminPanel.style.display).toBe('block');
      
      // 3. Auth modal is hidden
      const authModal = document.getElementById('authModal');
      expect(authModal.classList.contains('hidden')).toBe(true);
    });

    /**
     * Test Case 18: Enter key in password field works with failed authentication
     * Validates: Requirements 2.4
     */
    it('should handle Enter key press with failed authentication', async () => {
      // Mock API response for invalid password
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Get password input element
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Get auth error element
      const authError = document.getElementById('authError');

      // Create and dispatch Enter key event
      const enterEvent = new window.KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });

      // Dispatch the event on the password input
      passwordInput.dispatchEvent(enterEvent);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify authenticate was executed by checking error display
      expect(authError.textContent).toBe('Contraseña incorrecta');
      expect(authError.classList.contains('visible')).toBe(true);
      
      // Verify password was cleared
      expect(passwordInput.value).toBe('');
    });

    /**
     * Test Case 19: Other keys in password field do not trigger authenticate
     * Validates: Requirements 2.4
     */
    it('should not execute authenticate when other keys are pressed', async () => {
      // Mock fetch (should not be called)
      window.fetch = vi.fn();

      // Get password input element
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'test';

      // Create and dispatch a non-Enter key event (e.g., 'a' key)
      const keyEvent = new window.KeyboardEvent('keypress', {
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
        bubbles: true,
        cancelable: true
      });

      // Dispatch the event on the password input
      passwordInput.dispatchEvent(keyEvent);

      // Wait a bit to ensure no async operations start
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify fetch was NOT called (authenticate was not executed)
      expect(window.fetch).not.toHaveBeenCalled();
      
      // Verify password value is unchanged
      expect(passwordInput.value).toBe('test');
    });
  });
});
