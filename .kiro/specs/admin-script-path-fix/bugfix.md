# Bugfix Requirements Document

## Introduction

The admin panel authentication button fails in production (Vercel deployment) with the error "Uncaught ReferenceError: authenticate is not defined". The root cause is that the script tag in `public/admin.html` uses an absolute path `/admin.js` which doesn't resolve correctly in the production environment, preventing the script from loading. The `authenticate()` function is properly defined in `public/admin.js` (line 33), but the script file itself is not being loaded due to the incorrect path reference.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the admin.html page is loaded in production (Vercel) THEN the script tag with src="/admin.js" fails to load the JavaScript file

1.2 WHEN the user clicks the authenticate button THEN the system throws "Uncaught ReferenceError: authenticate is not defined at HTMLButtonElement.onclick (admin:353:87)"

1.3 WHEN the script fails to load THEN all admin panel functionality becomes unavailable because no JavaScript functions are defined

### Expected Behavior (Correct)

2.1 WHEN the admin.html page is loaded in production (Vercel) THEN the script tag SHALL successfully load the admin.js file using a relative path

2.2 WHEN the user clicks the authenticate button THEN the system SHALL execute the authenticate() function without errors

2.3 WHEN the script loads successfully THEN all admin panel functionality SHALL be available and operational

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the admin.html page is loaded in local development THEN the system SHALL CONTINUE TO load the admin.js file successfully

3.2 WHEN the authenticate() function is called after successful script loading THEN the system SHALL CONTINUE TO perform authentication as designed

3.3 WHEN other admin panel functions are called (loadGuests, confirmImport, exportConfirmations, etc.) THEN the system SHALL CONTINUE TO execute them correctly

3.4 WHEN the admin.js file content is unchanged THEN the system SHALL CONTINUE TO provide all existing functionality without modification
