import './DayDetail.css'
import { HourCard } from '../../molecules/HourCard/HourCard.js'

export function DayDetail(day, hours) {
  const title = new Date(day.date).toLocaleDateString('da-DK', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  // показываем каждый 3-й час: 00:00, 03:00 ... 21:00 (8 карточек)
  const every3 = hours.filter((h, i) => i % 3 === 0)

  return `
    <section class="day-detail">
      <div class="section-head"><h2>${title}</h2><span>HVER 3. TIME</span></div>
      <p class="day-detail__summary">${day.label} · ${day.max}° / ${day.min}° · ${day.wind} m/s ${day.windDir} · ${day.rain} mm</p>
      <ul class="hour-grid">
        ${every3.map(HourCard).join('')}
      </ul>
    </section>`
}
