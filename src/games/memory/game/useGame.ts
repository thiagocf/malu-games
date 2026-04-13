import { useState, useCallback, useEffect } from 'react'
import { createGame, flipCard, resolvePair } from './engine'
import type { GameConfig, GameState } from './types'
import { useSounds } from './useSounds'

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => createGame(config))

  const { playFlip, playMatch, playWin } = useSounds()

  useEffect(() => {
    if (state.flippedIds.length === 2) {
      const timer = setTimeout(() => {
        setState(s => {
          const next = resolvePair(s)
          const didMatch = next.cards.some(
            c => (c.id === s.flippedIds[0] || c.id === s.flippedIds[1]) && c.isMatched
          )
          if (next.isComplete) playWin()
          else if (didMatch) playMatch()
          return next
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.flippedIds, playMatch, playWin])

  const handleFlip = useCallback((id: number) => {
    setState(prev => {
      if (prev.flippedIds.length >= 2) return prev
      playFlip()
      return flipCard(prev, id)
    })
  }, [playFlip])

  const restart = useCallback(() => {
    setState(createGame(config))
  }, [config])

  return {
    cards: state.cards,
    moves: state.moves,
    isComplete: state.isComplete,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    flipCard: handleFlip,
    restart,
  }
}
