import { appConfig, copy } from '../config/app.config';
import { challenges } from '../config/data';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function ReadyScreen() {
  const { dispatch } = useGame();
  const { sample } = useGeolocation();

  const start = async () => {
    // This tap is the user gesture iOS requires before the geolocation prompt.
    void sample();
    dispatch({
      type: 'START_GAME',
      at: Date.now(),
      challengeCount: challenges.length,
      loop: appConfig.loopChallenges,
    });
  };

  return (
    <Screen
      title={copy.ready.heading}
      footer={
        <BigButton variant="success" onClick={start}>
          {copy.ready.cta}
        </BigButton>
      }
    >
      <p>{copy.ready.body}</p>
    </Screen>
  );
}
