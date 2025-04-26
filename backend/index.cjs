const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const { translateLines } = require('./translatePapago.js');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve frontend (Vite build output)
const frontendPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

/* ------------------- TRANSLATE: LINES ------------------- */
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

/* ------------------- TRANSLATE: SINGLE WORD ------------------- */
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

/* ------------------- LYRICS SCRAPER (NOT USING GENIUS ANMORE) ------------------- */
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

/* ------------------- YOUTUBE SEARCH ------------------- */
app.get('/api/youtube/search', async (req, res) => {
  const query = req.query.query;
  const key = process.env.YOUTUBE_API_KEY;

  if (!query || !key) {
    return res.status(400).json({ error: 'Missing query or API key' });
  }

  try {
    // Step 1: Search videos (optimized fields)
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 2,
        key,
        fields: 'items(id/videoId)' // ✅ Only get video IDs
      },
    });

    const searchItems = searchResponse.data.items;
    const videoIds = searchItems.map(item => item.id.videoId).join(',');

    if (!videoIds) {
      return res.json([]);
    }

    // Step 2: Get detailed video info (optimized fields)
    const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        id: videoIds,
        key,
        fields: 'items(id,snippet(title,channelTitle,thumbnails,publishedAt),statistics(viewCount))' // ✅ Only necessary fields
      },
    });

    const detailedItems = detailsResponse.data.items;

    console.log('✅ Detailed Items (optimized):', JSON.stringify(detailedItems, null, 2));

    // Step 3: Format response for frontend
    const enrichedResults = detailedItems.map(item => ({
      id: { videoId: item.id },
      snippet: {
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
      },
      statistics: {
        viewCount: item.statistics?.viewCount,
      },
    }));

    res.json(enrichedResults);

  } catch (err) {
    console.error('❌ YouTube search failed:', err.message);
    res.status(500).json({ error: 'YouTube search error' });
  }
});

/* ------------------- REACT SPA FALLBACK ------------------- */
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

/* ------------------- START SERVER ------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
