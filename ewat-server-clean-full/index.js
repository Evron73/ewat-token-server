/*************************************************************
 * EVAT Token Server – NOWPayments webhook → automatic transfer
 * -----------------------------------------------------------
 * • Listens on /webhook
 * • When payment_status === 'confirmed'
 *     ‣ sends   amount * 10 000  EVAT   to  pay_address
 * • Root GET (/) answers “server online” so Render health-check
 *   és a böngésző is lát valamit.
 *************************************************************/

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Web3 from 'web3';

dotenv.config();

/* ────────────────────────────────────────────────────────── */
/* ▶️  Environment variables (Render ▶ Environment)          */
const {
  PORT = 10_000,                // Render listens on 10000 → ne változtasd
  WEB3_PROVIDER,                // https://polygon-mainnet.infura.io/v3/<INFURA_KEY>
  PRIVATE_KEY,                  // 0x…   (a küldő wallethez tartozó privát kulcs)
  TOKEN_CONTRACT_ADDRESS        // 0x63d5F96664c1f4997Ca7C20BB195456a0503256
} = process.env;

/* ────────────────────────────────────────────────────────── */
/* ▶️  Express + Web3 bootstrap                              */
const app   = express();
app.use(bodyParser.json());

const web3      = new Web3(WEB3_PROVIDER);
const senderAcc = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(senderAcc);

/* ────────────────────────────────────────────────────────── */
/* ▶️  Minimal ERC-20 ABI csak transfer()                     */
const tokenAbi = [
  {
    constant : false,
    inputs   : [
      { name: '_to',    type: 'address'  },
      { name: '_value', type: 'uint256'  }
    ],
    name     : 'transfer',
    outputs  : [{ name: '', type: 'bool' }],
    type     : 'function'
  }
];

const token = new web3.eth.Contract(tokenAbi, TOKEN_CONTRACT_ADDRESS);

/* ────────────────────────────────────────────────────────── */
/* ▶️  Webhook ENDPOINT                                       */
app.post('/webhook', async (req, res) => {
  try {
    const { payment_status, pay_address, amount } = req.body;

    // 1️⃣ Csak a véglegesített tranzakciókat kezeljük
    if (payment_status !== 'confirmed')
      return res.status(200).send('💤 Payment not confirmed – ignored');

    // 2️⃣ Cím + token mennyiség
    const recipient      = pay_address;
    const tokensToMint   = BigInt(amount) * 10_000n;   // 1$ → 10 000 EVAT

    // 3️⃣ Build & sign TX – fixált gasPrice (40 GWei) → biztos belefér a hálózati minimumba
    const tx = {
      from     : senderAcc.address,
      to       : TOKEN_CONTRACT_ADDRESS,
      gas      : 200_000,
      gasPrice : web3.utils.toWei('40', 'gwei'),       // <── kulcs!
      data     : token.methods.transfer(recipient, tokensToMint).encodeABI()
    };

    const receipt = await web3.eth.sendTransaction(tx);

    console.log(`✅ Tokens sent! ${tokensToMint} → ${recipient} | TX: ${receipt.transactionHash}`);
    res.status(200).send(`✓ OK – ${tokensToMint} EVAT sent`);
  } catch (err) {
    console.error('❌ Token transfer failed:', err);
    res.status(500).send('Token transfer error');
  }
});

/* ────────────────────────────────────────────────────────── */
/* ▶️  Root – egyszerű egészség-ellenőrzés                    */
app.get('/', (_, res) => res.send('EVAT Token Server is online'));

/* ────────────────────────────────────────────────────────── */
app.listen(PORT, () =>
  console.log(`🚀 EVAT token server listening on port ${PORT}`)
);
