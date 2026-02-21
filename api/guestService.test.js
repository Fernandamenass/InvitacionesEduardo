import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as guestService from './guestService.js';
import * as db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a unique database path for each test run
function getUniqueDbPath() {
  return path.join(__dirname, `../data/test-guest-service-${Date.now()}-${Math.random().toString(36).substring(7)}.db`);
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

describe('GuestService', () => {
  let TEST_DB_PATH;

  beforeEach(async () => {
    // Generate a unique database path for this test
    TEST_DB_PATH = getUniqueDbPath();
    process.env.DATABASE_PATH = TEST_DB_PATH;
    
    // Clean up test database if it exists
    await safeDeleteDb(TEST_DB_PATH);
    
    // Initialize database
    await db.initializeDatabase();
  });
  
  afterEach(async () => {
    // Clean up test database
    await safeDeleteDb(TEST_DB_PATH);
  });

  describe('Unit Tests', () => {
    describe('createGuest', () => {
      it('should create a guest with valid data', async () => {
        const guestData = {
          name: 'Juan Pérez',
          phone: '+52123456789',
          maxCompanions: 2
        };
        
        const guest = await guestService.createGuest(guestData);
        
        expect(guest).toBeDefined();
        expect(guest.id).toBeDefined();
        expect(guest.name).toBe('Juan Pérez');
        expect(guest.phone).toBe('+52123456789');
        expect(guest.maxCompanions).toBe(2);
      });

      it('should throw error for missing name', async () => {
        const guestData = {
          phone: '+52123456789',
          maxCompanions: 1
        };
        
        await expect(guestService.createGuest(guestData)).rejects.toThrow('Guest name is required');
      });

      it('should throw error for missing phone', async () => {
        const guestData = {
          name: 'Juan Pérez',
          maxCompanions: 1
        };
        
        await expect(guestService.createGuest(guestData)).rejects.toThrow('Guest phone is required');
      });
    });

    describe('getGuestById', () => {
      it('should retrieve an existing guest', async () => {
        const created = await guestService.createGuest({
          name: 'María García',
          phone: '+52987654321',
          maxCompanions: 1
        });
        
        const retrieved = await guestService.getGuestById(created.id);
        
        expect(retrieved).not.toBeNull();
        expect(retrieved.id).toBe(created.id);
        expect(retrieved.name).toBe('María García');
      });

      it('should return null for non-existent ID', async () => {
        const result = await guestService.getGuestById('non-existent-id');
        expect(result).toBeNull();
      });
    });

    describe('getAllGuests', () => {
      it('should return empty array when no guests exist', async () => {
        const guests = await guestService.getAllGuests();
        expect(guests).toEqual([]);
      });

      it('should return all guests', async () => {
        await guestService.createGuest({ name: 'Guest 1', phone: '111', maxCompanions: 1 });
        await guestService.createGuest({ name: 'Guest 2', phone: '222', maxCompanions: 2 });
        await guestService.createGuest({ name: 'Guest 3', phone: '333', maxCompanions: 3 });
        
        const guests = await guestService.getAllGuests();
        expect(guests.length).toBe(3);
      });
    });

    describe('generateInviteLink', () => {
      it('should generate a valid link with guest ID', () => {
        const guestId = 'test-id-123';
        const link = guestService.generateInviteLink(guestId);
        
        expect(link).toContain('/invite/');
        expect(link).toContain('test-id-123');
      });

      it('should use custom base URL when provided', () => {
        const guestId = 'test-id';
        const baseUrl = 'https://custom-domain.com';
        const link = guestService.generateInviteLink(guestId, baseUrl);
        
        expect(link).toBe('https://custom-domain.com/invite/test-id');
      });

      it('should encode special characters in ID', () => {
        const guestId = 'test id with spaces';
        const link = guestService.generateInviteLink(guestId);
        
        expect(link).toContain('test%20id%20with%20spaces');
        expect(link).not.toContain(' ');
      });
    });
  });

  describe('Property 5: Enlaces son únicos por invitado', () => {
    it('should generate unique links for different guests', async () => {
      // Feature: graduacion-eduardo-web, Property 5: Enlaces son únicos por invitado
      // Validates: Requirements 2.1
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              phone: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
              maxCompanions: fc.integer({ min: 1, max: 10 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          async (guestsData) => {
            // Create multiple guests
            const createdGuests = [];
            for (const guestData of guestsData) {
              const guest = await guestService.createGuest(guestData);
              createdGuests.push(guest);
            }
            
            // Generate links for all guests
            const links = createdGuests.map(guest => 
              guestService.generateInviteLink(guest.id)
            );
            
            // All links should be unique
            const uniqueLinks = new Set(links);
            expect(uniqueLinks.size).toBe(links.length);
          }
        ),
        { numRuns: 50 } // Reduced for performance
      );
    }, 10000); // 10 second timeout
  });

  describe('Property 7: Codificación URL maneja caracteres especiales', () => {
    it('should properly encode special characters in guest IDs', () => {
      // Feature: graduacion-eduardo-web, Property 7: Codificación URL maneja caracteres especiales
      // Validates: Requirements 2.5
      
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (guestId) => {
            const link = guestService.generateInviteLink(guestId);
            
            // Link should be a valid URL string
            expect(typeof link).toBe('string');
            expect(link.length).toBeGreaterThan(0);
            
            // Extract the ID part from the link
            const urlParts = link.split('/invite/');
            expect(urlParts.length).toBe(2);
            
            const encodedId = urlParts[1];
            
            // Decode the ID and it should match the original
            const decodedId = decodeURIComponent(encodedId);
            expect(decodedId).toBe(guestId);
            
            // The encoded ID should not contain unencoded special characters
            // that would break URLs (spaces, etc.)
            if (guestId.includes(' ')) {
              expect(encodedId).not.toContain(' ');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Round trip de invitado preserva datos', () => {
    it('should preserve guest data through save and retrieve cycle', async () => {
      // Feature: graduacion-eduardo-web, Property 8: Round trip de invitado preserva datos
      // Validates: Requirements 3.1, 3.2
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            phone: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            maxCompanions: fc.integer({ min: 1, max: 10 })
          }),
          async (guestData) => {
            // Create guest
            const createdGuest = await guestService.createGuest(guestData);
            
            // Generate link
            const link = guestService.generateInviteLink(createdGuest.id);
            
            // Extract ID from link
            const urlParts = link.split('/invite/');
            const encodedId = urlParts[1];
            const extractedId = decodeURIComponent(encodedId);
            
            // Retrieve guest using extracted ID
            const retrievedGuest = await guestService.getGuestById(extractedId);
            
            // Guest should exist
            expect(retrievedGuest).not.toBeNull();
            
            // Data should match
            expect(retrievedGuest.name).toBe(guestData.name.trim());
            expect(retrievedGuest.phone).toBe(guestData.phone.trim());
            expect(retrievedGuest.maxCompanions).toBe(guestData.maxCompanions);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: IDs inexistentes retornan error', () => {
    it('should return null for non-existent guest IDs', async () => {
      // Feature: graduacion-eduardo-web, Property 9: IDs inexistentes retornan error
      // Validates: Requirements 3.4
      
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (nonExistentId) => {
            // Try to retrieve a guest with an ID that doesn't exist
            const result = await guestService.getGuestById(nonExistentId);
            
            // Should return null for non-existent IDs
            expect(result).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
