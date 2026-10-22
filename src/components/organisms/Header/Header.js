import './Header.css'
import { WeatherIcon } from '../../atoms/WeatherIcon/WeatherIcon.js'
import { Temperature } from '../../atoms/Temperature/Temperature.js'

const THEME_NAMES = { morning: 'Morgen', day: 'Dag', evening: 'Aften', night: 'Nat' }

export function Header(current, city, theme) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return `
    <header class="header">
      <div class="header__top">
        <div>
          <p class="header__city"><svg class="header__pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${city}</p>
          <p class="header__sub">VEJRET NU</p>
        </div>
        <div class="header__badge">${THEME_NAMES[theme]}<small>${time}</small></div>
      </div>
      <div class="header__main">
        <div>
          ${Temperature(current.temp, 'temperature--big')}
          <p class="header__label">${current.label}</p>
        </div>
        ${WeatherIcon(current.icon, 'lg')}
      </div>
<svg class="header__hills" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
  <!-- Первый холм: продолжается до правого края -->
  <path
    d="M0 120 V44
       C48 40 84 20 129 23
       C181 26 201 58 252 65
       C306 73 352 54 400 48
       V120 H0Z"
    fill="var(--hill-1)"
  />

  <!-- Второй холм справа -->
  <path
    d="M170 120
       C195 84 224 53 266 42
       C317 28 357 42 400 53
       V120Z"
    fill="var(--hill-2)"
  />

  <!-- Третий холм: тоже продолжается до правого края -->
  <path
    d="M0 120 V73
       C41 67 76 51 117 52
       C166 54 193 79 232 87
       C285 98 340 77 400 66
       V120 H0Z"
    fill="var(--hill-3)"
  />
</svg>
    </header>`
}
