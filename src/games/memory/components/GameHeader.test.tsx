import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameHeader } from './GameHeader'

describe('GameHeader — dialog de abandono', () => {
  it('não mostra dialog inicialmente', () => {
    render(<GameHeader moves={0} onAbandon={vi.fn()} />)
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
  })

  it('clicar "Abandonar" abre dialog', () => {
    render(<GameHeader moves={0} onAbandon={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    expect(screen.getByText('Continuar jogando')).toBeInTheDocument()
  })

  it('"Continuar jogando" fecha dialog sem chamar onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    fireEvent.click(screen.getByText('Continuar jogando'))
    expect(screen.queryByText('Continuar jogando')).not.toBeInTheDocument()
    expect(onAbandon).not.toHaveBeenCalled()
  })

  it('"Abandonar" no dialog chama onAbandon', () => {
    const onAbandon = vi.fn()
    render(<GameHeader moves={0} onAbandon={onAbandon} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abandonar' }))
    // After dialog opens there are two "Abandonar" buttons; the confirm one is inside the dialog
    const abandonButtons = screen.getAllByRole('button', { name: 'Abandonar' })
    fireEvent.click(abandonButtons[abandonButtons.length - 1])
    expect(onAbandon).toHaveBeenCalledTimes(1)
  })

  it('exibe o contador de moves correto', () => {
    render(<GameHeader moves={7} onAbandon={vi.fn()} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
