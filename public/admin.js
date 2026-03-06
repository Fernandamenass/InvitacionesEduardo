// Admin Panel JavaScript

// Authentication
const AUTH_KEY = 'admin_authenticated';

// Authentication is handled server-side via /api/admin/auth endpoint
// Password is validated against ADMIN_PASSWORD environment variable

function checkAuth() {
    // Determine authentication state from localStorage
    const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';

    async function authenticate() {
        // Diagnostic logging for troubleshooting
        if (typeof window.authenticate === 'undefined') {
            console.error(
                'authenticate function is not defined in global scope. ' +
                'Check that admin.js is loaded correctly with the script tag and that functions are exposed to the window object. ' +
                'Verify the script tag path is correct: <script src="/admin.js" defer></script>'
            );
        }

        const password = document.getElementById('passwordInput').value;
        const authError = document.getElementById('authError');

        try {
            // Validate password against server endpoint
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            // Guard: if response has no JSON (HTML error page), read as text
            const contentType = response.headers.get('content-type') || '';
            let data = null;

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.warn('Non-JSON response from /api/admin/auth:', response.status, text.slice(0, 200));
                data = { success: false, message: `Server error (${response.status})` };
            }

            if (response.ok && data && data.success) {
                localStorage.setItem(AUTH_KEY, 'true');
                authError.classList.remove('visible');
                showAdminPanel();
            } else {
                authError.textContent = (data && data.message) ? data.message : 'Password incorrecto';
                authError.classList.add('visible');
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        } catch (error) {
            console.error('Authentication error:', error);
            authError.textContent = 'Error al autenticar. Intenta de nuevo.';
            authError.classList.add('visible');
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    }

    if (isAuthenticated) {
        showAdminPanel();
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('passwordInput').focus();
}

function showAdminPanel() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('adminPanel').style.display = 'block';
    loadGuests();
}

async function authenticate() {
    // Diagnostic logging for troubleshooting
    if (typeof window.authenticate === 'undefined') {
        console.error(
            'authenticate function is not defined in global scope. ' +
            'Check that admin.js is loaded correctly with the script tag and that functions are exposed to the window object. ' +
            'Verify the script tag path is correct: <script src="/admin.js" defer></script>'
        );
    }
    
    const password = document.getElementById('passwordInput').value;
    const authError = document.getElementById('authError');
    
    try {
        // Validate password against server endpoint
        const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem(AUTH_KEY, 'true');
            authError.classList.remove('visible');
            showAdminPanel();
        } else {
            authError.textContent = data.message || 'Password incorrecto';
            authError.classList.add('visible');
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    } catch (error) {
        console.error('Authentication error:', error);
        authError.textContent = 'Error al autenticar. Intenta de nuevo.';
        authError.classList.add('visible');
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    showAuthModal();
}

// Allow Enter key to submit password
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                authenticate();
            }
        });
    }
    
    checkAuth();
});

// Global state
let currentFile = null;
let guestsData = [];

