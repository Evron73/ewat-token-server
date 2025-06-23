const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

const contractABI = [ /* IDE JÖN A TOKEN ABI */ ];
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

app.post("/ipn", async (req, res) => {
  const { payment_status, payout_address, price_amount } = req.body;

  if (payment_status === "finished") {
    const tokenPrice = 0.0136;
    const amount = Math.floor(price_amount / tokenPrice);
    try {
      const tx = contract.methods.transfer(payout_address, web3.utils.toWei(amount.toString(), "ether"));
      const gas = await tx.estimateGas({ from: process.env.FROM_ADDRESS });
      const gasPrice = await web3.eth.getGasPrice();
      const data = tx.encodeABI();
      const nonce = await web3.eth.getTransactionCount(process.env.FROM_ADDRESS);

      const signedTx = await web3.eth.accounts.signTransaction({
        to: process.env.CONTRACT_ADDRESS,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: 137
      }, process.env.PRIVATE_KEY);

      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log("✅ EWAT token sent:", receipt.transactionHash);
    } catch (err) {
      console.error("❌ Token sending error:", err);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 EWAT Server running on port 3000");
});