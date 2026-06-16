import type { Challenge, Pub } from '../types';
import pubsTxt from './pubs.txt?raw';
import challengesTxt from './challenges.txt?raw';

/**
 * Reader-friendly pronunciation guides for the (mostly Czech) pub names,
 * keyed by decoded name. Names not listed here render without a guide.
 */
const PHONETICS: Record<string, string> = {
  'U Fleku': 'oo FLE-koo',
  'Lokál Dlouhááá': 'LOK-aal DLOH-haa',
  'U Zlatého Tygra': 'oo ZLA-teh-ho TIG-ra',
  'Pivovarský Dům': 'PIV-o-var-skee DOOM',
  'U Medvídků': 'oo MED-veed-koo',
  'Vinohradský Pivovar': 'VIN-o-hrad-skee PIV-o-var',
  'Zlý Časy': 'zlee CHA-si',
};

function parsePubs(txt: string): Pub[] {
  return txt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url, i) => {
      const match = url.match(/\/maps\/place\/([^/@]+)\/@([-\d.]+),([-\d.]+)/);
      if (!match) throw new Error(`Invalid pub URL on line ${i + 1}: ${url}`);
      const [, nameEncoded, lat, lng] = match;
      const name = decodeURIComponent(nameEncoded.replace(/\+/g, ' '));
      return {
        id: `pub-${String(i + 1).padStart(2, '0')}`,
        name,
        lat: Number(lat),
        lng: Number(lng),
        phonetic: PHONETICS[name],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseChallenges(txt: string): Challenge[] {
  return txt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const sep = line.indexOf(' | ');
      if (sep === -1) throw new Error(`Missing ' | ' separator on challenge line ${i + 1}: ${line}`);
      return {
        title: line.slice(0, sep),
        description: line.slice(sep + 3),
      };
    });
}

export const pubs: Pub[] = parsePubs(pubsTxt);
export const challenges: Challenge[] = parseChallenges(challengesTxt);
