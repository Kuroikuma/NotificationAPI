import axios from "axios";

export const getWeatherForecast = async(latitude, longitude) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`;

  try {
    const response = await axios.get(url);
    const { daily } = response.data;

    // Clima actual
    const tomorrowIndex = 1;
    const currentCondition = daily.weather_code[0]; // Código para describir el estado del clima
    const tomorrowCondition = daily.weather_code[tomorrowIndex];

    // Pronóstico del día siguiente
     // El índice 0 es el día actual, 1 es el siguiente día
    const maxTemp = daily.temperature_2m_max[tomorrowIndex];
    const minTemp = daily.temperature_2m_min[tomorrowIndex];
    const precipitation = daily.precipitation_sum[tomorrowIndex];

    const weatherConditions = {
      0: 'Despejado',
      1: 'Despejado (con nubes)',
      2: 'Nubes dispersas',
      3: 'Nublado',
      45: 'Neblina',
      48: 'Escarcha',
      51: 'Lluvia ligera',
      53: 'Lluvia moderada',
      55: 'Lluvia intensa',
      56: 'Lluvia congelada ligera',
      57: 'Lluvia congelada intensa',
      61: 'Lluvia y nieve ligera',
      63: 'Lluvia y nieve moderada',
      65: 'Lluvia y nieve intensa',
      66: 'Tormenta de lluvia congelada',
      67: 'Tormenta de lluvia y nieve',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      77: 'Granizo',
      80: 'Lluvias fuertes',
      81: 'Tormenta eléctrica ligera',
      82: 'Tormenta eléctrica intensa',
      85: 'Lluvia helada ligera',
      86: 'Lluvia helada intensa',
      95: 'Tormenta con lluvia',
      96: 'Tormenta con lluvia fuerte',
      99: 'Tormenta con nieve',
    };
    
    const currentConditionDescription = weatherConditions[currentCondition] || "Condición desconocida";
    const tomorrowConditionDescription = weatherConditions[tomorrowCondition] || "Condición desconocida";
    

    // Construye el mensaje
    const weatherMessage = `
      🌤 Clima actual:
      - Condición: ${currentConditionDescription}
      
      📅 Pronóstico para mañana:
      - Máxima: ${maxTemp}°C
      - Mínima: ${minTemp}°C
      - Precipitación: ${precipitation} mm
      - Condición: ${tomorrowConditionDescription}
    `;
    return weatherMessage;
  } catch (error) {
    console.error('Error obteniendo el pronóstico del clima:', error);
    throw new Error('No se pudo obtener el pronóstico del clima.');
  }
}

// async function sendPushNotifications() {
//   try {
//     // Recupera todos los tokens de MongoDB
//     const tokens = await PushToken.find();
//     let messages = [];

//     for (let { token } of tokens) {
//       if (!Expo.isExpoPushToken(token)) {
//         console.log(`Token inválido: ${token}`);
//         continue;
//       }

//       messages.push({
//         to: token,
//         sound: 'default',
//         title: '¡Buenos días! 🌞',
//         channelId: "default",
//         body: 'Este es tu recordatorio diario de las 8:00 AM.',
//         data: { withSome: 'data' },
//       });
//     }

//     let chunks = expo.chunkPushNotifications(messages);

//     for (let chunk of chunks) {
//       try {
//         let receipts = await expo.sendPushNotificationsAsync(chunk);
//         console.log('Notificaciones enviadas:', receipts);
//       } catch (error) {
//         console.error('Error enviando notificaciones:', error);
//       }
//     }
//   } catch (error) {
//     console.error('Error al enviar notificaciones:', error);
//   }
// }
