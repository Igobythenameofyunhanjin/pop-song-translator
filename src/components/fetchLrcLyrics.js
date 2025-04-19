
import axios from 'axios';

const fetchLrcLyrics = async (title, artist) => {
  const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`;
  const searchRes = await axios.get(searchUrl);

  if (!searchRes.data || searchRes.data.length === 0) {
    throw new Error("No lyrics found");
  }

  const bestMatch = searchRes.data.find(item => item.syncedLyrics);

  if (!bestMatch || !bestMatch.syncedLyrics) {
    throw new Error("No synced lyrics available");
  }

  const lrcRaw = bestMatch.syncedLyrics;

  // Convert LRC string to [{ time, line }]
  const lrcParsed = lrcRaw.split('\n').map(line => {
    const match = line.match(/\[(\d{2}):(\d{2}(?:\.\d{1,2})?)\](.*)/);
    if (!match) return null;

    const min = parseInt(match[1], 10);
    const sec = parseFloat(match[2]);
    const time = parseFloat((min * 60 + sec).toFixed(2));
    const text = match[3].trim();

    return text ? { time, line: text } : null;
  }).filter(Boolean);

  return lrcParsed;
};

export default fetchLrcLyrics;