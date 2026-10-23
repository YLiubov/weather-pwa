// Контроллер связывает Model и View: просит данные у модели, хранит выбранный день, отдаёт всё View.

// Model: функции для получения и преобразования данных (без DOM)
import { getPosition } from '../models/positionModel.js'
import { getWeatherData, getCityName, toCurrent, toDays, toHours } from '../models/weatherModel.js'
// View: функции, которые рисуют страницу и вешают клик (без загрузки данных)
import { renderLoading, renderError, renderWeather, bindEvents } from '../views/weatherView.js'

// state — единое место, где хранятся данные приложения (как массив собак в dog-проекте)
const state = {
  current: null,      // погода «сейчас» (объект из toCurrent)
  days: [],           // 7 дней (массив из toDays)
  hours: [],          // все 168 часов (массив из toHours)
  selectedDate: null, // дата выбранного дня, например '2026-10-22'
  city: '',
  tab: 'week',        // 'today' или 'week'
}

// Тема по времени суток: меняет цвета через data-theme на body
function getTheme(hour) {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'day'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

// Показать страницу по текущему state. Вызывается при загрузке и при каждом клике по дню
function show() {
  const theme = getTheme(new Date().getHours())
  document.body.dataset.theme = theme
  // find: находим объект выбранного дня среди 7 дней
  const selectedDay = state.days.find((d) => d.date === state.selectedDate)
  // filter: оставляем только часы этой даты ('2026-10-22T14:00' начинается с '2026-10-22'), получается 24 штуки
  const hours = state.hours.filter((h) => h.time.startsWith(state.selectedDate))
  // отдаём View всё нужное одним объектом, View сама нарисует
  renderWeather({ current: state.current, city: state.city, theme, tab: state.tab, days: state.days, selectedDay, hours })
}

// Точка входа: её вызывает main.js. async, потому что внутри ждём (await) геолокацию и API
export async function initWeather() {
  // пока данные грузятся, показываем «Henter vejret...»
  renderLoading()

  // говорим View: «когда кликнут по дню, вызови эту функцию и передай дату».
  // Контроллер запоминает новый день и перерисовывает страницу
  bindEvents({
    // клик по дню в списке: открываем подробный вид этого дня
    onDay: (date) => {
      state.selectedDate = date
      state.tab = 'today'
      show()
    },
    // клик по вкладке: «I dag» всегда показывает сегодняшний день
    onTab: (tab) => {
      state.tab = tab
      if (tab === 'today') state.selectedDate = state.days[0].date
      show()
    },
  })

  // try/catch: если что-то пойдёт не так (нет сети, ошибка API), не ломаемся, а показываем сообщение
  try {
    const { lat, long } = await getPosition()     // 1. где пользователь (или fallback Aalborg)
    const [data, city] = await Promise.all([getWeatherData(lat, long), getCityName(lat, long)])    // 2. запрос к Open-Meteo, «сырые» данные
    state.city = city
    state.current = toCurrent(data)               // 3. превращаем в удобные объекты
    state.days = toDays(data)
    state.hours = toHours(data)
    state.selectedDate = state.days[0].date       // 4. по умолчанию выбран сегодняшний день
    show()                                        // 5. рисуем
  } catch (error) {
    console.error('No data today:', error)
    renderError('Kunne ikke hente vejret. Prøv igen senere.')
  }
}
