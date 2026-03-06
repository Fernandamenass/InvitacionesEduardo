# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Environment Variables Not Loaded at Startup
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case - server startup with .env file present
  - Test that process.env.ADMIN_PASSWORD is undefined on server startup (from Fault Condition in design)
  - Test that admin authentication with correct password from .env returns 500 error instead of 200
  - Test that console logs show "ADMIN_PASSWORD environment variable is not set"
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Server Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (all server functionality that doesn't depend on env variables)
  - Observe: GET /index.html returns HTML correctly on unfixed code
  - Observe: GET /api/health returns 200 on unfixed code
  - Observe: GET /api/guest/:id works correctly on unfixed code
  - Observe: POST /api/confirm works correctly on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for dotenv configuration

  - [x] 3.1 Implement the fix
    - Add `require('dotenv').config();` as the FIRST line of server.js
    - Ensure it's placed before any other require() statements
    - Ensure it's placed before any code that accesses process.env (line 11 accesses process.env.PORT)
    - Verify no other changes are needed - the rest of the code is correct
    - _Bug_Condition: isBugCondition(serverStartup) where dotenv NOT imported AND dotenv.config() NOT called AND process.env.ADMIN_PASSWORD is accessed AND .env file exists_
    - _Expected_Behavior: Environment variables from .env SHALL be loaded into process.env before any application code runs_
    - _Preservation: All server functionality that does NOT depend on environment variables (static file serving, routing, middleware, database operations) SHALL produce exactly the same behavior_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Environment Variables Loaded at Startup
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify process.env.ADMIN_PASSWORD is now defined
    - Verify admin authentication with correct password returns 200
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Server Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify static file serving still works
    - Verify all API endpoints still work
    - Verify health check still returns 200
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
