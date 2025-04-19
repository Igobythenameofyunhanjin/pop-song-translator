import axios from 'axios';

export const translateWithGoogle = async (lines) => {
  //console.log("[Frontend] Sending lines:", lines); // Debug check

  const res = await axios.post('http://localhost:3001/api/translate', {
    lines,           // ✅ must be an array of strings
    targetLang: 'ko'
  });

  return res.data.translations;
};
