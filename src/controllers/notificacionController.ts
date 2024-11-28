import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { INotificacion, Notificacion } from '../models/notificacion';
import { IUsuario, Usuario } from "../models/user";
import { Finca, ICoordenadas } from "../models/finca";
import { getWeatherForecast } from "../helpers/openmeteo";
import cron from 'node-cron';
import { programNotification } from "../helpers/notificacion";

export interface INotificationExpo {
  to: string;
  sound: string;
  title: string;
  channelId: string;
  body: string;
  data: {
      withSome: string;
  };
}

// Crear una nueva Notification
export const createNotification = async (req, res) => {
  try {
    console.log("@createNotification")
    const notificationData = req.body;
    
    const notification = new Notificacion(notificationData);
    

    if (!cron.validate(notification.run_time)) {
      return res.status(400).json({ error: 'Formato de tiempo inválido.' });
    }

    programNotification(notification);

    await notification.save();
    res.status(201).json({ message: 'Notification creada exitosamente', notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear Notification', error });
  }
};

// Obtener todas las Notifications
export const getNotifications = async (req, res) => {
  try {
    console.log("@getNotifications")
    
    const notifications = await Notificacion.find();
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener Notifications', error });
  }
};

// Obtener una Notification por ID
export const getNotificationById = async (req, res) => {
  console.log("@getNotificationById")
  const { id } = req.params;
  try {
    const notification = await Notificacion.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification no encontrada' });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener Notification', error });
  }
};

// Actualizar el estado de leída de una Notification
export const markNotificationAsRead = async (req, res) => {
  console.log("@markNotificationAsRead")
  const { id } = req.params;
  try {
    const notification = await Notificacion.findByIdAndUpdate(id, { leido: true, update_at: Date.now() }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification no encontrada' });
    }
    res.status(200).json({ message: 'Notification marcada como leída', notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al marcar Notification como leída', error });
  }
};

export const registerToken = async (req, res) => {
  console.log("@registerToken")
  const { token, id } = req.body;

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).send('Token no válido.');
  }

  try {
    // Verifica si el token ya existe para evitar duplicados
    await Usuario.findByIdAndUpdate(id, { pushToToken: token, update_at: Date.now() }, { new: true });

    res.send('Token registrado correctamente.');
  } catch (error) {
    console.error('Error al guardar el token:', error);
    res.status(500).send('Error al registrar el token.');
  }
};

export const sendPushNotifications = async () => {
  console.log("@sendPushNotifications")
  let expo = new Expo();

  try {
    // Recupera todos los tokens de MongoDB
    const notificaciones:INotificacion[] = await Notificacion.find().populate('idUsuario');

    let messages:ExpoPushMessage[] = [];

    for (let notificacion of notificaciones) {

      let finca = await Finca.findById(notificacion.detalles.idFinca);

      if (finca === null) {
        console.log(`Finca no encontrada: ${notificacion.detalles.idFinca}`);
        continue;
      }

      let token = (notificacion.idUsuario as IUsuario).pushToToken;
      let titulo = notificacion.detalles.titulo

      if (!Expo.isExpoPushToken(token)) {
        console.log(`Token inválido: ${token}`);
        continue;
      }

      let { latitud, longitud } = (finca.coordenadas as ICoordenadas);

      let body = await getWeatherForecast(latitud, longitud);

      messages.push({
        to: token,
        sound: 'default',
        title: titulo,
        channelId: "default",
        body: body,
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
};

export const sendPushNotificationsRoute = async (req, res) => {
  console.log("@sendPushNotificationsRoute")
  try {
    await sendPushNotifications();
    res.send('Notificaciones enviadas correctamente.');
  } catch (error) {
    console.error('Error al enviar notificaciones:', error);
    res.status(500).send('Error al enviar notificaciones.');
  }
};
