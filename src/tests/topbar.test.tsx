import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../components/ResetHoldButton', () => ({
  ResetHoldButton: ({ disabled, cancelSignal, ariaLabel, onComplete }: { disabled: boolean; cancelSignal: string; ariaLabel: string; onComplete: () => void }) => (
    <button
      type="button"
      data-testid="reset-hold"
      data-disabled={String(disabled)}
      data-cancel={cancelSignal}
      aria-label={ariaLabel}
      onClick={onComplete}
    >
      reset
    </button>
  ),
}))

import { TopBar } from '../components/TopBar'
import { initialState } from '../app/state'

describe('TopBar', () => {
  it('dispatches settings toggle and wires hold reset props', () => {
    const dispatch = vi.fn()
    const onHoldReset = vi.fn()
    const state = { ...initialState('pt'), scores: { red: 1, blue: 2 }, settingsOpen: true }

    render(
      <TopBar
        state={state}
        dispatch={dispatch}
        setToText="SET TO 12"
        settingsLabel="Settings"
        resetLabel="Reset"
        onHoldReset={onHoldReset}
      />,
    )

    expect(screen.getByText('SET TO 12')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_SETTINGS' })

    const reset = screen.getByTestId('reset-hold')
    expect(reset.getAttribute('data-disabled')).toBe('false')
    expect(reset.getAttribute('data-cancel')).toBe('1-2-true-false-false')

    fireEvent.click(reset)
    expect(onHoldReset).toHaveBeenCalled()
  })

  it('disables hold reset in deadlock or winner overlay', () => {
    const dispatch = vi.fn()
    const onHoldReset = vi.fn()
    const base = initialState('pt')

    const { rerender } = render(
      <TopBar
        state={{ ...base, deadlock: true }}
        dispatch={dispatch}
        setToText="SET TO 12"
        settingsLabel="Settings"
        resetLabel="Reset"
        onHoldReset={onHoldReset}
      />,
    )

    expect(screen.getByTestId('reset-hold').getAttribute('data-disabled')).toBe('true')

    rerender(
      <TopBar
        state={{ ...base, winnerOverlayVisible: true }}
        dispatch={dispatch}
        setToText="SET TO 12"
        settingsLabel="Settings"
        resetLabel="Reset"
        onHoldReset={onHoldReset}
      />,
    )

    expect(screen.getByTestId('reset-hold').getAttribute('data-disabled')).toBe('true')
  })
})
