import axios from 'axios';
import fs from 'fs';
import path from 'path';
import process from 'process';

const cacheFilePath = path.join(process.cwd(), 'deepl_cache.json');
let cache = {};

// Load cache from disk if exists
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

async function translateLines(lines, targetLang = 'KO', retryCount = 0) {
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  const untranslatedLines = lines.filter(line => !cache[line]);

  if (untranslatedLines.length === 0) {
    return lines.map(line => cache[line]);
  }

  const formData = new URLSearchParams();
  for (const line of untranslatedLines) {
    formData.append('text', line);
  }
  formData.append('target_lang', targetLang);

  try {
    const response = await axios.post('https://api-free.deepl.com/v2/translate', formData, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
  // console.log("response from backend:", response.data);

    const translations = response.data.translations;
    translations.forEach((t, i) => {
      const original = untranslatedLines[i];
      cache[original] = t.text;
      console.log(`✅ Translated: "${original}" → "${t.text}"`);
    });

    saveCacheToDisk();
    return lines.map(line => cache[line] || '');
  } catch (error) {
    if (error.response && error.response.status === 429) {
      if (retryCount < 5) {
        const delay = 2000 + retryCount * 1000;
        console.warn(`⏳ Rate limited. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return translateLines(lines, targetLang, retryCount + 1);
      } else {
        console.error('❌ Max retries reached for 429 error.');
      }
    } else {
      console.error('❌ Translation failed:', error.message);
    }

    return lines.map(line => cache[line] || '');
  }
}

export { translateLines };
