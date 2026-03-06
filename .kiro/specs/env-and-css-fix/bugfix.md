# Bugfix Requirements Document

## Introduction

The graduation invitation system has two critical bugs that prevent proper functionality:

1. Admin authentication fails because environment variables from the .env file are not being loaded into the application, causing `process.env.ADMIN_PASSWORD` to be undefined
2. The application may fail to serve static files properly due to server initialization issues related to the missing dotenv configuration

These bugs prevent administrators from accessing the admin panel and may cause styling issues on invitation pages. The root cause is that while the dotenv package is installed in package.json, it is not configured in server.js to load the .env file at application startup.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the server starts THEN the system does not load environment variables from the .env file because dotenv is not configured

1.2 WHEN an admin attempts to login with the correct password THEN the system returns "Server configuration error" because `process.env.ADMIN_PASSWORD` is undefined

1.3 WHEN the admin authentication endpoint checks for ADMIN_PASSWORD THEN the system logs "ADMIN_PASSWORD environment variable is not set" and returns a 500 error

### Expected Behavior (Correct)

2.1 WHEN the server starts THEN the system SHALL load environment variables from the .env file using dotenv configuration

2.2 WHEN an admin attempts to login with the correct password from the .env file THEN the system SHALL authenticate successfully and return a 200 status with success message

2.3 WHEN the admin authentication endpoint checks for ADMIN_PASSWORD THEN the system SHALL find the value "MiPasswordSeguro2024" from the .env file and validate against it

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the server serves static files from the public directory THEN the system SHALL CONTINUE TO serve CSS, JavaScript, and HTML files correctly

3.2 WHEN a guest accesses an invitation page THEN the system SHALL CONTINUE TO load and display the page with all resources

3.3 WHEN any API endpoint is called THEN the system SHALL CONTINUE TO process requests and return appropriate responses

3.4 WHEN the database is initialized THEN the system SHALL CONTINUE TO initialize successfully

3.5 WHEN admin attempts login with an incorrect password THEN the system SHALL CONTINUE TO return a 401 unauthorized error
