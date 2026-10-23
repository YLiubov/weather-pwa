// fallback, если не получилось определить позицию (Aalborg, Friis)
const fallback = { lat: 57.0253, long: 9.5537 }

// Возвращает Promise с { lat, long }.
// Promise никогда не reject-ится: при любой ошибке приходит fallback,
// поэтому вызывающему коду не нужен .catch()
export function getPosition() {
  return new Promise((resolve) => {
    // браузер не поддерживает geolocation
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser')
      // return останавливает функцию, чтобы не вызвать getCurrentPosition
      return resolve(fallback)
    }

    navigator.geolocation.getCurrentPosition(
      // успех: берём широту и долготу, округляем до 2 знаков,
      // чтобы адрес запроса повторялся и Service Worker находил его в кэше
      (position) => resolve({
        lat: Number(position.coords.latitude.toFixed(2)),
        long: Number(position.coords.longitude.toFixed(2)),
      }),

      // ошибка: пользователь отказал или позицию не найти
      () => {
        console.log('no pos error')
        resolve(fallback)
      },

      // если ответа нет 5 секунд, берём fallback
      { timeout: 5000 }
    )
  })
}
