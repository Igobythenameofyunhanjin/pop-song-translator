import { useEffect, useRef, useState } from 'react';
import { translateWithPapago } from './Translator';
import LyricLine from './LyricLine';

const LyricsDisplay = ({ lyrics, currentTime, onSeek, onRendered }) => {
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [hasRendered, setHasRendered] = useState(false); // ✅ ensures callback is only fired once per lyrics
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const versionRef = useRef(0);

  // 🧠 Translate lyrics
  useEffect(() => {
    let cancelled = false;
    const version = ++versionRef.current;
    setTranslatedLyrics([]);
    setHasRendered(false);

    const translate = async () => {
      const englishLines = lyrics.map((item) => item.line);
      const translated = await translateWithPapago(englishLines);

      if (cancelled || version !== versionRef.current) return;

      const combined = lyrics.map((item, i) => ({
        ...item,
        korean: translated[i] || '',
      }));

      setTranslatedLyrics(combined);
    };

    translate();
    return () => {
      cancelled = true;
    };
  }, [lyrics]);

  // ✅ After lyrics have rendered → trigger `onRendered`
  useEffect(() => {
    if (translatedLyrics.length === 0 || hasRendered) return;

    const timeout = setTimeout(() => {
      setHasRendered(true);
      onRendered?.();
    }, 50); // let the DOM render first

    return () => clearTimeout(timeout);
  }, [translatedLyrics, hasRendered, onRendered]);

  // 🎯 Auto-scroll only when not blocked by user
  useEffect(() => {
    if (isUserScrolling) return;

    const el = activeLineRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const offset = el.offsetTop - container.offsetTop;
    container.scrollTo({ top: offset - 100, behavior: 'smooth' });
  }, [currentTime]);

  // 🖱️ Detect manual scroll → block auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false); // re-enable auto-scroll after user stops
      }, 3000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full h-[60vh] overflow-y-auto px-4 scroll-smooth" ref={containerRef}>
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
