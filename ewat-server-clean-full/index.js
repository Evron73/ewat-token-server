const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const NOWPAYMENTS_API_KEY = "83ADNBV-3QH4B8K-M7CXZNE-H4E56XM";
const TOKEN_PRICE_USD = 0.01;

app.post("/buy-token", async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount) {
      return res.status(400).json({ error: "Missing walletAddress or amount" });
    }

    const priceUSD = amount * TOKEN_PRICE_USD;

    const payment = await axios.post("https://api.nowpayments.io/v1/invoice", {
      price_amount: priceUSD,
      price_currency: "usd",
      pay_currency: "usdt", // vagy "eth", "btc", stb.
      order_id: `evat_${Date.now()}`,
      order_description: `Buy ${amount} EVAT tokens`,
      ipn_callback_url: "https://evat-token-server-1.onrender.com/ipn-callback",
      success_url: "https://evatlabs.com/success",
      cancel_url: "https://evatlabs.com/cancel",
    }, {
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      }
    });

    return res.json({ payment_url: payment.data.invoice_url });

  } catch (error) {
    console.error("Payment error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("EVAT Token Payment Server is running.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

