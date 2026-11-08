import type { BodyShape, ShapeBuildContext, ShapeSpec } from '../types';
import { buildMachine } from './machine';
import { buildPortrait } from './portrait';
import { buildFaceMesh, buildOrbits, buildSeismic, buildText, buildWindows } from './procedural';

/** Shape registry. Add a case here when you add a new ShapeSpec kind. */
export function buildShape(spec: ShapeSpec, ctx: ShapeBuildContext): BodyShape {
  switch (spec.kind) {
    case 'machine':
      return buildMachine(ctx);
    case 'portrait':
      return buildPortrait(ctx);
    case 'orbits':
      return buildOrbits(ctx);
    case 'seismic':
      return buildSeismic(ctx, spec.rows ?? 5);
    case 'mesh':
      return buildFaceMesh(ctx);
    case 'text':
      return buildText(ctx, spec.lines);
    case 'windows':
      return buildWindows(ctx);
  }
}
