import { describe, expect, it } from 'vitest'
import {
  SUCCESS_MESSAGE_TEMPLATES,
  formatSuccessMessage,
  selectSuccessMessageIndex,
} from './successMessages'

describe('successMessages', () => {
  it('mantem as 8 frases aprovadas', () => {
    expect(SUCCESS_MESSAGE_TEMPLATES).toHaveLength(8)
    expect(SUCCESS_MESSAGE_TEMPLATES.map(template => formatSuccessMessage(template, 'Elefante', 'E'))).toEqual([
      'Isso mesmo! Elefante, com a letra E!',
      'Muito bem! Elefante começa com E!',
      'Acertou! Elefante é com a letra E!',
      'Boa! Elefante começa com E!',
      'Excelente! Elefante, com a letra E!',
      'Mandou bem! Elefante começa com E!',
      'Isso! A letra E é de Elefante!',
      'Perfeito! Elefante começa com a letra E!',
    ])
  })

  it('seleciona um indice valido a partir do random informado', () => {
    expect(selectSuccessMessageIndex(() => 0)).toBe(0)
    expect(selectSuccessMessageIndex(() => 0.49)).toBe(3)
    expect(selectSuccessMessageIndex(() => 0.99)).toBe(7)
  })
})
