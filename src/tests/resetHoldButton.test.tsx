import { fireEvent, render, screen } from '@testing-library/react'
import { ResetHoldButton } from '../components/ResetHoldButton'

describe('ResetHoldButton', () => {
  it('returns null when disabled', () => {
    const view = render(<ResetHoldButton disabled cancelSignal="a" ariaLabel="Reset" onComplete={vi.fn()} />)
    expect(view.container.firstChild).toBeNull()
  })

  it('completes hold after duration', () => {
    const onComplete = vi.fn()
    let tick: FrameRequestCallback | null = null
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      tick = cb
      return 1
    })
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)

    render(<ResetHoldButton disabled={false} cancelSignal="a" ariaLabel="Reset" onComplete={onComplete} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Reset' }))
    expect(tick).not.toBeNull()
    tick!(3000)
    expect(onComplete).toHaveBeenCalledTimes(1)

    now.mockRestore()
    raf.mockRestore()
  })

  it('cancels active hold on pointer end and cancelSignal changes', () => {
    const onComplete = vi.fn()
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 7)
    const caf = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { rerender } = render(<ResetHoldButton disabled={false} cancelSignal="a" ariaLabel="Reset" onComplete={onComplete} />)
    const button = screen.getByRole('button', { name: 'Reset' })

    fireEvent.pointerDown(button)
    fireEvent.pointerUp(button)
    expect(caf).toHaveBeenCalledWith(7)

    fireEvent.pointerDown(button)
    fireEvent.pointerLeave(button)
    expect(caf).toHaveBeenCalledTimes(2)

    fireEvent.pointerDown(button)
    fireEvent.pointerCancel(button)
    expect(caf).toHaveBeenCalledTimes(3)

    fireEvent.pointerDown(button)
    rerender(<ResetHoldButton disabled={false} cancelSignal="b" ariaLabel="Reset" onComplete={onComplete} />)
    expect(caf).toHaveBeenCalledTimes(4)
    expect(onComplete).not.toHaveBeenCalled()

    raf.mockRestore()
    caf.mockRestore()
  })
})
