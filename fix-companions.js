// Script to fix duplicate companions
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'invitations.db');
const db = new sqlite3.Database(dbPath);

console.log('Limpiando acompañantes duplicados...\n');

// Delete all companions
db.run('DELETE FROM companions', [], function(err) {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`✓ ${this.changes} acompañantes eliminados`);
  console.log('✓ Base de datos limpiada');
  console.log('\nAhora puedes volver a confirmar desde la página de invitación.');
  
  db.close();
});
