import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGame } from './useGame'
import { DECKS } from '../assets/decks/decks'

vi.mock('./useSounds', () => ({
  useSounds: () => ({
    playFlip: vi.fn(),
    playMatch: vi.fn(),
    playWin: vi.fn(),
  }),
}))

const testConfig = { deck: DECKS[0].items, pairCount: 2 }

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns card ids grouped by animalId — first pair with 2 cards is a matching pair */
function findMatchingPair(cards: ReturnType<typeof useGame>['cards']): [number, number] {
  const byAnimal = new Map<string, number[]>()
  for (const card of cards) {
    const list = byAnimal.get(card.animalId) ?? []
    list.push(card.id)
    byAnimal.set(card.animalId, list)
  }
  for (const ids of byAnimal.values()) {
    if (ids.length === 2) return [ids[0], ids[1]]
  }
  throw new Error('No matching pair found')
}

/** Returns two card ids that belong to different animals */
function findNonMatchingPair(cards: ReturnType<typeof useGame>['cards']): [number, number] {
  const byAnimal = new Map<string, number[]>()
  for (const card of cards) {
    const list = byAnimal.get(card.animalId) ?? []
    list.push(card.id)
    byAnimal.set(card.animalId, list)
  }
  const keys = [...byAnimal.keys()]
  if (keys.length < 2) throw new Error('Need at least 2 different animals')
  const first = byAnimal.get(keys[0])![0]
  const second = byAnimal.get(keys[1])![0]
  return [first, second]
}

// ─── inicialização ────────────────────────────────────────────────────────────

describe('useGame — inicialização', () => {
  it('cria 2 * pairCount cards', () => {
    const { result } = renderHook(() => useGame(testConfig))
    expect(result.current.cards).toHaveLength(testConfig.pairCount * 2)
  })

  it('moves começa em 0', () => {
    const { result } = renderHook(() => useGame(testConfig))
    expect(result.current.moves).toBe(0)
  })

  it('isComplete começa false', () => {
    const { result } = renderHook(() => useGame(testConfig))
    expect(result.current.isComplete).toBe(false)
  })
})

// ─── CONTRACT: delay de 1000ms antes de resolver o par ───────────────────────

describe('CONTRACT: delay de 1000ms antes de resolver o par', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('estado não muda antes de 999ms elapsar', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => {
      result.current.flipCard(id1)
    })
    await act(async () => {
      result.current.flipCard(id2)
    })

    // moves should still be 0 before 1000ms
    expect(result.current.moves).toBe(0)

    await act(async () => {
      vi.advanceTimersByTime(999)
    })

    expect(result.current.moves).toBe(0)
  })

  it('estado muda após 1000ms (vi.advanceTimersByTime)', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => {
      result.current.flipCard(id1)
    })
    await act(async () => {
      result.current.flipCard(id2)
    })

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.moves).toBe(1)
  })

  it('timer é cancelado se o hook desmonta antes de 1000ms', async () => {
    const { result, unmount } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => {
      result.current.flipCard(id1)
    })
    await act(async () => {
      result.current.flipCard(id2)
    })

    // unmount before timer fires
    unmount()

    // advance past 1000ms — should not throw or update state
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    // moves stayed 0 because the component was unmounted before resolve
    expect(result.current.moves).toBe(0)
  })
})

// ─── CONTRACT: moves incrementa exatamente +1 por resolvePair ────────────────

describe('CONTRACT: moves incrementa exatamente +1 por resolvePair', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('moves vai de 0 para 1 após primeiro par', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.moves).toBe(1)
  })

  it('moves vai de N para N+1 em cada resolução', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [matchId1, matchId2] = findMatchingPair(result.current.cards)
    const [noMatchId1, noMatchId2] = findNonMatchingPair(result.current.cards)

    // first resolution: non-matching pair
    await act(async () => { result.current.flipCard(noMatchId1) })
    await act(async () => { result.current.flipCard(noMatchId2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.moves).toBe(1)

    // second resolution: matching pair
    await act(async () => { result.current.flipCard(matchId1) })
    await act(async () => { result.current.flipCard(matchId2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.moves).toBe(2)
  })
})

// ─── CONTRACT: flippedIds é limpo após resolução ──────────────────────────────

describe('CONTRACT: flippedIds é limpo após resolução', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flippedIds está vazio após par encontrado (cards isMatched=true)', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    // observable proxy: both cards are matched (flippedIds was cleared internally)
    const card1 = result.current.cards.find(c => c.id === id1)!
    const card2 = result.current.cards.find(c => c.id === id2)!
    expect(card1.isMatched).toBe(true)
    expect(card2.isMatched).toBe(true)
    // and they remain flipped
    expect(card1.isFlipped).toBe(true)
    expect(card2.isFlipped).toBe(true)
  })

  it('flippedIds está vazio após par não encontrado (cards voltam a isFlipped=false)', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findNonMatchingPair(result.current.cards)

    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    // observable proxy: both cards are unflipped (flippedIds was cleared internally)
    const card1 = result.current.cards.find(c => c.id === id1)!
    const card2 = result.current.cards.find(c => c.id === id2)!
    expect(card1.isFlipped).toBe(false)
    expect(card2.isFlipped).toBe(false)
    expect(card1.isMatched).toBe(false)
    expect(card2.isMatched).toBe(false)
  })
})

