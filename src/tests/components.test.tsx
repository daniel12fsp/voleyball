import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UndoButton } from '../components/UndoButton'
import { WinnerOverlay } from '../components/WinnerOverlay'
import { initialState } from '../app/state'

describe('components', () => {
  it('shows undo only when active play and dispatches undo click', async () => {
    const user = userEvent.setup()
    const dispatch = vi.fn()
    const hidden = initialState('pt')
    const { rerender } = render(<UndoButton state={hidden} dispatch={dispatch} label="Undo" />)
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()

    const visible = { ...hidden, history: [{ red: 0, blue: 0 }], scores: { red: 1, blue: 0 } }
    rerender(<UndoButton state={visible} dispatch={dispatch} label="Undo" />)
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNDO' })
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
