import { useRef, useState } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import LyricsDisplay from './components/LyricsDisplay';
import { fetchLyrics } from './components/LyricsFetcher';
import fetchLrcLyrics from './components/fetchLrcLyrics';
import YouTubeSearchBar from './components/YouTubeSearchBar';
import LoadingSpinner from './components/LoadingSpinner'; // 👈 import spinner

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 loading state
  const playerRef = useRef(null); // 👈 this ref will control video time

  const handleSongLoad = async (e) => {
    e.preventDefault();
    const url = e.target.elements.youtubeUrl.value;
    const artist = e.target.elements.artist.value;
    const title = e.target.elements.title.value;

    setVideoUrl(url);
    setLoading(true); // 👈 show spinner

    try {
      const syncedLyrics = await fetchLrcLyrics(title, artist);
      setLyrics(syncedLyrics);
      //console.log("[✅ syncedLyrics Lines]", syncedLyrics);
    } catch (err) {
      alert("Doesn't have the lyrics according to your artist and song title information.\nfill the artist and song title information again and push the Load button again.");
      console.error("Fallback to old method:", err);

      const rawLyrics = await fetchLyrics(artist, title);
      const result = [];

      rawLyrics
        .replace(/^.*?(?=\[Verse|\[Intro|\[Chorus|\[Outro|\[Bridge)/, "")
        .split(/(\[.*?\])/g)
        .filter(Boolean)
        .forEach((part) => {
          if (part.startsWith("[")) {
            result.push(part.trim());
          } else {
            const lines = part
              .replace(/\[.*?\]/g, "")
              .replace(/([a-z])([A-Z])/g, "$1\n$2")
              .replace(/([,!?])(\S)/g, "$1\n$2")
              .replace(/(\))(\S)/g, "$1\n$2")
              .split("\n")
              .map((line) => line.trim())
              .filter(
                (line) =>
                  line.length > 2 &&
                  !line.includes("Contributors") &&
                  !line.includes("Translations") &&
                  !line.includes("Português")
              );

            result.push(...lines);
          }
        });

      const lines = result.map((line, idx) => ({
        time: idx * 5,
        line,
      }));

      setLyrics(lines);
      //console.log("[✅ Clean Parsed Lines]", lines);
    } finally {
      setLoading(false); // 👈 hide spinner
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black text-white p-4">
      {loading && <LoadingSpinner />} {/* 👈 render conditionally */}
      <div className="w-full mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-4">
          🎧 Pop-Song Translator
        </h1>

        <YouTubeSearchBar
          onVideoSelect={(video) => {
            setVideoUrl(video.url);

            // Auto-fill input fields
            const urlInput = document.querySelector('input[name="youtubeUrl"]');
            const artistInput = document.querySelector('input[name="artist"]');
            const titleInput = document.querySelector('input[name="title"]');

            if (urlInput) urlInput.value = video.url;
            if (artistInput) artistInput.value = video.artist;
            if (titleInput) titleInput.value = video.title;

            // Auto-load lyrics by simulating the form submit
            handleSongLoad({
              preventDefault: () => {},
              target: {
                elements: {
                  youtubeUrl: { value: video.url },
                  artist: { value: video.artist },
                  title: { value: video.title },
                },
              },
            });
          }}
        />
        
        <h2 className="text-white font-bold text-center mb-4">
          ✅ Or fill the below text boxes
        </h2>

        <form
          onSubmit={handleSongLoad}
          className="flex flex-col gap-2 items-center"
        >
          <div className="flex items-center gap-2 w-full max-w-2xl">
            <label
              htmlFor="youtubeUrl"
              className="w-32 text-right text-sm text-white"
            >
              YouTube URL:
            </label>
            <input
              id="youtubeUrl"
              name="youtubeUrl"
              type="text"
              placeholder="https://youtube.com/..."
              className="flex-1 p-2 rounded text-orange-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full max-w-2xl">
            <label
              htmlFor="artist"
              className="w-32 text-right text-sm text-white"
            >
              Artist:
            </label>
            <input
              id="artist"
              name="artist"
              type="text"
              placeholder="e.g. Kanye West"
              className="flex-1 p-2 rounded text-orange-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full max-w-2xl">
            <label
              htmlFor="title"
              className="w-32 text-right text-sm text-white"
            >
              Song Title:
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Stronger"
              className="flex-1 p-2 rounded text-orange-400"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded text-black font-bold mt-2"
          >
            Load
          </button>
        </form>

        {videoUrl && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YouTubePlayer
              key={videoUrl}
              ref={playerRef}
              videoUrl={videoUrl}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />

            <LyricsDisplay
              lyrics={lyrics}
              currentTime={currentTime}
              onSeek={(time) => playerRef.current?.seekTo(time)}
            />
          </div>
        )}

        {/* <h4 className="text-1xl text-center mb-4">
          Korean-English Dictionary is supported by: <br />
          National Institute of Korean Language's Korean-English Learners'
          Dictionary 
        </h4> */}

        {/* <div className="flex items-center justify-center">
          <img
            src="src\image.png"
            alt="Centered"
          />
        </div> */}

        <div id="source-from">
          <h4 className="font-bold text-center mb-4">
            🤝 This app is supported by: <br />
            <br />
            🎥 YOUTUBE{" "}
            <a href="https://www.youtube.com/" target="_blank">
              https://www.youtube.com/
            </a>
            <br />
            🤖 ChatGPT{" "}
            <a href="https://chatgpt.com/" target="_blank">
              https://chatgpt.com/
            </a>
            <br />
            🚀 DeepL{" "}
            <a
              href="https://www.deepl.com/en/products/translator"
              target="_blank"
            >
              https://www.deepl.com/en/products/translator
            </a>
            <br />
            🎸 LRCLIB{" "}
            <a href="https://lrclib.net/" target="_blank">
              https://lrclib.net/
            </a>
            <br />
            {/* 🧠 GENIUS{" "}
            <a href="https://genius.com/" target="_blank">
              https://genius.com/
            </a>
            <br /> */}
            📖 KENGDIC{" "}
            <a href="https://github.com/garfieldnate/kengdic" target="_blank">
              https://github.com/garfieldnate/kengdic
            </a>
            <br />
            <br />
            🔎 inquiry: cowarddrone98@gmail.com
          </h4>
        </div>
      </div>
    </div>
  );
}

export default App;
