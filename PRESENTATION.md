# Vejr PWA: шпаргалка к презентации

Приложение погоды: Open-Meteo API, Vanilla JS, ES Modules, MVC, Atomic Design, адаптивный CSS, PWA (устанавливается и работает офлайн).
Сайт: https://yliubov.github.io/weather-pwa/ · Репозиторий: https://github.com/YLiubov/weather-pwa

Как пользоваться: сначала раздел 1 (рассказать за 1 минуту), потом открывай нужный раздел, когда спросят про конкретное место.
Везде есть «где в коде», чтобы быстро показать файл.

---

## 1. Рассказ на 1 минуту (по-датски коротко можно повторить по тем же пунктам)

1. Это PWA-приложение погоды. Данные берём из **Open-Meteo**, позицию пользователя определяем через **геолокацию** (если нельзя, то Aalborg).
2. Код разделён по **MVC**: Model берёт данные, View рисует, Controller связывает.
3. Интерфейс собран по **Atomic Design**: атомы, молекулы, организмы.
4. **Service Worker** делает приложение офлайн: статика cache-first, API network-first с запасом из кэша.
5. **Manifest** + иконки делают его устанавливаемым. Публикация: **GitHub Actions** → **GitHub Pages**.
6. Дизайн: 4 темы по времени суток (утро, день, вечер, ночь), стеклянные панели, градиенты.

---

## 2. Как данные идут через приложение (главная схема)

```
main.js
  └─ initWeather()                         [controller]
       ├─ getPosition()                    [model]  → { lat, long }
       ├─ getWeatherData(lat, long)        [model]  → «сырой» ответ API
       ├─ getCityName(lat, long)           [model]  → "Aalborg"
       ├─ toCurrent / toDays / toHours     [model]  → удобные объекты
       ├─ state = { ... }                  [controller] хранит всё
       └─ show() → renderWeather(...)      [view]   → HTML на странице
```

Аналогия с проектом про собак: там `dogs` лежал в массиве, а View рисовала карточки. Здесь то же самое, только вместо `dogs` объект `state`.

---

## 3. MVC: что где лежит

| Слой | Файл | Что делает | Чего НЕ делает |
|---|---|---|---|
| **Model** | `src/models/positionModel.js`, `weatherModel.js` | Получает и преобразует данные | Не трогает DOM |
| **View** | `src/views/weatherView.js` | Рисует HTML, ловит клики | Не грузит данные |
| **Controller** | `src/controllers/weatherController.js` | Вызывает модель, хранит `state`, отдаёт данные во View | Не рисует сам |

### Model
- `getPosition()` (positionModel): Promise с `{ lat, long }`. **Никогда не reject**: при ошибке, отказе или таймауте 5 с возвращает fallback Aalborg Friis (57.0253, 9.5537). Поэтому снаружи не нужен `.catch`. Координаты округляются до 2 знаков, чтобы URL запроса повторялся и кэш работал офлайн.
- `buildURL(lat, long)`: собирает адрес запроса через `URLSearchParams` (current, daily, hourly, 7 дней, ветер в м/с, `timezone=auto`).
- `getWeatherData(lat, long)`: `fetch`, проверка `response.ok`, возвращает JSON.
- `getCityName(lat, long)`: название города (BigDataCloud). Если не вышло, «Din position».
- `describeWeather(code, isDay)`: WMO-код → датское название + имя иконки (ночью луна).
- `windDirection(deg)`: градусы → N, NØ, Ø, SØ, S, SV, V, NV.
- `toCurrent / toDays / toHours`: API отдаёт **колонки** (массив времён, массив температур...), а мы превращаем их через `map` в **массив объектов** (один объект = один день или час).

### Controller
- `state`: единое хранилище: `current`, `days`, `hours`, `selectedDate`, `city`, `tab`.
- `getTheme(hour)`: утро 5-11, день 11-17, вечер 17-22, иначе ночь.
- `show()`: `find` выбирает день, `filter` оставляет часы этой даты, ставит `data-theme`, вызывает View.
- `initWeather()`: показывает «loading», подписывает клики (`bindEvents`), в `try` грузит данные, в `catch` пишет `console.error` и показывает сообщение об ошибке.

