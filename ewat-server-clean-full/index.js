const express = require('express');
const axios    = require('axios');
const cors     = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.port || 3000;

/* ---- CORS csak POST-ra, teszthez engedjük a Wix domaint is ---- */
app.use(cors({
  origin: ['https://www.evatlabs.com', 'https://evatlabs.com', '*'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* ---- Konstansok ---- */
const NOWPAYMENTS_API_KEY  = process.env.NOWPAYMENTS_API_KEY;
const WALLET_RECEIVER_ADDR = process.env.WALLET_RECEIVER_ADDRESS;
const TOKEN_PRICE_USD      = 0.01;
const MAX_PURCHASE_USD     = 10000;

/* ---- API: POST /buy-token ---- */
app.post('/buy-token', async (req, res) => {
  try {
    const amount = parseInt(req.body.amount, 10);

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Érvénytelen tokenmennyiség.' });
    }

    const usdTotal = amount * TOKEN_PRICE_USD;
    if (usdTotal > MAX_PURCHASE_USD) {
      return res.status(400).json({ error:
        `Egyszerre max $${MAX_PURCHASE_USD}. (Most: $${usdTotal.toFixed(2)})` });
    }

    /* NOWPayments invoice */
    const invoiceRes = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount:     usdTotal,
        price_currency:   'usd',
        pay_currency:     'matic',
        order_id:         `EVAT-${Date.now()}`,
        payee_address:    WALLET_RECEIVER_ADDR,
        is_fixed_rate:    true
      },
      { headers: { 'x-api-key': NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' } }
    );

    res.json({ invoice_url: invoiceRes.data.invoice_url });

  } catch (err) {
    console.error('buy-token error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Szerverhiba.' });
  }
});

/* ---- Root teszt ---- */
app.get('/', (_req, res) => res.send('EVAT backend él ▸ /buy-token'));

app.listen(PORT, () => console.log(`💡 Szerver fut a ${PORT}-on`));
