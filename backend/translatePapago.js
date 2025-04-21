import axios from 'axios';
import fs from 'fs';
import path from 'path';
import process from 'process';

const cacheFilePath = path.join(process.cwd(), 'papago_cache.json');
let cache = {};

// Load cache
if (fs.existsSync(cacheFilePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    console.log('📂 Cache loaded');
  } catch (error) {
    console.error('❌ Failed to load cache:', error.message);
  }
}

function saveCacheToDisk() {
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
    console.log('💾 Cache saved to disk');
  } catch (error) {
    console.error('❌ Failed to save cache:', error.message);
  }
}

async function translateLines(lines, targetLang = 'ko') {
  const CLIENT_ID = process.env.PAPAGO_CLIENT_ID;
  const CLIENT_SECRET = process.env.PAPAGO_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing Papago credentials in .env");
  }

  const untranslatedLines = lines.filter(line => !cache[line]);

  if (untranslatedLines.length === 0) {
    return lines.map(line => cache[line]);
  }

  for (const line of untranslatedLines) {
    try {
      const response = await axios.post(
        'https://papago.apigw.ntruss.com/nmt/v1/translation',
        {
          source: 'auto',
          target: targetLang,
          text: line,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
            'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
          },
        }
      );

      const translated = response.data.message.result.translatedText;
      console.log(`✅ Translated: "${line}" → "${translated}"`);
      cache[line] = translated;
    } catch (error) {
      const errorLog = error.response?.data || error.message;
      console.error(`❌ Failed to translate "${line}":`, errorLog);
      cache[line] = '';
    }
  }

  saveCacheToDisk();
  return lines.map(line => cache[line] || '');
}

export { translateLines };
