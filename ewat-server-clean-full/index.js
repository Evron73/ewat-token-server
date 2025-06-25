app.get('/', (req, res) => {
  res.send('Server is running properly.');
});
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Teszt route (ellenőrzéshez)
app.get('/', (req, res) => {
  res.send('Server is running properly.');
});

// Ide jön majd a crypto fizetés API endpoint
app.post('/buy', async (req, res) => {
  // Ide jön a vásárlási logika később
  res.json({ message: 'Buy endpoint működik' });
});

// ⚠️ Ne írd fixen a 3000-es portot!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT}-on`);
});
