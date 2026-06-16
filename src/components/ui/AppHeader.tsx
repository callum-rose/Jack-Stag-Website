import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';
import { phaseOrder } from '../../state/routes';

/**
 * Global header shown on every screen: the website title, plus the current
 * team name once one has been chosen.
 */
export function AppHeader() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const teamName = state.team?.name;

  const showRulesButton =
    phaseOrder[state.phase] >= phaseOrder.rules && pathname !== '/rules';

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__title">{copy.appTitle}</span>
        <div className="app-header__right">
          {showRulesButton && (
            <button
              className="app-header__rules-btn"
              onClick={() => navigate('/rules')}
            >
              Rules
            </button>
          )}
          {teamName && <span className="app-header__team">{teamName}</span>}
        </div>
      </div>
    </header>
  );
}
