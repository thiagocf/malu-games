import { describe, it, expect } from 'vitest'
import { createDeck, createGame, flipCard, resolvePair, isComplete } from './engine'
import type { GameConfig, GameState } from './types'

const config: GameConfig = {
  deck: [
    { id: 'dog', emoji: '🐶', label: 'Cachorro' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
  ],
  pairCount: 2,
  players: ['P1'],
}

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    cards: [
      { id: 0, animalId: 'dog', isFlipped: false, isMatched: false },
      { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
      { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
      { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
    ],
    flippedIds: [],
    moves: 0,
    isComplete: false,
    players: [{ name: 'P1', pairsFound: 0 }],
    currentPlayerIndex: 0,
    ...overrides,
  }
}

// ─── createGame ──────────────────────────────────────────────────────────────

describe('createGame', () => {
  it('initializes players from config names with pairsFound 0', () => {
    const state = createGame({ ...config, players: ['Ana', 'Beto'] })
    expect(state.players).toEqual([
      { name: 'Ana', pairsFound: 0 },
      { name: 'Beto', pairsFound: 0 },
    ])
  })

  it('starts with currentPlayerIndex 0', () => {
    expect(createGame(config).currentPlayerIndex).toBe(0)
  })

  it('starts with moves 0 and isComplete false', () => {
    const state = createGame(config)
    expect(state.moves).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('creates the correct number of cards', () => {
    expect(createGame(config).cards).toHaveLength(4)
  })

  it('works with a single player (solo mode)', () => {
    const state = createGame({ ...config, players: ['Malu'] })
    expect(state.players).toEqual([{ name: 'Malu', pairsFound: 0 }])
  })
})

// ─── createDeck ─────────────────────────────────────────────────────────────

describe('createDeck', () => {
  it('creates 2x the number of animals as cards', () => {
    expect(createDeck(config)).toHaveLength(4)
  })

  it('has exactly 2 cards for each animal', () => {
    const deck = createDeck(config)
    expect(deck.filter(c => c.animalId === 'dog')).toHaveLength(2)
    expect(deck.filter(c => c.animalId === 'cat')).toHaveLength(2)
  })

  it('assigns unique sequential ids starting at 0', () => {
    const deck = createDeck(config)
    expect(deck.map(c => c.id).sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('starts all cards unflipped and unmatched', () => {
    const deck = createDeck(config)
    expect(deck.every(c => !c.isFlipped && !c.isMatched)).toBe(true)
  })

  it('creates only the number of pairs specified by pairCount', () => {
    const bigDeck: GameConfig = {
      deck: [
        { id: 'dog', emoji: '🐶', label: 'Cachorro' },
        { id: 'cat', emoji: '🐱', label: 'Gato' },
        { id: 'frog', emoji: '🐸', label: 'Sapo' },
        { id: 'lion', emoji: '🦁', label: 'Leão' },
        { id: 'rabbit', emoji: '🐰', label: 'Coelho' },
        { id: 'bear', emoji: '🐻', label: 'Urso' },
      ],
      pairCount: 4,
      players: ['P1'],
    }
    const deck = createDeck(bigDeck)
    expect(deck).toHaveLength(8)
    const uniqueIds = new Set(deck.map(c => c.animalId))
    expect(uniqueIds.size).toBe(4)
  })

  it('creates 24 cards when pairCount is 12', () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `item-${i}`,
      emoji: '🔵',
      label: `Item ${i}`,
    }))
    const deck = createDeck({ deck: items, pairCount: 12, players: ['P1'] })
    expect(deck).toHaveLength(24)
    const uniqueIds = new Set(deck.map(c => c.animalId))
    expect(uniqueIds.size).toBe(12)
  })

  it('each animalId appears exactly twice', () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `item-${i}`,
      emoji: '🔵',
      label: `Item ${i}`,
    }))
    const deck = createDeck({ deck: items, pairCount: 6, players: ['P1'] })
    const counts = new Map<string, number>()
    deck.forEach(c => counts.set(c.animalId, (counts.get(c.animalId) ?? 0) + 1))
    counts.forEach(count => expect(count).toBe(2))
  })
})

