export const fetchLyrics = async (artist, title) => {
    const res = await fetch(`http://localhost:3001/lyrics?artist=${artist}&title=${title}`);
    const data = await res.json();
    return data.lyrics || '';
  };
  