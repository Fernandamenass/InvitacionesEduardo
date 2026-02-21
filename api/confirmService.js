const db = require('./database');
const { getGuestById } = require('./guestService');

/**
 * Save confirmation for a guest with companions
 * Validates companion limit and handles duplicate confirmations
 * @param {Object} confirmationData - Confirmation data
 * @param {string} confirmationData.guestId - Guest ID
 * @param {boolean} confirmationData.confirmed - Confirmation status
 * @param {Array<string>} confirmationData.companions - Array of companion names
 * @returns {Promise<Object>} Saved confirmation with ID
 */
async function saveConfirmation(confirmationData) {
  const { guestId, confirmed, companions = [] } = confirmationData;
  
  // Validate required fields
  if (!guestId) {
    throw new Error('Guest ID is required');
  }
  
  if (typeof confirmed !== 'boolean') {
    throw new Error('Confirmation status must be a boolean');
  }
  
  // Get guest to validate existence and check max_companions limit
  const guest = await getGuestById(guestId);
  
  if (!guest) {
    throw new Error('Guest not found');
  }
  
  // Validate companion limit
  // max_companions represents total passes (guest + companions)
  // So allowed companions = max_companions - 1 (subtract the guest)
  const allowedCompanions = guest.maxCompanions - 1;
  
  if (companions.length > allowedCompanions) {
    throw new Error(`Cannot add ${companions.length} companions. Maximum allowed is ${allowedCompanions}`);
  }
  
  // Check if guest already has a confirmation (for idempotence)
  const existingConfirmation = await db.get(
    'SELECT id FROM confirmations WHERE guest_id = ?',
    [guestId]
  );
  
  let confirmationId;
  
  if (existingConfirmation) {
    // Update existing confirmation
    confirmationId = existingConfirmation.id;
    
    await db.run(
      'UPDATE confirmations SET confirmed = ?, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [confirmed, confirmationId]
    );
    
    // Delete existing companions
    await db.run(
      'DELETE FROM companions WHERE confirmation_id = ?',
      [confirmationId]
    );
  } else {
    // Create new confirmation
    const result = await db.run(
      'INSERT INTO confirmations (guest_id, confirmed) VALUES (?, ?)',
      [guestId, confirmed]
    );
    
    confirmationId = result.lastID;
  }
  
  // Insert companions
  for (const companionName of companions) {
    if (companionName && companionName.trim() !== '') {
      await db.run(
        'INSERT INTO companions (confirmation_id, name) VALUES (?, ?)',
        [confirmationId, companionName.trim()]
      );
    }
  }
  
  // Return the saved confirmation with companions
  return {
    id: confirmationId,
    guestId,
    confirmed,
    companions: companions.filter(c => c && c.trim() !== '').map(c => c.trim())
  };
}

/**
 * Get confirmation for a guest
 * @param {string} guestId - Guest ID
 * @returns {Promise<Object|null>} Confirmation data or null if not found
 */
async function getConfirmation(guestId) {
  if (!guestId) {
    throw new Error('Guest ID is required');
  }
  
  const confirmation = await db.get(
    'SELECT id, guest_id as guestId, confirmed, confirmed_at as confirmedAt FROM confirmations WHERE guest_id = ?',
    [guestId]
  );
  
  if (!confirmation) {
    return null;
  }
  
  // Get companions
  const companions = await db.all(
    'SELECT name FROM companions WHERE confirmation_id = ?',
    [confirmation.id]
  );
  
  return {
    ...confirmation,
    confirmed: Boolean(confirmation.confirmed), // Convert SQLite integer to boolean
    companions: companions.map(c => c.name)
  };
}

/**
 * Get all confirmations
 * @returns {Promise<Array>} Array of all confirmations with guest and companion data
 */
async function getAllConfirmations() {
  const confirmations = await db.all(
    `SELECT 
      c.id, 
      c.guest_id as guestId, 
      c.confirmed, 
      c.confirmed_at as confirmedAt,
      g.name as guestName,
      g.phone as guestPhone
    FROM confirmations c
    JOIN guests g ON c.guest_id = g.id
    ORDER BY c.confirmed_at DESC`
  );
  
  // Get companions for each confirmation and convert confirmed to boolean
  for (const confirmation of confirmations) {
    const companions = await db.all(
      'SELECT name FROM companions WHERE confirmation_id = ?',
      [confirmation.id]
    );
    confirmation.companions = companions.map(c => c.name);
    confirmation.confirmed = Boolean(confirmation.confirmed); // Convert SQLite integer to boolean
  }
  
  return confirmations;
}

module.exports = {
  saveConfirmation,
  getConfirmation,
  getAllConfirmations
};
