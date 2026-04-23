import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedbackPopup } from './FeedbackPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'baleia',
  label: 'Baleia',
  imagePath: '/fake/baleia.jpeg',
  firstLetter: 'B',
  gender: 'F',
}

describe('FeedbackPopup', () => {
  it('impede drag nativo na imagem', () => {
    render(<FeedbackPopup animal={animal} onDismiss={() => {}} />)
    expect(screen.getByAltText('Baleia')).toHaveAttribute('draggable', 'false')
  })

  it('chama onDismiss ao clicar no botão', () => {
    const onDismiss = vi.fn()
    render(<FeedbackPopup animal={animal} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
