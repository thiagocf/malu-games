import { useState, useCallback } from 'react'
import { createDeck, flipCard, resolvePair } from './engine'
import type { GameConfig, GameState } from './types'

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => ({
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
  }))

  const handleFlip = useCallback((id: number) => {
    setState(prev => {
      if (prev.flippedIds.length >= 2) return prev
      const next = flipCard(prev, id)
      if (next.flippedIds.length === 2) {
        setTimeout(() => {
          setState(s => resolvePair(s))
        }, 1000)
      }
      return next
    })
  }, [])

  const restart = useCallback(() => {
    setState({
      cards: createDeck(config),
      flippedIds: [],
      moves: 0,
      isComplete: false,
    })
  }, [config])

  return {
    cards: state.cards,
    moves: state.moves,
    isComplete: state.isComplete,
    flipCard: handleFlip,
    restart,
  }
}
