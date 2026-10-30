import { useEffect, useRef, useState } from 'react';
import {
  playTrack,
  togglePlay as widgetToggle,
  setVolume as widgetVolume,
  seekTo as widgetSeek,
  onPlayState,
  onProgress,
} from './soundcloudWidget';
import './Player.css';

type Props = {
  permalinkUrl: string | null;
  title: string;
  artist: string;
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
  Expand: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  ),
  Collapse: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </svg>
  ),
};

export function Player({
  permalinkUrl,
  title,
  artist,
  thumbnail,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: Props) {
  const vinylRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ lastAngle: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    onPlayState(setPlaying);
    onProgress((sec, dur) => {
      setCurrent(sec);
      setDuration(dur);
    });
  }, []);

  useEffect(() => {
    if (permalinkUrl) playTrack(permalinkUrl);
    setCurrent(0);
    setDuration(0);
  }, [permalinkUrl]);

  useEffect(() => {
    widgetVolume(volume);
  }, [volume]);

  if (!permalinkUrl) return null;

  const togglePlay = () => widgetToggle();

  const seekBy = (delta: number) => {
    const target = Math.max(0, current + delta);
    widgetSeek(target);
    setCurrent(target);
  };

  const handleSeek = (value: number) => {
    widgetSeek(value);
    setCurrent(value);
  };

  // Жест по пластинке: полный оборот ≈ 30 секунд
  const angleOf = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = vinylRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  };

  const onVinylDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { lastAngle: angleOf(e) };
  };

  const onVinylMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const a = angleOf(e);
    let delta = a - d.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.lastAngle = a;
    const seconds = (delta / 360) * 30;
    const target = Math.max(0, Math.min(duration || Infinity, current + seconds));
    setCurrent(target);
    widgetSeek(target);
  };

  const onVinylUp = () => {
    dragRef.current = null;
  };

  const controls = (
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
  );

  const progress = (
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
  );

  const volumeBlock = (
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
  );

  const classes = [
    'player',
    expanded ? 'player--expanded' : '',
    playing ? '' : 'player--paused',
    mounted ? 'player--ready' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {thumbnail && (
        <div
          className="player__bg"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}

      <button
        className="player__expand"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Свернуть' : 'Развернуть'}
        type="button"
      >
        {expanded ? <Icon.Collapse /> : <Icon.Expand />}
      </button>

      {expanded ? (
        <div className="player__stage">
          <div className="player__left">
            <div
              className="vinyl"
              ref={vinylRef}
              onPointerDown={onVinylDown}
              onPointerMove={onVinylMove}
              onPointerUp={onVinylUp}
              onPointerCancel={onVinylUp}
            >
              <div className="vinyl__disc" />
              {thumbnail && (
                <img className="vinyl__label" src={thumbnail} alt="" draggable={false} />
              )}
            </div>
            <span className="player__title">{title}</span>
            <span className="player__artist">{artist}</span>
            {controls}
          </div>

          <div className="player__right">
            <div className="player__lyrics">
              <p>Текст песни появится здесь</p>
            </div>
          </div>

          <div className="player__bottom">
            {progress}
            {volumeBlock}
          </div>
        </div>
      ) : (
        <>
          <div className="player__top">
            <div className="player__track">
              {thumbnail && <img className="player__cover" src={thumbnail} alt="" />}
              <div className="player__info">
                <span className="player__title">{title}</span>
                <span className="player__artist">{artist}</span>
              </div>
            </div>
          </div>
          {controls}
          {progress}
          {volumeBlock}
        </>
      )}
    </div>
  );
}