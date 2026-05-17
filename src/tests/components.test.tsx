import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UndoButton } from '../components/UndoButton'
import { WinnerOverlay } from '../components/WinnerOverlay'
import { initialState } from '../app/state'

describe('components', () => {
  it('shows undo only when active play', () => {
    const dispatch = vi.fn()
    const hidden = initialState('pt')
    const { rerender } = render(<UndoButton state={hidden} dispatch={dispatch} label="Undo" />)
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()

    const visible = { ...hidden, history: [{ red: 0, blue: 0 }], scores: { red: 1, blue: 0 } }
    rerender(<UndoButton state={visible} dispatch={dispatch} label="Undo" />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy()
  })

  it('winner overlay tap forwards selected team', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()

    render(
      <WinnerOverlay
        winner="red"
        red={12}
        blue={8}
        redWinsLabel="RED WINS"
        blueWinsLabel="BLUE WINS"
        onTapTeam={onTap}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Blue tap zone' }))
    expect(onTap).toHaveBeenCalledWith('blue')
  })
})
