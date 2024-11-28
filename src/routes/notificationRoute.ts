import express from 'express';
import { createNotification, getNotificationById, getNotifications, markNotificationAsRead, registerToken, sendPushNotificationsRoute } from '../controllers/notificacionController';

export const router = express.Router();

router.post('', createNotification);

// Obtener todas las alertas
router.get('', getNotifications);

router.get('/send-push-notifications', sendPushNotificationsRoute);

// Obtener alerta por ID
router.get('/:id', getNotificationById);

// Marcar alerta como leída
router.put('/:id/leer', markNotificationAsRead);

router.post('/register-token', registerToken);

export default router;
