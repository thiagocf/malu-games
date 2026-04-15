import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Settings } from './Settings'

const defaultProps = {
  pairCount: 8,
  onChangePairCount: vi.fn(),
  playerMode: 'solo' as const,
  playerNames: ['Jogador 1', 'Jogador 2'],
  onChangePlayerMode: vi.fn(),
  onChangePlayerNames: vi.fn(),
  onBack: vi.fn(),
}

describe('Settings — exibição inicial', () => {
  it('exibe todos os botões de opção de pares', () => {
    render(<Settings {...defaultProps} />)
    for (const n of [4, 6, 8, 10, 12]) {
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument()
    }
  })

  it('exibe hint com pares e cartas corretos para o valor inicial', () => {
    render(<Settings {...defaultProps} />)
    expect(screen.getByText('8 pares = 16 cartas')).toBeInTheDocument()
  })

  it('atualiza hint ao selecionar nova opção', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    expect(screen.getByText('6 pares = 12 cartas')).toBeInTheDocument()
  })
})

describe('Settings — modo de jogo', () => {
  it('mostra os botões Solo e 2 Jogadores', () => {
    render(<Settings {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Solo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2 Jogadores' })).toBeInTheDocument()
  })

  it('input do Jogador 1 sempre visível', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    expect(screen.getByPlaceholderText('Jogador 1')).toBeInTheDocument()
  })

  it('input do Jogador 2 oculto em modo solo', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    expect(screen.queryByPlaceholderText('Jogador 2')).not.toBeInTheDocument()
  })

  it('input do Jogador 2 visível em modo duo', () => {
    render(<Settings {...defaultProps} playerMode="duo" />)
    expect(screen.getByPlaceholderText('Jogador 2')).toBeInTheDocument()
  })

  it('alternar para 2 Jogadores exibe input do Jogador 2', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    expect(screen.getByPlaceholderText('Jogador 2')).toBeInTheDocument()
  })

  it('nome em branco usa o placeholder como valor ao salvar', () => {
    const onChangePlayerNames = vi.fn()
    render(<Settings {...defaultProps} onChangePlayerNames={onChangePlayerNames} />)
    fireEvent.change(screen.getByPlaceholderText('Jogador 1'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePlayerNames).toHaveBeenCalledWith(
      expect.arrayContaining(['Jogador 1'])
    )
  })

  it('mudança de modo ativa guard de alterações não salvas', () => {
    render(<Settings {...defaultProps} playerMode="solo" />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument()
  })

  it('chamar onChangePlayerMode com modo selecionado ao salvar', () => {
    const onChangePlayerMode = vi.fn()
    render(<Settings {...defaultProps} playerMode="solo" onChangePlayerMode={onChangePlayerMode} />)
    fireEvent.click(screen.getByRole('button', { name: '2 Jogadores' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePlayerMode).toHaveBeenCalledWith('duo')
  })
})

describe('Settings — botão voltar sem alterações', () => {
  it('chama onBack direto quando não há alterações', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('não mostra dialog de confirmação quando não há alterações', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.queryByText('Sair sem salvar?')).not.toBeInTheDocument()
  })
})

describe('CONTRACT: guard de alterações não salvas', () => {
  it('mostra dialog de confirmação ao voltar com alterações pendentes', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument()
  })

  it('"Sair sem salvar" chama onBack sem salvar', () => {
    const onBack = vi.fn()
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    fireEvent.click(screen.getByText('Sair sem salvar'))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onChangePairCount).not.toHaveBeenCalled()
  })

  it('"Salvar" no dialog chama onChangePairCount com valor selecionado', () => {
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '6' }))
    fireEvent.click(screen.getByRole('button', { name: '←' }))
    fireEvent.click(screen.getAllByText('Salvar')[0])
    expect(onChangePairCount).toHaveBeenCalledWith(6)
  })
})

describe('Settings — botão Salvar', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('chama onChangePairCount com o novo valor ao salvar', () => {
    const onChangePairCount = vi.fn()
    render(<Settings {...defaultProps} onChangePairCount={onChangePairCount} />)
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onChangePairCount).toHaveBeenCalledWith(4)
  })

  it('botão Salvar fica desabilitado após salvar', () => {
    render(<Settings {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByRole('button', { name: '✓ Salvo!' })).toBeDisabled()
  })

  it('chama onBack após 800ms de feedback', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onBack).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(800) })
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('não chama onBack antes de 800ms', () => {
    const onBack = vi.fn()
    render(<Settings {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    act(() => { vi.advanceTimersByTime(799) })
    expect(onBack).not.toHaveBeenCalled()
  })
})
