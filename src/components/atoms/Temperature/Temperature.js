import './Temperature.css'
export function Temperature(value, className = '') {
  return `<span class="temperature ${className}">${value}°</span>`
}