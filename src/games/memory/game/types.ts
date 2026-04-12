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

export type GameState = {
  cards: Card[]
  flippedIds: number[]
  moves: number
  isComplete: boolean
}

export type GameConfig = {
  deck: Animal[]
}
