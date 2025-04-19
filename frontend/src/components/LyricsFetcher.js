export const fetchLyrics = async (artist, title) => {
    const res = await fetch(`/lyrics?artist=${artist}&title=${title}`);
    const data = await res.json();
    return data.lyrics || '';
  };
  