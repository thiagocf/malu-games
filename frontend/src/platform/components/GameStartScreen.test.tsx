import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameStartScreen } from './GameStartScreen'

describe('GameStartScreen', () => {
  it('renderiza title e children', () => {
    render(
      <GameStartScreen title="🎮 Jogo Teste">
        <div>conteudo-do-jogo</div>
      </GameStartScreen>
    )
    expect(screen.getByText('🎮 Jogo Teste')).toBeInTheDocument()
    expect(screen.getByText('conteudo-do-jogo')).toBeInTheDocument()
  })

  it('renderiza subtitle quando fornecido', () => {
    render(
      <GameStartScreen title="T" subtitle="Escolhe um tema!">
        <div />
      </GameStartScreen>
    )
    expect(screen.getByText('Escolhe um tema!')).toBeInTheDocument()
  })

  it('NÃO renderiza botão de config quando onOpenSettings ausente', () => {
    render(<GameStartScreen title="T"><div /></GameStartScreen>)
    expect(screen.queryByRole('button', { name: /configurações/i })).not.toBeInTheDocument()
  })

  it('renderiza botão de config quando onOpenSettings fornecido', () => {
    render(
      <GameStartScreen title="T" onOpenSettings={vi.fn()}><div /></GameStartScreen>
    )
    expect(screen.getByRole('button', { name: /configurações/i })).toBeInTheDocument()
  })

  it('clique no botão chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(
      <GameStartScreen title="T" onOpenSettings={onOpenSettings}><div /></GameStartScreen>
    )
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
