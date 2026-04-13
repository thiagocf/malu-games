import type { Card, GameConfig, GameState } from './types'

export function createDeck(config: GameConfig): Card[] {
  const selected = config.deck.slice(0, config.pairCount)
  const doubled = [...selected, ...selected]
  const shuffled = doubled.sort(() => Math.random() - 0.5)
  return shuffled.map((animal, index) => ({
    id: index,
    animalId: animal.id,
    isFlipped: false,
    isMatched: false,
  }))
}

export function createGame(config: GameConfig): GameState {
  return {
    cards: createDeck(config),
    flippedIds: [],
    moves: 0,
    isComplete: false,
    players: config.players.map(name => ({ name, pairsFound: 0 })),
    currentPlayerIndex: 0,
  }
}

export function flipCard(state: GameState, id: number): GameState {
  const card = state.cards.find(c => c.id === id)
  if (!card || card.isFlipped || card.isMatched || state.flippedIds.length >= 2) {
    return state
  }
  return {
    ...state,
    cards: state.cards.map(c => c.id === id ? { ...c, isFlipped: true } : c),
    flippedIds: [...state.flippedIds, id],
  }
}

export function resolvePair(state: GameState): GameState {
  const [firstId, secondId] = state.flippedIds
  const first = state.cards.find(c => c.id === firstId)!
  const second = state.cards.find(c => c.id === secondId)!
  const matched = first.animalId === second.animalId

  const cards = state.cards.map(c => {
    if (c.id === firstId || c.id === secondId) {
      return matched ? { ...c, isMatched: true } : { ...c, isFlipped: false }
    }
    return c
  })

  const players = state.players.map((p, i) =>
    matched && i === state.currentPlayerIndex
      ? { ...p, pairsFound: p.pairsFound + 1 }
      : p
  )

  const currentPlayerIndex = matched
    ? state.currentPlayerIndex
    : (state.currentPlayerIndex + 1) % state.players.length

  const next: GameState = {
    ...state,
    cards,
    flippedIds: [],
    moves: state.moves + 1,
    isComplete: false,
    players,
    currentPlayerIndex,
  }

  return { ...next, isComplete: isComplete(next) }
}

export function isComplete(state: GameState): boolean {
  return state.cards.every(c => c.isMatched)
}
