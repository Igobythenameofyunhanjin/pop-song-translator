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

  const handleClick = async (word, e) => {
    if (!word || word.length < 2) return;

    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;

    try {
      const response = await axios.get(`/api/translate-word?word=${word}`);
      setTooltip({ show: true, text: response.data.translated, x, y });
    } catch (err) {
      console.error('❌ Tooltip translation failed:', err.message);
      setTooltip({ show: true, text: 'Translation failed', x, y });
    }

    setTimeout(() => {
      setTooltip(prev => ({ ...prev, show: false }));
    }, 4000);
  };
  
  const handleCloseTooltip = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };
  
  return (
    <div
      className={`my-4 text-center transition-all duration-500 transform ${
        isActive
          ? "opacity-100 scale-105 animate-bounceLine"
          : "opacity-30 scale-100"
      }`}
    >
      
      {/* English Words */}
      <p className="text-xl sm:text-2xl font-bold text-white mb-1 flex flex-wrap justify-center">
        {english.split(" ").map((word, idx) => (
          <span
            key={idx}
            onClick={(e) => handleClick(word, e)}
            className="relative cursor-pointer mx-1 hover:underline"
          >
            {word}
          </span>
        ))}
      </p>

      {/* Korean Translation */}
      <p className="text-lg sm:text-xl text-orange-400">{korean}</p>

      {/* Tooltip using React Portal */}
      {tooltip.show && (
        <TooltipPortal>
          <div
            style={{
              position: "absolute",
              top: tooltip.y + 10,
              left: tooltip.x + 10,
              backgroundColor: "white",
              color: "black",
              padding: "12px 16px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              zIndex: 9999,
              fontSize: "14px",
              maxWidth: "260px",
              lineHeight: "1.4",
              wordBreak: "break-word",
            }}
          >
            {/* Close "×" Button */}
            <button
              onClick={handleCloseTooltip}
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#333",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
            >
              ×
            </button>

            {/* Tooltip Content */}
            <div>{tooltip.text}</div>
          </div>
        </TooltipPortal>
      )}
    </div>
  );
};

export default LyricLine;
