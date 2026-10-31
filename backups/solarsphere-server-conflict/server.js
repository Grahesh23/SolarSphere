import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT || 5000);

const bootstrap = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 [SolarSphere] API listening on http://localhost:${PORT}`);
  });
};


bootstrap().catch((error) => {
  console.error('❌ [Bootstrap Error] Failed to start server:', error);
  process.exit(1);
});
