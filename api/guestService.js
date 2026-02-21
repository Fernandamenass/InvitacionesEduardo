const { v4: uuidv4 } = require('uuid');
const db = require('./database');

/**
 * Create a new guest in the database
 * @param {Object} guestData - Guest data
 * @param {string} guestData.name - Guest name
 * @param {string} guestData.phone - Guest phone
 * @param {number} guestData.maxCompanions - Maximum number of companions allowed
 * @returns {Promise<Object>} Created guest with generated ID
 */
async function createGuest(guestData) {
  const { name, phone, maxCompanions = 1 } = guestData;
  
  // Validate required fields
  if (!name || name.trim() === '') {
    throw new Error('Guest name is required');
  }
  
  if (!phone || phone.trim() === '') {
    throw new Error('Guest phone is required');
  }
  
  // Check if guest with this phone already exists
  const existingGuest = await db.get(
    'SELECT id FROM guests WHERE phone = ?',
    [phone.trim()]
  );
  
  if (existingGuest) {
    throw new Error(`Ya existe un invitado con el teléfono ${phone.trim()}`);
  }
  
  // Generate unique UUID
  const id = uuidv4();
  
  // Insert into database
  await db.run(
    'INSERT INTO guests (id, name, phone, max_companions) VALUES (?, ?, ?, ?)',
    [id, name.trim(), phone.trim(), maxCompanions]
  );
  
  return {
    id,
    name: name.trim(),
    phone: phone.trim(),
    maxCompanions
  };
}

/**
 * Get a guest by ID
 * @param {string} id - Guest ID
 * @returns {Promise<Object|null>} Guest data or null if not found
 */
async function getGuestById(id) {
  if (!id) {
    throw new Error('Guest ID is required');
  }
  
  const guest = await db.get(
    'SELECT id, name, phone, max_companions as maxCompanions, created_at as createdAt FROM guests WHERE id = ?',
    [id]
  );
  
  return guest || null;
}

/**
 * Get all guests from the database
 * @returns {Promise<Array>} Array of all guests
 */
async function getAllGuests() {
  const guests = await db.all(
    'SELECT id, name, phone, max_companions as maxCompanions, created_at as createdAt FROM guests ORDER BY created_at DESC'
  );
  
  return guests;
}

/**
 * Generate invite link for a guest
 * @param {string} guestId - Guest ID
 * @param {string} baseUrl - Base URL for the application (optional, defaults to env variable)
 * @returns {string} Complete invite URL
 */
function generateInviteLink(guestId, baseUrl = null) {
  if (!guestId) {
    throw new Error('Guest ID is required to generate invite link');
  }
  
  // Use provided baseUrl or fall back to environment variable or default
  const base = baseUrl || process.env.BASE_URL || 'http://localhost:3000';
  
  // Ensure base URL doesn't end with slash
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  
  // Encode the guest ID for URL safety (handles special characters)
  const encodedId = encodeURIComponent(guestId);
  
  return `${cleanBase}/invite/${encodedId}`;
}

module.exports = {
  createGuest,
  getGuestById,
  getAllGuests,
  generateInviteLink
};
