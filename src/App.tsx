import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { DECKS } from './games/memory/assets/decks/decks'
import type { DeckConfig } from './games/memory/game/types'
import './App.css'

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)

  if (!selectedDeck) {
    return <DeckSelector decks={DECKS} onSelect={setSelectedDeck} />
  }

  return <Game deck={selectedDeck} onBackToMenu={() => setSelectedDeck(null)} />
}

function Game({ deck, onBackToMenu }: { deck: DeckConfig; onBackToMenu: () => void }) {
  const config = { deck: deck.items }
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onRestart={restart} />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} onBackToMenu={onBackToMenu} />}
    </main>
  )
}
