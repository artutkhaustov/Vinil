export type Track = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  permalinkUrl: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function searchTracks(query: string): Promise<Track[]> {
  const res = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? 'Ошибка поиска');
  }
  return data.results;
}