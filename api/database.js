const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Get database connection
 * @returns {Promise<sqlite3.Database>} Database instance
 */
function getConnection() {
  // Read DB_PATH dynamically to support test isolation
  const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../data/invitations.db');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

/**
 * Initialize database schema
 * Creates tables: guests, confirmations, companions
 */
async function initializeDatabase() {
  const db = await getConnection();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create guests table
      db.run(`
        CREATE TABLE IF NOT EXISTS guests (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          max_companions INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          db.close();
          return reject(err);
        }
      });

      // Create confirmations table
      db.run(`
        CREATE TABLE IF NOT EXISTS confirmations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guest_id TEXT NOT NULL,
          confirmed BOOLEAN NOT NULL,
          confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (guest_id) REFERENCES guests(id)
        )
      `, (err) => {
        if (err) {
          db.close();
          return reject(err);
        }
      });

      // Create companions table
      db.run(`
        CREATE TABLE IF NOT EXISTS companions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          confirmation_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          FOREIGN KEY (confirmation_id) REFERENCES confirmations(id)
        )
      `, (err) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        db.close((closeErr) => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
async function run(query, params = []) {
  const db = await getConnection();
  
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Get a single row
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Single row result
 */
async function get(query, params = []) {
  const db = await getConnection();
  
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get all rows
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} All rows result
 */
async function all(query, params = []) {
  const db = await getConnection();
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  getConnection,
  initializeDatabase,
  run,
  get,
  all
};
