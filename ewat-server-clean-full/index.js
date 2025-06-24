const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/create-payment', async (req, res) => {
  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ message: 'Missing amount or wallet address' });
  }

  // 1 EVAT = 0.01 USD (beállított logika)
  const tokenPriceInUSD = 0.01;
  const totalUSD = Number(amount) * tokenPriceInUSD;

  try {
    const paymentResponse = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount: totalUSD,
        price_currency: 'usd',
        pay_currency: 'matic',
        ipn_callback_url: 'https://yourdomain.com/ipn', // nem kötelező, de később jó lehet
        order_id: `EVAT-${Date.now()}`,
        order_description: `Purchase of ${amount} EVAT tokens`,
        success_url: 'https://evatlabs.com/success',
        cancel_url: 'https://evatlabs.com/cancel',
        buyer_email: '', // opcionális
        customer: wallet // fontos: ide a walletet mentjük meg
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const invoiceUrl = paymentResponse.data.invoice_url;
    res.json({ invoice_url: invoiceUrl });

  } catch (error) {
    console.error('NOWPayments error:', error.response?.data || error.message);
    res.status(500).json({ message: 'NOWPayments API error' });
  }
});

app.listen(port, () => {
  console.log(`EVAT Token backend server running on port ${port}`);
});
