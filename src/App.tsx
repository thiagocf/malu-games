import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import type { DeckConfig } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)

  if (showSettings) {
    return (
      <Settings
        pairCount={pairCount}
        onChangePairCount={setPairCount}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  if (!selectedDeck) {
    return (
      <DeckSelector
        decks={DECKS}
        onSelect={setSelectedDeck}
        onOpenSettings={() => setShowSettings(true)}
      />
    )
  }

  return <Game deck={selectedDeck} pairCount={pairCount} onBackToMenu={() => setSelectedDeck(null)} />
}

function Game({ deck, pairCount, onBackToMenu }: { deck: DeckConfig; pairCount: number; onBackToMenu: () => void }) {
  const config = { deck: deck.items, pairCount }
  const { cards, moves, isComplete, flipCard, restart } = useGame(config)

  return (
    <main className="app">
      <GameHeader moves={moves} onAbandon={onBackToMenu} />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && <GameOver moves={moves} onRestart={restart} onBackToMenu={onBackToMenu} />}
    </main>
  )
}
