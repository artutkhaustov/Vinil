import { useEffect, useRef, useState } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import './Player.css';

type Props = {
  videoId: string | null;
  title: string;
  thumbnail: string;
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

const Icon = {
  Prev: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="5" width="2.5" height="14" />
      <path d="M20 5v14L9 12z" />
    </svg>
  ),
  Next: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="17.5" y="5" width="2.5" height="14" />
      <path d="M4 5v14l11-7z" />
    </svg>
  ),
  Rewind: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 6v12l-8-6z" />
      <path d="M20 6v12l-8-6z" />
    </svg>
  ),
  Forward: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6v12l8-6z" />
      <path d="M13 6v12l8-6z" />
    </svg>
  ),
  Play: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  ),
  Volume: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
    </svg>
  ),
};

export function Player({
  videoId,
  title,
  thumbnail,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);

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

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

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
      {thumbnail && (
        <div
          className="player__bg"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}

      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(e) => {
          playerRef.current = e.target;
          e.target.setVolume(volume);
          setDuration(e.target.getDuration());
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnd={() => {
          setPlaying(false);
          if (hasNext) onNext();
        }}
      />

      <div className="player__top">
        <div className="player__track">
          {thumbnail && <img className="player__cover" src={thumbnail} alt="" />}
          <span className="player__title">{title}</span>
        </div>

        <div className="player__controls">
          <button className="player__icon" onClick={onPrev} disabled={!hasPrev} aria-label="Предыдущий">
            <Icon.Prev />
          </button>
          <button className="player__icon" onClick={() => seekBy(-10)} aria-label="Назад 10 сек">
            <Icon.Rewind />
          </button>
          <button className="player__play" onClick={togglePlay} aria-label="Играть или пауза">
            {playing ? <Icon.Pause /> : <Icon.Play />}
          </button>
          <button className="player__icon" onClick={() => seekBy(10)} aria-label="Вперёд 10 сек">
            <Icon.Forward />
          </button>
          <button className="player__icon" onClick={onNext} disabled={!hasNext} aria-label="Следующий">
            <Icon.Next />
          </button>
        </div>

        <div className="player__volume">
          <Icon.Volume />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
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