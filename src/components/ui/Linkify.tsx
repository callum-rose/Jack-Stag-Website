import { Fragment } from 'react';

// Splits text on http(s) URLs and renders them as clickable links, leaving the
// rest as plain text. The challenge/pub .txt files are hand-edited and may
// paste in links (e.g. https://getcalicocutpants.com/) that should be tappable.
const URL_RE = /(https?:\/\/[^\s]+)/g;

// Trailing punctuation shouldn't be swallowed into the link — a sentence like
// "...like this (https://example.com)." leaves the ")" and "." as text.
function splitTrailing(url: string): [string, string] {
  const match = url.match(/[.,;:!?)\]]+$/);
  if (!match) return [url, ''];
  return [url.slice(0, url.length - match[0].length), match[0]];
}

export function Linkify({ children }: { children: string }) {
  const parts = children.split(URL_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const [href, trailing] = splitTrailing(part);
        return (
          <Fragment key={i}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {href}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </>
  );
}
