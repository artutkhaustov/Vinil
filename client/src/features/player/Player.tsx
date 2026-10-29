import { useEffect, useRef, useState } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';

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

const barStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(20, 20, 26, 0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  color: '#f2f2f5',
  zIndex: 1000,
};

export function Player({ videoId, hasPrev, hasNext, onPrev, onNext }: Props) {
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

  const handleSeek = (value: number) => {
    playerRef.current?.seekTo(value, true);
    setCurrent(value);
  };

  return (
    <div style={barStyle}>
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

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onPrev} disabled={!hasPrev}>⏮</button>
        <button onClick={togglePlay}>{playing ? '⏸ Пауза' : '▶ Играть'}</button>
        <button onClick={onNext} disabled={!hasNext}>⏭</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 600 }}>
        <span>{formatTime(current)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={current}
          onChange={(e) => handleSeek(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        🔊
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: 160 }}
        />
      </div>
    </div>
  );
}