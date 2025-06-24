const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.NOWPAYMENTS_API_KEY;
const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
const walletReceiverAddress = process.env.WALLET_RECEIVER_ADDRESS;

app.post("/api/buy", async (req, res) => {
  const { amount, address } = req.body;

  if (!amount || !address) {
    return res.status(400).json({ error: "Missing amount or address" });
  }

  const pricePerTokenUSD = 0.01;
  const totalPriceUSD = amount * pricePerTokenUSD;

  try {
    const paymentResponse = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: totalPriceUSD,
        price_currency: "usd",
        pay_currency: "matic",
        order_id: `evat-${Date.now()}`,
        order_description: `${amount} EVAT token purchase`,
        ipn_callback_url: "https://your-site.com/callback",
        success_url: "https://evatlabs.com/success",
        cancel_url: "https://evatlabs.com/cancel",
        payout_address: walletReceiverAddress,
        is_fixed_rate: true
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    const invoiceUrl = paymentResponse.data.invoice_url;
    res.json({ url: invoiceUrl });
  } catch (err) {
    console.error("NOWPayments error:", err.response?.data || err.message);
    res.status(500).json({ error: "NOWPayments API error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

