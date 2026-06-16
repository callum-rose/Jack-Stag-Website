import { appConfig, copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { isPubCompleted } from '../state/gameReducer';
import { useNearestPub } from '../hooks/useNearestPub';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';
import { AlreadySearchedScreen } from './AlreadySearchedScreen';

export function ArrivalScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  const last = state.geo.last;
  const { nearest } = useNearestPub(last, pubs, appConfig.arrivalRadiusM);

  const pending = state.pendingPubId
    ? (pubs.find((p) => p.id === state.pendingPubId) ?? null)
    : (nearest?.pub ?? null);

  const confirm = () => {
    void sample();
    dispatch({
      type: 'CONFIRM_PUB',
      at: Date.now(),
      challengeCount: challenges.length,
      loop: appConfig.loopChallenges,
    });
  };

  const openDirections = () => {
    if (!pending) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pending.lat},${pending.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  if (pending && isPubCompleted(state, pending.id)) {
    return (
      <AlreadySearchedScreen
        pubId={pending.id}
        onBack={() => dispatch({ type: 'CANCEL_ARRIVAL' })}
      />
    );
  }

  return (
    <Screen
      title={pending?.name ?? copy.arrival.heading}
      subtitle={pending?.phonetic ? <em>[{pending.phonetic}]</em> : undefined}
      footer={
        <BigButton
          variant="primary"
          onClick={() => dispatch({ type: 'CANCEL_ARRIVAL' })}
        >
          Back to all pubs
        </BigButton>
      }
    >
      {pending && (
        <>
          <BigButton variant="secondary" onClick={openDirections}>
            Get Directions
          </BigButton>
          <BigButton variant="success" onClick={confirm}>
            We've arrived
          </BigButton>
        </>
      )}
    </Screen>
  );
}