// Utility functions
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message visible ${type}`;
    setTimeout(() => {
        element.classList.remove('visible');
    }, 5000);
}

function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    if (show) {
        element.classList.add('visible');
    } else {
        element.classList.remove('visible');
    }
}

// ===== IMPORT FUNCTIONALITY =====

// Drag and drop handlers
const dropZone = document.getElementById('dropZone');

if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
}

// File input handler
const fileInput = document.getElementById('fileInput');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showMessage('importMessage', 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)', 'error');
        return;
    }
    
    currentFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('guestCount').textContent = 'Calculando...';
    document.getElementById('importPreview').classList.add('visible');
    
    // In a real implementation, we might preview the file content here
    // For now, we'll just show the file is ready
    document.getElementById('guestCount').textContent = 'Listo para importar';
}

function cancelImport() {
    currentFile = null;
    document.getElementById('importPreview').classList.remove('visible');
    document.getElementById('fileInput').value = '';
}

async function confirmImport() {
    if (!currentFile) {
        showMessage('importMessage', 'No hay archivo seleccionado', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', currentFile);
    
    showLoading('importLoading', true);
    document.getElementById('importPreview').classList.remove('visible');
    
    try {
        const response = await fetch('/api/admin/import', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            let message = result.message || `✓ ${result.imported} invitados importados`;
            
            if (result.errors && result.errors.length > 0) {
                message += `\n\nAdvertencias:\n${result.errors.slice(0, 5).join('\n')}`;
                if (result.errors.length > 5) {
                    message += `\n... y ${result.errors.length - 5} más`;
                }
            }
            
            showMessage('importMessage', message, 'success');
            currentFile = null;
            document.getElementById('fileInput').value = '';
            
            // Reload guest list
            setTimeout(() => loadGuests(), 1000);
        } else {
            const errorMsg = result.errors && result.errors.length > 0
                ? `Error: ${result.errors.join(', ')}`
                : 'Error al importar el archivo';
            showMessage('importMessage', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Import error:', error);
        showMessage('importMessage', 'Error de conexión al importar', 'error');
    } finally {
        showLoading('importLoading', false);
    }
}

// ===== GUEST LIST FUNCTIONALITY =====

async function loadGuests() {
    showLoading('guestsLoading', true);
    document.getElementById('guestsTableContainer').innerHTML = '';
    
    try {
        // Add timestamp to prevent caching
        const response = await fetch(`/api/admin/guests?t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar invitados');
        }
        
        const data = await response.json();
        guestsData = data.guests || [];
        
        renderGuestsTable(guestsData);
        updateExportSummary(guestsData);
        
    } catch (error) {
        console.error('Load guests error:', error);
        showMessage('guestsMessage', 'Error al cargar la lista de invitados', 'error');
    } finally {
        showLoading('guestsLoading', false);
    }
}

