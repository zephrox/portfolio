import * as THREE from 'three';
import type { ParticleSystem } from './ParticleSystem';

/**
 * Each particle is a tiny round dot. The edge is antialiased over one device pixel (vEdge is that
 * pixel as a fraction of the sprite), so even 2-3 px dots stay round instead of turning square.
 */
const vertexShader = /* glsl */ `
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aSize;
  uniform vec2 uRes;
  uniform float uDpr;
  varying float vAlpha;
  varying vec3 vColor;
  varying float vEdge;
  void main() {
    vec2 z = position.xy / uRes * 2.0 - 1.0;
    gl_Position = vec4(z.x, -z.y, 0.0, 1.0);
    float px = max(1.0, aSize * uDpr);
    gl_PointSize = px;
    vEdge = 1.0 / px;
    vAlpha = aAlpha;
    vColor = aColor;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vEdge;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float cover = 1.0 - smoothstep(1.0 - 2.0 * vEdge, 1.0, r);
    if (cover <= 0.0) discard;
    float a = vAlpha * cover;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

/** Draws a ParticleSystem with Three.js. Positions are in CSS pixels; the shader maps them to clip space. */
export class ParticleRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private geometry = new THREE.BufferGeometry();
  private material: THREE.ShaderMaterial;
  private position: THREE.BufferAttribute;
  private alpha: THREE.BufferAttribute;
  private color: THREE.BufferAttribute;
  private size: THREE.BufferAttribute;

  constructor(canvas: HTMLCanvasElement, private sys: ParticleSystem) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    const n = sys.n;
    this.position = new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.alpha = new THREE.BufferAttribute(sys.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    this.color = new THREE.BufferAttribute(sys.color, 3).setUsage(THREE.DynamicDrawUsage);
    this.size = new THREE.BufferAttribute(sys.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.position);
    this.geometry.setAttribute('aAlpha', this.alpha);
    this.geometry.setAttribute('aColor', this.color);
    this.geometry.setAttribute('aSize', this.size);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      premultipliedAlpha: true,
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  setSize(width: number, height: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    (this.material.uniforms.uRes.value as THREE.Vector2).set(width, height);
    this.material.uniforms.uDpr.value = dpr;
  }

  render(): void {
    const p = this.position.array as Float32Array;
    const { x, y, n } = this.sys;
    for (let i = 0; i < n; i++) {
      p[i * 3] = x[i];
      p[i * 3 + 1] = y[i];
    }
    this.position.needsUpdate = true;
    this.alpha.needsUpdate = true;
    this.color.needsUpdate = true;
    this.size.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
