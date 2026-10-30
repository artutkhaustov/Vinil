import { Router } from 'express';
import { z } from 'zod';
import { searchTracks } from '../services/soundcloudSearch.js';

const router = Router();

const querySchema = z.object({
  q: z.string().trim().min(1, 'Параметр q обязателен').max(200),
});

router.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const results = await searchVideos(parsed.data.q);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;