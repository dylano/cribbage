import React from 'react';
import { useMemo } from 'react';
import { useImmer } from 'use-immer';
import './App.css';

const SCORE_LIMITS = {
  MIN: 0,
  MAX: 121,
};

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

const Winner = ({ winner, resetGame }) =>
  winner ? (
    <div className="winner">
      <div>{`Player ${winner} wins!`}</div>
      <button onClick={resetGame}>Play again</button>
    </div>
  ) : null;

const Scoreboard = ({ children }) => {
  return <div className="scoreboard">{children}</div>;
};

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
    setTurn((draft) => ({}));
  };

  const buildTurn = (tallyType) => {
    setTurn((draft) => {
      draft[tallyType.label] = {
        value: tallyType.value,
        quantity: draft[tallyType.label]?.quantity + 1 || 1,
      };
    });
  };

  const submitTurn = () => {
    updateScore(playerNumber, turnScore);
    resetTurn();
  };

  const TallyButton = ({ tallyType }) => {
    const type = tallyType.label;
    const quantity = turn[tallyType.label]?.quantity || 0;
    const count = quantity ? ` (${quantity})` : '';
    return (
      <button className="btnTally" onClick={() => buildTurn(tallyType)}>
        <div>{type}</div>
        <div className="quantity">{count}</div>
      </button>
    );
  };

  const ScoreButton = ({ onClick, enabled, enabledStyle, children }) => {
    const style = enabled ? enabledStyle : {};
    return (
      <button className="btnScore" onClick={onClick} style={style} disabled={!enabled}>
        {children}
      </button>
    );
  };

  const scoreEnabled = turnScore > 0;

  return (
    <div className={inverted ? 'inverted player' : 'player'}>
      <div
        className="player-progress"
        style={{ width: `${(currentScore * 100) / SCORE_LIMITS.MAX}%` }}
      ></div>
      <h2>Player {playerNumber}</h2>
      <div>
        <div className="score-summary">
          <div className="player-score">
            <span className="score-title">Score:</span>
            <span className="score-score">
              {currentScore} - {opponentScore}
            </span>
          </div>
          <div>
            <div>Adjust: </div>
            <button onClick={() => updateScore(playerNumber, 1)}>+1</button>
            <button onClick={() => updateScore(playerNumber, -1)}>-1</button>
          </div>
        </div>
        <div className="scoring-grid">
          <span>Turn score: {turnScore}</span>
          <div className="row turn-control">
            <>
              <ScoreButton
                onClick={() => resetTurn()}
                enabled={turnScore > 0}
                enabledStyle={{ color: 'blue', backgroundColor: 'yellow' }}
              >
                reset
              </ScoreButton>
              <ScoreButton
                onClick={() => submitTurn()}
                enabled={turnScore > 0}
                enabledStyle={{ color: 'yellow', backgroundColor: 'blue' }}
              >
                score!
              </ScoreButton>
            </>
          </div>
          <span>Basics:</span>
          <div className="row">
            <TallyButton tallyType={TALLY.FIFTEEN} />
            <TallyButton tallyType={TALLY.PAIR} />
          </div>
          <span>Runs:</span>
          <div className="row">
            <TallyButton tallyType={TALLY.RUN3} />
            <TallyButton tallyType={TALLY.RUN4} />
            <TallyButton tallyType={TALLY.RUN5} />
          </div>
          <span>Flush:</span>
          <div className="row">
            <TallyButton tallyType={TALLY.FLUSH4} />
            <TallyButton tallyType={TALLY.FLUSH5} />
          </div>
          <span>Jacks:</span>
          <div className="row">
            <button onClick={() => buildTurn(TALLY.NIBS)}>nibs/2</button>
            <button onClick={() => buildTurn(TALLY.NOBS)}>nobs/1</button>
          </div>
        </div>
      </div>
    </div>
  );
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
      setScore((draft) => {
        const prevScore = draft[`p${playerNumber}Score`];
        const newScore = Math.min(
          SCORE_LIMITS.MAX,
          Math.max(SCORE_LIMITS.MIN, prevScore + increment)
        );
        draft[`p${playerNumber}Score`] = newScore;
        if (newScore >= SCORE_LIMITS.MAX) {
          draft.winner = playerNumber;
        }
      });
    }
  };

  return (
    <div className="App">
      <Player
        playerNumber={2}
        currentScore={score.p2Score}
        opponentScore={score.p1Score}
        updateScore={changeScore}
        inverted
      />
      <Scoreboard>
        <Winner winner={score.winner} resetGame={resetGame} />
      </Scoreboard>
      <Player
        playerNumber={1}
        currentScore={score.p1Score}
        opponentScore={score.p2Score}
        updateScore={changeScore}
      />
    </div>
  );
}

export default App;
