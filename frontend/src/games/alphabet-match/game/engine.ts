import type { Animal, GameConfig, GameState, Round } from './types'

export function buildAvailableLetters(animals: Animal[]): string[] {
  const letters = new Set(animals.map(a => a.firstLetter))
  return [...letters].sort()
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildLetterOptions(correctLetter: string, availableLetters: string[]): string[] {
  if (availableLetters.length < 4) {
    throw new Error('Alphabet Match requires at least 4 distinct letters')
  }

  const distractors = shuffle(availableLetters.filter(letter => letter !== correctLetter)).slice(0, 3)
  return shuffle([correctLetter, ...distractors])
}

export function createGame(config: GameConfig): GameState {
  const { totalRounds, animals } = config
  const available = buildAvailableLetters(animals)
  const selectedLetters = shuffle(available).slice(0, totalRounds)

  const animalsByLetter = new Map<string, Animal[]>()
  for (const animal of animals) {
    const list = animalsByLetter.get(animal.firstLetter) ?? []
    list.push(animal)
    animalsByLetter.set(animal.firstLetter, list)
  }

  const rounds: Round[] = selectedLetters.map(letter => {
    const candidates = animalsByLetter.get(letter)!
    const correctAnimal = candidates[Math.floor(Math.random() * candidates.length)]
    const distractors = shuffle(animals.filter(a => a.firstLetter !== letter)).slice(0, 3)
    const letterOptions = buildLetterOptions(correctAnimal.firstLetter, available)

    return {
      letter,
      correctAnimal,
      options: shuffle([correctAnimal, ...distractors]),
      letterOptions,
      attempts: 0,
      completed: false,
    }
  })

  return { rounds, currentRoundIndex: 0, totalAttempts: 0, isComplete: false }
}

export function checkAnswer(
  state: GameState,
  animalId: string,
): { correct: boolean; selectedAnimal: Animal } {
  const round = state.rounds[state.currentRoundIndex]
  const selectedAnimal = round.options.find(a => a.id === animalId)!
  return { correct: round.correctAnimal.id === animalId, selectedAnimal }
}

export function checkLetterAnswer(
  state: GameState,
  selectedLetter: string,
): { correct: boolean; selectedLetter: string; correctAnimal: Animal } {
  const round = state.rounds[state.currentRoundIndex]
  return {
    correct: round.correctAnimal.firstLetter === selectedLetter,
    selectedLetter,
    correctAnimal: round.correctAnimal,
  }
}

export function recordAttempt(state: GameState): GameState {
  const idx = state.currentRoundIndex
  const rounds = state.rounds.map((r, i) =>
    i === idx ? { ...r, attempts: r.attempts + 1 } : r,
  )
  return { ...state, rounds, totalAttempts: state.totalAttempts + 1 }
}

export function completeRound(state: GameState): GameState {
  const idx = state.currentRoundIndex
  const rounds = state.rounds.map((r, i) =>
    i === idx ? { ...r, completed: true } : r,
  )
  return { ...state, rounds }
}

export function advanceRound(state: GameState): GameState {
  const nextIndex = state.currentRoundIndex + 1
  return { ...state, currentRoundIndex: nextIndex, isComplete: nextIndex >= state.rounds.length }
}
