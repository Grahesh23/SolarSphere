import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SolarSphere API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SolarSphere backend is running',
  });
});

export default app;
