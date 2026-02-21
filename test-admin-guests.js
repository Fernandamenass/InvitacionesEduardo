// Test admin guests endpoint
const guestService = require('./api/guestService');
const confirmService = require('./api/confirmService');
const db = require('./api/database');

async function test() {
  await db.initializeDatabase();
  
  const guests = await guestService.getAllGuests();
  
  console.log('Testing admin guests endpoint logic...\n');
  
  for (const guest of guests) {
    const link = guestService.generateInviteLink(guest.id);
    const confirmation = await confirmService.getConfirmation(guest.id);
    
    const guestData = {
      id: guest.id,
      name: guest.name,
      phone: guest.phone,
      maxCompanions: guest.maxCompanions,
      link: link,
      confirmed: confirmation !== null && confirmation.confirmed === true,
      companionCount: confirmation ? confirmation.companions.length : 0
    };
    
    console.log(`${guest.name}:`);
    console.log(`  - Confirmed: ${guestData.confirmed}`);
    console.log(`  - Companion count: ${guestData.companionCount}`);
    console.log(`  - Companions: ${confirmation ? confirmation.companions.join(', ') : 'none'}`);
    console.log('');
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
