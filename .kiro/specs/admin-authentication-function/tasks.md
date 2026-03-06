# Implementation Plan: Admin Authentication Function Accessibility

## Overview

This implementation fixes a JavaScript ReferenceError where the `authenticate` function is not accessible from inline onclick handlers in admin.html. The solution involves moving the script tag to the head with the defer attribute and explicitly exposing functions to the global scope. All changes are made to existing files (admin.html and admin.js) without modifying authentication logic.

## Tasks

- [x] 1. Modify admin.html to fix script loading
  - [x] 1.1 Move script tag from body to head with defer attribute
    - Locate the existing `<script src="/admin.js"></script>` tag in admin.html
    - Move it to the `<head>` section
    - Add `defer` attribute to ensure script executes after DOM parsing
    - Add `onerror="handleScriptError()"` attribute for error handling
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 1.2 Add inline error handler script in head
    - Create inline `<script>` tag in head (before admin.js script tag)
    - Implement `handleScriptError()` function that displays error in auth modal
    - Include error message: "No se pudo cargar admin.js"
    - Log error to console with script path
    - _Requirements: 1.3, 5.1, 5.2_

- [x] 1.3 Write unit tests for script loading modifications
  - Test that script tag is in head with defer attribute
  - Test that script tag has correct path (/admin.js)
  - Test that onerror handler is present
  - Test that handleScriptError displays error message
  - _Requirements: 1.1, 1.2, 1.4, 1.3_

- [x] 2. Modify admin.js to expose functions globally
  - [x] 2.1 Add global function exposure at top of admin.js
    - After all function definitions, add explicit window assignments
    - Expose: authenticate, loadGuests, exportConfirmations, copyLink, copyAllLinks, clearAllGuests, confirmImport, cancelImport
    - Use pattern: `window.functionName = functionName;`
    - _Requirements: 2.1, 2.2, 6.2_
  
  - [x] 2.2 Add diagnostic logging to authenticate function
    - At the start of authenticate function, add check for undefined
    - Log helpful message if function is not in global scope
    - Include suggestion to check script tag and file path
    - _Requirements: 5.3, 5.4_

- [x] 2.3 Write unit tests for global function exposure
  - Test that window.authenticate is defined after loading admin.js
  - Test that all exposed functions are accessible via window object
  - Test that authenticate can be called without ReferenceError
  - Test diagnostic logging when function is undefined
  - _Requirements: 2.1, 2.2, 5.3, 5.4_

- [x] 3. Checkpoint - Verify script loading and function accessibility
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Write integration tests for authentication flow
  - [x] 4.1 Test initial page load behavior
    - Test that auth modal is displayed on page load without authentication
    - Test that admin panel is hidden initially
    - _Requirements: 3.1_
  
  - [x] 4.2 Test successful authentication flow
    - Mock successful API response
    - Test that localStorage is updated with authentication state
    - Test that admin panel becomes visible
    - Test that auth modal is hidden
    - Test that error message is cleared
    - _Requirements: 3.2, 3.4, 4.5_
  
  - [x] 4.3 Test failed authentication scenarios
    - Test invalid password displays "Contraseña incorrecta"
    - Test network error displays "Error al autenticar. Intenta de nuevo."
    - Test that password input is cleared and focused after error
    - Test that error message persists until next attempt
    - _Requirements: 3.3, 3.5, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 4.4 Test keyboard interaction
    - Test that pressing Enter in password field executes authenticate
    - _Requirements: 2.4_

- [x] 5. Write backward compatibility tests
  - Test that authentication logic behavior is unchanged
  - Test that all existing admin functions remain functional (loadGuests, exportConfirmations, etc.)
  - Test that localStorage mechanism is unchanged
  - Test that API endpoint integration is unchanged
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Final checkpoint - Manual browser testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- Each task references specific requirements for traceability
- No authentication logic is modified - only script loading and function exposure
- All changes maintain backward compatibility with existing functionality
- The fix addresses the root cause: timing of script loading and global scope accessibility
