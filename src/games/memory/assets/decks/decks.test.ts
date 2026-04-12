import { DECKS } from './decks'

describe('DECKS — integridade de dados', () => {
  it('exporta exatamente 5 decks', () => {
    expect(DECKS).toHaveLength(5)
  })

  it('cada deck tem id único', () => {
    const ids = DECKS.map(d => d.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('cada deck tem name, emoji e items não-vazios', () => {
    for (const deck of DECKS) {
      expect(deck.name).toBeTruthy()
      expect(deck.emoji).toBeTruthy()
      expect(deck.items.length).toBeGreaterThan(0)
    }
  })

  it('cada deck tem exatamente 12 items', () => {
    for (const deck of DECKS) {
      expect(deck.items).toHaveLength(12)
    }
  })

  it('ids dos items são únicos dentro de cada deck', () => {
    for (const deck of DECKS) {
      const itemIds = deck.items.map(item => item.id)
      const uniqueItemIds = new Set(itemIds)
      expect(uniqueItemIds.size).toBe(itemIds.length)
    }
  })

  it('nenhum item tem id vazio', () => {
    for (const deck of DECKS) {
      for (const item of deck.items) {
        expect(item.id).toBeTruthy()
      }
    }
  })

  it('cada item tem emoji e label não-vazios', () => {
    for (const deck of DECKS) {
      for (const item of deck.items) {
        expect(item.emoji).toBeTruthy()
        expect(item.label).toBeTruthy()
      }
    }
  })

  it('ids dos decks são o conjunto estável esperado: animals, fruits, faces, vehicles, foods', () => {
    const ids = DECKS.map(d => d.id)
    expect(ids).toEqual(expect.arrayContaining(['animals', 'fruits', 'faces', 'vehicles', 'foods']))
    expect(ids).toHaveLength(5)
  })

  it('ids não contêm espaços ou caracteres especiais (apenas letras, números, hífens e underscores)', () => {
    const validId = /^[a-zA-Z0-9_-]+$/
    for (const deck of DECKS) {
      expect(deck.id).toMatch(validId)
      for (const item of deck.items) {
        expect(item.id).toMatch(validId)
      }
    }
  })
})
