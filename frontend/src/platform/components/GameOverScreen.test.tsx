import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen'

describe('GameOverScreen', () => {
  it('renderiza title e children', () => {
    render(
      <GameOverScreen title="🎉 Parabéns!" onRestart={vi.fn()} onBackToMenu={vi.fn()}>
        <p>Estatísticas</p>
      </GameOverScreen>
    )
    expect(screen.getByText('🎉 Parabéns!')).toBeInTheDocument()
    expect(screen.getByText('Estatísticas')).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart', () => {
    const onRestart = vi.fn()
    render(
      <GameOverScreen title="T" onRestart={onRestart} onBackToMenu={vi.fn()}>
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByText('Jogar de novo'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu', () => {
    const onBackToMenu = vi.fn()
    render(
      <GameOverScreen title="T" onRestart={vi.fn()} onBackToMenu={onBackToMenu}>
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByText('Outro jogo'))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('aceita rótulos customizados', () => {
    render(
      <GameOverScreen
        title="T"
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        restartLabel="De novo!"
        menuLabel="Menu"
      >
        <p />
      </GameOverScreen>
    )
    expect(screen.getByText('De novo!')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('NÃO renderiza botão de config quando onOpenSettings ausente', () => {
    render(
      <GameOverScreen title="T" onRestart={vi.fn()} onBackToMenu={vi.fn()}>
        <p />
      </GameOverScreen>
    )
    expect(screen.queryByRole('button', { name: /configurações/i })).not.toBeInTheDocument()
  })

  it('botão de config chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(
      <GameOverScreen
        title="T"
        onRestart={vi.fn()}
        onBackToMenu={vi.fn()}
        onOpenSettings={onOpenSettings}
      >
        <p />
      </GameOverScreen>
    )
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
