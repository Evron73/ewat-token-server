const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const web3 = new Web3(process.env.WEB3_PROVIDER);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

const tokenAbi = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  }
];

const tokenContract = new web3.eth.Contract(tokenAbi, process.env.TOKEN_CONTRACT);

app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-nowpayments-sig"];
  if (signature !== process.env.IPN_SECRET) {
    return res.sendStatus(403);
  }

  const payment = req.body;
  if (payment.payment_status !== "finished") {
    return res.sendStatus(200); // Wait until confirmed
  }

  const buyer = payment.order_description; // You can change this to a buyer wallet field
  const tokenAmount = parseFloat(payment.price_amount) / 0.01;

  try {
    const tx = await tokenContract.methods
      .transfer(buyer, web3.utils.toWei(tokenAmount.toString(), "ether"))
      .send({ from: account.address, gas: 100000 });

    console.log("✅ Token sent:", tx.transactionHash);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Transfer error:", err.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("EVAT Token Server is live");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port", process.env.PORT || 3000);
});
