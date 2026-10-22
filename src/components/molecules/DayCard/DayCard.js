import './DayCard.css'
import { WeatherIcon } from '../../atoms/WeatherIcon/WeatherIcon.js'
import { Temperature } from '../../atoms/Temperature/Temperature.js'
import { UiIcon } from '../../atoms/UiIcon/UiIcon.js'
import { WindInfo } from '../WindInfo/WindInfo.js'

export function DayCard(day, isToday) {
  // превращает 2026-10-22 в «torsdag» и «22. okt.» (датский формат)
  const date = new Date(day.date)
  const name = isToday ? 'I dag' : date.toLocaleDateString('da-DK', { weekday: 'long' })
  const short = date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })

  return `
    <button class="day-card ${isToday ? 'day-card--active' : ''}" data-date="${day.date}">
      <span class="day-card__info">
        <span class="day-card__name">${name}</span>
        <span class="day-card__label">${isToday ? '' : short + ' · '}${day.label}</span>
      </span>
      ${WeatherIcon(day.icon, 'sm')}
      <span class="day-card__extra">
        <span class="day-card__rain">${UiIcon('drop')} ${day.chance}%</span>
        ${WindInfo(day.wind, day.windDir)}
      </span>
      <span class="day-card__temps">
        ${Temperature(day.max)} ${Temperature(day.min, 'temperature--min')}
      </span>
    </button>`
}
