const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Teszt GET endpoint
app.get('/', (req, res) => {
  res.send('EVAT Token server is running!');
});

// POST endpoint token vásárláshoz
app.post('/buy-token', (req, res) => {
  const { walletAddress, amount } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ error: 'Missing walletAddress or amount' });
  }

  console.log(`Received purchase request for ${amount} tokens to ${walletAddress}`);
  return res.status(200).json({ message: 'Token purchase request received.' });
});

// A Render saját portját használjuk
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
