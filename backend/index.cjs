const { pathToFileURL } = require('url'); // ✅ Required for Windows ESM path fix
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🎧 Backend is running');
});


// ✅ Dynamically import ESM route using file:// URL
(async () => {
  const routePath = pathToFileURL(path.resolve('./routes/translate.js'));
  const { default: translateRouter } = await import(routePath.href);
  app.use('/api', translateRouter);

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Backend listening on http://localhost:${PORT}`);
  });
})();

app.get('/api/translate-word', async (req, res) => {
  const word = req.query.word;
  if (!word) return res.status(400).json({ error: 'No word provided' });

  try {
    const { translateLines } = await import('./translateDeepL.js');
    const result = await translateLines([word]);
    res.json({ translated: result[0] || 'No translation' });
  } catch (err) {
    console.error('❌ Word translation failed:', err.message);
    res.status(500).json({ error: 'Translation error' });
  }
});


app.get('/lyrics', async (req, res) => {
  const { artist, title } = req.query;
  const searchQuery = `${artist} ${title}`;
  const token = process.env.GENIUS_ACCESS_TOKEN;

  try {
    const searchRes = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const hit = searchRes.data.response.hits.find(hit =>
      hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
    );

    if (!hit) {
      return res.status(404).json({ error: 'No lyrics found' });
    }

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

app.listen(3001, () => console.log('🚀 Backend listening on port 3001'));
