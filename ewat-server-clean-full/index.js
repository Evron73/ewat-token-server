require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // Engedélyez minden domaint
app.use(express.json());

app.post('/create-payment', async (req, res) => {
  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ error: 'Missing amount or wallet address' });
  }

  try {
    const response = await axios.post('https://api.nowpayments.io/v1/invoice', {
      price_amount: amount * 0.01, // 1 EVAT = 0.01 USD
      price_currency: 'usd',
      pay_currency: 'matic', // vagy 'eth', 'usdt', amit támogat
      order_id: 'evat-' + Date.now(),
      order_description: `EVAT Token Purchase - ${amount} tokens`,
      payout_address: wallet,
      is_fixed_rate: true
    }, {
      headers: {
        'x-api-key': process.env.NOW_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const invoiceUrl = response.data.invoice_url;
    return res.json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error('NOWPayments error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Invoice creation failed',
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
