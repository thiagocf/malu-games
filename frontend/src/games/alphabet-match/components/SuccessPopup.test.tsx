import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuccessPopup } from './SuccessPopup'
import type { Animal } from '../game/types'

const animal: Animal = {
  id: 'elefante',
  label: 'Elefante',
  imagePath: '/fake/elefante.jpeg',
  firstLetter: 'E',
}

describe('SuccessPopup', () => {
  it('renderiza a imagem do animal correto', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    expect(screen.getByAltText('Elefante')).toBeInTheDocument()
  })

  it('exibe a letra destacada no texto', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    const spans = screen.getAllByText('E', { selector: 'span' })
    expect(spans.length).toBe(2)
  })

  it('chama onMount ao montar', () => {
    const onMount = vi.fn()
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={onMount} />)
    expect(onMount).toHaveBeenCalledTimes(1)
  })

  it('chama onNext ao clicar no botão Próximo', () => {
    const onNext = vi.fn()
    render(<SuccessPopup animal={animal} letter="E" onNext={onNext} onMount={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('impede drag nativo na imagem', () => {
    render(<SuccessPopup animal={animal} letter="E" onNext={() => {}} onMount={() => {}} />)
    expect(screen.getByAltText('Elefante')).toHaveAttribute('draggable', 'false')
  })
})
