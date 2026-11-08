import { useEffect, useRef, useState } from 'react';
import { Director } from '../engine/Director';
import type { EngineScene } from '../engine/types';
import { rgbOf } from '../theme/tokens';
import type { SceneConfig } from '../types/scene';
import { Header } from './Header';
import { Scene } from './Scene';

function toEngine(s: SceneConfig): EngineScene {
  return { shape: s.shape, color: rgbOf(s.color), enter: s.enter, region: s.region, regionMobile: s.regionMobile, bodyAlpha: s.bodyAlpha };
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
