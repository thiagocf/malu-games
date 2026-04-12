import { describe, it, expect } from 'vitest'
import { createDeck, flipCard, resolvePair, isComplete } from './engine'
import type { GameConfig, GameState } from './types'

const config: GameConfig = {
  deck: [
    { id: 'dog', emoji: '🐶', label: 'Cachorro' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
  ],
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
    ...overrides,
  }
}

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
    const state: GameState = {
      cards: [
        { id: 0, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 1, animalId: 'cat', isFlipped: true,  isMatched: true  },
        { id: 2, animalId: 'dog', isFlipped: true,  isMatched: false },
        { id: 3, animalId: 'cat', isFlipped: true,  isMatched: true  },
      ],
      flippedIds: [0, 2],
      moves: 1,
      isComplete: false,
    }
    expect(resolvePair(state).isComplete).toBe(true)
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
