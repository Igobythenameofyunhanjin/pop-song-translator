const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const { translateLines } = require('./translateDeepL.js');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve React frontend
const frontendPath = path.resolve(__dirname, '../dist');
app.use(express.static(frontendPath));

// ✅ Translate full lines
app.post('/api/translate', async (req, res) => {
  const { lines, targetLang } = req.body;
  if (!Array.isArray(lines)) {
    return res.status(400).json({ error: 'lines must be an array' });
  }

  try {
    const translations = await translateLines(lines, targetLang || 'ko');
    res.json({ translations });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed', message: err.message });
  }
});

// ✅ Translate individual word (tooltip)
app.get('/api/translate-word', async (req, res) => {
  const word = req.query.word;
  if (!word) return res.status(400).json({ error: 'No word provided' });

  try {
    const result = await translateLines([word]);
    res.json({ translated: result[0] || 'No translation' });
  } catch (err) {
    console.error('❌ Word translation failed:', err.message);
    res.status(500).json({ error: 'Translation error' });
  }
});

// ✅ Lyrics scraping
app.get('/lyrics', async (req, res) => {
  const { artist, title } = req.query;
  const searchQuery = `${artist} ${title}`;
  const token = process.env.GENIUS_ACCESS_TOKEN;

  try {
    const searchRes = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const hit = searchRes.data.response.hits.find(hit =>
      hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
    );

    if (!hit) return res.status(404).json({ error: 'No lyrics found' });

    const songUrl = hit.result.url;
    const html = await axios.get(songUrl);
    const $ = cheerio.load(html.data);
    const lyrics = $('div[data-lyrics-container="true"]').text();

    res.json({ lyrics: lyrics.trim() });
  } catch (err) {
    console.error('Genius lyrics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// ✅ Fallback: React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
