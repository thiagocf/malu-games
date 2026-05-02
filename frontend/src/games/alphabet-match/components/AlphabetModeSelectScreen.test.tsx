import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlphabetModeSelectScreen } from './AlphabetModeSelectScreen'

describe('AlphabetModeSelectScreen', () => {
  it('renderiza os dois modos', () => {
    render(<AlphabetModeSelectScreen onSelectMode={() => {}} onBackToMenu={() => {}} />)

    expect(screen.getByRole('button', { name: /ache o animal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ache a letra/i })).toBeInTheDocument()
  })

  it('seleciona o modo Ache o animal', () => {
    const onSelectMode = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={onSelectMode} onBackToMenu={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /ache o animal/i }))

    expect(onSelectMode).toHaveBeenCalledWith('letter-to-animal')
  })

  it('seleciona o modo Ache a letra', () => {
    const onSelectMode = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={onSelectMode} onBackToMenu={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: /ache a letra/i }))

    expect(onSelectMode).toHaveBeenCalledWith('animal-to-letter')
  })

  it('volta para o menu principal', () => {
    const onBackToMenu = vi.fn()
    render(<AlphabetModeSelectScreen onSelectMode={() => {}} onBackToMenu={onBackToMenu} />)

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }))

    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})
