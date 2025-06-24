const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/create-payment", async (req, res) => {
  const { amount, wallet } = req.body;

  if (!amount || !wallet) {
    return res.status(400).json({ error: "Missing amount or wallet" });
  }

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "matic", // vagy "eth", vagy bármelyik támogatott coin
        order_id: `ewat_${Date.now()}`,
        order_description: `Purchase of ${amount} EWAT tokens`,
        ipn_callback_url: "https://yourdomain.com/ipn",
        success_url: "https://evatlabs.com/success",
        cancel_url: "https://evatlabs.com/cancel",
        is_fixed_rate: true
      })
    });

    const data = await response.json();

    if (data.invoice_url) {
      res.json({ invoice_url: data.invoice_url });
    } else {
      res.status(500).json({ error: "Failed to create invoice", data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
