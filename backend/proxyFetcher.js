import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchFreeProxies() {
  try {
    const { data: html } = await axios.get('https://free-proxy-list.net/');
    const $ = cheerio.load(html);

    // Target the actual table via class names
    const proxyRows = $('table.table-bordered tbody tr');

    const proxies = [];

    proxyRows.each((_, row) => {
      const columns = $(row).find('td');

      const ip = $(columns[0]).text().trim();
      const port = $(columns[1]).text().trim();
      //const country = $(columns[3]).text().trim(); // optional
      const anonymity = $(columns[4]).text().toLowerCase();
      const google = $(columns[5]).text().toLowerCase();
      //const https = $(columns[6]).text().toLowerCase();

      // Filter: anonymous, google-enabled, and HTTPS
      if (anonymity === 'anonymous' && google === 'yes') {
        proxies.push(`${ip}:${port}`);
      }
    });

    console.log('✅ Usable proxies:', proxies.length);
    console.log('🧾 Proxy list:', proxies);
    return proxies;
  } catch (err) {
    console.error('❌ Failed to fetch proxies:', err.message);
    return [];
  }
}
