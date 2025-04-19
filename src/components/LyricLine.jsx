import { useState } from 'react';
import axios from 'axios';
import TooltipPortal from './TooltipPortal';

const LyricLine = ({ english, korean, isActive }) => {
  const [tooltip, setTooltip] = useState({
    show: false,
    text: '',
    x: 0,
    y: 0,
  });

  const handleLongPress = async (word, e) => {
    if (!word || word.length < 2) return;

    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;

    try {
      const response = await axios.get(`http://localhost:3001/api/translate-word?word=${word}`);
      setTooltip({ show: true, text: response.data.translated, x, y });
    } catch (err) {
      console.error('❌ Tooltip translation failed:', err.message);
      setTooltip({ show: true, text: 'Translation failed', x, y });
    }

    setTimeout(() => {
      setTooltip(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleMouseDown = (word, e) => {
    e.persist();
    e.target.dataset.timeout = setTimeout(() => handleLongPress(word, e), 500);
  };

  const handleMouseUp = (e) => {
    clearTimeout(e.target.dataset.timeout);
  };

  return (
    <div
      className={`my-4 text-center transition-all duration-500 transform ${
        isActive ? 'opacity-100 scale-105 animate-bounceLine' : 'opacity-30 scale-100'
      }`}
    >
      {/* English Words */}
      <p className="text-xl sm:text-2xl font-bold text-white mb-1 flex flex-wrap justify-center">
        {english.split(' ').map((word, idx) => (
          <span
            key={idx}
            onMouseDown={(e) => handleMouseDown(word, e)}
            onMouseUp={handleMouseUp}
            className="relative cursor-pointer mx-1 hover:underline"
          >
            {word}
          </span>
        ))}
      </p>

      {/* Korean Translation */}
      <p className="text-lg sm:text-xl text-green-400">{korean}</p>

      {/* Tooltip using React Portal */}
      {tooltip.show && (
        <TooltipPortal>
          <div
            style={{
              position: 'absolute',
              top: tooltip.y + 10,
              left: tooltip.x + 10,
              backgroundColor: 'white',
              color: 'black',
              padding: '6px 12px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              zIndex: 9999,
              fontSize: '14px',
              maxWidth: '240px',
              lineHeight: '1.4',
              wordBreak: 'break-word',
            }}
          >
            {tooltip.text}
          </div>
        </TooltipPortal>
      )}
    </div>
  );
};

export default LyricLine;
