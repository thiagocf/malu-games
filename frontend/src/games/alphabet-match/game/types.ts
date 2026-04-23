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
