import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

const {
  PORT = 3000,
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

const erc20Abi = [
  {
    "constant": false,
    "name": "transfer",
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

const token = new web3.eth.Contract(erc20Abi, TOKEN_CONTRACT_ADDRESS);

app.post('/webhook', async (req, res) => {
  try {
    const sig = req.headers['x-nowpayments-sig'];
    if (sig !== NOWPAYMENTS_API_KEY) {
      return res.status(401).send('Invalid signature');
    }

    const {
      payment_status,
      pay_amount,
      pay_address,
      order_description
    } = req.body;

    if (payment_status !== 'finished') {
      return res.status(200).send('Ignored – not finished');
    }

    const rewardTable = {
      'EVAT CORE': 33000,
      'EVAT GROVE': 66000,
      'EVAT GLOBE': 116600,
      'EVAT MAG': 160000,
      'EVAT NEXUS': 200000,
      'EVAT QUANTUM': 300000
    };

    const amount = rewardTable[order_description?.toUpperCase()] ?? 0;
    if (!web3.utils.isAddress(pay_address) || amount === 0) {
      return res.status(400).send('Invalid address or product');
    }

    const tx = await token.methods.transfer(pay_address, amount)
      .send({ from: sender.address, gas: 100000 });

    console.log(`✅ Sent ${amount} EVAT to ${pay_address}. TxHash: ${tx.transactionHash}`);
    return res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Webhook error', err);
    return res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`EVAT token server listening on :${PORT}`));
