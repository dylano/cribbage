import React from 'react';
import { useMemo } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

const SCORE_LIMITS = {
  MIN: 0,
  MAX: 121,
}

const TALLY = {
  FIFTEEN: { label: '15', value: 2 },
  PAIR: { label: 'Pair', value: 2 },
  RUN3: { label: 'R3', value: 3 },
  RUN4: { label: 'R4', value: 4 },
  RUN5: { label: 'R5', value: 5 },
  FLUSH4: { label: 'F4', value: 4 },
  FLUSH5: { label: 'F5', value: 5 },
  GO: { label: 'Go', value: 1 },
  NIBS: { label: 'Nibs', value: 2 },
  NOBS: { label: 'Nobs', value: 1 },
};

const Winner = ({ winner, resetGame }) => (
  winner ?
    <div className="scoreboard">
      <span>{`Player ${winner} wins!`}</span>
      <button onClick={resetGame}>Play again</button>
    </div>
    : null
)

const Scoreboard = ({ score, children }) => {
  return (
    <div>
      {children}
    </div>
  );
}

const Player = ({ playerNumber, currentScore, opponentScore, updateScore, inverted }) => {
  const [turn, setTurn] = useImmer({});
  const turnScore = useMemo(() => {
    const total = Object.values(turn).reduce(function (total, tally) {
      const { value, quantity } = tally;
      return total + value * quantity;
    }, 0);

    return total;
  }, [turn]);

  const resetTurn = () => {
    setTurn(draft => ({}));
  }

  const buildTurn = (tallyType) => {
    setTurn(draft => {
      draft[tallyType.label] = { value: tallyType.value, quantity: draft[tallyType.label]?.quantity + 1 || 1 };
    });
  }

  const submitTurn = () => {
    updateScore(playerNumber, turnScore);
    resetTurn();
  }

  return (
    <div className={inverted ? 'inverted' : ''}>
      <h2>Player {playerNumber}</h2>
      <div>
        <div>Score: {currentScore} - {opponentScore} </div>
        <div>
          <span>Adjust</span>
          <button onClick={() => updateScore(playerNumber, 1)}>+1</button>
          <button onClick={() => updateScore(playerNumber, -1)}>-1</button>
        </div>
        <div>
          <h4>Turn score: {turnScore}</h4>
          <div>
            <button onClick={() => buildTurn(TALLY.FIFTEEN)}>15</button>
            <button onClick={() => buildTurn(TALLY.PAIR)}>pair</button>
            <div>
              <span>Run of:</span>
              <button onClick={() => buildTurn(TALLY.RUN3)}>3</button>
              <button onClick={() => buildTurn(TALLY.RUN4)}>4</button>
              <button onClick={() => buildTurn(TALLY.RUN5)}>5</button>
            </div>
            <div>
              <span>Flush:</span>
              <button onClick={() => buildTurn(TALLY.FLUSH4)}>4</button>
              <button onClick={() => buildTurn(TALLY.FLUSH5)}>5</button>
            </div>
            <div>
              <button onClick={() => buildTurn(TALLY.NIBS)}>nibs(2)</button>
              <button onClick={() => buildTurn(TALLY.NOBS)}>nobs(1)</button>
            </div>
          </div>
          <div><button onClick={() => resetTurn()}>reset</button>
            <button onClick={() => submitTurn()}>score it</button>
          </div>
        </div>
      </div>
    </div>
  )
};

function App() {
  const initialState = {
    p1Score: 0,
    p2Score: 0,
    winner: null,
  };

  const [score, setScore] = useImmer(initialState);

  const resetGame = () => setScore(() => initialState);

  const changeScore = (playerNumber, increment) => {
    if (!score.winner) {
      setScore(draft => {
        const prevScore = draft[`p${playerNumber}Score`];
        const newScore = Math.min(SCORE_LIMITS.MAX, Math.max(SCORE_LIMITS.MIN, prevScore + increment));
        draft[`p${playerNumber}Score`] = newScore;
        if (newScore >= SCORE_LIMITS.MAX) {
          draft.winner = playerNumber;
        }
      });
    }
  }

  return (
    <div className="App">
      <Player playerNumber={2} currentScore={score.p2Score} opponentScore={score.p1Score} updateScore={changeScore} inverted />
      <Scoreboard score={score}>
        <Winner winner={score.winner} resetGame={resetGame} />
      </Scoreboard>
      <Player playerNumber={1} currentScore={score.p1Score} opponentScore={score.p2Score} updateScore={changeScore} />
    </div>
  );
}

export default App;
