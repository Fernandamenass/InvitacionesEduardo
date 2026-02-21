const fs = require('fs');
const path = require('path');
const db = require('./database');
const guestService = require('./guestService');
const confirmService = require('./confirmService');
const excelService = require('./excelService');

describe('API Endpoints Integration Tests', () => {
  let testDbPath;
  let originalDbPath;
  
  beforeEach(async () => {
    // Create unique test database for each test
    testDbPath = path.join(__dirname, '..', 'data', `test-endpoints-${Date.now()}-${Math.random()}.db`);
    originalDbPath = process.env.DATABASE_PATH;
    
    // Clean up if exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Set test database path
    process.env.DATABASE_PATH = testDbPath;
    
    // Initialize database
    await db.initializeDatabase();
  });
  
  afterEach(async () => {
    // Restore original database path
    process.env.DATABASE_PATH = originalDbPath;
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  });
  
  describe('Complete Flow: Import → Generate Links → Confirm → Export', () => {
    it('should handle complete workflow from import to export', async () => {
      // Get initial count
      const initialGuests = await guestService.getAllGuests();
      const initialCount = initialGuests.length;
      
      // Step 1: Import guests from Excel
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const guestData = [
        { nombre: 'Juan Pérez Test', telefono: '+52123456789', pases: 2 },
        { nombre: 'María García Test', telefono: '+52987654321', pases: 1 },
        { nombre: 'Pedro López Test', telefono: '+52555123456', pases: 3 }
      ];
      const worksheet = XLSX.utils.json_to_sheet(guestData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Parse and import
      const parseResult = excelService.parseExcelFile(excelBuffer);
      expect(parseResult.guests).toHaveLength(3);
      expect(parseResult.errors).toHaveLength(0);
      
      const importedGuests = [];
      for (const guest of parseResult.guests) {
        const created = await guestService.createGuest(guest);
        importedGuests.push(created);
      }
      
      expect(importedGuests).toHaveLength(3);
      
      // Step 2: Generate links for newly imported guests
      const allGuests = await guestService.getAllGuests();
      expect(allGuests.length).toBe(initialCount + 3);
      
      const links = importedGuests.map(guest => 
        guestService.generateInviteLink(guest.id)
      );
      
      expect(links).toHaveLength(3);
      expect(links[0]).toContain('/invite/');
      
      // Step 3: Confirm attendance for some guests
      const guest1 = importedGuests[0];
      const guest2 = importedGuests[1];
      
      // Guest 1 confirms with 1 companion (has 2 passes)
      const confirmation1 = await confirmService.saveConfirmation({
        guestId: guest1.id,
        confirmed: true,
        companions: ['Ana Martínez']
      });
      
      expect(confirmation1.companions).toHaveLength(1);
      
      // Guest 2 confirms alone (has 1 pass)
      const confirmation2 = await confirmService.saveConfirmation({
        guestId: guest2.id,
        confirmed: true,
        companions: []
      });
      
      expect(confirmation2.companions).toHaveLength(0);
      
      // Step 4: Export confirmations
      const confirmations = await confirmService.getAllConfirmations();
      expect(confirmations.length).toBeGreaterThanOrEqual(2);
      
      const exportBuffer = excelService.exportConfirmations(confirmations);
      expect(exportBuffer).toBeInstanceOf(Buffer);
      expect(exportBuffer.length).toBeGreaterThan(0);
      
      // Verify exported data contains our test guests
      const exportedWorkbook = XLSX.read(exportBuffer, { type: 'buffer' });
      const exportedSheet = exportedWorkbook.Sheets['Confirmaciones'];
      const exportedData = XLSX.utils.sheet_to_json(exportedSheet);
      
      expect(exportedData.length).toBeGreaterThanOrEqual(2);
      
      // Find our test guests in the export
      const testGuest1 = exportedData.find(d => d.nombre === 'Juan Pérez Test');
      expect(testGuest1).toBeDefined();
      expect(testGuest1.confirmado).toBe('Sí');
      expect(testGuest1.acompañantes).toBe('Ana Martínez');
    }, 10000); // 10 second timeout for integration test
  });
  
  describe('Error Handling', () => {
    it('should handle invalid guest ID in getGuestById', async () => {
      const guest = await guestService.getGuestById('invalid-id');
      expect(guest).toBeNull();
    });
    
    it('should handle missing file in import', async () => {
      // This simulates the endpoint receiving no file
      const parseResult = excelService.parseExcelFile(Buffer.from(''));
      expect(parseResult.errors.length).toBeGreaterThan(0);
    });
    
    it('should handle invalid Excel format', async () => {
      const invalidBuffer = Buffer.from('not an excel file');
      const parseResult = excelService.parseExcelFile(invalidBuffer);
      expect(parseResult.errors.length).toBeGreaterThan(0);
      expect(parseResult.guests).toHaveLength(0);
    });
    
    it('should handle confirmation for non-existent guest', async () => {
      await expect(
        confirmService.saveConfirmation({
          guestId: 'non-existent-id',
          confirmed: true,
          companions: []
        })
      ).rejects.toThrow('Guest not found');
    });
    
    it('should handle exceeding companion limit', async () => {
      const guest = await guestService.createGuest({
        name: 'Test User',
        phone: '+52123456789',
        maxCompanions: 2
      });
      
      // Try to add 2 companions (exceeds limit of 1 for 2 passes)
      await expect(
        confirmService.saveConfirmation({
          guestId: guest.id,
          confirmed: true,
          companions: ['Companion 1', 'Companion 2']
        })
      ).rejects.toThrow('Cannot add 2 companions');
    });
    
    it('should handle empty database export', async () => {
      // Create a fresh empty database for this test
      const emptyConfirmations = [];
      
      const exportBuffer = excelService.exportConfirmations(emptyConfirmations);
      expect(exportBuffer).toBeInstanceOf(Buffer);
      
      // Verify it has headers
      const XLSX = require('xlsx');
      const workbook = XLSX.read(exportBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets['Confirmaciones'];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      // Empty export should have one row with empty values (headers only)
      expect(data).toHaveLength(1);
      expect(data[0].nombre).toBe('');
    });
    
    it('should handle duplicate confirmations (idempotence)', async () => {
      const guest = await guestService.createGuest({
        name: 'Test User Idempotence',
        phone: '+52123456789',
        maxCompanions: 2
      });
      
      // First confirmation
      await confirmService.saveConfirmation({
        guestId: guest.id,
        confirmed: true,
        companions: ['Companion 1']
      });
      
      // Second confirmation (should update, not create new)
      await confirmService.saveConfirmation({
        guestId: guest.id,
        confirmed: true,
        companions: ['Companion 2']
      });
      
      // Get confirmation for this specific guest
      const confirmation = await confirmService.getConfirmation(guest.id);
      expect(confirmation).toBeDefined();
      expect(confirmation.companions).toEqual(['Companion 2']);
    });
  });
  
  describe('Data Validation', () => {
    it('should validate required fields in Excel import', async () => {
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const invalidData = [
        { nombre: 'Juan Pérez', telefono: '', pases: 2 }, // Missing phone
        { nombre: '', telefono: '+52123456789', pases: 1 }, // Missing name
        { nombre: 'Valid User', telefono: '+52987654321', pases: 2 } // Valid
      ];
      const worksheet = XLSX.utils.json_to_sheet(invalidData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const parseResult = excelService.parseExcelFile(excelBuffer);
      
      expect(parseResult.guests).toHaveLength(1); // Only valid user
      expect(parseResult.errors).toHaveLength(2); // Two error rows
      expect(parseResult.errors[0]).toContain('Fila 2');
      expect(parseResult.errors[1]).toContain('Fila 3');
    });
    
    it('should handle special characters in guest names', async () => {
      const guest = await guestService.createGuest({
        name: 'José María Ñoño',
        phone: '+52123456789',
        maxCompanions: 1
      });
      
      const link = guestService.generateInviteLink(guest.id);
      expect(link).toContain('/invite/');
      
      // Retrieve guest
      const retrieved = await guestService.getGuestById(guest.id);
      expect(retrieved.name).toBe('José María Ñoño');
    });
  });
});
