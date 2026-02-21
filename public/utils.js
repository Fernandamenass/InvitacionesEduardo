/**
 * Utility functions for the guest invitation page
 * These functions are extracted for testing purposes
 */

/**
 * Extract guest ID from URL
 * Supports formats: /invite/:id or /?id=:id or #:id
 * @param {string} pathname - The URL pathname
 * @param {string} search - The URL search string
 * @param {string} hash - The URL hash
 * @returns {string|null} - The extracted guest ID or null
 */
function extractGuestIdFromUrl(pathname, search, hash) {
  // Try path-based ID first: /invite/abc-123
  const pathMatch = pathname.match(/\/invite\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // Try query parameter: ?id=abc-123
  const urlParams = new URLSearchParams(search);
  const queryId = urlParams.get('id');
  if (queryId) {
    return queryId;
  }
  
  // Try hash: #abc-123
  const hashValue = hash.substring(1);
  if (hashValue) {
    return hashValue;
  }
  
  return null;
}

/**
 * Validate confirmation form
 * @param {number} companionsCount - Number of companions added
 * @param {number} maxCompanions - Maximum companions allowed (including guest)
 * @returns {Object} - Validation result with valid flag and optional message
 */
function validateConfirmationForm(companionsCount, maxCompanions) {
  // Calculate limit (maxCompanions - 1 because guest counts as 1)
  const limit = maxCompanions - 1;
  
  if (companionsCount > limit) {
    return {
      valid: false,
      message: `No puedes agregar más de ${limit} acompañante(s)`
    };
  }
  
  return { valid: true };
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractGuestIdFromUrl,
    validateConfirmationForm
  };
}
