import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOver } from './GameOver'

describe('Alphabet Match GameOver', () => {
  it('permite trocar modo', () => {
    const onChangeMode = vi.fn()
    render(
      <GameOver
        totalAttempts={5}
        totalRounds={5}
        onRestart={() => {}}
        onBackToMenu={() => {}}
        onChangeMode={onChangeMode}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /trocar modo/i }))

    expect(onChangeMode).toHaveBeenCalledTimes(1)
  })
})
