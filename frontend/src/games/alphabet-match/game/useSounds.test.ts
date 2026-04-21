import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSounds } from './useSounds'

const mockSpeak = vi.fn()
const mockCancel = vi.fn()

beforeEach(() => {
  mockSpeak.mockClear()
  mockCancel.mockClear()

  // Mock SpeechSynthesisUtterance
  global.SpeechSynthesisUtterance = class {
    text: string = ''
    lang: string = ''

    constructor(text: string) {
      this.text = text
    }
  } as any

  vi.stubGlobal('speechSynthesis', { speak: mockSpeak, cancel: mockCancel })
})

describe('useSounds — speakAnimalName', () => {
  it('cancela fala anterior e fala só o label quando letter não é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Abelha') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Abelha')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('fala a frase de sucesso quando letter é fornecida', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalName('Elefante', 'E') })

    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Isso mesmo! Elefante, com a letra E!')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakAnimalName('Abelha') })
    }).not.toThrow()
  })
})

describe('useSounds — speakAnimalError', () => {
  it('fala a frase de erro com o nome do animal', () => {
    const { result } = renderHook(() => useSounds())
    act(() => { result.current.speakAnimalError('Borboleta') })

    expect(mockCancel).toHaveBeenCalledTimes(1)
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Esse é o Borboleta!')
    expect(utterance.lang).toBe('pt-BR')
  })

  it('não lança erro quando speechSynthesis não está disponível', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSounds())
    expect(() => {
      act(() => { result.current.speakAnimalError('Borboleta') })
    }).not.toThrow()
  })
})
