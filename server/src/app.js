import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import searchRouter from './routes/search.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/search', searchRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.expose ? err.message : 'Внутренняя ошибка сервера',
  });
});

export default app;