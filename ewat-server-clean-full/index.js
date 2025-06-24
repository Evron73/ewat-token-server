const express = require('express');
require('dotenv').config();
const app = express();
const fetch = require('node-fetch');

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('EVAT Token Server is running!');
});

// ÚJ: Token vásárlás végpont
app.post('/create-payment', async (req, res) => {
  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ error: 'Missing amount or wallet address' });
  }

  const usdAmount = parseFloat(amount) * 0.0136;

  const invoiceData = {
    price_amount: usdAmount,
    price_currency: "usd",
    pay_currency: "usdttrc20",
    order_description: `EWAT Token Purchase (${amount} tokens)`,
    payout_address: wallet,
    payout_currency: "matic",
    is_fixed_rate: true
  };

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY
      },
      body: JSON.stringify(invoiceData)
    });

    const data = await response.json();
    if (data.invoice_url) {
      res.json({ invoice_url: data.invoice_url });
    } else {
      res.status(500).json({ error: "Invoice creation failed", details: data });
    }
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
