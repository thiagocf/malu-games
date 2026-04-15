import { useState } from 'react'
import { useGame } from './games/memory/game/useGame'
import { Board } from './games/memory/components/Board'
import { GameHeader } from './games/memory/components/GameHeader'
import { GameOver } from './games/memory/components/GameOver'
import { DeckSelector } from './games/memory/components/DeckSelector'
import { Settings } from './games/memory/components/Settings'
import { DECKS } from './games/memory/assets/decks/decks'
import { LoginButton } from './auth/LoginButton'
import type { DeckConfig, PlayerMode } from './games/memory/game/types'
import './App.css'

const DEFAULT_PAIR_COUNT = 8
const DEFAULT_PLAYER_NAMES = ['Jogador 1', 'Jogador 2']

export function App() {
  const [selectedDeck, setSelectedDeck] = useState<DeckConfig | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [pairCount, setPairCount] = useState(DEFAULT_PAIR_COUNT)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('solo')
  const [playerNames, setPlayerNames] = useState<string[]>(DEFAULT_PLAYER_NAMES)

  return (
    <>
      <LoginButton />
      {showSettings ? (
        <Settings
          pairCount={pairCount}
          onChangePairCount={setPairCount}
          playerMode={playerMode}
          playerNames={playerNames}
          onChangePlayerMode={setPlayerMode}
          onChangePlayerNames={setPlayerNames}
          onBack={() => setShowSettings(false)}
        />
      ) : !selectedDeck ? (
        <DeckSelector
          decks={DECKS}
          onSelect={setSelectedDeck}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <Game
          deck={selectedDeck}
          pairCount={pairCount}
          players={playerMode === 'duo' ? playerNames : [playerNames[0]]}
          onBackToMenu={() => setSelectedDeck(null)}
        />
      )}
    </>
  )
}

function Game({
  deck,
  pairCount,
  players,
  onBackToMenu,
}: {
  deck: DeckConfig
  pairCount: number
  players: string[]
  onBackToMenu: () => void
}) {
  const config = { deck: deck.items, pairCount, players }
  const {
    cards,
    moves,
    isComplete,
    players: playerState,
    currentPlayerIndex,
    flipCard,
    restart,
  } = useGame(config)

  return (
    <main className="app">
      <GameHeader
        moves={moves}
        players={playerState}
        currentPlayerIndex={currentPlayerIndex}
        onAbandon={onBackToMenu}
      />
      <Board cards={cards} animals={deck.items} onFlip={flipCard} />
      {isComplete && (
        <GameOver
          moves={moves}
          players={playerState}
          onRestart={restart}
          onBackToMenu={onBackToMenu}
        />
      )}
    </main>
  )
}