// ─── flipCard ────────────────────────────────────────────────────────────────

describe('flipCard', () => {
  it('flips the target card and adds its id to flippedIds', () => {
    const next = flipCard(makeState(), 0)
    expect(next.cards.find(c => c.id === 0)?.isFlipped).toBe(true)
    expect(next.flippedIds).toContain(0)
  })

  it('returns the same state reference if card is already flipped', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0],
    })
    expect(flipCard(state, 0)).toBe(state)
  })

  it('returns the same state reference if 2 cards are already flipped', () => {
    const state = makeState({ flippedIds: [0, 1] })
    expect(flipCard(state, 2)).toBe(state)
  })

  it('returns the same state reference if card is matched', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
    })
    expect(flipCard(state, 0)).toBe(state)
  })
})

// ─── resolvePair ─────────────────────────────────────────────────────────────

describe('resolvePair', () => {
  it('marks both cards as matched when they share the same animalId', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
    })
    const next = resolvePair(state)
    expect(next.cards.find(c => c.id === 0)?.isMatched).toBe(true)
    expect(next.cards.find(c => c.id === 2)?.isMatched).toBe(true)
  })

  it('unflips both cards when they have different animalIds', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    const next = resolvePair(state)
    expect(next.cards.find(c => c.id === 0)?.isFlipped).toBe(false)
    expect(next.cards.find(c => c.id === 1)?.isFlipped).toBe(false)
  })

  it('increments the move counter', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).moves).toBe(1)
  })

  it('clears flippedIds', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).flippedIds).toHaveLength(0)
  })

  it('sets isComplete to true when all pairs are found', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true,  isMatched: true  },
        { id: 2, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: true,  isMatched: true  },
      ],
      flippedIds: [0, 2],
      moves: 1,
    })
    expect(resolvePair(state).isComplete).toBe(true)
  })
})

// ─── CONTRACT: turno de jogo ─────────────────────────────────────────────────

describe('CONTRACT: acerto mantém a vez', () => {
  it('solo — currentPlayerIndex permanece 0 após par encontrado', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })

  it('duo — currentPlayerIndex não avança quando o jogador acerta', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(1)
  })
})

describe('CONTRACT: erro passa a vez', () => {
  it('duo — currentPlayerIndex avança de 0 para 1 após erro', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 0,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(1)
  })

  it('duo — currentPlayerIndex volta para 0 quando o último jogador erra (wrap)', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })

  it('solo — currentPlayerIndex permanece 0 após erro (nunca troca)', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
    })
    expect(resolvePair(state).currentPlayerIndex).toBe(0)
  })
})

describe('CONTRACT: placar isolado por jogador', () => {
  it('só o jogador atual recebe ponto ao acertar — o outro permanece inalterado', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: false, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 2],
      players: [{ name: 'P1', pairsFound: 0 }, { name: 'P2', pairsFound: 0 }],
      currentPlayerIndex: 1,
    })
    const next = resolvePair(state)
    expect(next.players[0].pairsFound).toBe(0)
    expect(next.players[1].pairsFound).toBe(1)
  })

  it('nenhum jogador recebe ponto em um erro', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: false },
        { id: 2, animalId: 'dog', isFlipped: false, isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: false, isMatched: false },
      ],
      flippedIds: [0, 1],
      players: [{ name: 'P1', pairsFound: 2 }, { name: 'P2', pairsFound: 1 }],
      currentPlayerIndex: 0,
    })
    const next = resolvePair(state)
    expect(next.players[0].pairsFound).toBe(2)
    expect(next.players[1].pairsFound).toBe(1)
  })
})

// ─── isComplete ──────────────────────────────────────────────────────────────

describe('isComplete', () => {
  it('returns false when some cards are unmatched', () => {
    expect(isComplete(makeState())).toBe(false)
  })

  it('returns true when all cards are matched', () => {
    const state = makeState({
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 1, animalId: 'cat', isFlipped: true, isMatched: true },
        { id: 2, animalId: 'dog', isFlipped: true, isMatched: true },
        { id: 3, animalId: 'cat', isFlipped: true, isMatched: true },
      ],
    })
    expect(isComplete(state)).toBe(true)
  })
})
