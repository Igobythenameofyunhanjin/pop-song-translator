// backend/translateGoogle.js
import { translate } from '@vitalets/google-translate-api';
import { HttpProxyAgent } from 'http-proxy-agent';
import { fetchFreeProxies } from './proxyFetcher.js';
import axios from 'axios';

let proxyList = [];
let proxyIndex = 0;
const badProxies = new Set();

async function validateProxy(proxy) {
  try {
    const [ip, port] = proxy.split(':');
    const res = await axios.get('http://httpbin.org/ip', {
      proxy: { host: ip, port: parseInt(port) },
      timeout: 3000,
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function refreshValidProxies() {
  const allProxies = await fetchFreeProxies();
  const validProxies = [];
  for (const proxy of allProxies) {
    if (await validateProxy(proxy)) {
      validProxies.push(proxy);
    } else {
      console.log(`❌ Proxy validation failed: ${proxy}`);
    }
  }
  console.log('🆕 Validated proxy list:', validProxies);
  return validProxies;
}

export async function translateLines(lines, targetLang = 'ko') {
  const translations = [];

  if (proxyList.length === 0) {
    proxyList = await refreshValidProxies();
    proxyIndex = 0;
  }

  for (const line of lines) {
    if (!line.trim()) {
      translations.push('');
      continue;
    }

    let translated = false;
    let proxyTries = 0;

    while (!translated) {
      if (proxyTries >= proxyList.length) {
        console.log('♻️ All proxies used. Fetching new list...');
        proxyList = await refreshValidProxies();
        proxyIndex = 0;
        proxyTries = 0;
        if (proxyList.length === 0) break;
      }

      const proxy = proxyList[proxyIndex];
      if (badProxies.has(proxy)) {
        proxyIndex = (proxyIndex + 1) % proxyList.length;
        proxyTries++;
        continue;
      }

      console.log(`🌐 Trying proxy: ${proxy} for: "${line}"`);

      try {
        const result = await translate(line, {
          to: targetLang,
          fetchOptions: {
            agent: new HttpProxyAgent(`http://${proxy}`),
            timeout: 10000,
          },
        });
        translations.push(result.text);
        console.log(`✅ Success with proxy: ${proxy}`);
        translated = true;
      } catch (err) {
        console.warn(`❌ Proxy failed (${proxy}):`, err.message);
        badProxies.add(proxy);
        proxyIndex = (proxyIndex + 1) % proxyList.length;
        proxyTries++;

        const backoff = Math.pow(2, proxyTries) * 100;
        await new Promise((res) => setTimeout(res, Math.min(backoff, 5000)));
      }
    }

    if (!translated) {
      console.warn(`❌ Skipped translation: "${line}"`);
      translations.push('');
    }
  }

  return translations;
}
