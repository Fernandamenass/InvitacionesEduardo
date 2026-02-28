# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Script Loads in Production
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to the concrete failing case: admin.html in production with absolute path "/admin.js"
  - Test that when admin.html is loaded in production (Vercel) with script tag src="/admin.js", the script fails to load
  - Test that clicking the authenticate button throws "Uncaught ReferenceError: authenticate is not defined"
  - Test that browser console shows script loading failure (404 or similar)
  - The test assertions should verify: scriptLoaded('admin.js') === false AND typeof authenticate === 'undefined'
  - Run test on UNFIXED code (with absolute path "/admin.js")
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: script loading errors, ReferenceError messages, network tab failures
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (local development where script loads successfully)
  - Write property-based tests capturing observed behavior patterns:
    - Authentication logic works correctly (password verification, session storage, panel display)
    - All admin panel functions work identically (loadGuests, confirmImport, exportConfirmations, copyLink, clearAllGuests)
    - API calls and data processing remain unchanged
    - Local development environment continues to work
  - Property-based testing generates many test cases for stronger guarantees across different admin operations
  - Run tests on UNFIXED code in local development environment
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix for admin script path loading in production

  - [x] 3.1 Implement the fix
    - Open `public/admin.html` and navigate to line 353
    - Change the script tag from `<script src="/admin.js"></script>` to `<script src="admin.js"></script>`
    - Remove the leading slash to use relative path instead of absolute path
    - Save the file (no changes to admin.js required)
    - _Bug_Condition: isBugCondition(input) where input.environment == 'production' AND input.scriptTagPath == '/admin.js' AND NOT scriptLoaded('admin.js')_
    - _Expected_Behavior: scriptLoaded('admin.js') === true AND typeof authenticate === 'function' for all page loads in production_
    - _Preservation: All admin panel operations (authentication, guest management, import/export) must produce identical behavior; admin.js file content remains completely unchanged_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Script Loads in Production
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1 in production environment (Vercel)
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - script loads successfully, authenticate function is defined)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 in both local development and production
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions - all admin functionality works identically)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
