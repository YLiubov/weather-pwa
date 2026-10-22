import './DayList.css'
import { DayCard } from '../../molecules/DayCard/DayCard.js'

export function DayList(days) {
  return `
    <section class="day-list">
      <div class="section-head"><h2>7-dages udsigt</h2><span>NÆSTE 7 DAGE</span></div>
      ${days.map((day, i) => DayCard(day, i === 0)).join('')}
    </section>`
}
