import connectDB from './config/db.js';
import dotenv from 'dotenv';
import express from 'express';
import notificationRoutes from './routes/notificationRoute';

dotenv.config();

// Inicializamos el servidor Express
const app = express();
app.use(express.json());

connectDB()

export const scheduledJobs = {};

app.use('/notifications', notificationRoutes);

// Inicia el servidor
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
