import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { INotificacion, Notificacion } from '../models/notificacion';
import { Finca } from '../models/finca';
import { getWeatherForecast } from './openmeteo';
import { scheduledJobs } from '../server';
import cron from 'node-cron';
import { IUsuario } from '../models/user';

export const programNotification = (notificacion) => {
  const { _id, run_time } = notificacion;

  // Cancelar cualquier tarea previa si ya estaba programada
  if (scheduledJobs[_id]) {
    scheduledJobs[_id].stop();
    delete scheduledJobs[_id];
  }

  // Programar la nueva tarea con `node-cron`
  const job = cron.schedule(
    run_time,
    async () => {
      console.log(`Enviando notificación para ID: ${_id}`);

      let expo = new Expo();

      try {
        // Obtener detalles actualizados de la notificación
        const notif = (await Notificacion.findById(_id).populate('idUsuario') as INotificacion)
        const finca = await Finca.findById(notif.detalles.idFinca);

        if (!finca) {
          console.log(`Finca no encontrada: ${notif.detalles.idFinca}`);
          return;
        }

        const token = (notif.idUsuario as IUsuario).pushToToken;

        if (!Expo.isExpoPushToken(token)) {
          console.log(`Token inválido: ${token}`);
          return;
        }

        const { latitud, longitud } = finca.coordenadas;
        const body = await getWeatherForecast(latitud, longitud);

        const message:ExpoPushMessage = {
          to: token,
          sound: 'default',
          title: notif.detalles.titulo,
          body: body,
          data: { withSome: 'data' },
        };

        const receipts = await expo.sendPushNotificationsAsync([message]);
        console.log('Notificación enviada:', receipts);
      } catch (error) {
        console.error('Error al enviar notificación:', error);
      }
    },
    {
      timezone: 'America/Managua',
    }
  );

  // Guardar la tarea programada en memoria
  scheduledJobs[_id] = job;
};