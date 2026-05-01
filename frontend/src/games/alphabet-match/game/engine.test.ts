import { describe, it, expect } from 'vitest'
import {
  buildAvailableLetters,
  createGame,
  checkAnswer,
  checkLetterAnswer,
  recordAttempt,
  completeRound,
  advanceRound,
} from './engine'
import type { Animal, GameConfig, GameState, Round } from './types'

const makeAnimal = (id: string, label: string, firstLetter: string): Animal => ({
  id,
  label,
  imagePath: `/fake/${id}.jpeg`,
  firstLetter,
  gender: 'M',
})

const sampleAnimals: Animal[] = [
  makeAnimal('abelha', 'Abelha', 'A'),
  makeAnimal('aguia', 'Águia', 'A'),
  makeAnimal('baleia', 'Baleia', 'B'),
  makeAnimal('cachorro', 'Cachorro', 'C'),
  makeAnimal('elefante', 'Elefante', 'E'),
]

const fullCatalog: Animal[] = [
  makeAnimal('abelha', 'Abelha', 'A'),
  makeAnimal('aguia', 'Águia', 'A'),
  makeAnimal('alce', 'Alce', 'A'),
  makeAnimal('baleia', 'Baleia', 'B'),
  makeAnimal('burro', 'Burro', 'B'),
  makeAnimal('cachorro', 'Cachorro', 'C'),
  makeAnimal('cavalo', 'Cavalo', 'C'),
  makeAnimal('dinossauro', 'Dinossauro', 'D'),
  makeAnimal('elefante', 'Elefante', 'E'),
  makeAnimal('esquilo', 'Esquilo', 'E'),
  makeAnimal('flamingo', 'Flamingo', 'F'),
  makeAnimal('gato', 'Gato', 'G'),
  makeAnimal('hipopotamo', 'Hipopótamo', 'H'),
  makeAnimal('iguana', 'Iguana', 'I'),
  makeAnimal('jacare', 'Jacaré', 'J'),
  makeAnimal('leao', 'Leão', 'L'),
  makeAnimal('macaco', 'Macaco', 'M'),
  makeAnimal('onca', 'Onça', 'O'),
  makeAnimal('pato', 'Pato', 'P'),
  makeAnimal('raposa', 'Raposa', 'R'),
  makeAnimal('sapo', 'Sapo', 'S'),
]

const fullConfig: GameConfig = { totalRounds: 5, animals: fullCatalog }

function makeRound(overrides?: Partial<Round>): Round {
  return {
    letter: 'E',
    correctAnimal: makeAnimal('elefante', 'Elefante', 'E'),
    options: [
      makeAnimal('elefante', 'Elefante', 'E'),
      makeAnimal('gato', 'Gato', 'G'),
      makeAnimal('baleia', 'Baleia', 'B'),
      makeAnimal('raposa', 'Raposa', 'R'),
    ],
    letterOptions: ['E', 'G', 'B', 'R'],
    attempts: 0,
    completed: false,
    ...overrides,
  }
}

function makeGameState(overrides?: Partial<GameState>): GameState {
  return {
    rounds: [
      makeRound(),
      makeRound({ letter: 'G', correctAnimal: makeAnimal('gato', 'Gato', 'G') }),
      makeRound({ letter: 'B', correctAnimal: makeAnimal('baleia', 'Baleia', 'B') }),
    ],
    currentRoundIndex: 0,
    totalAttempts: 0,
    isComplete: false,
    ...overrides,
  }
}

describe('buildAvailableLetters', () => {
  it('returns distinct letters from the animal catalog', () => {
    const letters = buildAvailableLetters(sampleAnimals)
    expect(letters).toEqual(['A', 'B', 'C', 'E'])
  })

  it('returns empty array for empty catalog', () => {
    expect(buildAvailableLetters([])).toEqual([])
  })

  it('returns one letter when all animals share the same letter', () => {
    const animals = [makeAnimal('abelha', 'Abelha', 'A'), makeAnimal('aguia', 'Águia', 'A')]
    expect(buildAvailableLetters(animals)).toEqual(['A'])
  })
})

