const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const BASE_URL = 'https://api.soundcloud.com';

function toHighResArtwork(url) {
  if (!url) return null;
  return url.replace('-large.', '-t500x500.');
}

export async function searchTracks(query) {
  if (!CLIENT_ID) {
    throw new Error('Не задан SOUNDCLOUD_CLIENT_ID в переменных окружения');
  }

  const url = new URL(`${BASE_URL}/tracks`);
  url.search = new URLSearchParams({
    q: query,
    limit: '20',
    client_id: CLIENT_ID,
  });

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Ошибка SoundCloud: ${res.status} ${body.slice(0, 200)}`);
    err.status = 502;
    err.expose = true;
    throw err;
  }

  const data = await res.json();

  return data.map((t) => ({
    id: String(t.id),
    title: t.title,
    artist: t.user?.username ?? '',
    artworkUrl: toHighResArtwork(t.artwork_url),
    permalinkUrl: t.permalink_url,
  }));
}