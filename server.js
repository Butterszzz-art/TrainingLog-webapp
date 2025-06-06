const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/config', (req, res) => {
  res.json({
    airtableToken: process.env.AIRTABLE_TOKEN || 'patHs7yemB2TYuOOc.6ed847f094d08b1d30710f9f5763d909d1841a2e7dc63fbdac208133a39ae577',
    airtableBaseId: process.env.AIRTABLE_BASE_ID || 'appmjr4IgnEH72K1b'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
