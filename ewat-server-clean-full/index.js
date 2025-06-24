const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('EVAT Token Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});