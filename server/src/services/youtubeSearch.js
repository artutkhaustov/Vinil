const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!API_KEY) {
  throw new Error('Не задан YOUTUBE_API_KEY в переменных окружения');
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h = 0, m = 0, s = 0] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export async function searchVideos(query) {
  const searchUrl = new URL(`${BASE_URL}/search`);
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    maxResults: '20',
    q: query,
    key: API_KEY,
  });

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw await toApiError(searchRes, 'Ошибка поиска YouTube');
  const searchData = await searchRes.json();

  const ids = searchData.items.map((item) => item.id.videoId).filter(Boolean);
  if (ids.length === 0) return [];

  const videosUrl = new URL(`${BASE_URL}/videos`);
  videosUrl.search = new URLSearchParams({
    part: 'contentDetails,snippet',
    id: ids.join(','),
    key: API_KEY,
  });

  const videosRes = await fetch(videosUrl);
  if (!videosRes.ok) throw await toApiError(videosRes, 'Ошибка получения данных видео');
  const videosData = await videosRes.json();

  return videosData.items.map((v) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails?.medium?.url ?? v.snippet.thumbnails?.default?.url,
    duration: parseDuration(v.contentDetails.duration),
  }));
}

async function toApiError(res, message) {
  const body = await res.text();
  const err = new Error(`${message}: ${res.status} ${body.slice(0, 200)}`);
  err.status = res.status === 403 || res.status === 429 ? 502 : 500;
  err.expose = true;
  return err;
}