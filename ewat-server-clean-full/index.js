import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

const {
  PORT = 10000,
  NOWPAYMENTS_API_KEY,
  WEB3_PROVIDER,
  PRIVATE_KEY,
  TOKEN_CONTRACT_ADDRESS
} = process.env;

const app = express();
app.use(bodyParser.json());

const web3 = new Web3(WEB3_PROVIDER);
const sender = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(sender);

// Token ABI (transfer)
const tokenAbi = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
];

const tokenContract = new web3.eth.Contract(tokenAbi, TOKEN_CONTRACT_ADDRESS);

// ✅ WEBHOOK route
app.post('/webhook', async (req, res) => {
  try {
    const { payment_status, pay_address, amount } = req.body;

    if (payment_status !== 'confirmed') {
      return res.status(200).send('Ignored non-confirmed payment');
    }

    const recipient = pay_address;
    const tokensToSend = parseInt(amount) * 10000;

    const tx = await tokenContract.methods.transfer(recipient, tokensToSend).send({
      from: sender.address,
      gas: 100000
    });

    console.log(`✅ Token sent! TX Hash: ${tx.transactionHash}`);
    res.status(200).send(`Sent ${tokensToSend} tokens to ${recipient}`);
  } catch (error) {
    console.error('❌ Token transfer failed:', error);
    res.status(500).send('Token transfer error');
  }
});

// Optional: Root GET
app.get('/', (req, res) => {
  res.send('EVAT Token Server is online');
});

app.listen(PORT, () => {
  console.log(`🚀 EVAT token server listening on port :${PORT}`);
});

