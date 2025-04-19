import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import YouTube from 'react-youtube';

const extractVideoId = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : url;
};

const YouTubePlayer = forwardRef(({ videoUrl, onTimeUpdate }, ref) => {
  const [videoId, setVideoId] = useState('');
  const playerRef = useRef(null);

  useEffect(() => {
    setVideoId(extractVideoId(videoUrl));
  }, [videoUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        onTimeUpdate(time);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  // 👇 Make seekTo accessible from outside using ref
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, true);
      }
    },
  }));

  const opts = {
    height: '360',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  return (
    <div className="w-full aspect-video">
      <YouTube videoId={videoId} opts={opts} onReady={onReady} />
    </div>
  );
});

export default YouTubePlayer;
