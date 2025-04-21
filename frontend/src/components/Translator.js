import axios from 'axios';

//Actually using deepL
export const translateWithPapago = async (lines) => {
  //console.log("[Frontend] Sending lines:", lines); // Debug check

  const res = await axios.post('/api/translate', {
    lines,           // ✅ must be an array of strings
    targetLang: 'ko'
  });

  return res.data.translations;
};
