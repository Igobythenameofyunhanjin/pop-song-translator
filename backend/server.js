// This file is not used anymore.

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import xml2js from 'xml2js';
import process from 'process';

dotenv.config();

const app = express();
app.use(cors());
const PORT = 5001;

app.get('/api/define', async (req, res) => {
  const { word } = req.query;

  try {
    const result = await axios.get('https://krdict.korean.go.kr/api/search', {
      params: {
        key: process.env.VITE_DICTIONARY_API_KEY,
        q: word,
        req_type: 'xml',         // Make sure to request XML
        part: 'word',            // Target word-level search
        sort: 'dict',            // Optional: Sort by dictionary order
        advanced: 'y',           // Enable full details
        translated: 'n'          // Korean definitions only
      },
      responseType: 'text'       // Tell axios NOT to parse XML automatically
    });

    const xml = result.data;
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xml, (err, jsonResult) => {
      if (err) {
        return res.status(500).json({ definition: 'XML parse error' });
      }

      const items = jsonResult?.channel?.item;
      const senses = Array.isArray(items)
        ? items[0]?.sense
        : items?.sense;

      const firstDefinition = Array.isArray(senses)
        ? senses[0]?.definition
        : senses?.definition;

      res.json({ definition: firstDefinition || 'No definition found.' });
    });
  } catch (error) {
    console.error('❌ Dictionary fetch failed:', error.message);
    res.status(500).json({ definition: 'Lookup failed.' });
  }
});

app.listen(PORT, () =>
  console.log(`📘 Dictionary API proxy running on http://localhost:${PORT}`)
);
