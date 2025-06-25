const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const NOWPAYMENTS_API_KEY = '83ADNBV-3QH4B8K-M7CXZNE-H4E56XM';
const TOKEN_PRICE_USD = 0.01;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('EVAT Token Payment API is running.');
});

app.post('/buy-token', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing or invalid walletAddress or amount.' });
    }

    const fiatAmount = (amount * TOKEN_PRICE_USD).toFixed(2);

    const payment = {
      price_amount: fiatAmount,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: `evat-${Date.now()}`,
      order_description: `Buy ${amount} EVAT tokens`,
      ipn_callback_url: 'https://yourdomain.com/ipn', // opcionális
      success_url: 'https://evatlabs.com/thankyou',
      cancel_url: 'https://evatlabs.com/cancel',
      buyer_email: 'user@example.com', // opcionális
      payout_address: walletAddress
    };

    const response = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      payment,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      payment_url: response.data.invoice_url,
      amount_requested: amount,
      usd_amount: fiatAmount
    });
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
