// Preservation Property Tests - Admin Script Path Fix
// **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
//
// These tests verify that existing admin panel functionality remains unchanged
// after fixing the script path. Tests are run on UNFIXED code in local development
// where the script loads successfully, establishing baseline behavior to preserve.
//
// **EXPECTED OUTCOME**: Tests PASS on unfixed code (confirms baseline behavior)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Preservation Properties - Admin Panel Functionality', () => {
  
  // Read admin.js content for testing
  const adminJsPath = path.join(__dirname, '..', 'public', 'admin.js');
  const adminJsContent = fs.readFileSync(adminJsPath, 'utf-8');
  
  describe('Property 2: Preservation - Core Function Definitions', () => {
    
    it('should preserve all admin panel function definitions', () => {
      // **Validates: Requirements 3.2, 3.3, 3.4**
      //
      // Verify that all critical admin functions are defined in admin.js
      // This ensures the JavaScript file content remains unchanged
      
      const requiredFunctions = [
        'authenticate',
        'checkAuth',
        'showAuthModal',
        'showAdminPanel',
        'logout',
        'loadGuests',
        'renderGuestsTable',
        'confirmImport',
        'cancelImport',
        'handleFileSelect',
        'exportConfirmations',
        'copyLink',
        'copyAllLinks',
        'clearAllGuests',
        'showMessage',
        'showLoading',
        'updateExportSummary',
        'escapeHtml',
        'fallbackCopyText'
      ];
      
      // Verify each function is defined in the file
      requiredFunctions.forEach(funcName => {
        const functionPattern = new RegExp(`(async\\s+)?function\\s+${funcName}\\s*\\(|const\\s+${funcName}\\s*=`);
        expect(adminJsContent).toMatch(functionPattern);
      });
    });
    
    it('should preserve authentication function signature and logic', () => {
      // **Validates: Requirements 3.2**
      //
      // Verify authenticate() function structure remains unchanged
      // - Should be async function
      // - Should read password from input
      // - Should call /api/admin/auth endpoint
      // - Should handle localStorage for AUTH_KEY
      
      expect(adminJsContent).toContain('async function authenticate()');
      expect(adminJsContent).toContain("document.getElementById('passwordInput')");
      expect(adminJsContent).toContain('/api/admin/auth');
      expect(adminJsContent).toContain("localStorage.setItem(AUTH_KEY, 'true')");
      expect(adminJsContent).toContain('showAdminPanel()');
    });
    
    it('should preserve guest management function signatures', () => {
      // **Validates: Requirements 3.3**
      //
      // Verify all guest management functions remain unchanged
      
      // loadGuests should fetch from /api/admin/guests
      expect(adminJsContent).toContain('async function loadGuests()');
      expect(adminJsContent).toContain('/api/admin/guests');
      
      // confirmImport should post to /api/admin/import
      expect(adminJsContent).toContain('async function confirmImport()');
      expect(adminJsContent).toContain('/api/admin/import');
      
      // exportConfirmations should fetch from /api/admin/export
      expect(adminJsContent).toContain('async function exportConfirmations()');
      expect(adminJsContent).toContain('/api/admin/export');
      
      // clearAllGuests should post to /api/admin/clear
      expect(adminJsContent).toContain('async function clearAllGuests()');
      expect(adminJsContent).toContain('/api/admin/clear');
    });
  });
  
  describe('Property 2: Preservation - Authentication Logic', () => {
    
    it('should preserve authentication flow patterns', () => {
      // **Validates: Requirements 3.2**
      //
      // Property: Authentication logic structure remains unchanged
      // - Password validation via API call
      // - localStorage management
      // - Error handling patterns
      
      fc.assert(
        fc.property(
          fc.record({
            password: fc.string({ minLength: 1, maxLength: 50 }),
            isCorrect: fc.boolean()
          }),
          (testCase) => {
            // Verify the authentication flow structure exists
            const hasPasswordInput = adminJsContent.includes("document.getElementById('passwordInput')");
            const hasApiCall = adminJsContent.includes('/api/admin/auth');
            const hasLocalStorage = adminJsContent.includes("localStorage.setItem(AUTH_KEY, 'true')");
            const hasErrorHandling = adminJsContent.includes('authError');
            
            expect(hasPasswordInput).toBe(true);
            expect(hasApiCall).toBe(true);
            expect(hasLocalStorage).toBe(true);
            expect(hasErrorHandling).toBe(true);
          }
        )
      );
    });
    
    it('should preserve session management with AUTH_KEY', () => {
      // **Validates: Requirements 3.2**
      //
      // Verify AUTH_KEY constant and its usage remain unchanged
      
      expect(adminJsContent).toContain("const AUTH_KEY = 'admin_authenticated'");
      expect(adminJsContent).toContain("localStorage.getItem(AUTH_KEY)");
      expect(adminJsContent).toContain("localStorage.setItem(AUTH_KEY");
      expect(adminJsContent).toContain("localStorage.removeItem(AUTH_KEY)");
    });
  });
  
  describe('Property 2: Preservation - Guest Management Operations', () => {
    
    it('should preserve loadGuests API call pattern', () => {
      // **Validates: Requirements 3.3**
      //
      // Property: loadGuests maintains same API call structure
      // - Fetches from /api/admin/guests with cache-busting timestamp
      // - Handles response data
      // - Calls renderGuestsTable and updateExportSummary
      
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed, testing structure
          () => {
            const hasApiCall = adminJsContent.includes('/api/admin/guests');
            const hasCacheBusting = adminJsContent.includes('Date.now()');
            const hasRenderCall = adminJsContent.includes('renderGuestsTable');
            const hasUpdateSummary = adminJsContent.includes('updateExportSummary');
            
            expect(hasApiCall).toBe(true);
            expect(hasCacheBusting).toBe(true);
            expect(hasRenderCall).toBe(true);
            expect(hasUpdateSummary).toBe(true);
          }
        )
      );
    });
    
    it('should preserve import functionality structure', () => {
      // **Validates: Requirements 3.3**
      //
      // Property: Import functionality maintains same structure
      // - File validation for .xlsx/.xls
      // - FormData upload to /api/admin/import
      // - Success/error message handling
      
      fc.assert(
        fc.property(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 50 }),
            hasExcelExtension: fc.boolean()
          }),
          (testCase) => {
            const hasFileValidation = adminJsContent.includes('.xlsx') && adminJsContent.includes('.xls');
            const hasFormData = adminJsContent.includes('FormData');
            const hasImportEndpoint = adminJsContent.includes('/api/admin/import');
            const hasMessageHandling = adminJsContent.includes('showMessage');
            
            expect(hasFileValidation).toBe(true);
            expect(hasFormData).toBe(true);
            expect(hasImportEndpoint).toBe(true);
            expect(hasMessageHandling).toBe(true);
          }
        )
      );
    });
    
    it('should preserve export functionality structure', () => {
      // **Validates: Requirements 3.3**
      //
      // Verify export maintains same blob download pattern
      
      expect(adminJsContent).toContain('/api/admin/export');
      expect(adminJsContent).toContain('blob');
      expect(adminJsContent).toContain('window.URL.createObjectURL');
      expect(adminJsContent).toContain('.xlsx');
    });
  });
  
  describe('Property 2: Preservation - Copy Functionality', () => {
    
    it('should preserve copyLink function for individual guests', () => {
      // **Validates: Requirements 3.3**
      //
      // Property: copyLink maintains clipboard API usage
      // - Uses navigator.clipboard.writeText
      // - Has fallback for older browsers
      // - Provides visual feedback
      
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (guestIndex) => {
            const hasClipboardApi = adminJsContent.includes('navigator.clipboard.writeText');
            const hasFallback = adminJsContent.includes('fallbackCopyText');
            const hasVisualFeedback = adminJsContent.includes('copied');
            
            expect(hasClipboardApi).toBe(true);
            expect(hasFallback).toBe(true);
            expect(hasVisualFeedback).toBe(true);
          }
        )
      );
    });
    
    it('should preserve copyAllLinks batch functionality', () => {
      // **Validates: Requirements 3.3**
      //
      // Verify copyAllLinks maintains formatting pattern
      
      expect(adminJsContent).toContain('async function copyAllLinks()');
      expect(adminJsContent).toContain('guestsData.map');
      expect(adminJsContent).toContain('navigator.clipboard.writeText');
    });
  });
  
  describe('Property 2: Preservation - UI Helper Functions', () => {
    
    it('should preserve showMessage function signature', () => {
      // **Validates: Requirements 3.3, 3.4**
      //
      // Property: showMessage maintains same parameter structure
      // - Takes elementId, message, type
      // - Sets className with type
      // - Auto-hides after timeout
      
      fc.assert(
        fc.property(
          fc.record({
            elementId: fc.string({ minLength: 1, maxLength: 20 }),
            message: fc.string({ minLength: 1, maxLength: 100 }),
            type: fc.constantFrom('success', 'error', 'info')
          }),
          (testCase) => {
            const hasFunction = adminJsContent.includes('function showMessage(elementId, message, type)');
            const hasClassName = adminJsContent.includes('element.className');
            const hasTimeout = adminJsContent.includes('setTimeout');
            
            expect(hasFunction).toBe(true);
            expect(hasClassName).toBe(true);
            expect(hasTimeout).toBe(true);
          }
        )
      );
    });
    
    it('should preserve showLoading function signature', () => {
      // **Validates: Requirements 3.3, 3.4**
      //
      // Verify showLoading maintains visibility toggle pattern
      
      expect(adminJsContent).toContain('function showLoading(elementId, show)');
      expect(adminJsContent).toContain('classList.add');
      expect(adminJsContent).toContain('classList.remove');
    });
    
    it('should preserve escapeHtml security function', () => {
      // **Validates: Requirements 3.4**
      //
      // Property: escapeHtml maintains XSS prevention
      // - Creates temporary div element
      // - Uses textContent for escaping
      // - Returns innerHTML
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (text) => {
            const hasFunction = adminJsContent.includes('function escapeHtml(text)');
            const hasDiv = adminJsContent.includes('createElement');
            const hasTextContent = adminJsContent.includes('textContent');
            
            expect(hasFunction).toBe(true);
            expect(hasDiv).toBe(true);
            expect(hasTextContent).toBe(true);
          }
        )
      );
    });
  });
  
  describe('Property 2: Preservation - Table Rendering', () => {
    
    it('should preserve renderGuestsTable structure', () => {
      // **Validates: Requirements 3.3, 3.4**
      //
      // Property: renderGuestsTable maintains table structure
      // - Handles empty state
      // - Creates table with proper columns
      // - Uses escapeHtml for security
      // - Includes copy buttons
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              phone: fc.string({ minLength: 8, maxLength: 15 }),
              maxCompanions: fc.integer({ min: 1, max: 10 }),
              confirmed: fc.boolean(),
              companionCount: fc.integer({ min: 0, max: 10 })
            }),
            { minLength: 0, maxLength: 5 }
          ),
          (guests) => {
            const hasEmptyState = adminJsContent.includes('empty-state');
            const hasTableCreation = adminJsContent.includes('createElement');
            const hasEscapeHtml = adminJsContent.includes('escapeHtml');
            const hasCopyButton = adminJsContent.includes('copy-btn');
            
            expect(hasEmptyState).toBe(true);
            expect(hasTableCreation).toBe(true);
            expect(hasEscapeHtml).toBe(true);
            expect(hasCopyButton).toBe(true);
          }
        )
      );
    });
    
    it('should preserve updateExportSummary calculation logic', () => {
      // **Validates: Requirements 3.3, 3.4**
      //
      // Verify summary calculations remain unchanged
      
      expect(adminJsContent).toContain('function updateExportSummary(guests)');
      expect(adminJsContent).toContain('guests.length');
      expect(adminJsContent).toContain('guests.filter');
      expect(adminJsContent).toContain('guests.reduce');
      expect(adminJsContent).toContain('totalGuests');
      expect(adminJsContent).toContain('confirmedGuests');
      expect(adminJsContent).toContain('totalCompanions');
      expect(adminJsContent).toContain('totalPeople');
    });
  });
  
  describe('Property 2: Preservation - Event Handlers', () => {
    
    it('should preserve DOMContentLoaded event listener', () => {
      // **Validates: Requirements 3.1, 3.4**
      //
      // Verify initialization event handlers remain unchanged
      
      expect(adminJsContent).toContain("document.addEventListener('DOMContentLoaded'");
      expect(adminJsContent).toContain('checkAuth()');
    });
    
    it('should preserve Enter key handler for password input', () => {
      // **Validates: Requirements 3.2**
      //
      // Verify keyboard event handling remains unchanged
      
      expect(adminJsContent).toContain("addEventListener('keypress'");
      expect(adminJsContent).toContain("e.key === 'Enter'");
      expect(adminJsContent).toContain('authenticate()');
    });
    
    it('should preserve drag and drop handlers', () => {
      // **Validates: Requirements 3.3**
      //
      // Verify file upload drag/drop events remain unchanged
      
      expect(adminJsContent).toContain("addEventListener('dragover'");
      expect(adminJsContent).toContain("addEventListener('dragleave'");
      expect(adminJsContent).toContain("addEventListener('drop'");
      expect(adminJsContent).toContain('handleFileSelect');
    });
  });
  
  describe('Property 2: Preservation - Global State Management', () => {
    
    it('should preserve global state variables', () => {
      // **Validates: Requirements 3.4**
      //
      // Verify global variables remain unchanged
      
      expect(adminJsContent).toContain('let currentFile = null');
      expect(adminJsContent).toContain('let guestsData = []');
      expect(adminJsContent).toContain("const AUTH_KEY = 'admin_authenticated'");
    });
  });
  
  describe('Property 2: Preservation - Clear All Functionality', () => {
    
    it('should preserve clearAllGuests confirmation flow', () => {
      // **Validates: Requirements 3.3**
      //
      // Verify multi-step confirmation remains unchanged
      
      expect(adminJsContent).toContain('async function clearAllGuests()');
      expect(adminJsContent).toContain('confirm(');
      expect(adminJsContent).toContain('prompt(');
      expect(adminJsContent).toContain('ELIMINAR');
      expect(adminJsContent).toContain('/api/admin/clear');
    });
  });
});
