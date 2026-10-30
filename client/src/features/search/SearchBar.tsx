import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTracks } from './api';
import { Player } from '../player/Player';
import './SearchBar.css';

const STORAGE_KEY = 'vinil-search';

type Saved = { query: string; index: number | null };

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Saved;
  } catch {
    // повреждённые данные игнорируем
  }
  return { query: '', index: null };
}

export function SearchBar() {
  const [saved] = useState(loadSaved);
  const [input, setInput] = useState(saved.query);
  const [query, setQuery] = useState(saved.query);
  const [currentIndex, setCurrentIndex] = useState<number | null>(saved.index);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ query, index: currentIndex })
    );
  }, [query, currentIndex]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTracks(query),
    enabled: query.length > 0,
  });

  const tracks = data ?? [];
  const currentTrack =
    currentIndex !== null ? tracks[currentIndex] : undefined;

  const hasPrev = currentIndex !== null && currentIndex > 0;
  const hasNext = currentIndex !== null && currentIndex < tracks.length - 1;

  return (
    <div className="search">
      <form
        className="search__form"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input.trim());
          setCurrentIndex(null);
        }}
      >
        <input
          className="search__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Поиск музыки"
        />
        <button className="search__button" type="submit">
          Найти
        </button>
      </form>

      {isLoading && <p className="search__status">Загрузка...</p>}
      {error && <p className="search__status">{error.message}</p>}

      <ul className="track-list">
        {tracks.map((track, index) => (
          <li
            key={track.id}
            className={`track ${index === currentIndex ? 'track--active' : ''}`}
          >
            <img className="track__cover" src={track.thumbnail} alt="" />
            <span className="track__info">{track.title}</span>
            <span className="track__duration">
              {Math.floor(track.duration / 60)}:
              {String(track.duration % 60).padStart(2, '0')}
            </span>
            <button
              className="track__play"
              onClick={() => setCurrentIndex(index)}
            >
              ▶
            </button>
          </li>
        ))}
      </ul>

      <Player
        videoId={currentTrack?.id ?? null}
        title={currentTrack?.title ?? ''}
        thumbnail={currentTrack?.thumbnail ?? ''}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={() =>
          setCurrentIndex((i) => (i !== null && i > 0 ? i - 1 : i))
        }
        onNext={() =>
          setCurrentIndex((i) =>
            i !== null && i < tracks.length - 1 ? i + 1 : i
          )
        }
      />
    </div>
  );
}