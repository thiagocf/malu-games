import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LetterRoundScreen } from './LetterRoundScreen'
import styles from './LetterRoundScreen.module.css'
import type { Animal, Round } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
  gender: 'M',
}

const round: Round = {
  letter: 'E',
  correctAnimal: animal,
  options: [animal],
  letterOptions: ['A', 'E', 'G', 'L'],
  attempts: 0,
  completed: false,
}

const defaultProps = {
  round,
  selectedLetter: null,
  blockedLetters: [] as string[],
  onPreviewAnimal: () => {},
  onSelectLetter: () => {},
  onConfirm: () => {},
}

describe('LetterRoundScreen', () => {
  it('renderiza a imagem do animal sem mostrar o nome', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    expect(screen.getByAltText('Animal para descobrir a letra')).toBeInTheDocument()
    expect(screen.queryByText('Elefante')).toBeNull()
  })

  it('impede drag nativo na imagem', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    expect(screen.getByAltText('Animal para descobrir a letra')).toHaveAttribute('draggable', 'false')
  })

  it('chama onPreviewAnimal ao clicar na imagem', () => {
    const onPreviewAnimal = vi.fn()
    render(<LetterRoundScreen {...defaultProps} onPreviewAnimal={onPreviewAnimal} />)

    fireEvent.click(screen.getByRole('button', { name: /ouvir animal/i }))

    expect(onPreviewAnimal).toHaveBeenCalledTimes(1)
  })

  it('renderiza as quatro letras', () => {
    render(<LetterRoundScreen {...defaultProps} />)

    for (const letter of round.letterOptions) {
      expect(screen.getByRole('button', { name: `Letra ${letter}` })).toBeInTheDocument()
    }
  })

  it('seleciona uma letra', () => {
    const onSelectLetter = vi.fn()
    render(<LetterRoundScreen {...defaultProps} onSelectLetter={onSelectLetter} />)

    fireEvent.click(screen.getByRole('button', { name: 'Letra E' }))

    expect(onSelectLetter).toHaveBeenCalledWith('E')
  })

  it('exibe botão confirmar só quando há letra selecionada', () => {
    const { rerender } = render(<LetterRoundScreen {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /é essa/i })).toBeNull()

    rerender(<LetterRoundScreen {...defaultProps} selectedLetter="E" />)
    expect(screen.getByRole('button', { name: /é essa/i })).toBeInTheDocument()
  })

  it('chama onConfirm ao confirmar', () => {
    const onConfirm = vi.fn()
    render(<LetterRoundScreen {...defaultProps} selectedLetter="E" onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: /é essa/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('aplica selected na letra selecionada', () => {
    render(<LetterRoundScreen {...defaultProps} selectedLetter="E" />)

    expect(screen.getByRole('button', { name: 'Letra E' }).className).toContain(styles.selected)
  })

  it('desabilita letras bloqueadas', () => {
    render(<LetterRoundScreen {...defaultProps} blockedLetters={['A']} />)

    const blocked = screen.getByRole('button', { name: 'Letra A' })
    expect(blocked).toBeDisabled()
    expect(blocked.className).toContain(styles.blocked)
  })
})
