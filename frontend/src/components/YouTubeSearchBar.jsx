import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { decode } from 'html-entities';

function formatViewCount(viewCount) {
  if (!viewCount) return '';
  const views = parseInt(viewCount, 10);
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1) + 'M views';
  } else if (views >= 1_000) {
    return (views / 1_000).toFixed(1) + 'K views';
  } else {
    return views + ' views';
  }
}

function formatUploadedDate(publishedAt) {
  if (!publishedAt) return '';
  const publishedDate = new Date(publishedAt);
  const now = new Date();
  const diffMs = now - publishedDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

function YouTubeSearchBar({ onVideoSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef();

  const fetchVideos = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/youtube/search?query=${query}`);
      setResults(res.data);
      setShowDropdown(true);
      setHighlighted(0);
    } catch (err) {
      console.error('❌ YouTube search failed:', err.message);
      alert("Youtube search function blocked by YouTube company because of too many usage. Try this function again after tomorrow 4pm. Because of this function usage is gonna be initialized at that time.\n\n유튜브 검색 기능은 과도한 사용으로 인해 유튜브 측에서 차단되었습니다. 다음 날 오후 4시에 해당 기능 사용량이 초기화되오니 그 때 다시 사용해주시면 작동 될 것입니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (showDropdown && results.length > 0) {
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
    } else if (e.key === 'Enter') {
      // If dropdown is not shown, run search
      e.preventDefault();
      fetchVideos();
    }
  };

  const handleSelect = (video) => {
    setQuery('');
    setShowDropdown(false);
    setResults([]);
    const indexOfDash = decode(video.snippet.title).indexOf("-");

    if (indexOfDash !== -1) {
      const artist = decode(video.snippet.title).slice(0, indexOfDash).trim();
      const title = decode(video.snippet.title).slice(indexOfDash + 1).trim();

      onVideoSelect({
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        artist,
        title,
      });
    } else {
      onVideoSelect({
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        artist: decode(video.snippet.channelTitle),
        title: decode(video.snippet.title),
      });
    }

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
      {loading && <LoadingSpinner />}
      <div className="flex w-11/12 sm:w-3/4 lg:w-1/2 gap-2">
        <input
          type="text"
          value={query}
          placeholder="Search YouTube (유튜브 검색)"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border p-2 w-full text-orange-400 rounded"
        />
        <button
          onClick={fetchVideos}
          className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded text-black font-bold"
        >
          Search
        </button>
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute mt-2 w-11/12 sm:w-3/4 lg:w-1/2 bg-black border border-gray-700 rounded shadow-lg max-h-[300px] overflow-y-auto z-50">
        {results.map((video, idx) => (
          <li
            key={video.id.videoId}
            onClick={() => handleSelect(video)}
            className={`cursor-pointer flex items-start px-4 py-2 gap-3 hover:bg-gray-800 ${
              idx === highlighted ? 'bg-gray-700' : ''
            }`}
          >
            <img
              src={video.snippet.thumbnails.default.url}
              alt={decode(video.snippet.title)}
              className="w-16 h-12 rounded"
            />
            <div className="flex flex-col text-white">
              <span className="text-sm font-bold">{decode(video.snippet.title)}</span>
              <span className="text-xs text-gray-400">{decode(video.snippet.channelTitle)}</span>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{formatViewCount(video.statistics?.viewCount)}</span>
                <span>•</span>
                <span>{formatUploadedDate(video.snippet?.publishedAt)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>      
      )}
    </div>
  );
}

export default YouTubeSearchBar;
