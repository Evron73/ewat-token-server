const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());            // <<< CORS engedélyezése
app.use(express.json());    // <<< JSON-body kezelés

// Egyszerű teszt-end-point
app.get('/', (_, res) => res.send('EVAT Token Server is running!'));

// NOWPayments → invoice készítés
app.post('/create-payment', async (req, res) => {
  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ error: 'amount vagy wallet hiányzik' });
  }

  const usdAmount = parseFloat(amount) * 0.0136;   // 1 EWAT = 0,0136 USD

  const invoiceData = {
    price_amount: usdAmount,
    price_currency: 'usd',
    pay_currency: 'usdttrc20',
    order_description: `EWAT Token purchase (${amount} EWAT)`,
    payout_address: wallet,
    payout_currency: 'matic',
    is_fixed_rate: true
  };

  try {
    const { data } = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      invoiceData,
      { headers: { 'x-api-key': process.env.NOW_API_KEY } }
    );

    if (data && data.invoice_url) {
      return res.json({ invoice_url: data.invoice_url });
    }
    return res.status(500).json({ error: 'Invoice creation failed', details: data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'NOWPayments error', details: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
