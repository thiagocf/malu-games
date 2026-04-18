import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameHeader } from './GameHeader'
import type { Player } from '../game/types'

const soloPlayer: Player[] = [{ name: 'Malu', pairsFound: 3 }]
const duoPlayers: Player[] = [
  { name: 'Ana', pairsFound: 2 },
  { name: 'Beto', pairsFound: 1 },
]

describe('GameHeader — dialog de abandono', () => {
  it('não mostra dialog inicialmente', () => {
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
  })

  it('clicar "✕ Sair" abre dialog', () => {
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '✕ Sair' }))
    expect(screen.getByText('Continuar jogando')).toBeInTheDocument()
  })

  it('"Continuar jogando" fecha dialog sem chamar onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: '✕ Sair' }))
    fireEvent.click(screen.getByText('Continuar jogando'))
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
    expect(onAbandon).not.toHaveBeenCalled()
  })

  it('"Abandonar" no dialog chama onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} players={soloPlayer} currentPlayerIndex={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: '✕ Sair' }))
    const abandonButtons = screen.getAllByRole('button', { name: 'Abandonar' })
    fireEvent.click(abandonButtons[abandonButtons.length - 1])
    expect(onAbandon).toHaveBeenCalledTimes(1)
  })

  it('exibe o contador de moves correto', () => {
    render(<GameHeader moves={7} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

describe('GameHeader — placar solo', () => {
  it('mostra o nome do jogador', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText(/Malu/)).toBeInTheDocument()
  })

  it('mostra pares encontrados', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText(/3 pares/)).toBeInTheDocument()
  })

  it('não exibe "Vez de" em modo solo', () => {
    render(<GameHeader moves={5} players={soloPlayer} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.queryByText(/Vez de/)).not.toBeInTheDocument()
  })
})

describe('GameHeader — placar duo', () => {
  it('mostra o nome dos dois jogadores', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getAllByText(/Ana/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Beto/)).toBeInTheDocument()
  })

  it('exibe "Vez de" com o nome do jogador atual', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={1} onAbandon={vi.fn()} />)
    expect(screen.getByText('Vez de: Beto')).toBeInTheDocument()
  })

  it('atualiza "Vez de" quando currentPlayerIndex muda', () => {
    render(<GameHeader moves={5} players={duoPlayers} currentPlayerIndex={0} onAbandon={vi.fn()} />)
    expect(screen.getByText('Vez de: Ana')).toBeInTheDocument()
  })
})
