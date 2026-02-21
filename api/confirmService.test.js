const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const { createGuest } = require('./guestService');
const { saveConfirmation, getConfirmation, getAllConfirmations } = require('./confirmService');

// Use a test database
const TEST_DB_PATH = path.join(__dirname, '../data/test-confirmations.db');
process.env.DATABASE_PATH = TEST_DB_PATH;

describe('ConfirmService', () => {
  beforeEach(async () => {
    // Clean up test database if it exists
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    
    // Initialize database
    await db.initializeDatabase();
  });
  
  afterEach(() => {
    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Property Tests', () => {
    beforeEach(async () => {
      // Clean database before each property test
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
      await db.initializeDatabase();
    });
    /**
     * Feature: graduacion-eduardo-web, Property 10b: Límite de acompañantes respetado
     * Validates: Requirements 4.3
     * 
     * For any guest with a maximum number of passes assigned, the system must prevent
     * adding more companions than the allowed limit (passes - 1, since the main guest counts as 1)
     */
    it('Property 10b: should respect companion limit based on max_companions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // guest name
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // guest phone
          fc.integer({ min: 1, max: 10 }), // max_companions (total passes)
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 15 }), // companions array
          async (name, phone, maxCompanions, companionsArray) => {
            // Create a guest with specific max_companions
            const guest = await createGuest({
              name,
              phone,
              maxCompanions
            });
            
            // Calculate allowed companions (max_companions - 1 for the guest)
            const allowedCompanions = maxCompanions - 1;
            
            // Try to save confirmation with companions
            if (companionsArray.length > allowedCompanions) {
              // Should reject if exceeds limit
              await expect(
                saveConfirmation({
                  guestId: guest.id,
                  confirmed: true,
                  companions: companionsArray
                })
              ).rejects.toThrow();
            } else {
              // Should accept if within limit
              const confirmation = await saveConfirmation({
                guestId: guest.id,
                confirmed: true,
                companions: companionsArray
              });
              
              expect(confirmation.companions.length).toBeLessThanOrEqual(allowedCompanions);
            }
          }
        ),
        { numRuns: 50 } // Reduced runs to avoid timeout
      );
    }, 10000); // 10 second timeout

    /**
     * Feature: graduacion-eduardo-web, Property 12: Confirmación incluye timestamp
     * Validates: Requirements 5.1
     * 
     * For any confirmation saved in the database, the record must include a timestamp
     * indicating when the confirmation was made
     */
    it('Property 12: should include timestamp in confirmation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // guest name
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // guest phone
          fc.integer({ min: 1, max: 10 }), // max_companions
          fc.boolean(), // confirmed status
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { maxLength: 5 }), // companions
          async (name, phone, maxCompanions, confirmed, companionsArray) => {
            // Create a guest
            const guest = await createGuest({
              name,
              phone,
              maxCompanions
            });
            
            // Filter companions to respect limit
            const allowedCompanions = maxCompanions - 1;
            const companions = companionsArray.slice(0, allowedCompanions);
            
            // Save confirmation
            await saveConfirmation({
              guestId: guest.id,
              confirmed,
              companions
            });
            
            // Retrieve confirmation
            const retrieved = await getConfirmation(guest.id);
            
            // Should have a timestamp
            expect(retrieved).not.toBeNull();
            expect(retrieved.confirmedAt).toBeDefined();
            expect(retrieved.confirmedAt).not.toBeNull();
            expect(typeof retrieved.confirmedAt).toBe('string');
            
            // Timestamp should be a valid date string that can be parsed
            const confirmedAt = new Date(retrieved.confirmedAt);
            expect(isNaN(confirmedAt.getTime())).toBe(false);
          }
        ),
        { numRuns: 50 } // Reduced runs to avoid database connection issues
      );
    }, 10000); // 10 second timeout

    /**
     * Feature: graduacion-eduardo-web, Property 13: Round trip de confirmación preserva datos
     * Validates: Requirements 5.2
     * 
     * For any confirmation sent with main guest, confirmation status and list of companions,
     * saving to database and then retrieving the record should return exactly the same data
     */
    it('Property 13: should preserve confirmation data through save and retrieve cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // guest name
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // guest phone
          fc.integer({ min: 1, max: 10 }), // max_companions
          fc.boolean(), // confirmed status
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { maxLength: 5 }), // companions
          async (name, phone, maxCompanions, confirmed, companionsArray) => {
            // Create a guest
            const guest = await createGuest({
              name,
              phone,
              maxCompanions
            });
            
            // Filter companions to respect limit
            const allowedCompanions = maxCompanions - 1;
            const companions = companionsArray.slice(0, allowedCompanions);
            
            // Trim companions since saveConfirmation trims them
            const trimmedCompanions = companions.map(c => c.trim());
            
            // Save confirmation
            const saved = await saveConfirmation({
              guestId: guest.id,
              confirmed,
              companions
            });
            
            // Retrieve confirmation
            const retrieved = await getConfirmation(guest.id);
            
            // Data should match
            expect(retrieved).not.toBeNull();
            expect(retrieved.guestId).toBe(guest.id);
            expect(retrieved.confirmed).toBe(confirmed);
            
            // Companions should match (order and content, after trimming)
            expect(retrieved.companions.length).toBe(trimmedCompanions.length);
            for (let i = 0; i < trimmedCompanions.length; i++) {
              expect(retrieved.companions[i]).toBe(trimmedCompanions[i]);
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 10000); // 10 second timeout

    /**
     * Feature: graduacion-eduardo-web, Property 14: Confirmaciones duplicadas actualizan registro existente
     * Validates: Requirements 5.5
     * 
     * For any guest who confirms attendance twice, the system should have exactly one
     * confirmation record for that guest (the most recent), not two separate records
     */
    it('Property 14: should update existing confirmation instead of creating duplicate', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // guest name
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // guest phone
          fc.integer({ min: 1, max: 10 }), // max_companions
          fc.boolean(), // first confirmed status
          fc.boolean(), // second confirmed status
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { maxLength: 3 }), // first companions
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { maxLength: 3 }), // second companions
          async (name, phone, maxCompanions, confirmed1, confirmed2, companions1Array, companions2Array) => {
            // Create a guest
            const guest = await createGuest({
              name,
              phone,
              maxCompanions
            });
            
            // Filter companions to respect limit
            const allowedCompanions = maxCompanions - 1;
            const companions1 = companions1Array.slice(0, allowedCompanions);
            const companions2 = companions2Array.slice(0, allowedCompanions);
            
            // Save first confirmation
            const first = await saveConfirmation({
              guestId: guest.id,
              confirmed: confirmed1,
              companions: companions1
            });
            
            // Save second confirmation (should update, not create new)
            const second = await saveConfirmation({
              guestId: guest.id,
              confirmed: confirmed2,
              companions: companions2
            });
            
            // Both should have the same confirmation ID (proving it's an update)
            expect(first.id).toBe(second.id);
            
            // Retrieve confirmation
            const retrieved = await getConfirmation(guest.id);
            
            // Should have exactly one confirmation with the second set of data
            expect(retrieved).not.toBeNull();
            expect(retrieved.guestId).toBe(guest.id);
            expect(retrieved.confirmed).toBe(confirmed2);
            
            // Should have the second set of companions
            const trimmedCompanions2 = companions2.map(c => c.trim());
            expect(retrieved.companions.length).toBe(trimmedCompanions2.length);
            for (let i = 0; i < trimmedCompanions2.length; i++) {
              expect(retrieved.companions[i]).toBe(trimmedCompanions2[i]);
            }
          }
        ),
        { numRuns: 20 } // Reduced runs to avoid database connection issues
      );
    }, 15000); // 15 second timeout
  });
});
