import { useEffect, useRef, useState } from 'react';
import { translateWithPapago } from './Translator';
import LyricLine from './LyricLine';

const LyricsDisplay = ({ lyrics, currentTime, onSeek }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // 🧠 Translate once per song
  useEffect(() => {
    const translateAll = async () => {
      const englishLines = lyrics.map((item) => item.line);
      const translatedKoreanLines = await translateWithPapago(englishLines);

      const combined = lyrics.map((item, i) => ({
        ...item,
        korean: translatedKoreanLines[i] || '',
      }));

      setTranslatedLyrics(combined);
    };

    translateAll();
  }, [lyrics]);

  // 🎯 Auto-scroll to active line
  useEffect(() => {
    if (!isAutoScroll || !activeLineRef.current || !containerRef.current) return;

    const topOffset = activeLineRef.current.offsetTop - containerRef.current.offsetTop;
    containerRef.current.scrollTo({ top: topOffset - 100, behavior: 'smooth' });
  }, [currentTime, isAutoScroll]);

  // 🖱️ Detect manual scroll to pause auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsAutoScroll(false);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsAutoScroll(true);
      }, 2000); // Resume auto-scroll after 2s of inactivity
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="w-full h-[60vh] overflow-y-auto px-4 scroll-smooth"
      ref={containerRef}
    >
      {translatedLyrics.map((line, index) => {
        const nextTime = translatedLyrics[index + 1]?.time ?? Infinity;
        const isActive = currentTime >= line.time && currentTime < nextTime;

        return (
          <div
            key={index}
            ref={isActive ? activeLineRef : null}
            onDoubleClick={() => onSeek?.(line.time)}
          >
            <LyricLine
              english={line.line}
              korean={line.korean}
              isActive={isActive}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LyricsDisplay;
