import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/user-management/User.js';
import authRoutes from './routes/authRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'SolarSphere API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUserRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';

  res.status(statusCode).json({
    success: false,
    message,
  });
});

const seedDefaultAdmin = async () => {
  const adminEmail = 'admin@solarsphere.demo';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'solarsphere123',
      role: 'Admin',
      phone: '+91 00000 00000',
      companyName: 'SolarSphere',
    });

    console.log('✅ Default admin seeded: admin@solarsphere.demo / solarsphere123');
  }
};

connectDB()
  .then(async () => {
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 SolarSphere server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