### View
- `renderLoading / renderError / renderWeather`.
- `bindEvents`: **делегирование событий**: один слушатель на `#app`, потому что карточки пересоздаются через `innerHTML`. `closest()` находит нужную карточку, `dataset` читает `data-date` / `data-tab`.

---

## 4. Atomic Design

Каждый компонент: функция, которая возвращает строку HTML. Своя папка с `.js` и `.css` (CSS подключается `import './X.css'`, Vite собирает сам).

```
src/components/
  atoms/       WeatherIcon  UiIcon  Temperature
  molecules/   WindInfo  DayCard  HourCard  StatsBar  Tabs
  organisms/   Header  DayList  DayDetail
```

- **Атом**: мельчайший элемент, ничего не знает о других. `WeatherIcon` / `UiIcon`: иконка как CSS-маска (форма из PNG, цвет из `--icon`, поэтому цвет меняется в каждой теме). `Temperature`: число с градусом.
- **Молекула**: несколько атомов. `DayCard` (строка дня), `HourCard` (карточка часа), `WindInfo` (иконка + скорость + направление), `StatsBar` (Feels like / Humidity / Wind), `Tabs`.
- **Организм**: крупный блок страницы. `Header` (город, температура, иконка, холмы), `DayList` (7 дней), `DayDetail` (один день: 8 карточек каждые 3 часа).

Правило: атом не знает никого, молекула использует атомы, организм использует молекулы и атомы.

---

## 5. Service Worker и PWA (самое важное для вопросов)

Файл: `public/service-worker.js`. Регистрация: `src/main.js` (`navigator.serviceWorker.register(...)`). Лежит в `public/`, чтобы попасть в корень сайта и управлять всем приложением.

**Жизненный цикл:**
1. `install`: Service Worker **заранее кэширует** всё нужное: `index.html`, manifest, иконки, а также JS, CSS и шрифты. Имена файлов от Vite содержат хеш, поэтому SW читает `index.html` и CSS и сам находит их адреса.
2. `activate`: удаляет старые кэши (другая версия имени, например `v2`).
3. `fetch`: перехватывает каждый запрос и выбирает стратегию.

**Две стратегии (это требование задания):**

| Что | Стратегия | Как работает | Почему |
|---|---|---|---|
| Статика (HTML, JS, CSS, иконки, шрифты) | **cache-first** | Есть в кэше: отдаём. Нет: берём из сети и кладём в кэш | Не меняется, быстро, работает офлайн |
| API (Open-Meteo, BigDataCloud) | **network-first**, запасной вариант кэш | Сначала сеть, ответ кладём в кэш. Сети нет: отдаём последний сохранённый | Погода должна быть свежей, но офлайн лучше старые данные, чем ничего |

Кэшей два: `vejr-static-v3` и `vejr-api-v3`. При изменении Service Worker меняем версию.

**Почему предзагрузка при install (история ошибки):** при самом первом заходе Service Worker ещё не управляет страницей, поэтому JS/CSS не попали бы в кэш и офлайн была бы пустая страница. Решение: кэшировать всё в `install`.

**Manifest** (`public/manifest.json`): name, short_name, `display: standalone` (без адресной строки), цвета, иконки 192 и 512, `start_url: "./"` (относительный путь, чтобы работало на `/weather-pwa/`).

**Как показать офлайн на презентации:** DevTools → Application → Service Workers (виден активный) → Cache Storage (виден кэш) → Network → Offline → перезагрузка страницы, приложение работает.

---

## 6. Деплой

- `vite.config.js`: `base: '/weather-pwa/'`, потому что на GitHub Pages сайт лежит не в корне, а в подпапке с названием репозитория.
- `.github/workflows/deploy.yml`: при каждом `git push` в `main` GitHub сам делает `npm ci`, `npm run build` и публикует папку `dist`. В Settings → Pages выбрано Source: **GitHub Actions**.
- Геолокация требует HTTPS: GitHub Pages даёт его автоматически.

---

## 7. Дизайн (по макету из PDF)

