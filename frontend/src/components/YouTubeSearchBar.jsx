import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'; // 👈 import spinner

function YouTubeSearchBar({ onVideoSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const dropdownRef = useRef();
  const [loading, setLoading] = useState(false); // 👈 loading state

  // Debounced YouTube Search
  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true); // 👈 show spinner
        const res = await axios.get(`/api/youtube/search?query=${query}`);
        setResults(res.data);
        setShowDropdown(true);
        setHighlighted(0);
      } catch (err) {
        console.error('❌ YouTube search failed:', err.message);
      } finally {
        setLoading(false); // 👈 hide spinner
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      setHighlighted((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setHighlighted((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlighted]) {
        handleSelect(results[highlighted]);
      }
    }
  };

  const handleSelect = (video) => {
    setQuery('');
    setShowDropdown(false);
    setResults([]);
    onVideoSelect({
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      artist: video.snippet.channelTitle,
      title: video.snippet.title,
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="my-6 w-full flex flex-col items-center relative z-50" ref={dropdownRef}>
      {loading && <LoadingSpinner />} {/* 👈 render conditionally */}
      <input
        type="text"
        value={query}
        placeholder="Search YouTube"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border p-2 w-11/12 sm:w-3/4 lg:w-1/2 text-orange-400 rounded"
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute mt-12 w-11/12 sm:w-3/4 lg:w-1/2 bg-black border border-gray-700 rounded shadow-lg max-h-[300px] overflow-y-auto z-50">
          {results.map((video, idx) => (
            <li
              key={video.id.videoId}
              onClick={() => handleSelect(video)}
              className={`cursor-pointer flex items-center px-4 py-2 gap-3 hover:bg-gray-800 ${
                idx === highlighted ? 'bg-gray-700' : ''
              }`}
            >
              <img
                src={video.snippet.thumbnails.default.url}
                alt={video.snippet.title}
                className="w-12 h-9 rounded"
              />
              <span className="text-sm text-white">{video.snippet.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default YouTubeSearchBar;
