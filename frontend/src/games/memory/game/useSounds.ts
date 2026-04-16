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

export function useSounds() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    return ctxRef.current
  }, [])

  const playFlip = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 440, 'sine', 0.12)
  }, [getCtx])

  const playMatch = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    playTone(ctx, 523, 'sine', 0.2, 0.2)
    setTimeout(() => playTone(ctx, 659, 'sine', 0.3, 0.22), 130)
  }, [getCtx])

  const playWin = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(ctx, freq, 'sine', 0.35, 0.25), i * 100)
    })
  }, [getCtx])

  return { playFlip, playMatch, playWin }
}
