import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LetterFeedbackPopup } from './LetterFeedbackPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
  gender: 'M',
}

describe('LetterFeedbackPopup', () => {
  it('mostra a imagem e a frase sem nome do animal', () => {
    render(<LetterFeedbackPopup animal={animal} selectedLetter="A" onDismiss={() => {}} />)

    expect(screen.getByAltText('Animal escolhido')).toBeInTheDocument()
    expect(screen.getByText('Esse animal não começa com a letra A.')).toBeInTheDocument()
    expect(screen.queryByText('Elefante')).toBeNull()
  })

  it('chama onDismiss ao tentar novamente', () => {
    const onDismiss = vi.fn()
    render(<LetterFeedbackPopup animal={animal} selectedLetter="A" onDismiss={onDismiss} />)

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
