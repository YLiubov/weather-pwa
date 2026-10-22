import './Tabs.css'

export function Tabs(activeTab) {
  const tab = (id, label) =>
    `<button class="tabs__btn ${activeTab === id ? 'tabs__btn--active' : ''}" data-tab="${id}">${label}</button>`

  return `
    <nav class="tabs">
      ${tab('today', 'I dag')}
      ${tab('week', '7 dage')}
    </nav>`
}
