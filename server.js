const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/config', (req, res) => {
  res.json({
    airtableToken: process.env.AIRTABLE_TOKEN || '',
    airtableBaseId: process.env.AIRTABLE_BASE_ID || ''
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
