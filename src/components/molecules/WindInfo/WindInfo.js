import './WindInfo.css'
import { UiIcon } from '../../atoms/UiIcon/UiIcon.js'

export function WindInfo(speed, direction) {
  return `<span class="wind-info">${UiIcon('wind')} ${speed} m/s ${direction}</span>`
}
