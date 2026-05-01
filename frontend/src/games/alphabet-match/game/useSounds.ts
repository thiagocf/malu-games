import { useCallback, useRef } from 'react'

function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx = (window.AudioContext ?? (window as unknown as Record<string, typeof AudioContext>)['webkitAudioContext'])
  return new AudioCtx()
}

function playTone(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gain = 0.18) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gainNode.gain.setValueAtTime(gain, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'

  const doSpeak = () => {
    const voices = synth.getVoices()
    const ptBR = voices.find(v => v.lang === 'pt-BR') ?? voices.find(v => v.lang.startsWith('pt'))
    if (ptBR) utterance.voice = ptBR
    synth.speak(utterance)
  }

  if (synth.getVoices().length === 0) {
    synth.addEventListener('voiceschanged', doSpeak, { once: true })
  } else {
    doSpeak()
  }
}

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    const ctx = ctxRef.current
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
    return ctx
  }, [])

  const playCorrect = useCallback(() => {
    getCtx().then(ctx => {
      if (!ctx) return
      playTone(ctx, 523, 'sine', 0.2, 0.2)
      setTimeout(() => playTone(ctx, 659, 'sine', 0.2, 0.22), 100)
      setTimeout(() => playTone(ctx, 784, 'sine', 0.3, 0.24), 200)
    })
  }, [getCtx])

  const playWrong = useCallback(() => {
    getCtx().then(ctx => {
      if (!ctx) return
      playTone(ctx, 330, 'sine', 0.25, 0.12)
    })
  }, [getCtx])

  const playVictory = useCallback(() => {
    getCtx().then(ctx => {
      if (!ctx) return
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(ctx, freq, 'sine', 0.35, 0.25), i * 120)
      })
    })
  }, [getCtx])

  const speakAnimalName = useCallback((label: string, letter?: string) => {
    speak(letter ? `Isso mesmo! ${label}, com a letra ${letter}!` : label)
  }, [])

  const speakAnimalError = useCallback((label: string, gender: 'M' | 'F') => {
    const prefix = gender === 'F' ? 'Essa é a' : 'Esse é o'
    speak(`${prefix} ${label}!`)
  }, [])

  const speakRoundIntro = useCallback((letter: string) => {
    speak(`Qual animal começa com a letra ${letter}?`)
  }, [])

  const speakLetter = useCallback((letter: string) => {
    speak(`Letra ${letter}`)
  }, [])

  return { playCorrect, playWrong, playVictory, speakAnimalName, speakAnimalError, speakRoundIntro, speakLetter }
}
