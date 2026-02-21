import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, run, get, all } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique database path for each test run
function getUniqueDbPath() {
  return path.join(__dirname, `../data/test-database-${Date.now()}-${Math.random().toString(36).substring(7)}.db`);
}

// Helper to safely delete database file with retries
async function safeDeleteDb(dbPath, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
      return;
    } catch (err) {
      if (err.code === 'EBUSY' && i < maxRetries - 1) {
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 50));
      } else if (err.code !== 'ENOENT') {
        // Only throw if it's not a "file not found" error
        throw err;
      }
    }
  }
}

describe('Database Schema and Connection', () => {
  let TEST_DB_PATH;

  beforeEach(async () => {
    // Generate a unique database path for this test
    TEST_DB_PATH = getUniqueDbPath();
    process.env.DATABASE_PATH = TEST_DB_PATH;
    
    // Clean up test database before each test
    await safeDeleteDb(TEST_DB_PATH);
    await initializeDatabase();
  });

  afterEach(async () => {
    // Clean up test database after each test
    await safeDeleteDb(TEST_DB_PATH);
  });

  describe('Property Tests', () => {
    /**
     * Feature: graduacion-eduardo-web, Property 2: IDs de invitados son únicos
     * Validates: Requirements 1.3
     * 
     * For any set of imported guests, all generated identifiers must be distinct from each other.
     */
    it('Property 2: Guest IDs are unique across multiple insertions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            phone: fc.string({ minLength: 1, maxLength: 20 }),
            max_companions: fc.integer({ min: 1, max: 10 })
          }),
          { minLength: 2, maxLength: 20 } // Reduced from 50 to 20 for performance
        ),
        async (guests) => {
          // Create a unique database for this iteration
          const iterationDbPath = getUniqueDbPath();
          process.env.DATABASE_PATH = iterationDbPath;
          
          try {
            await initializeDatabase();
            
            // Generate unique IDs for each guest
            const guestIds = guests.map(() => uuidv4());
            
            // Insert all guests into database
            for (let i = 0; i < guests.length; i++) {
              await run(
                'INSERT INTO guests (id, name, phone, max_companions) VALUES (?, ?, ?, ?)',
                [guestIds[i], guests[i].name, guests[i].phone, guests[i].max_companions]
              );
            }
            
            // Retrieve all guest IDs from database
            const retrievedGuests = await all('SELECT id FROM guests');
            const retrievedIds = retrievedGuests.map(g => g.id);
            
            // Check that all IDs are unique (no duplicates)
            const uniqueIds = new Set(retrievedIds);
            expect(uniqueIds.size).toBe(retrievedIds.length);
            
            // Check that we have the same number of IDs as we inserted
            expect(retrievedIds.length).toBe(guestIds.length);
          } finally {
            // Clean up iteration database
            await safeDeleteDb(iterationDbPath);
            // Restore the test database path
            process.env.DATABASE_PATH = TEST_DB_PATH;
          }
        }
      ),
      { numRuns: 50 } // Reduced from 100 for performance
    );
  }, 15000); // 15 second timeout for this property test
  });

  describe('Unit Tests', () => {
    // Unit Tests for Database Initialization
  
    it('should successfully initialize database and create all tables', async () => {
    // Database is already initialized in beforeEach
    // Verify that all three tables exist by querying them
    
    const guestsResult = await all('SELECT name FROM sqlite_master WHERE type="table" AND name="guests"');
    expect(guestsResult.length).toBe(1);
    
    const confirmationsResult = await all('SELECT name FROM sqlite_master WHERE type="table" AND name="confirmations"');
    expect(confirmationsResult.length).toBe(1);
    
    const companionsResult = await all('SELECT name FROM sqlite_master WHERE type="table" AND name="companions"');
    expect(companionsResult.length).toBe(1);
  });

  it('should create guests table with correct schema', async () => {
    // Insert a test guest to verify schema
    const testId = uuidv4();
    await run(
      'INSERT INTO guests (id, name, phone, max_companions) VALUES (?, ?, ?, ?)',
      [testId, 'Test Guest', '+1234567890', 2]
    );
    
    const guest = await get('SELECT * FROM guests WHERE id = ?', [testId]);
    
    expect(guest).toBeDefined();
    expect(guest.id).toBe(testId);
    expect(guest.name).toBe('Test Guest');
    expect(guest.phone).toBe('+1234567890');
    expect(guest.max_companions).toBe(2);
    expect(guest.created_at).toBeDefined();
  });

  it('should create confirmations table with correct schema', async () => {
    // First insert a guest
    const guestId = uuidv4();
    await run(
      'INSERT INTO guests (id, name, phone) VALUES (?, ?, ?)',
      [guestId, 'Test Guest', '+1234567890']
    );
    
    // Insert a confirmation
    const result = await run(
      'INSERT INTO confirmations (guest_id, confirmed) VALUES (?, ?)',
      [guestId, 1]
    );
    
    const confirmation = await get('SELECT * FROM confirmations WHERE id = ?', [result.lastID]);
    
    expect(confirmation).toBeDefined();
    expect(confirmation.guest_id).toBe(guestId);
    expect(confirmation.confirmed).toBe(1);
    expect(confirmation.confirmed_at).toBeDefined();
  });

  it('should create companions table with correct schema', async () => {
    // First insert a guest and confirmation
    const guestId = uuidv4();
    await run(
      'INSERT INTO guests (id, name, phone) VALUES (?, ?, ?)',
      [guestId, 'Test Guest', '+1234567890']
    );
    
    const confirmResult = await run(
      'INSERT INTO confirmations (guest_id, confirmed) VALUES (?, ?)',
      [guestId, 1]
    );
    
    // Insert a companion
    await run(
      'INSERT INTO companions (confirmation_id, name) VALUES (?, ?)',
      [confirmResult.lastID, 'Companion Name']
    );
    
    const companions = await all('SELECT * FROM companions WHERE confirmation_id = ?', [confirmResult.lastID]);
    
    expect(companions.length).toBe(1);
    expect(companions[0].name).toBe('Companion Name');
    expect(companions[0].confirmation_id).toBe(confirmResult.lastID);
  });

  it('should establish successful database connection', async () => {
    // Test that we can perform basic operations
    const testId = uuidv4();
    
    // Insert
    await run(
      'INSERT INTO guests (id, name, phone) VALUES (?, ?, ?)',
      [testId, 'Connection Test', '+1111111111']
    );
    
    // Read
    const guest = await get('SELECT * FROM guests WHERE id = ?', [testId]);
    expect(guest).toBeDefined();
    expect(guest.name).toBe('Connection Test');
    
    // Update
    await run('UPDATE guests SET name = ? WHERE id = ?', ['Updated Name', testId]);
    const updatedGuest = await get('SELECT * FROM guests WHERE id = ?', [testId]);
    expect(updatedGuest.name).toBe('Updated Name');
    
    // Delete
    await run('DELETE FROM guests WHERE id = ?', [testId]);
    const deletedGuest = await get('SELECT * FROM guests WHERE id = ?', [testId]);
    expect(deletedGuest).toBeUndefined();
  });
  });
});