describe('createGame', () => {
  it('creates the correct number of rounds', () => {
    expect(createGame(fullConfig).rounds).toHaveLength(5)
  })

  it('each round has exactly 4 options', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.options).toHaveLength(4)
    })
  })

  it('each round has a correct animal whose firstLetter matches the round letter', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.correctAnimal.firstLetter).toBe(round.letter)
    })
  })

  it('the correct animal is included in the options', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.options.map(o => o.id)).toContain(round.correctAnimal.id)
    })
  })

  it('distractor animals have different first letters than the round letter', () => {
    createGame(fullConfig).rounds.forEach(round => {
      round.options
        .filter(o => o.id !== round.correctAnimal.id)
        .forEach(d => expect(d.firstLetter).not.toBe(round.letter))
    })
  })

  it('all round letters are distinct', () => {
    const letters = createGame(fullConfig).rounds.map(r => r.letter)
    expect(new Set(letters).size).toBe(letters.length)
  })

  it('starts with currentRoundIndex 0, totalAttempts 0, isComplete false', () => {
    const state = createGame(fullConfig)
    expect(state.currentRoundIndex).toBe(0)
    expect(state.totalAttempts).toBe(0)
    expect(state.isComplete).toBe(false)
  })

  it('each round starts with attempts 0 and completed false', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.attempts).toBe(0)
      expect(round.completed).toBe(false)
    })
  })

  it('each round has exactly 4 letter options', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.letterOptions).toHaveLength(4)
    })
  })

  it('letter options include the correct letter', () => {
    createGame(fullConfig).rounds.forEach(round => {
      expect(round.letterOptions).toContain(round.correctAnimal.firstLetter)
    })
  })

  it('letter options use distinct available catalog letters', () => {
    const availableLetters = buildAvailableLetters(fullCatalog)

    createGame(fullConfig).rounds.forEach(round => {
      expect(new Set(round.letterOptions).size).toBe(round.letterOptions.length)
      round.letterOptions.forEach(letter => {
        expect(availableLetters).toContain(letter)
      })
    })
  })

  it('letter distractors exclude the correct letter', () => {
    createGame(fullConfig).rounds.forEach(round => {
      const distractors = round.letterOptions.filter(letter => letter !== round.correctAnimal.firstLetter)
      expect(distractors).toHaveLength(3)
    })
  })
})

describe('checkAnswer', () => {
  it('returns correct: true when the selected animal is the correct one', () => {
    const result = checkAnswer(makeGameState(), 'elefante')
    expect(result.correct).toBe(true)
    expect(result.selectedAnimal.id).toBe('elefante')
  })

  it('returns correct: false when the selected animal is wrong', () => {
    const result = checkAnswer(makeGameState(), 'gato')
    expect(result.correct).toBe(false)
    expect(result.selectedAnimal.id).toBe('gato')
  })
})

describe('checkLetterAnswer', () => {
  it('returns correct: true when the selected letter is the correct one', () => {
    const result = checkLetterAnswer(makeGameState(), 'E')

    expect(result.correct).toBe(true)
    expect(result.selectedLetter).toBe('E')
    expect(result.correctAnimal.id).toBe('elefante')
  })

  it('returns correct: false when the selected letter is wrong', () => {
    const result = checkLetterAnswer(makeGameState(), 'B')

    expect(result.correct).toBe(false)
    expect(result.selectedLetter).toBe('B')
    expect(result.correctAnimal.id).toBe('elefante')
  })
})

describe('recordAttempt', () => {
  it('increments attempts on the current round', () => {
    expect(recordAttempt(makeGameState()).rounds[0].attempts).toBe(1)
  })

  it('increments totalAttempts', () => {
    expect(recordAttempt(makeGameState()).totalAttempts).toBe(1)
  })

  it('does not modify other rounds', () => {
    const next = recordAttempt(makeGameState())
    expect(next.rounds[1].attempts).toBe(0)
    expect(next.rounds[2].attempts).toBe(0)
  })
})

describe('completeRound', () => {
  it('marks the current round as completed', () => {
    expect(completeRound(makeGameState()).rounds[0].completed).toBe(true)
  })

  it('does not modify other rounds', () => {
    expect(completeRound(makeGameState()).rounds[1].completed).toBe(false)
  })
})

describe('advanceRound', () => {
  it('advances currentRoundIndex by 1', () => {
    expect(advanceRound(completeRound(makeGameState())).currentRoundIndex).toBe(1)
  })

  it('sets isComplete to true when advancing past the last round', () => {
    expect(advanceRound(completeRound(makeGameState({ currentRoundIndex: 2 }))).isComplete).toBe(true)
  })

  it('does not set isComplete when there are more rounds', () => {
    expect(advanceRound(completeRound(makeGameState({ currentRoundIndex: 0 }))).isComplete).toBe(false)
  })
})
