import { act, fireEvent, render, screen } from '@testing-library/react'
import { UndoButton } from '../components/UndoButton'
import { WinnerOverlay } from '../components/WinnerOverlay'
import { initialState } from '../app/state'

describe('components', () => {
  it('shows undo only when active play and dispatches undo via hold', () => {
    const dispatch = vi.fn()
    const hidden = initialState('pt')
    const { rerender } = render(<UndoButton state={hidden} dispatch={dispatch} label="Undo" holdLabel="HOLD" />)
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()

    let tick: FrameRequestCallback | null = null
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      tick = cb
      return 1
    })
    const now = vi.spyOn(performance, 'now').mockReturnValue(0)

    const visible = { ...hidden, history: [{ red: 0, blue: 0 }], scores: { red: 1, blue: 0 } }
    rerender(<UndoButton state={visible} dispatch={dispatch} label="Undo" holdLabel="HOLD" />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Undo' }), { pointerId: 1, clientX: 10, clientY: 10 })
    expect(tick).not.toBeNull()

    act(() => {
      tick!(700)
    })
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNDO' })

    now.mockRestore()
    raf.mockRestore()
  })

  it('winner overlay tap forwards selected team and renders winner-first score', () => {
    const onTap = vi.fn()

    const { rerender } = render(
      <WinnerOverlay
        winner="red"
        red={12}
        blue={8}
        redWinsLabel="RED WINS"
        blueWinsLabel="BLUE WINS"
        onTapTeam={onTap}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Blue tap zone' }))
    expect(onTap).toHaveBeenCalledWith('blue')
    expect(screen.getByText('RED WINS')).toBeTruthy()
    expect(screen.getByText('12 – 8')).toBeTruthy()

    rerender(
      <WinnerOverlay
        winner="blue"
        red={7}
        blue={12}
        redWinsLabel="RED WINS"
        blueWinsLabel="BLUE WINS"
        onTapTeam={onTap}
      />,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Red tap zone' }))
    expect(onTap).toHaveBeenCalledWith('red')
    expect(screen.getByText('BLUE WINS')).toBeTruthy()
    expect(screen.getByText('12 – 7')).toBeTruthy()
  })
})
