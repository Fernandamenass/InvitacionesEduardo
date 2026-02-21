const XLSX = require('xlsx');
const path = require('path');

// Create example guest data with different pass values
const exampleGuests = [
  {
    nombre: 'Juan Pérez García',
    telefono: '+52123456789',
    pases: 2
  },
  {
    nombre: 'María González López',
    telefono: '+52987654321',
    pases: 1
  },
  {
    nombre: 'Familia Rodríguez',
    telefono: '+52555123456',
    pases: 4
  },
  {
    nombre: 'Carlos Martínez',
    telefono: '+52444987654',
    pases: 3
  },
  {
    nombre: 'Ana Sánchez Díaz',
    telefono: '+52333456789',
    pases: 2
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(exampleGuests);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');

// Create data directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write the file
const outputPath = path.join(dataDir, 'ejemplo-invitados.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Archivo de ejemplo creado exitosamente: ${outputPath}`);
console.log('\nInvitados de ejemplo:');
exampleGuests.forEach((guest, index) => {
  console.log(`${index + 1}. ${guest.nombre} - ${guest.telefono} - ${guest.pases} pases`);
});
