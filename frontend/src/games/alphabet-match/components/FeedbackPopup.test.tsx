import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackPopup } from './FeedbackPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'baleia',
  label: 'Baleia',
  imagePath: '/fake/baleia.jpeg',
  firstLetter: 'B',
}

describe('FeedbackPopup', () => {
  it('prevents native image drag (regression: image disappearing on hover)', () => {
    render(<FeedbackPopup animal={animal} onDismiss={() => {}} />)
    const img = screen.getByAltText('Baleia')
    expect(img).toHaveAttribute('draggable', 'false')
  })
})
