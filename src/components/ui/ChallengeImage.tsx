import { useState } from 'react';

// Optional illustration for a challenge, loaded from a URL in the .txt files.
// It flex-grows to fill the space left below the text and shrinks to fit, so
// the challenge screen never scrolls (see `.challenge-image` in global.css).
// A broken URL is hidden rather than left as a broken-image icon.
export function ChallengeImage({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      className="challenge-image"
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
