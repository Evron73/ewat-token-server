const express = require('express');
const cors = require('cors');
const app = express();

// Engedélyezd CORS-t
app.use(cors());
app.use(express.json());
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.port || 3000;

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const WALLET_RECEIVER_ADDRESS = process.env.WALLET_RECEIVER_ADDRESS;

// 💰 Token ára fixen 0.01 USD
const TOKEN_PRICE_USD = 0.01;
// 🛑 Maximális engedélyezett vásárlási érték USD-ben
const MAX_PURCHASE_USD = 10000;

app.post('/buy-token', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Érvénytelen tokenmennyiség.' });
    }

    const usdTotal = amount * TOKEN_PRICE_USD;

    if (usdTotal > MAX_PURCHASE_USD) {
      return res.status(400).json({
        error: `Egyszerre maximum $${MAX_PURCHASE_USD} értékű tokent vásárolhatsz. Ez most $${usdTotal.toFixed(2)} lenne.`
      });
    }

    const paymentRequest = {
      price_amount: usdTotal,
      price_currency: 'usd',
      pay_currency: 'matic',
      order_id: `EVAT-${Date.now()}`,
      payee_address: WALLET_RECEIVER_ADDRESS,
      is_fixed_rate: true,
      ipn_callback_url: "https://yourdomain.com/ipn" // ha nincs, törölhető
    };

    const response = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      paymentRequest,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      message: 'Sikeres kérés',
      invoice_url: response.data.invoice_url
    });

  } catch (err) {
    console.error('Hiba a vásárlás során:', err.response?.data || err.message);
    res.status(500).json({ error: 'Szerverhiba. Kérlek, próbáld újra később.' });
  }
});

app.get('/', (req, res) => {
  res.send('EVAT Token Vásárló Backend él.');
});

app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT}-as porton`);
});
