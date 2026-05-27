const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Contact/Appointment API endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, date, message } = req.body;

  // Basic validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'Vă rugăm să completați toate câmpurile obligatorii (Nume, E-mail, Telefon, Mesaj).'
    });
  }

  // Log submission (simulating database saving/email sending)
  console.log(`[Programare Noua] ${new Date().toISOString()}`);
  console.log(`Pacient: ${name}`);
  console.log(`Contact: Email: ${email} | Tel: ${phone}`);
  console.log(`Serviciu dorit: ${service || 'Nespecificat'}`);
  console.log(`Data preferata: ${date || 'Nespecificat'}`);
  console.log(`Mesaj: ${message}`);
  console.log('--------------------------------------------------');

  // Return elegant success response
  return res.status(200).json({
    success: true,
    message: 'Mesajul și cererea de programare au fost trimise cu succes! Dr. Camelia Szuhanek și echipa Smile Center vă vor contacta în cel mai scurt timp pentru confirmare.'
  });
});

// Fallback to index.html for single-page application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Smile Center Web App running successfully!`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Local Time: ${new Date().toLocaleString()}`);
  console.log(`==================================================`);
});
