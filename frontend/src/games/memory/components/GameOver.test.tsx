import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { GameOver } from './GameOver'
import type { Player } from '../game/types'

const soloPlayer: Player[] = [{ name: 'Bea', pairsFound: 4 }]
const duoWinner: Player[] = [{ name: 'Ana', pairsFound: 5 }, { name: 'Beto', pairsFound: 3 }]
const duoTie: Player[] = [{ name: 'Ana', pairsFound: 4 }, { name: 'Beto', pairsFound: 4 }]

const noop = () => {}

describe('CONTRACT: sem auto-redirect (solo e duo)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('NÃO chama onBackToMenu automaticamente em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('NÃO chama onBackToMenu automaticamente em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(10000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('CONTRACT: auto-redirect ausente em modo duo', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('duo com vencedor — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('duo em empate — sem redirect após qualquer tempo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('GameOver — modo solo', () => {
  it('exibe o nome do jogador', () => {
    render(<GameOver moves={10} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Parabéns, Bea!')).toBeInTheDocument()
  })

  it('exibe a contagem de moves', () => {
    render(<GameOver moves={42} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={onRestart} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Jogar de novo/))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu em modo solo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Outro jogo/))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})

describe('GameOver — modo duo', () => {
  it('exibe o nome do vencedor quando há um ganhador', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Ana ganhou!')).toBeInTheDocument()
  })

  it('exibe "Empate!" quando os pontos são iguais', () => {
    render(<GameOver moves={10} players={duoTie} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getByText('Empate!')).toBeInTheDocument()
  })

  it('exibe o placar dos dois jogadores', () => {
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    expect(screen.getAllByText(/Ana/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Beto/)).toBeInTheDocument()
  })

  it('botão "Jogar de novo" chama onRestart em modo duo', () => {
    const onRestart = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={onRestart} onBackToMenu={vi.fn()} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Jogar de novo/))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('botão "Outro jogo" chama onBackToMenu em modo duo', () => {
    const onBackToMenu = vi.fn()
    render(<GameOver moves={10} players={duoWinner} onRestart={vi.fn()} onBackToMenu={onBackToMenu} onOpenSettings={noop} />)
    fireEvent.click(screen.getByText(/Outro jogo/))
    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })
})

describe('GameOver — acesso a configurações', () => {
  it('renderiza botão de config quando onOpenSettings fornecido', () => {
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={vi.fn()} />)
    expect(screen.getByRole('button', { name: /configurações/i })).toBeInTheDocument()
  })

  it('clique no botão chama onOpenSettings', () => {
    const onOpenSettings = vi.fn()
    render(<GameOver moves={5} players={soloPlayer} onRestart={vi.fn()} onBackToMenu={vi.fn()} onOpenSettings={onOpenSettings} />)
    fireEvent.click(screen.getByRole('button', { name: /configurações/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
