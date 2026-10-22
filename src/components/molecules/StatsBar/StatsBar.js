import './StatsBar.css'

export function StatsBar(current) {
  return `
    <div class="stats-bar">
      <div class="stats-bar__item"><span>Føles som</span><strong>${current.feels}°</strong></div>
      <div class="stats-bar__item"><span>Fugtighed</span><strong>${current.humidity}%</strong></div>
      <div class="stats-bar__item"><span>Vind</span><strong>${current.wind} m/s ${current.windDir}</strong></div>
    </div>`
}
