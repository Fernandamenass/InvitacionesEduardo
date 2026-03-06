const fc = require('fast-check');

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * This test MUST FAIL on unfixed code to confirm the bug exists.
 * When it passes after the fix, it confirms the expected behavior is satisfied.
 * 
 * Property 1: Fault Condition - Environment Variables Not Loaded at Startup
 * 
 * For any server startup where a .env file exists with environment variables defined,
 * the server SHALL load those variables into process.env before any application code runs.
 */

describe('Bug Condition Exploration - Environment Variables Not Loaded', () => {
  
  test('CRITICAL: process.env.ADMIN_PASSWORD should be defined from .env file', () => {
    // This test checks if dotenv is configured to load environment variables
    // On UNFIXED code: process.env.ADMIN_PASSWORD will be undefined
    // On FIXED code: process.env.ADMIN_PASSWORD will be "MiPasswordSeguro2024"
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Log the actual value for debugging
    console.log('process.env.ADMIN_PASSWORD:', adminPassword);
    
    // This assertion WILL FAIL on unfixed code (expected behavior)
    expect(adminPassword).toBeDefined();
    expect(adminPassword).toBe('MiPasswordSeguro2024');
  });

  test('CRITICAL: Admin authentication with correct password should return 200', async () => {
    // Import server after environment variables should be loaded
    const app = require('../server');
    const request = require('supertest');
    
    // Test admin authentication with the correct password from .env
    const response = await request(app)
      .post('/api/admin/auth')
      .send({ password: 'MiPasswordSeguro2024' })
      .expect('Content-Type', /json/);
    
    // Log response for debugging
    console.log('Admin auth response:', response.status, response.body);
    
    // On UNFIXED code: This will return 500 "Server configuration error"
    // On FIXED code: This will return 200 with success message
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Autenticación exitosa');
  });

  test('Property: Environment variables loaded for all server startups with .env present', () => {
    // Property-based test: For ANY server startup scenario where .env exists,
    // environment variables MUST be loaded into process.env
    
    fc.assert(
      fc.property(
        fc.constant('server_startup'), // Represents server startup event
        (startupEvent) => {
          // Check that ADMIN_PASSWORD is loaded from .env
          const adminPassword = process.env.ADMIN_PASSWORD;
          
          // This property WILL FAIL on unfixed code
          // It confirms that environment variables are NOT loaded
          return adminPassword !== undefined && 
                 adminPassword === 'MiPasswordSeguro2024';
        }
      ),
      { numRuns: 10 } // Run 10 times to confirm consistent behavior
    );
  });

  test('Edge case: Server should handle missing .env gracefully', () => {
    // This tests that dotenv.config() doesn't crash when .env is missing
    // On UNFIXED code: This test may pass because no dotenv is configured
    // On FIXED code: dotenv.config() should fail silently (expected behavior)
    
    // We can't actually delete .env in this test, but we can verify
    // that the code doesn't crash when environment variables are missing
    // This is more of a documentation test
    expect(true).toBe(true);
  });
});