// ─── guarda de clique ─────────────────────────────────────────────────────────

describe('useGame — guarda de clique', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clicar 3ª carta enquanto 2 estão viradas é no-op', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findNonMatchingPair(result.current.cards)
    // find a third card that is neither id1 nor id2
    const thirdCard = result.current.cards.find(c => c.id !== id1 && c.id !== id2)!

    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })

    // both are flipped, now try a third
    await act(async () => { result.current.flipCard(thirdCard.id) })

    // third card should still be unflipped
    const third = result.current.cards.find(c => c.id === thirdCard.id)!
    expect(third.isFlipped).toBe(false)
  })

  it('clicar carta já virada é no-op', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const firstCard = result.current.cards[0]

    await act(async () => { result.current.flipCard(firstCard.id) })

    const cardAfterFirstFlip = result.current.cards.find(c => c.id === firstCard.id)!
    expect(cardAfterFirstFlip.isFlipped).toBe(true)

    // flip same card again — no-op
    await act(async () => { result.current.flipCard(firstCard.id) })

    const cardAfterSecondFlip = result.current.cards.find(c => c.id === firstCard.id)!
    expect(cardAfterSecondFlip.isFlipped).toBe(true)
    // moves still 0, only 1 card flipped, nothing resolved
    expect(result.current.moves).toBe(0)
  })

  it('clicar carta já matched é no-op', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    // match the pair
    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.moves).toBe(1)

    // try clicking a matched card — should be ignored
    await act(async () => { result.current.flipCard(id1) })

    // moves stays at 1, no extra resolution triggered
    expect(result.current.moves).toBe(1)
    const matched = result.current.cards.find(c => c.id === id1)!
    expect(matched.isMatched).toBe(true)
  })
})

// ─── restart ──────────────────────────────────────────────────────────────────

describe('useGame — restart', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reset moves para 0', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const [id1, id2] = findMatchingPair(result.current.cards)

    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.moves).toBe(1)

    await act(async () => { result.current.restart() })

    expect(result.current.moves).toBe(0)
  })

  it('reset isComplete para false', async () => {
    const { result } = renderHook(() => useGame(testConfig))

    // complete the game (pairCount=2, so 2 pairs)
    const cards1 = result.current.cards
    const [m1a, m1b] = findMatchingPair(cards1)
    await act(async () => { result.current.flipCard(m1a) })
    await act(async () => { result.current.flipCard(m1b) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    // find remaining unmatched matching pair
    const remaining = result.current.cards.filter(c => !c.isMatched)
    const [m2a, m2b] = findMatchingPair(remaining)
    await act(async () => { result.current.flipCard(m2a) })
    await act(async () => { result.current.flipCard(m2b) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    expect(result.current.isComplete).toBe(true)

    await act(async () => { result.current.restart() })

    expect(result.current.isComplete).toBe(false)
  })

  it('novo deck tem o mesmo tamanho que o original', async () => {
    const { result } = renderHook(() => useGame(testConfig))
    const originalSize = result.current.cards.length

    const [id1, id2] = findMatchingPair(result.current.cards)
    await act(async () => { result.current.flipCard(id1) })
    await act(async () => { result.current.flipCard(id2) })
    await act(async () => { vi.advanceTimersByTime(1000) })

    await act(async () => { result.current.restart() })

    expect(result.current.cards).toHaveLength(originalSize)
    expect(result.current.cards.every(c => !c.isFlipped && !c.isMatched)).toBe(true)
  })
})
