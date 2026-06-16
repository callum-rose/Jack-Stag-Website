import { useState, useEffect } from 'react';
import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';
import { totalTimeMs } from '../../state/selectors';
import { formatDuration } from '../../lib/time';

/**
 * Global header shown on every screen: the website title, plus the current
 * team name once one has been chosen.
 */
export function AppHeader() {
  const { state } = useGame();
  const teamName = state.team?.name;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.startedAt === null || state.finishedAt !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.startedAt, state.finishedAt]);

  const elapsedMs = state.startedAt !== null ? totalTimeMs(state, now) : null;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__title">{copy.appTitle}</span>
        {elapsedMs !== null && (
          <span className="app-header__timer">{formatDuration(elapsedMs)}</span>
        )}
        {teamName && <span className="app-header__team">{teamName}</span>}
      </div>
    </header>
  );
}
