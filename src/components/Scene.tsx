import type { CSSProperties } from 'react';
import { palette } from '../theme/tokens';
import type { SceneConfig } from '../types/scene';

/** One chapter's text. The Director flips data-state between "in" and "out". */
export function Scene({ index, config }: { index: number; config: SceneConfig }) {
  const { Content, color, layout, label } = config;
  const style = { '--section': palette[color] } as CSSProperties;
  return (
    <section
      className={`scene scene--${layout}${config.headOnBlock ? ' scene--ink' : ''}`}
      data-scene={index}
      data-state={index === 0 ? 'in' : 'out'}
      aria-label={label}
      style={style}
    >
      <div className="copy">
        <Content />
      </div>
    </section>
  );
}
