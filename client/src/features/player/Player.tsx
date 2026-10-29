import { useEffect, useRef, useState } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import './Player.css';

type Props = {
  videoId: string | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function formatTime(sec: number) {
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function Player({ videoId, hasPrev, hasNext, onPrev, onNext }: Props) {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setCurrent(p.getCurrentTime());
      setDuration(p.getDuration());
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    setCurrent(0);
    setDuration(0);
  }, [videoId]);

  if (!videoId) return null;

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: { autoplay: 1 },
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  };

  const seekBy = (delta: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(Math.max(0, current + delta), true);
  };

  const handleSeek = (value: number) => {
    playerRef.current?.seekTo(value, true);
    setCurrent(value);
  };

  return (
    <div className="player">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(e) => {
          playerRef.current = e.target;
          setDuration(e.target.getDuration());
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnd={() => {
          setPlaying(false);
          if (hasNext) onNext();
        }}
      />

      <div className="player__row">
        <button className="player__side" disabled aria-hidden>
          ☰
        </button>

        <div className="player__controls">
          <button className="player__icon" onClick={() => seekBy(-10)}>
            ⏪
          </button>
          <button className="player__play" onClick={togglePlay}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button className="player__icon" onClick={() => seekBy(10)}>
            ⏩
          </button>
        </div>

        <div className="player__side-buttons">
          <button className="player__side" onClick={onPrev} disabled={!hasPrev}>
            ⏮
          </button>
          <button className="player__side" onClick={onNext} disabled={!hasNext}>
            ⏭
          </button>
        </div>
      </div>

      <div className="player__progress">
        <span>{formatTime(current)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={current}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}