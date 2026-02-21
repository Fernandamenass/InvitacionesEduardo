// Test confirmation with companions
const confirmService = require('./api/confirmService');
const guestService = require('./api/guestService');
const db = require('./api/database');

async function test() {
  await db.initializeDatabase();
  
  // Get first guest
  const guests = await guestService.getAllGuests();
  if (guests.length === 0) {
    console.log('No guests found');
    return;
  }
  
  const guest = guests[0];
  console.log(`Testing with guest: ${guest.name} (${guest.id})`);
  console.log(`Max companions allowed: ${guest.maxCompanions}`);
  
  // Save confirmation with 1 companion
  console.log('\nSaving confirmation with 1 companion...');
  const result = await confirmService.saveConfirmation({
    guestId: guest.id,
    confirmed: true,
    companions: ['Test Companion']
  });
  
  console.log('Saved:', result);
  
  // Read it back
  console.log('\nReading confirmation back...');
  const confirmation = await confirmService.getConfirmation(guest.id);
  console.log('Retrieved:', confirmation);
  
  console.log('\n✓ Test complete');
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
