const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Teszteléshez a főoldal (Renderhez kell)
app.get('/', (req, res) => {
  res.send('Server is running properly.');
});

// ✅ Token vásárlási logika (példa)
app.post('/buy-token', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'Missing walletAddress or amount' });
    }

    // Itt helyettesítsd be a saját logikád
    console.log(`Vásárlás: ${amount} token a következő címre: ${walletAddress}`);

    // Tesztválasz
    res.status(200).json({ message: 'Token purchase simulated successfully.' });
  } catch (err) {
    console.error('Hiba a /buy-token végponton:', err);
    res.status(500).json({ error: 'Szerverhiba' });
  }
});

// ✅ A Render által megadott portot használd
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT}-on`);
});
