// This js file is not used anymore.

export async function fetchKoreanMeaning(word) {
    const API_KEY = import.meta.env.VITE_DICTIONARY_API_KEY;
    const url = `https://krdict.korean.go.kr/api/search?key=${API_KEY}&q=${encodeURIComponent(word)}&req_type=json&translated=y&trans_lang=1`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      const firstEntry = data.channel?.item?.[0];
      const firstSense = firstEntry?.sense?.[0];
  
      // You can pick Korean definition or English translation
      const koreanDefinition = firstSense?.definition;
      const englishTranslation = firstSense?.translation?.trans_dfn;
      
      console.log("fetchMeaning.js return:", englishTranslation || koreanDefinition || "No definition found.");

      return englishTranslation || koreanDefinition || "No definition found.";
    } catch (err) {
      console.error("❌ Dictionary fetch failed:", err);
      return "Error fetching meaning.";
    }
  }
  