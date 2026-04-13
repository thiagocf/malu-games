import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import { GameOver } from './GameOver'

describe('CONTRACT: auto-redirect após 3000ms', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não chama onBackToMenu antes de 3000ms', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    render(<GameOver moves={10} onRestart={onRestart} onBackToMenu={onBackToMenu} />)

    act(() => {
      vi.advanceTimersByTime(2999)
    })

    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('chama onBackToMenu exatamente uma vez após 3000ms', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    render(<GameOver moves={10} onRestart={onRestart} onBackToMenu={onBackToMenu} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(onBackToMenu).toHaveBeenCalledTimes(1)
  })

  it('timer é cancelado se componente desmonta (sem memory leak)', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    const { unmount } = render(
      <GameOver moves={10} onRestart={onRestart} onBackToMenu={onBackToMenu} />
    )

    unmount()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(onBackToMenu).not.toHaveBeenCalled()
  })
})

describe('GameOver — ações manuais', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('botão "Jogar de novo" chama onRestart imediatamente', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    render(<GameOver moves={5} onRestart={onRestart} onBackToMenu={onBackToMenu} />)

    fireEvent.click(screen.getByText('Jogar de novo'))

    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('"Jogar de novo" não chama onBackToMenu', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    render(<GameOver moves={5} onRestart={onRestart} onBackToMenu={onBackToMenu} />)

    fireEvent.click(screen.getByText('Jogar de novo'))

    expect(onBackToMenu).not.toHaveBeenCalled()
  })

  it('exibe a contagem de moves recebida por props', () => {
    const onBackToMenu = vi.fn()
    const onRestart = vi.fn()
    render(<GameOver moves={42} onRestart={onRestart} onBackToMenu={onBackToMenu} />)

    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
