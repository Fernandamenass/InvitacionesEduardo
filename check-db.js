// Script to check database contents
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'invitations.db');
const db = new sqlite3.Database(dbPath);

console.log('\n=== GUESTS ===');
db.all('SELECT * FROM guests', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(`Total guests: ${rows.length}`);
  rows.forEach(row => {
    console.log(`- ${row.name} (${row.phone}) - Max companions: ${row.max_companions}`);
  });
  
  console.log('\n=== CONFIRMATIONS ===');
  db.all('SELECT c.*, g.name as guest_name FROM confirmations c JOIN guests g ON c.guest_id = g.id', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log(`Total confirmations: ${rows.length}`);
    rows.forEach(row => {
      console.log(`- ${row.guest_name}: confirmed=${row.confirmed}, id=${row.id}`);
    });
    
    console.log('\n=== COMPANIONS ===');
    db.all('SELECT co.*, c.guest_id, g.name as guest_name FROM companions co JOIN confirmations c ON co.confirmation_id = c.id JOIN guests g ON c.guest_id = g.id', [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }
      console.log(`Total companions: ${rows.length}`);
      rows.forEach(row => {
        console.log(`- ${row.name} (companion of ${row.guest_name})`);
      });
      
      db.close();
    });
  });
});
