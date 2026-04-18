import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoundScreen } from './RoundScreen'
import styles from './RoundScreen.module.css'
import type { Animal, Round } from '../game/types'

const makeAnimal = (id: string, label: string): Animal => ({
  id,
  label,
  imagePath: `/fake/${id}.jpeg`,
  firstLetter: label.charAt(0),
})

const correctAnimal = makeAnimal('abelha', 'Abelha')
const distractors = [
  makeAnimal('baleia', 'Baleia'),
  makeAnimal('cachorro', 'Cachorro'),
  makeAnimal('dinossauro', 'Dinossauro'),
]

const round: Round = {
  letter: 'A',
  correctAnimal,
  options: [correctAnimal, ...distractors],
  attempts: 0,
  completed: false,
}

describe('RoundScreen', () => {
  it('renders all options with accessible images', () => {
    render(<RoundScreen round={round} showCorrect={false} onSelect={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.getByAltText('Abelha')).toBeInTheDocument()
    expect(screen.getByAltText('Baleia')).toBeInTheDocument()
    expect(screen.getByAltText('Cachorro')).toBeInTheDocument()
    expect(screen.getByAltText('Dinossauro')).toBeInTheDocument()
  })

  it('prevents native image drag on every option image (regression: cards disappearing on hover)', () => {
    render(<RoundScreen round={round} showCorrect={false} onSelect={() => {}} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(4)
    for (const img of images) {
      expect(img).toHaveAttribute('draggable', 'false')
    }
  })

  it('calls onSelect with the animal id when an option is clicked', () => {
    const onSelect = vi.fn()
    render(<RoundScreen round={round} showCorrect={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByAltText('Abelha').closest('button')!)
    expect(onSelect).toHaveBeenCalledWith('abelha')
  })

  it('disables every option when showCorrect is true', () => {
    render(<RoundScreen round={round} showCorrect={true} onSelect={() => {}} />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })

  it('applies the correct class only to the correct animal button when showCorrect is true', () => {
    render(<RoundScreen round={round} showCorrect={true} onSelect={() => {}} />)
    const correctButton = screen.getByAltText('Abelha').closest('button')!
    expect(correctButton.className).toContain(styles.correct)

    const wrongButton = screen.getByAltText('Baleia').closest('button')!
    expect(wrongButton.className).not.toContain(styles.correct)
  })
})
