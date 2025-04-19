// components/LyricsPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import LyricLine from './LyricLine';

const LyricsPlayer = ({ lyrics }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 mt-6">
      <audio ref={audioRef} controls src="/sample_kanye.mp3" />
      <div className="mt-4 space-y-4 text-center">
        {lyrics.map((line, idx) => {
          const nextTime = lyrics[idx + 1]?.time || Infinity;
          const isActive = currentTime >= line.time && currentTime < nextTime;
          return (
            <LyricLine
              key={idx}
              english={line.line}
              korean={line.korean}
              isActive={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LyricsPlayer;
