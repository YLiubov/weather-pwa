import './HourCard.css'
import { WeatherIcon } from '../../atoms/WeatherIcon/WeatherIcon.js'
import { UiIcon } from '../../atoms/UiIcon/UiIcon.js'
import { WindInfo } from '../WindInfo/WindInfo.js'

export function HourCard(hour) {
  const time = hour.time.slice(11, 16)

  return `
    <li class="hour-card">
      <div class="hour-card__info">
        <span class="hour-card__time">${time}</span>
        <span class="hour-card__temp">${hour.temp}°</span>
        <span class="hour-card__rain">${UiIcon('drop')} ${hour.chance}% · ${hour.rain} mm</span>
        ${WindInfo(hour.wind, hour.windDir)}
      </div>
      ${WeatherIcon(hour.icon, 'sm')}
    </li>`
}
