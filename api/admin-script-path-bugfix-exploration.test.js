// Bug Condition Exploration Test - Admin Script Path Fix
// This test verifies the bug exists in production (Vercel) with absolute path "/admin.js"
// **EXPECTED OUTCOME**: This test MUST FAIL on unfixed code - failure confirms the bug exists

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bug Condition Exploration - Admin Script Path in Production', () => {
  
  it('Property 1: Fault Condition - Script tag should use relative path for production compatibility', () => {
    // **Validates: Requirements 1.1, 1.2, 1.3**
    // 
    // This test verifies the bug condition:
    // - admin.html uses absolute path "/admin.js" (UNFIXED CODE)
    // - This causes script loading failure in production (Vercel)
    // - Results in "Uncaught ReferenceError: authenticate is not defined"
    //
    // **CRITICAL**: This test MUST FAIL on unfixed code
    // When it fails, it confirms the bug exists (absolute path is present)
    //
    // **Scoped PBT Approach**: Testing the concrete failing case
    // - Environment: production (Vercel)
    // - Script tag path: "/admin.js" (absolute)
    // - Expected behavior: script should use relative path "admin.js"
    
    // Read the admin.html file
    const adminHtmlPath = path.join(__dirname, '..', 'public', 'admin.html');
    const adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf-8');
    
    // Check if the script tag uses absolute path (bug condition)
    const hasAbsolutePath = adminHtmlContent.includes('<script src="/admin.js"></script>');
    
    // Check if the script tag uses relative path (expected behavior)
    const hasRelativePath = adminHtmlContent.includes('<script src="admin.js"></script>');
    
    // **COUNTEREXAMPLE DOCUMENTATION**:
    // If this test fails (as expected on unfixed code), it means:
    // - Script tag uses absolute path "/admin.js"
    // - In production (Vercel), this causes:
    //   * Browser network tab shows 404 or failed request for /admin.js
    //   * Console shows "Uncaught ReferenceError: authenticate is not defined"
    //   * All admin panel functionality is unavailable
    //   * typeof authenticate === 'undefined'
    //   * scriptLoaded('admin.js') === false
    
    // On UNFIXED code: hasAbsolutePath = true, hasRelativePath = false (TEST FAILS)
    // On FIXED code: hasAbsolutePath = false, hasRelativePath = true (TEST PASSES)
    
    expect(hasAbsolutePath).toBe(false); // Should NOT have absolute path
    expect(hasRelativePath).toBe(true);  // Should have relative path
    
    // Additional verification: ensure the script tag exists
    const hasScriptTag = adminHtmlContent.includes('admin.js');
    expect(hasScriptTag).toBe(true);
  });
  
  it('Property 1: Bug Condition - Absolute path prevents script loading in production', () => {
    // **Validates: Requirements 1.1, 1.2, 1.3**
    //
    // This test documents the bug condition more explicitly:
    // Bug_Condition: isBugCondition(input) where:
    //   input.environment == 'production' 
    //   AND input.scriptTagPath == '/admin.js' 
    //   AND NOT scriptLoaded('admin.js')
    //
    // Expected behavior after fix:
    //   scriptLoaded('admin.js') === true
    //   typeof authenticate === 'function'
    //   All admin panel functions are defined
    
    const adminHtmlPath = path.join(__dirname, '..', 'public', 'admin.html');
    const adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf-8');
    
    // Check if script tag with admin.js exists
    const hasAdminScript = adminHtmlContent.includes('admin.js');
    expect(hasAdminScript).toBe(true); // Script tag should exist
    
    // Extract the script src value
    const scriptMatch = adminHtmlContent.match(/src="([^"]*admin\.js)"/);
    
    if (scriptMatch) {
      const scriptPath = scriptMatch[1];
      
      // **COUNTEREXAMPLE**: On unfixed code, scriptPath will be "/admin.js"
      // This absolute path causes the bug in production:
      // - Browser tries to load from domain root: https://domain.com/admin.js
      // - Vercel routing may not serve static files from root correctly
      // - Script fails to load (404 or similar)
      // - authenticate() function is never defined
      // - Clicking authenticate button throws ReferenceError
      
      // Verify the path is relative (not starting with /)
      expect(scriptPath.startsWith('/')).toBe(false); // Should NOT start with /
      expect(scriptPath).toBe('admin.js'); // Should be relative path
    } else {
      // If no match, fail the test
      expect(scriptMatch).toBeTruthy();
    }
  });
  
  it('Property 1: Expected Behavior - Script should load successfully in all environments', () => {
    // **Validates: Requirements 2.1, 2.2, 2.3**
    //
    // This test encodes the expected behavior:
    // - Script tag uses relative path "admin.js"
    // - Script loads successfully in both development and production
    // - All functions (authenticate, loadGuests, etc.) are available
    //
    // On UNFIXED code: This test FAILS (absolute path present)
    // On FIXED code: This test PASSES (relative path present)
    
    const adminHtmlPath = path.join(__dirname, '..', 'public', 'admin.html');
    const adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf-8');
    
    // Verify admin.js file exists in the same directory
    const adminJsPath = path.join(__dirname, '..', 'public', 'admin.js');
    const adminJsExists = fs.existsSync(adminJsPath);
    expect(adminJsExists).toBe(true);
    
    // Verify the script tag uses relative path for cross-environment compatibility
    const hasCorrectScriptTag = adminHtmlContent.includes('<script src="admin.js"></script>');
    
    // **COUNTEREXAMPLE DOCUMENTATION**:
    // If hasCorrectScriptTag is false (unfixed code):
    // - Script tag uses absolute path "/admin.js"
    // - Production environment (Vercel) fails to load the script
    // - Browser console error: "Uncaught ReferenceError: authenticate is not defined"
    // - Network tab shows failed request for /admin.js
    // - All admin panel functionality is broken
    
    expect(hasCorrectScriptTag).toBe(true);
  });
});
