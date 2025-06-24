const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const WALLET_RECEIVER_ADDRESS = process.env.WALLET_RECEIVER_ADDRESS;

app.post("/create-payment", async (req, res) => {
  const { amount, walletAddress } = req.body;

  try {
    const payment = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: amount * 0.01, // 1 token = $0.01
        price_currency: "usd",
        pay_currency: "matic",
        ipn_callback_url: "https://yourdomain.com/ipn", // opcionális
        order_description: "EVAT Token Purchase",
        purchase_id: Date.now().toString(),
        payout_address: WALLET_RECEIVER_ADDRESS,
        payout_currency: "matic",
        is_fee_paid_by_user: true
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({ redirect_url: payment.data.invoice_url });
  } catch (err) {
    console.error("NOWPayments API error:", err.response?.data || err.message);
    return res.status(500).send("NOWPayments API error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
