const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const NOWPAYMENTS_API_KEY = '83ADNBV-3QH4B8K-M7CXZNE-H4E56XM';
const TOKEN_PRICE_USD = 0.01;

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("EVAT Token Server running");
});

app.post("/buy-token", async (req, res) => {
  const { walletAddress, amount } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ error: "Missing walletAddress or amount" });
  }

  const usdAmount = amount * TOKEN_PRICE_USD;

  try {
    const payment = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: usdAmount,
        price_currency: "usd",
        pay_currency: "usdt", // vagy btc, eth, bármilyen elfogadott coin
        order_description: `Buy ${amount} EVAT tokens for ${walletAddress}`,
        ipn_callback_url: "https://evatlabs.com/ipn",
        success_url: "https://evatlabs.com/success",
        cancel_url: "https://evatlabs.com/cancel",
      },
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ invoice_url: payment.data.invoice_url });
  } catch (err) {
    console.error("NOWPayments Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

