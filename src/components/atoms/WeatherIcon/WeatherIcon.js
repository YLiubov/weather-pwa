import './WeatherIcon.css'

// Иконка рисуется как маска: форма берётся из PNG, а цвет задаёт CSS-переменная --icon
export function WeatherIcon(name, size = 'md') {
  const src = `${import.meta.env.BASE_URL}icons/weather/${name}.png`
  return `<span class="weather-icon weather-icon--${size}" style="--src:url('${src}')" role="img" aria-hidden="true"></span>`
}
