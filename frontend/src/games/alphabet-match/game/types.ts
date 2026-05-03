export type AlphabetMatchMode = 'letter-to-animal' | 'animal-to-letter'

export type Animal = {
  id: string
  label: string
  imagePath: string
  firstLetter: string
  gender: 'M' | 'F'
}

export type Round = {
  letter: string
  correctAnimal: Animal
  options: Animal[]
  letterOptions: string[]
  attempts: number
  completed: boolean
}

export type GameState = {
  rounds: Round[]
  currentRoundIndex: number
  totalAttempts: number
  isComplete: boolean
}

export type GameConfig = {
  totalRounds: number
  animals: Animal[]
}