function renderGuestsTable(guests) {
    const container = document.getElementById('guestsTableContainer');
    
    if (guests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No hay invitados registrados</p>
                <p style="font-size: 0.9rem; color: #999;">Importa un archivo Excel para comenzar</p>
            </div>
        `;
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'guests-table';
    
    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Pases</th>
            <th>Estado</th>
            <th>Acompañantes</th>
            <th>Enlace</th>
            <th>Acción</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    guests.forEach((guest, index) => {
        const row = document.createElement('tr');
        
        const statusBadge = guest.confirmed 
            ? '<span class="status-badge status-confirmed">Confirmado</span>'
            : '<span class="status-badge status-pending">Pendiente</span>';
        
        const companionCount = guest.companionCount || 0;
        
        row.innerHTML = `
            <td>${escapeHtml(guest.name)}</td>
            <td>${escapeHtml(guest.phone)}</td>
            <td>${guest.maxCompanions || 1}</td>
            <td>${statusBadge}</td>
            <td>${companionCount}</td>
            <td class="link-cell" title="${escapeHtml(guest.link)}">${escapeHtml(guest.link)}</td>
            <td>
                <button class="copy-btn" onclick="copyLink(${index})">
                    copy();
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(table);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateExportSummary(guests) {
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.confirmed).length;
    const totalCompanions = guests.reduce((sum, g) => sum + (g.companionCount || 0), 0);
    const totalPeople = confirmedGuests + totalCompanions;
    
    document.getElementById('totalGuests').textContent = totalGuests;
    document.getElementById('confirmedGuests').textContent = confirmedGuests;
    document.getElementById('totalCompanions').textContent = totalCompanions;
    document.getElementById('totalPeople').textContent = totalPeople;
}

// ===== EXPORT FUNCTIONALITY =====

async function exportConfirmations() {
    showLoading('exportLoading', true);
    
    try {
        const response = await fetch('/api/admin/export');
        
        if (!response.ok) {
            throw new Error('Error al exportar');
        }
        
        // Get the blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `confirmaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage('exportMessage', '✓ Archivo Excel descargado exitosamente', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showMessage('exportMessage', 'Error al exportar confirmaciones', 'error');
    } finally {
        showLoading('exportLoading', false);
    }
}

// ===== COPY FUNCTIONALITY =====

async function copyLink(index) {
    if (index < 0 || index >= guestsData.length) {
        return;
    }
    
    const guest = guestsData[index];
    const link = guest.link;
    
    try {
        await navigator.clipboard.writeText(link);
        
        // Visual feedback
        const buttons = document.querySelectorAll('.copy-btn');
        if (buttons[index]) {
            const originalText = buttons[index].textContent;
            buttons[index].textContent = '✓ copied!';
            buttons[index].classList.add('copied');
            
            setTimeout(() => {
                buttons[index].textContent = originalText;
                buttons[index].classList.remove('copied');
            }, 2000);
        }
        
    } catch (error) {
        console.error('Copy error:', error);
        // Fallback for older browsers
        fallbackCopyText(link);
    }
}

async function copyAllLinks() {
    if (guestsData.length === 0) {
        showMessage('guestsMessage', 'No hay invitados para copiar', 'error');
        return;
    }
    
    // Format: Name - Phone - Link
    const formattedList = guestsData.map(guest => {
        return `${guest.name} - ${guest.phone}\n${guest.link}`;
    }).join('\n\n');
    
    try {
        await navigator.clipboard.writeText(formattedList);
        showMessage('guestsMessage', 
            `✓ ${guestsData.length} enlaces copiados al portapapeles`, 
            'success'
        );
    } catch (error) {
        console.error('Copy all error:', error);
        // Fallback for older browsers
        fallbackCopyText(formattedList);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showMessage('guestsMessage', '✓ Copiado al portapapeles', 'success');
    } catch (error) {
        console.error('Fallback copy error:', error);
        showMessage('guestsMessage', 'Error al copiar. Por favor copia manualmente.', 'error');
    }
    
    document.body.removeChild(textArea);
}


// ===== CLEAR ALL GUESTS FUNCTIONALITY =====

async function clearAllGuests() {
    // Confirm action
    const confirmed = confirm(
        '⚠️ ADVERTENCIA: Esta acción eliminará TODOS los invitados y confirmaciones de la base de datos.\n\n' +
        '¿Estás seguro de que deseas continuar?'
    );
    
    if (!confirmed) {
        return;
    }
    
    // Double confirmation
    const doubleConfirmed = confirm(
        '⚠️ ÚLTIMA CONFIRMACIÓN\n\n' +
        'Esta acción NO se puede deshacer.\n\n' +
        'Escribe "ELIMINAR" en el siguiente prompt para confirmar.'
    );
    
    if (!doubleConfirmed) {
        return;
    }
    
    const userInput = prompt('Escribe "ELIMINAR" para confirmar:');
    
    if (userInput !== 'ELIMINAR') {
        showMessage('guestsMessage', 'Operación cancelada', 'error');
        return;
    }
    
    showLoading('guestsLoading', true);
    
    try {
        const response = await fetch('/api/admin/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('guestsMessage', 
                '✓ Todos los invitados han sido eliminados exitosamente', 
                'success'
            );
            
            // Clear the table and reload
            guestsData = [];
            renderGuestsTable([]);
            updateExportSummary([]);
            
        } else {
            showMessage('guestsMessage', 
                result.message || 'Error al limpiar la base de datos', 
                'error'
            );
        }
        
    } catch (error) {
        console.error('Clear all guests error:', error);
        showMessage('guestsMessage', 'Error de conexión al limpiar la base de datos', 'error');
    } finally {
        showLoading('guestsLoading', false);
    }
}

// ===== GLOBAL FUNCTION EXPOSURE =====
// Expose functions to global scope for inline event handlers in admin.html
window.authenticate = authenticate;
window.loadGuests = loadGuests;
window.exportConfirmations = exportConfirmations;
window.copyLink = copyLink;
window.copyAllLinks = copyAllLinks;
window.clearAllGuests = clearAllGuests;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
