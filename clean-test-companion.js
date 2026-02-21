// Remove test companion
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'invitations.db');
const db = new sqlite3.Database(dbPath);

console.log('Eliminando acompañante de prueba...\n');

db.run("DELETE FROM companions WHERE name = 'Test Companion'", [], function(err) {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`✓ ${this.changes} acompañante(s) eliminado(s)`);
  
  // Show remaining companions
  db.all('SELECT * FROM companions', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    console.log(`\nAcompañantes restantes: ${rows.length}`);
    rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });
    
    db.close();
  });
});
