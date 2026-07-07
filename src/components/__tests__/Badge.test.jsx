/**
 * Smoke tests for the Badge UI component.
 * Verifies rendering, default variant, and custom variant class application.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../ui/Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Slow</Badge>)
    expect(screen.getByText('Slow')).toBeInTheDocument()
  })

  it('applies default variant classes when no variant is specified', () => {
    const { container } = render(<Badge>Default</Badge>)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-slate-300')
    expect(span.className).toContain('bg-slate-700')
  })

  it('applies solar variant classes', () => {
    const { container } = render(<Badge variant="solar">Solar</Badge>)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-amber-400')
  })

  it('applies danger variant classes', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-red-400')
  })

  it('falls back to default for an unknown variant', () => {
    const { container } = render(<Badge variant="nonexistent">Unknown</Badge>)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-slate-300')
  })

  it('merges custom className prop', () => {
    const { container } = render(<Badge className="my-custom-class">X</Badge>)
    const span = container.querySelector('span')
    expect(span.className).toContain('my-custom-class')
  })
})
