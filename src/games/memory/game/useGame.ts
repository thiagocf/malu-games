import { useState, useCallback, useEffect } from 'react'
import { createDeck, flipCard, resolvePair } from './engine'
import type { GameConfig, GameState } from './types'

export function useGame(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => ({
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
  }))

  useEffect(() => {
    if (state.flippedIds.length === 2) {
      const timer = setTimeout(() => {
        setState(s => resolvePair(s))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.flippedIds])

  const handleFlip = useCallback((id: number) => {
    setState(prev => {
      if (prev.flippedIds.length >= 2) return prev
      return flipCard(prev, id)
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
