export type Track = {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
};

export async function searchTracks(query: string): Promise<Track[]> {
  const res = await fetch(
    `http://localhost:3000/api/search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? 'Ошибка поиска');
  }
  return data.results;
}