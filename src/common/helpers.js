/**
   * Красивый лог в консоль браузера с цветами и временем
   * @param {string} status - Статус: 'success', 'warning', 'error', или любой другой
   * @param {string} text - Текст сообщения
   */
function debugLog(status = 'info', text) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU');
  const timeStr = now.toLocaleTimeString('ru-RU');
  const timestamp = `[${dateStr} ${timeStr}]`;

  // Определяем стили в зависимости от статуса
  let tag, style;

  if (status.toLowerCase() === 'success') {
    tag = '[Success]';
    style = 'color:rgb(30, 176, 47); font-weight: bold;'; // Зелёный
  }
  else if (status.toLowerCase() === 'warning') {
    tag = '[Warning]';
    style = 'color:rgb(191, 124, 17); font-weight: bold;'; // Оранжевый
  }
  else if (status.toLowerCase() === 'error') {
    tag = '[Error]';
    style = 'color:rgb(200, 48, 31); font-weight: bold;'; // Красный
  }
  else {
    tag = '[Info]';
    style = 'color:rgb(187, 187, 187);'; // Серый
  }

  // Формируем полное сообщение
  const message = `${timestamp} ${tag}: ${text}`;

  // Выводим с цветами
  console.log(`%c${message}`, style);

  // Дополнительно возвращаем объект для возможного дальнейшего использования
  return {
    message,
    timestamp: now,
    status: status.toLowerCase()
  };
}