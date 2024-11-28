const dotenv = require('dotenv');
const express = require('express');
const { Expo } = require('expo-server-sdk');
const cron = require('node-cron');
const mongoose = require('mongoose');

dotenv.config();

// Inicializamos el servidor Express
const app = express();
app.use(express.json());

// Inicializamos el Expo SDK
let expo = new Expo();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error al conectar con MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Esquema de tokens en MongoDB
const pushTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
});

const PushToken = mongoose.model('PushToken', pushTokenSchema);

// Ruta para registrar tokens
app.post('/register-token', async (req, res) => {
  const { token } = req.body;

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).send('Token no válido.');
  }

  try {
    // Verifica si el token ya existe para evitar duplicados
    const existingToken = await PushToken.findOne({ token });
    if (!existingToken) {
      const newToken = new PushToken({ token });
      await newToken.save();
      console.log(`Token guardado en MongoDB: ${token}`);
    } else {
      console.log(`Token ya registrado: ${token}`);
    }

    res.send('Token registrado correctamente.');
  } catch (error) {
    console.error('Error al guardar el token:', error);
    res.status(500).send('Error al registrar el token.');
  }
});

// Función para enviar notificaciones
async function sendPushNotifications() {
  try {
    // Recupera todos los tokens de MongoDB
    const tokens = await PushToken.find();
    let messages = [];

    for (let { token } of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.log(`Token inválido: ${token}`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        title: '¡Buenos días! 🌞',
        body: 'Este es tu recordatorio diario de las 8:00 AM.',
        data: { withSome: 'data' },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log('Notificaciones enviadas:', receipts);
      } catch (error) {
        console.error('Error enviando notificaciones:', error);
      }
    }
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
  }
}

// Tarea programada: Ejecuta las notificaciones todos los días a las 8:00 AM
cron.schedule('35 22 * * *', () => {
  console.log('Enviando notificaciones...');
  sendPushNotifications();
});


// Inicia el servidor
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