- **4 темы** через CSS-переменные и `body[data-theme="..."]`: `--bg`, `--text`, `--muted`, `--icon`, `--glass`, `--glass-border`, `--badge`, `--hill-1/2/3`. Компоненты используют только переменные, поэтому смена темы не требует менять компоненты.
- **Градиенты:** вертикальный градиент неба + радиальное свечение в правом верхнем углу; у плашки времени суток свой градиент.
- **Glass:** полупрозрачный фон + рамка 1px + `backdrop-filter: blur(22px)`.
- **Шрифты:** Noto Serif JP (цифры, заголовки) и Zen Kaku Gothic New (подписи), две семьи. Установлены через `@fontsource` (лежат внутри проекта, работают офлайн, не нужен интернет к Google Fonts).
- **Холмы:** SVG из трёх слоёв, цвета из переменных темы.
- **Размеры по макету:** отступы 20px, радиусы 18/24/999px, иконка 90×90, температура 96px / вес 300.

**Адаптивность:** mobile-first. Базовые стили для телефона, `@media (min-width: 768px)` для планшета и десктопа. `#app` ограничен по ширине и центрирован. Часы: `grid` в 2 колонки с `minmax(0, 1fr)`.

---

## 8. Требования задания: где выполнено

| Требование | Где |
|---|---|
| GitHub repo + Pages | репозиторий + `deploy.yml` |
| API Open-Meteo | `weatherModel.js` (`buildURL`, `getWeatherData`) |
| Vanilla JS, ES Modules | `import` / `export` везде, без фреймворков |
| MVC | `models/`, `views/`, `controllers/` |
| Atomic Design | `components/atoms, molecules, organisms` |
| Responsive CSS | mobile-first + `@media` |
| API: network-first → cache | `networkFirst()` в Service Worker |
| Статика: cache-first | `cacheFirst()` в Service Worker |
| 7 дней | вкладка «7 dage» |
| Вид одного дня | вкладка «I dag» или клик по дню |
| Температура | Header, DayCard, HourCard |
| Ветер 10 м | `wind_speed_10m`: StatsBar, DayCard, HourCard |
| Направление ветра | `windDirection()` → `WindInfo` |
| Тип погоды + иконка | `describeWeather()` → `WeatherIcon` |
| Осадки | капля: вероятность % и мм |

---

## 9. Вопросы, которые могут задать

- **Что такое PWA?** Сайт, который можно установить как приложение и который работает офлайн. Нужны: HTTPS, manifest, Service Worker.
- **Чем cache-first отличается от network-first?** Cache-first: сначала кэш (быстро, для статики). Network-first: сначала сеть (свежие данные), кэш только запасной вариант.
- **Почему API network-first, а не cache-first?** Иначе пользователь видел бы устаревшую погоду.
- **Что делает `skipWaiting` / `clients.claim`?** Новый Service Worker сразу становится активным и берёт под контроль открытые страницы.
- **Зачем версия в названии кэша?** При обновлении `activate` удаляет старые кэши, чтобы не копился мусор и не показывалась старая версия.
- **Что если геолокацию не разрешили?** `getPosition()` не падает, а возвращает Aalborg Friis.
- **Почему `async/await`?** Геолокация и API асинхронные. Promise-обёртка над `getCurrentPosition` позволяет писать `await`.
- **Зачем `try/catch` в `initWeather`?** Если сеть или API упали, показываем сообщение, а не пустую страницу.
- **Зачем делегирование событий?** Карточки создаются заново при каждом `innerHTML`; один слушатель на родителе живёт всегда.
- **Почему округляем координаты?** Чтобы URL запроса повторялся и Service Worker находил его в кэше.
- **Чем MVC отличается от Atomic?** MVC делит логику (данные / вид / управление), Atomic делит сам интерфейс на уровни компонентов.
- **Как работает смена темы?** Контроллер ставит `data-theme`, CSS-переменные переопределяются под это значение.
- **Почему `base: '/weather-pwa/'`?** GitHub Pages публикует сайт в подпапке с названием репозитория.
- **Почему иконки CSS-маской?** Чтобы один PNG менял цвет в каждой теме через `--icon`.
