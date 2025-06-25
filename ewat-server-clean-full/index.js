const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Engedélyezzük a CORS-t és JSON kezelést
app.use(cors());
app.use(express.json());

// Teszt route: ellenőrizd, hogy a szerver él-e
app.get('/', (req, res) => {
  res.send('EWAT token server is running');
});

// Vásárlási végpont (pl. NOWPayments API integrációhoz később)
app.post('/buy-token', async (req, res) => {
  try {
    const { walletAddress, tokenAmount } = req.body;

    if (!walletAddress || !tokenAmount) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    // Itt jön majd a NOWPayments logika – ideiglenes válasz:
    return res.status(200).json({
      success: true,
      message: `Purchase request received for ${tokenAmount} tokens to ${walletAddress}`
    });

  } catch (error) {
    console.error('Buy-token error:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Indítjuk a szervert
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT}-on`);
});
