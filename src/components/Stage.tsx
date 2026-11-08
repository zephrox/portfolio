import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Director } from '../engine/Director';
import type { EngineScene } from '../engine/types';
import type { RegionFrac } from '../engine/types';
import { hexToRgb, palette, rgbOf, surface } from '../theme/tokens';
import type { SceneConfig } from '../types/scene';
import { Header } from './Header';
import { Scene } from './Scene';

/** Black "ink" for illustrations and headings drawn on a colour block. */
const INK = hexToRgb(surface.bg);
/** Phones: unless a scene says otherwise, its block fills the top of the screen above the text. */
const PHONE_BLOCK: RegionFrac = { x: 0, y: 0, w: 1, h: 0.46 };

function toEngine(s: SceneConfig): EngineScene {
  const color = rgbOf(s.color);
  return {
    shape: s.shape,
    color,
    bodyColor: s.block ? INK : color,
    headColor: s.headOnBlock ? INK : color,
    block: Boolean(s.block),
    enter: s.enter,
    region: s.region,
    regionMobile: s.regionMobile,
    bodyAlpha: s.bodyAlpha,
  };
}

/** Position and colour of a scene's block, as CSS variables read by .block in global.css. */
function blockStyle(s: SceneConfig): CSSProperties {
  const d = s.block;
  const m = s.blockMobile ?? PHONE_BLOCK;
  if (!d) return {};
  return {
    '--section': palette[s.color],
    '--block-x': d.x, '--block-y': d.y, '--block-w': d.w, '--block-h': d.h,
    '--block-mx': m.x, '--block-my': m.y, '--block-mw': m.w, '--block-mh': m.h,
  } as CSSProperties;
}

/** Full-screen story: particle canvas behind, one Scene per chapter on top. */
export function Stage({ scenes }: { scenes: SceneConfig[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directorRef = useRef<Director | null>(null);
  const [noGL, setNoGL] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const director = new Director({ root, canvas, scenes: scenes.map(toEngine), onNoWebGL: () => setNoGL(true) });
    directorRef.current = director;
    void director.start();
    return () => {
      director.destroy();
      directorRef.current = null;
    };
  }, [scenes]);

  return (
    <div ref={rootRef} className="stage">
      {scenes.map((s, i) =>
        s.block ? (
          <div key={s.id} className="block" data-block={i} data-state={i === 0 ? 'in' : 'out'} style={blockStyle(s)} aria-hidden="true" />
        ) : null,
      )}
      <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />
      <div className="stage__scan" data-scan="" aria-hidden="true" />
      {scenes.map((s, i) => (
        <Scene key={s.id} index={i} config={s} />
      ))}
      <Header />
      <div className="scroll-cue" aria-hidden="true">
        <div className="scroll-cue__fill" />
      </div>
      <button className="skip skip--prev" type="button" onClick={() => directorRef.current?.go(-1)}>
        Previous chapter
      </button>
      <button className="skip skip--next" type="button" onClick={() => directorRef.current?.go(1)}>
        Next chapter
      </button>
      {noGL && <p className="stage__nogl">The animation needs WebGL.</p>}
    </div>
  );
}
