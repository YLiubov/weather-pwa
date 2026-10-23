import './UiIcon.css'

export function UiIcon(name) {
  const src = `${import.meta.env.BASE_URL}icons/weather/${name}.png`
  return `<span class="ui-icon" style="--src:url('${src}')" aria-hidden="true"></span>`
}
