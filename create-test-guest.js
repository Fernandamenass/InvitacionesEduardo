const guestService = require('./api/guestService');
const db = require('./api/database');

async function createTestGuest() {
  try {
    // Initialize database
    await db.initializeDatabase();
    console.log('✓ Database initialized');
    
    // Create test guest
    const guest = await guestService.createGuest({
      name: 'Juan Pérez',
      phone: '+52123456789',
      maxCompanions: 3
    });
    
    console.log('\n✓ Test guest created successfully!');
    console.log('\nGuest Details:');
    console.log('  Name:', guest.name);
    console.log('  Phone:', guest.phone);
    console.log('  Max Companions:', guest.maxCompanions);
    
    // Generate invite link
    const link = guestService.generateInviteLink(guest.id);
    console.log('\n🔗 Invite Link:');
    console.log('  ', link);
    console.log('\n👉 Open this link in your browser to see the design!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test guest:', error);
    process.exit(1);
  }
}

createTestGuest();
