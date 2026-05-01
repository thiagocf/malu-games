export type SuccessMessageToken = string | 'animal' | 'letter'
export type SuccessMessageTemplate = SuccessMessageToken[]

export const SUCCESS_MESSAGE_TEMPLATES: SuccessMessageTemplate[] = [
  ['Isso mesmo! ', 'animal', ', com a letra ', 'letter', '!'],
  ['Muito bem! ', 'animal', ' começa com ', 'letter', '!'],
  ['Acertou! ', 'animal', ' é com a letra ', 'letter', '!'],
  ['Boa! ', 'animal', ' começa com ', 'letter', '!'],
  ['Excelente! ', 'animal', ', com a letra ', 'letter', '!'],
  ['Mandou bem! ', 'animal', ' começa com ', 'letter', '!'],
  ['Isso! A letra ', 'letter', ' é de ', 'animal', '!'],
  ['Perfeito! ', 'animal', ' começa com a letra ', 'letter', '!'],
]

export function selectSuccessMessageIndex(random = Math.random) {
  return Math.floor(random() * SUCCESS_MESSAGE_TEMPLATES.length)
}

export function formatSuccessMessage(
  template: SuccessMessageTemplate,
  animalLabel: string,
  letter: string
) {
  return template.map(token => {
    if (token === 'animal') return animalLabel
    if (token === 'letter') return letter
    return token
  }).join('')
}
