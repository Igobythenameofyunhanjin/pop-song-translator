// backend/routes/translate.js
import express from 'express';
import { translateLines } from '../translateDeepL.js';

const router = express.Router();

router.post('/translate', async (req, res) => {
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

export default router;
