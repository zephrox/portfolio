import type { ReactNode } from 'react';
import type { EvidenceItem } from '../content/evidence';

/**
 * Small building blocks for section copy. Use these instead of styling raw tags,
 * so type, spacing and colour stay consistent and the particle engine can find the heading.
 */

type HeadingSize = 'hook' | 'display' | 'section';

/** The one heading per section. Particles land on its letters, so keep exactly one per section. */
export function Heading({ as = 'h2', size = 'section', children }: { as?: 'h1' | 'h2' | 'p'; size?: HeadingSize; children: ReactNode }) {
  const Tag = as;
  return (
    <Tag className={`heading heading--${size}`} data-head="">
      {children}
    </Tag>
  );
}

/** The single highlighted word in a heading. Takes the section's colour. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="accent">{children}</span>;
}

export function Body({ children, size = 'md' }: { children: ReactNode; size?: 'md' | 'lg' | 'sm' }) {
  return <p className={`body body--${size}`}>{children}</p>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="hint">{children}</p>;
}

/** A column of copy inside multi-column layouts such as top-split. Counts as one reveal step. */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="stack">{children}</div>;
}

/** A row that keeps evidence and links together. Counts as one reveal step. */
export function Row({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return <div className={`row${center ? ' row--center' : ''}`}>{children}</div>;
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkArrow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="link-arrow" href={href}>
      {children}
      <Arrow />
    </a>
  );
}

export function ButtonLink({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  return (
    <a className={`button button--${variant}`} href={href}>
      {children}
    </a>
  );
}

/**
 * Proof for a chapter: a real photo, clip or screenshot.
 * Without `src` it shows a labelled dashed box so the gap is obvious. A stand-in image
 * (`placeholder`) always carries a visible "Placeholder" note with its credit.
 */
export function Evidence({ label, src, alt, video = false, placeholder = false, credit }: EvidenceItem) {
  if (!src) return <figure className="evidence evidence--empty">[{label}]</figure>;
  return (
    <figure className="evidence">
      <div className="evidence__frame">
        {video ? (
          <video src={src} muted loop autoPlay playsInline aria-label={alt ?? label} />
        ) : (
          <img src={src} alt={alt ?? label} loading="lazy" />
        )}
      </div>
      {placeholder && (
        <figcaption className="evidence__note">
          Placeholder{credit ? ` · ${credit}` : ''}
        </figcaption>
      )}
    </figure>
  );
}
