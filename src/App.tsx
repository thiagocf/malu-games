import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { ANIMALS } from './games/memory/assets/animals/animals'
import './App.css'

const config = { deck: ANIMALS }

export function App() {
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onRestart={restart} />
      <Board cards={cards} animals={ANIMALS} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} />}
    </main>
  )
}
