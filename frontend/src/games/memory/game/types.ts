export type Animal = {
  id: string
  emoji: string
  label: string
}

export type Card = {
  id: number
  animalId: string
  isFlipped: boolean
  isMatched: boolean
}

export type Player = {
  name: string
  pairsFound: number
}

export type PlayerMode = 'solo' | 'duo'

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
  players: Player[]
  currentPlayerIndex: number
}

export type GameConfig = {
  deck: Animal[]
  pairCount: number
  players: string[]
}

export type DeckConfig = {
  id: string
  name: string
  emoji: string
  items: Animal[]
}
