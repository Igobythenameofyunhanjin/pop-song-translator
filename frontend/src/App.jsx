import { useRef, useState } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import LyricsDisplay from './components/LyricsDisplay';
import fetchLrcLyrics from './components/fetchLrcLyrics';
import YouTubeSearchBar from './components/YouTubeSearchBar';
//import LoadingSpinner from './components/LoadingSpinner'; // 👈 import spinner
import { Helmet } from 'react-helmet';
import LoadingProgressBar from './components/LoadingProgressBar';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 loading state
  const playerRef = useRef(null); // 👈 this ref will control video time
  const playerContainerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const handleLyricsRendered = () => {
    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      setLoading(false);
    }, 100); // let scroll feel smoother
  };
  
  
  
  const handleSongLoad = async (e) => {
    e.preventDefault();
    const url = e.target.elements.youtubeUrl.value;
    const artist = e.target.elements.artist.value;
    const title = e.target.elements.title.value;
  
    setVideoUrl(url);
    setLoading(true);      // Show spinner
   
    try {
      const syncedLyrics = await fetchLrcLyrics(title, artist);
      setLyrics(syncedLyrics); // Trigger re-render
    } catch (err) {
      alert(
        "Doesn't have the lyrics according to your artist and song title information.\n\n가수와 노래 제목에 해당하는 가사가 없습니다.\n\nFill the proper artist and song title information again and push the Load button again.\n\n정확한 가수와 노래 제목을 다시 입력하여주시고 로드 버튼을 다시 눌러주세요."
      );
      console.error("err:", err);
      setLoading(false); // Hide spinner even if failed
    }
  };
  

  return (
    <>
      <Helmet>
        <title>
          Pop Song Translator | Translate English Lyrics to Korean | 영어-한국어
          팝송 번역기
        </title>
        <meta
          name="description"
          content="Translate English pop or hip-hop lyrics into Korean, line-by-line with synced YouTube video. 영어-한국어 팝송 번역기입니다."
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content="Pop Song Translator | 영어-한국어 팝송 번역기"
        />
        <meta
          property="og:description"
          content="Enjoy translated lyrics synced with music. 영어-한국어 가사를 함께 즐기세요."
        />
        <meta
          property="og:url"
          content="https://pop-song-translator.onrender.com/"
        />
      </Helmet>

      <div className="min-h-screen w-screen bg-black text-white p-4">
      {loading && <LoadingProgressBar progress={progress} />}
        <div className="w-full mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-4">
            🎧 Pop Song Translator <br />
            (팝송 번역기)
          </h1>
          <h1 className="text-base font-bold text-center mb-4">
            📝 Translate English to Korean <br />
            (영어-한국어 팝송 번역)
          </h1>
          <YouTubeSearchBar
            onVideoSelect={(video) => {
              setVideoUrl(video.url);

              // Auto-fill input fields
              const urlInput = document.querySelector(
                'input[name="youtubeUrl"]'
              );
              const artistInput = document.querySelector(
                'input[name="artist"]'
              );
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
            ✅ Or fill the below text boxes <br />
            (혹은 아래에 있는 텍스트 박스들을 채워주세요)
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
                YouTube URL (유튜브 링크):
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
                Artist (가수):
              </label>
              <input
                id="artist"
                name="artist"
                type="text"
                placeholder="e.g. Kanye West (예시)"
                className="flex-1 p-2 rounded text-orange-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full max-w-2xl">
              <label
                htmlFor="title"
                className="w-32 text-right text-sm text-white"
              >
                Song Title (노래 제목):
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Stronger (예시)"
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
            <div
              ref={playerContainerRef}
              className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
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
                onRendered={handleLyricsRendered} // ✅ pass callback
                onProgress={setProgress} // ✅ add this
              />
            </div>
          )}

          <br />
          <h2 className="text-white font-bold text-center mb-4">
            🖱️ If You click the english vocabulary on the lyrics, You can see
            the korean meaning of that clicked english vocabulary.
            <br />
            (가사 위에 있는 영단어를 클릭하면, 클릭한 영단어의 한국어 의미를
            확인하실 수 있습니다.)
            <br />
            ‼️ If You do double-click the lyric, music sync goes to the lyric
            line which you did double-click.
            <br />
            (가사를 더블클릭 하시면, 더블클릭 하신 가사로 음악 싱크가
            맞춰집니다.)
          </h2>
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
          <br />
          <div id="source-from">
            <h4 className="font-bold text-center mb-4">
              🤝 This app is supported by: <br />
              <br />
              YOUTUBE{" "}
              <br />
              ChatGPT{" "}
              <br />
              DeepL{" "}
              <br />LRCLIB{" "}
              <br />
              <br />
              <br />
              🔎 Inquiry: cowarddrone98@gmail.com
            </h4>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
