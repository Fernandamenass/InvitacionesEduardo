// State management
let guestData = null;
let companions = [];

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');
const mainContentEl = document.getElementById('main-content');
const guestNameEl = document.getElementById('guest-name');
const maxCompanionsEl = document.getElementById('max-companions');
const initialConfirmEl = document.getElementById('initial-confirm');
const confirmBtn = document.getElementById('confirm-btn');
const companionsFormEl = document.getElementById('companions-form');
const companionCountEl = document.getElementById('companion-count');
const companionLimitEl = document.getElementById('companion-limit');
const companionInput = document.getElementById('companion-input');
const addCompanionBtn = document.getElementById('add-companion-btn');
const companionsListEl = document.getElementById('companions-list');
const submitBtn = document.getElementById('submit-btn');
const successMessageEl = document.getElementById('success-message');

// Utility Functions

/**
 * Extract guest ID from URL
 * Supports formats: /invite/:id or /?id=:id or #:id
 */
function extractGuestIdFromUrl() {
  // Try path-based ID first: /invite/abc-123
  const pathMatch = window.location.pathname.match(/\/invite\/([^\/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // Try query parameter: ?id=abc-123
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get('id');
  if (queryId) {
    return queryId;
  }
  
  // Try hash: #abc-123
  const hash = window.location.hash.substring(1);
  if (hash) {
    return hash;
  }
  
  return null;
}

/**
 * Show error state
 */
function showError(message) {
  loadingEl.classList.add('hidden');
  mainContentEl.classList.add('hidden');
  errorMessageEl.textContent = message;
  errorEl.classList.remove('hidden');
}

/**
 * Show main content
 */
function showMainContent() {
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  mainContentEl.classList.remove('hidden');
}

/**
 * Update companion counter display
 */
function updateCompanionCounter() {
  companionCountEl.textContent = companions.length;
  
  // Disable input if limit reached
  const limit = guestData.maxCompanions - 1; // -1 because guest counts as 1
  if (companions.length >= limit) {
    companionInput.disabled = true;
    addCompanionBtn.disabled = true;
    companionInput.placeholder = 'Límite alcanzado';
  } else {
    companionInput.disabled = false;
    addCompanionBtn.disabled = false;
    companionInput.placeholder = 'Nombre del acompañante';
  }
}

/**
 * Render companions list
 */
function renderCompanionsList() {
  companionsListEl.innerHTML = '';
  
  companions.forEach((name, index) => {
    const companionItem = document.createElement('div');
    companionItem.className = 'companion-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'companion-name';
    nameSpan.textContent = name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-companion-btn';
    removeBtn.textContent = 'Eliminar';
    removeBtn.onclick = () => removeCompanion(index);
    
    companionItem.appendChild(nameSpan);
    companionItem.appendChild(removeBtn);
    companionsListEl.appendChild(companionItem);
  });
  
  updateCompanionCounter();
}

/**
 * Add companion to list
 */
function addCompanion() {
  const name = companionInput.value.trim();
  
  if (!name) {
    alert('Por favor ingresa un nombre');
    return;
  }
  
  const limit = guestData.maxCompanions - 1;
  if (companions.length >= limit) {
    alert(`No puedes agregar más de ${limit} acompañante(s)`);
    return;
  }
  
  companions.push(name);
  companionInput.value = '';
  renderCompanionsList();
}

/**
 * Remove companion from list
 */
function removeCompanion(index) {
  companions.splice(index, 1);
  renderCompanionsList();
}

/**
 * Validate form before submission
 */
function validateForm() {
  // Guest must be confirmed (this is implicit since they clicked confirm)
  // Companions must not exceed limit
  const limit = guestData.maxCompanions - 1;
  if (companions.length > limit) {
    return {
      valid: false,
      message: `No puedes agregar más de ${limit} acompañante(s)`
    };
  }
  
  return { valid: true };
}

// API Functions

/**
 * Fetch guest data from API
 */
async function fetchGuestData(guestId) {
  try {
    // Try with path parameter first (works with local server and Vercel)
    let response = await fetch(`/api/guest/${encodeURIComponent(guestId)}`);
    
    // If that fails, try with query parameter
    if (!response.ok && response.status === 404) {
      response = await fetch(`/api/guest?id=${encodeURIComponent(guestId)}`);
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('El enlace de invitación es inválido o no existe');
      }
      throw new Error('Error al cargar datos del invitado');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Submit confirmation to API
 */
async function submitConfirmation() {
  const validation = validateForm();
  if (!validation.valid) {
    alert(validation.message);
    return;
  }
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    const response = await fetch('/api/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestId: guestData.id,
        confirmed: true,
        companions: companions
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar confirmación');
    }
    
    const result = await response.json();
    
    // Show success message
    companionsFormEl.classList.add('hidden');
    successMessageEl.classList.remove('hidden');
    
  } catch (error) {
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Confirmación';
  }
}

// Event Handlers

/**
 * Handle confirm button click
 */
function handleConfirmClick() {
  initialConfirmEl.classList.add('hidden');
  companionsFormEl.classList.remove('hidden');
  
  // Set up companion limit
  const limit = guestData.maxCompanions - 1; // -1 because guest counts as 1
  companionLimitEl.textContent = limit;
  updateCompanionCounter();
}

/**
 * Handle add companion button click
 */
function handleAddCompanionClick() {
  addCompanion();
}

/**
 * Handle Enter key in companion input
 */
function handleCompanionInputKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addCompanion();
  }
}

/**
 * Handle submit button click
 */
function handleSubmitClick() {
  submitConfirmation();
}

// Initialization

/**
 * Initialize the page
 */
async function init() {
  try {
    // Extract guest ID from URL
    const guestId = extractGuestIdFromUrl();
    
    if (!guestId) {
      showError('No se encontró ID de invitado en la URL');
      return;
    }
    
    // Fetch guest data
    guestData = await fetchGuestData(guestId);
    
    // Populate UI with guest data
    guestNameEl.textContent = guestData.name;
    maxCompanionsEl.textContent = guestData.maxCompanions;
    
    // Show main content
    showMainContent();
    
    // Set up event listeners
    confirmBtn.addEventListener('click', handleConfirmClick);
    addCompanionBtn.addEventListener('click', handleAddCompanionClick);
    companionInput.addEventListener('keypress', handleCompanionInputKeyPress);
    submitBtn.addEventListener('click', handleSubmitClick);
    
    // If guest has already confirmed, show message
    if (guestData.hasConfirmed) {
      initialConfirmEl.innerHTML = '<p style="text-align: center; color: #4caf50;">Ya has confirmado tu asistencia anteriormente. Puedes actualizar tu confirmación si lo deseas.</p>';
    }
    
  } catch (error) {
    showError(error.message);
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
