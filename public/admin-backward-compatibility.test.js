/**
 * Backward compatibility tests for admin.js
 * Feature: admin-authentication-function
 * Task: 5. Write backward compatibility tests
 * Requirements: 6.1, 6.2, 6.3, 6.4
 * 
 * These tests ensure that the script loading and function exposure changes
 * don't break any existing functionality in the admin panel.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Admin Backward Compatibility Tests', () => {
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
          <div id="adminPanel" style="display: none;">
            <div id="guestsTableContainer"></div>
            <div id="exportSummary">
              <span id="totalGuests">0</span>
              <span id="confirmedGuests">0</span>
              <span id="totalCompanions">0</span>
              <span id="totalPeople">0</span>
            </div>
          </div>
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
    
    // Mock fetch
    window.fetch = vi.fn();
    
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

  describe('Authentication Logic Preservation', () => {
    /**
     * Test Case 23: Authentication logic behavior remains unchanged after fix
     * Validates: Requirements 6.1
     */
    it('should maintain original authentication flow with correct password', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests to prevent actual execution
      window.loadGuests = vi.fn();

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Call authenticate
      await window.authenticate();

      // Verify authentication flow:
      // 1. Fetch was called with correct endpoint and method
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/admin/auth',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'correct-password' })
        })
      );

      // 2. localStorage was updated with correct key
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');

      // 3. Admin panel is shown
      const adminPanel = document.getElementById('adminPanel');
      expect(adminPanel.style.display).toBe('block');

      // 4. Auth modal is hidden
      const authModal = document.getElementById('authModal');
      expect(authModal.classList.contains('hidden')).toBe(true);
    });

    /**
     * Test Case 24: Authentication logic handles incorrect password correctly
     * Validates: Requirements 6.1
     */
    it('should maintain original authentication error handling', async () => {
      // Mock failed API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Call authenticate
      await window.authenticate();

      // Verify error handling:
      // 1. Error message is displayed
      const authError = document.getElementById('authError');
      expect(authError.textContent).toBe('Contraseña incorrecta');
      expect(authError.classList.contains('visible')).toBe(true);

      // 2. Password input is cleared
      expect(passwordInput.value).toBe('');

      // 3. localStorage was NOT updated
      expect(window.localStorage.setItem).not.toHaveBeenCalledWith('admin_authenticated', 'true');

      // 4. Admin panel remains hidden
      const adminPanel = document.getElementById('adminPanel');
      expect(adminPanel.style.display).toBe('none');
    });

    /**
     * Test Case 25: Authentication logic handles network errors correctly
     * Validates: Requirements 6.1
     */
    it('should maintain original network error handling', async () => {
      // Mock fetch to throw network error
      window.fetch = vi.fn(() => 
        Promise.reject(new Error('Network error'))
      );

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'any-password';

      // Call authenticate
      await window.authenticate();

      // Verify error handling:
      // 1. Error message is displayed
      const authError = document.getElementById('authError');
      expect(authError.textContent).toBe('Error al autenticar. Intenta de nuevo.');
      expect(authError.classList.contains('visible')).toBe(true);

      // 2. Password input is cleared
      expect(passwordInput.value).toBe('');
    });
  });

  describe('Existing Admin Functions Preservation', () => {
    /**
     * Test Case 26: loadGuests function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain loadGuests functionality', async () => {
      // Mock successful API response with guest data
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            guests: [
              {
                name: 'John Doe',
                phone: '1234567890',
                maxCompanions: 2,
                confirmed: true,
                companionCount: 1,
                link: 'http://example.com/guest/1'
              }
            ]
          })
        })
      );

      // Call loadGuests
      await window.loadGuests();

      // Verify loadGuests behavior:
      // 1. Fetch was called with correct endpoint
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/guests')
      );

      // 2. Guest table was rendered
      const container = document.getElementById('guestsTableContainer');
      expect(container.innerHTML).toContain('John Doe');
      expect(container.innerHTML).toContain('1234567890');

      // 3. Export summary was updated
      expect(document.getElementById('totalGuests').textContent).toBe('1');
      expect(document.getElementById('confirmedGuests').textContent).toBe('1');
    });

    /**
     * Test Case 27: exportConfirmations function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain exportConfirmations functionality', async () => {
      // Mock successful export response
      const mockBlob = new window.Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
      );

      // Call exportConfirmations
      await window.exportConfirmations();

      // Verify exportConfirmations behavior:
      // 1. Fetch was called with correct endpoint
      expect(window.fetch).toHaveBeenCalledWith('/api/admin/export');

      // 2. URL.createObjectURL was called (for download)
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

      // 3. URL.revokeObjectURL was called (cleanup)
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });

    /**
     * Test Case 28: copyLink function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain copyLink functionality', async () => {
      // Load guests first to populate guestsData
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            guests: [
              {
                name: 'John Doe',
                phone: '1234567890',
                link: 'http://example.com/guest/1'
              }
            ]
          })
        })
      );

      await window.loadGuests();

      // Reset fetch mock and clipboard mock
      window.fetch.mockClear();
      window.navigator.clipboard.writeText.mockClear();

      // Call copyLink
      await window.copyLink(0);

      // Verify copyLink behavior:
      // 1. Clipboard writeText was called with correct link
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/guest/1');
    });

    /**
     * Test Case 29: copyAllLinks function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain copyAllLinks functionality', async () => {
      // Load guests first to populate guestsData
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            guests: [
              {
                name: 'John Doe',
                phone: '1234567890',
                link: 'http://example.com/guest/1'
              },
              {
                name: 'Jane Smith',
                phone: '0987654321',
                link: 'http://example.com/guest/2'
              }
            ]
          })
        })
      );

      await window.loadGuests();

      // Reset clipboard mock
      window.navigator.clipboard.writeText.mockClear();

      // Call copyAllLinks
      await window.copyAllLinks();

      // Verify copyAllLinks behavior:
      // 1. Clipboard writeText was called
      expect(window.navigator.clipboard.writeText).toHaveBeenCalled();

      // 2. Text includes both guests
      const copiedText = window.navigator.clipboard.writeText.mock.calls[0][0];
      expect(copiedText).toContain('John Doe');
      expect(copiedText).toContain('1234567890');
      expect(copiedText).toContain('http://example.com/guest/1');
      expect(copiedText).toContain('Jane Smith');
      expect(copiedText).toContain('0987654321');
      expect(copiedText).toContain('http://example.com/guest/2');
    });

    /**
     * Test Case 30: clearAllGuests function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain clearAllGuests functionality', async () => {
      // Mock confirm and prompt to simulate user confirmation
      window.confirm = vi.fn()
        .mockReturnValueOnce(true)  // First confirmation
        .mockReturnValueOnce(true); // Second confirmation
      window.prompt = vi.fn().mockReturnValue('ELIMINAR');

      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Call clearAllGuests
      await window.clearAllGuests();

      // Verify clearAllGuests behavior:
      // 1. User was prompted for confirmation
      expect(window.confirm).toHaveBeenCalledTimes(2);
      expect(window.prompt).toHaveBeenCalled();

      // 2. Fetch was called with correct endpoint and method
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/admin/clear',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    /**
     * Test Case 31: confirmImport function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain confirmImport functionality', async () => {
      // Create a mock file
      const mockFile = new window.File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Use handleFileSelect to set currentFile (this is how it's done in the real code)
      // First, we need to expose handleFileSelect or simulate file selection
      // Since handleFileSelect is not exposed, we'll simulate the file input change event
      const fileInput = document.getElementById('fileInput');
      
      // Create a mock FileList
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });

      // Trigger the change event to set currentFile via handleFileSelect
      const changeEvent = new window.Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            imported: 10,
            message: '10 invitados importados'
          })
        })
      );

      // Mock loadGuests
      window.loadGuests = vi.fn();

      // Call confirmImport
      await window.confirmImport();

      // Verify confirmImport behavior:
      // 1. Fetch was called with correct endpoint and FormData
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/admin/import',
        expect.objectContaining({
          method: 'POST'
        })
      );

      // 2. FormData contains the file
      const fetchCall = window.fetch.mock.calls[0];
      expect(fetchCall[1].body).toBeInstanceOf(window.FormData);
    });

    /**
     * Test Case 32: cancelImport function remains functional
     * Validates: Requirements 6.2
     */
    it('should maintain cancelImport functionality', () => {
      // Set up import preview by simulating file selection
      const mockFile = new window.File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = document.getElementById('fileInput');
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
        configurable: true
      });

      // Trigger the change event to set currentFile
      const changeEvent = new window.Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Verify import preview is visible after file selection
      const importPreview = document.getElementById('importPreview');
      expect(importPreview.classList.contains('visible')).toBe(true);

      // Call cancelImport
      window.cancelImport();

      // Verify cancelImport behavior:
      // 1. Import preview is hidden
      expect(importPreview.classList.contains('visible')).toBe(false);

      // 2. File input is cleared
      expect(fileInput.value).toBe('');
    });
  });

  describe('LocalStorage Mechanism Preservation', () => {
    /**
     * Test Case 33: localStorage authentication state mechanism remains unchanged
     * Validates: Requirements 6.3
     */
    it('should use the same localStorage key for authentication', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests
      window.loadGuests = vi.fn();

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'correct-password';

      // Call authenticate
      await window.authenticate();

      // Verify localStorage usage:
      // 1. Correct key is used
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');

      // 2. Value is stored as string 'true'
      const setItemCall = window.localStorage.setItem.mock.calls[0];
      expect(setItemCall[0]).toBe('admin_authenticated');
      expect(setItemCall[1]).toBe('true');
    });

    /**
     * Test Case 34: localStorage is not modified on failed authentication
     * Validates: Requirements 6.3
     */
    it('should not modify localStorage on failed authentication', async () => {
      // Mock failed API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            success: false, 
            message: 'Contraseña incorrecta' 
          })
        })
      );

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'wrong-password';

      // Call authenticate
      await window.authenticate();

      // Verify localStorage was NOT modified
      expect(window.localStorage.setItem).not.toHaveBeenCalledWith('admin_authenticated', 'true');
    });

    /**
     * Test Case 35: localStorage key format remains consistent
     * Validates: Requirements 6.3
     */
    it('should maintain consistent localStorage key format', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests
      window.loadGuests = vi.fn();

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'test-password';

      // Call authenticate
      await window.authenticate();

      // Verify the exact key format
      const setItemCalls = window.localStorage.setItem.mock.calls;
      const authCall = setItemCalls.find(call => call[0] === 'admin_authenticated');
      
      expect(authCall).toBeDefined();
      expect(authCall[0]).toBe('admin_authenticated');
      expect(authCall[1]).toBe('true');
    });
  });

  describe('API Endpoint Integration Preservation', () => {
    /**
     * Test Case 36: Authentication endpoint integration remains unchanged
     * Validates: Requirements 6.4
     */
    it('should use the same authentication endpoint', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Mock loadGuests
      window.loadGuests = vi.fn();

      // Set password input
      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'test-password';

      // Call authenticate
      await window.authenticate();

      // Verify endpoint:
      // 1. Correct endpoint is called
      expect(window.fetch).toHaveBeenCalledWith(
        '/api/admin/auth',
        expect.any(Object)
      );

      // 2. Correct method is used
      const fetchCall = window.fetch.mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');

      // 3. Correct headers are sent
      expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' });

      // 4. Correct body format is sent
      expect(fetchCall[1].body).toBe(JSON.stringify({ password: 'test-password' }));
    });

    /**
     * Test Case 37: Guest loading endpoint integration remains unchanged
     * Validates: Requirements 6.4
     */
    it('should use the same guest loading endpoint', async () => {
      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ guests: [] })
        })
      );

      // Call loadGuests
      await window.loadGuests();

      // Verify endpoint:
      // 1. Correct endpoint is called (with timestamp parameter)
      const fetchCall = window.fetch.mock.calls[0];
      expect(fetchCall[0]).toMatch(/^\/api\/admin\/guests\?t=\d+$/);
    });

    /**
     * Test Case 38: Export endpoint integration remains unchanged
     * Validates: Requirements 6.4
     */
    it('should use the same export endpoint', async () => {
      // Mock successful export response
      const mockBlob = new window.Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
      );

      // Call exportConfirmations
      await window.exportConfirmations();

      // Verify endpoint:
      expect(window.fetch).toHaveBeenCalledWith('/api/admin/export');
    });

    /**
     * Test Case 39: Import endpoint integration remains unchanged
     * Validates: Requirements 6.4
     */
    it('should use the same import endpoint', async () => {
      // Create a mock file
      const mockFile = new window.File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Simulate file selection
      const fileInput = document.getElementById('fileInput');
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
        configurable: true
      });

      // Trigger the change event to set currentFile
      const changeEvent = new window.Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, imported: 5 })
        })
      );

      // Mock loadGuests
      window.loadGuests = vi.fn();

      // Call confirmImport
      await window.confirmImport();

      // Verify endpoint:
      // 1. Correct endpoint is called
      expect(window.fetch).toHaveBeenCalled();
      const fetchCall = window.fetch.mock.calls[0];
      expect(fetchCall[0]).toBe('/api/admin/import');

      // 2. Correct method is used
      expect(fetchCall[1].method).toBe('POST');

      // 3. Body is FormData
      expect(fetchCall[1].body).toBeInstanceOf(window.FormData);
    });

    /**
     * Test Case 40: Clear endpoint integration remains unchanged
     * Validates: Requirements 6.4
     */
    it('should use the same clear endpoint', async () => {
      // Mock confirm and prompt
      window.confirm = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      window.prompt = vi.fn().mockReturnValue('ELIMINAR');

      // Mock successful API response
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      // Call clearAllGuests
      await window.clearAllGuests();

      // Verify endpoint:
      // 1. Correct endpoint is called
      const fetchCall = window.fetch.mock.calls[0];
      expect(fetchCall[0]).toBe('/api/admin/clear');

      // 2. Correct method is used
      expect(fetchCall[1].method).toBe('POST');

      // 3. Correct headers are sent
      expect(fetchCall[1].headers).toEqual({ 'Content-Type': 'application/json' });
    });
  });

  describe('Complete Integration Tests', () => {
    /**
     * Test Case 41: Full authentication and admin workflow remains unchanged
     * Validates: Requirements 6.1, 6.2, 6.3, 6.4
     */
    it('should maintain complete authentication and admin workflow', async () => {
      // Step 1: Authenticate
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const passwordInput = document.getElementById('passwordInput');
      passwordInput.value = 'admin-password';

      await window.authenticate();

      // Verify authentication
      expect(window.localStorage.setItem).toHaveBeenCalledWith('admin_authenticated', 'true');
      expect(window.fetch).toHaveBeenCalledWith('/api/admin/auth', expect.any(Object));

      // Step 2: Load guests
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            guests: [
              {
                name: 'Test Guest',
                phone: '1234567890',
                maxCompanions: 2,
                confirmed: true,
                companionCount: 1,
                link: 'http://example.com/guest/1'
              }
            ]
          })
        })
      );

      await window.loadGuests();

      // Verify guest loading
      expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/admin/guests'));
      expect(document.getElementById('totalGuests').textContent).toBe('1');

      // Step 3: Copy link
      await window.copyLink(0);

      // Verify copy functionality
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/guest/1');

      // Step 4: Export confirmations
      const mockBlob = new window.Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      window.fetch = vi.fn(() => 
        Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
      );

      await window.exportConfirmations();

      // Verify export functionality
      expect(window.fetch).toHaveBeenCalledWith('/api/admin/export');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
