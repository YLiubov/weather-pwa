import { Header } from '../components/organisms/Header/Header.js'
import { StatsBar } from '../components/molecules/StatsBar/StatsBar.js'
import { Tabs } from '../components/molecules/Tabs/Tabs.js'
import { DayList } from '../components/organisms/DayList/DayList.js'
import { DayDetail } from '../components/organisms/DayDetail/DayDetail.js'

const app = document.getElementById('app')

export function renderLoading() {
  app.innerHTML = '<p class="message">Henter vejret...</p>'
}

export function renderError(message) {
  app.innerHTML = `<p class="message message--error">${message}</p>`
}

// получает всё нужное одним объектом и собирает страницу из организмов и молекул
export function renderWeather({ current, city, theme, tab, days, selectedDay, hours }) {
  app.innerHTML = `
    ${Header(current, city, theme)}
    ${StatsBar(current)}
    ${Tabs(tab)}
    ${tab === 'week' ? DayList(days) : DayDetail(selectedDay, hours)}
    <p class="footer-note">Data fra Open-Meteo</p>`
}

// слушатель стоит на #app один раз: карточки пересоздаются при каждом рендере, их собственные слушатели бы пропадали
export function bindEvents({ onDay, onTab }) {
  app.addEventListener('click', (event) => {
    const card = event.target.closest('.day-card')
    if (card) return onDay(card.dataset.date)

    const tab = event.target.closest('.tabs__btn')
    if (tab) onTab(tab.dataset.tab)
  })
}
