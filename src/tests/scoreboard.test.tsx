import { fireEvent, render, screen } from '@testing-library/react'
import { ScoreBoard } from '../components/ScoreBoard'
import { initialState } from '../app/state'

describe('ScoreBoard', () => {
  it('dispatches score taps for both sides', () => {
    const dispatch = vi.fn()
    const state = initialState('pt')

    render(<ScoreBoard state={state} dispatch={dispatch} tx={{ setPoint: 'SET POINT' }} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Red side' }))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Blue side' }))

    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'SCORE_TAP', team: 'red' })
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: 'SCORE_TAP', team: 'blue' })
  })

  it('shows set-point labels only when legal next-point win', () => {
    const dispatch = vi.fn()
    const base = initialState('pt')

    const { rerender } = render(
      <ScoreBoard state={{ ...base, target: 12, scores: { red: 11, blue: 10 } }} dispatch={dispatch} tx={{ setPoint: 'SET POINT' }} />,
    )
    expect(screen.getByText('SET POINT')).toBeTruthy()

    rerender(
      <ScoreBoard
        state={{ ...base, target: 12, scores: { red: 10, blue: 11 }, winner: null, deadlock: false, invalidTargetLock: false }}
        dispatch={dispatch}
        tx={{ setPoint: 'SET POINT' }}
      />,
    )
    expect(screen.getByText('SET POINT')).toBeTruthy()

    rerender(
      <ScoreBoard
        state={{ ...base, target: 12, scores: { red: 11, blue: 10 }, winner: 'red' }}
        dispatch={dispatch}
        tx={{ setPoint: 'SET POINT' }}
      />,
    )
    expect(screen.queryByText('SET POINT')).toBeNull()
  })
})
