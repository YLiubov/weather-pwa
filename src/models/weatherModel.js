const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

function buildURL(lat, long) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: long,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m,precipitation',
    daily: 'weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum',
    hourly: 'precipitation_probability,temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation,is_day',
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: 7,
  })
  return `${BASE_URL}?${params}`
}

export async function getWeatherData(lat, long) {
  const response = await fetch(buildURL(lat, long))

  if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`)
  return response.json()
}

// Код погоды → название и иконка. API даёт число (WMO-код), например 0 = ясно, 61 = дождь
export function describeWeather(code, isDay = 1) {
  if (code <= 1) return { label: 'Klart', icon: isDay ? 'sun' : 'sleepy-moon' }
  if (code === 2) return { label: 'Delvist skyet', icon: isDay ? 'partly-cloudy' : 'moon-cloud' }
  if (code === 3) return { label: 'Overskyet', icon: 'clouds' }
  if (code === 45 || code === 48) return { label: 'Tåge', icon: 'fog' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Regn', icon: 'drizzle' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: 'Sne', icon: 'snow' }
  if (code >= 95) return { label: 'Tordenvejr', icon: 'thunderstorm' }
  return { label: 'Skyet', icon: 'cloud' }
}

// Градусы → сторона света (ветер 270° → «V»)
export function windDirection(deg) {
  const names = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV']
  return names[Math.round(deg / 45) % 8]
}


// Как это читать: map проходит по датам, i это номер дня (0..6). Из каждого массива берём элемент с номером i и собираем один объект. ...describeWeather(...) добавляет в объект label и icon.
export function toDays(data) {
  const d = data.daily
  return d.time.map((date, i) => ({
    date,
    max: Math.round(d.temperature_2m_max[i]),
    min: Math.round(d.temperature_2m_min[i]),
    wind: Math.round(d.wind_speed_10m_max[i]),
    windDir: windDirection(d.wind_direction_10m_dominant[i]),
    rain: d.precipitation_sum[i],
    chance: d.precipitation_probability_max[i],
    ...describeWeather(d.weather_code[i]),
  }))
}

export function toCurrent(data) {
  const c = data.current
  return {
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m),
    windDir: windDirection(c.wind_direction_10m),
    rain: c.precipitation,
    ...describeWeather(c.weather_code, c.is_day),
  }
}

// toHours делает то же, что toDays, только для часов. Возвращает 168 штук (7 дней × 24 часа). Для выбранного дня мы потом отфильтруем 24 часа по дате.
export function toHours(data) {
  const h = data.hourly
  return h.time.map((time, i) => ({
    time,
    temp: Math.round(h.temperature_2m[i]),
    wind: Math.round(h.wind_speed_10m[i]),
    windDir: windDirection(h.wind_direction_10m[i]),
    rain: h.precipitation[i],
    chance: h.precipitation_probability[i],
    ...describeWeather(h.weather_code[i], h.is_day[i]),
  }))
}
// Название города по координатам. Если не вышло, просто «Din position»
export async function getCityName(lat, long) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=da`
    const response = await fetch(url)
    if (!response.ok) throw new Error('geo error')
    const data = await response.json()
    const city = data.city || data.locality
    return city ? `${city}, ${data.countryName}` : 'Din position'
  } catch {
    return 'Din position'
  }
}
