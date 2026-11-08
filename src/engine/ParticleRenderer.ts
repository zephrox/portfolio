import * as THREE from 'three';
import { ENGINE } from './config';
import type { ParticleSystem } from './ParticleSystem';

/**
 * Each particle is a point sprite holding one micro cube. The vertex shader builds the cube's
 * rotation (axis-angle: a fixed random axis, an idle tumble over time, plus the flight tumble from
 * ParticleSystem). The fragment shader casts an orthographic ray through the pixel, intersects the
 * rotated unit box, and shades the face it hits with one flat tone: no gradients, no glow.
 */
const vertexShader = /* glsl */ `
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aSize;
  attribute vec3 aAxis;
  attribute float aPhase;
  attribute float aSpin;
  attribute float aTumble;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uTime;
  uniform float uSprite;
  varying float vAlpha;
  varying vec3 vColor;
  varying vec3 vR0;
  varying vec3 vR1;
  varying vec3 vR2;

  mat3 axisAngle(vec3 a, float t) {
    float c = cos(t);
    float s = sin(t);
    float k = 1.0 - c;
    return mat3(
      c + a.x * a.x * k, a.y * a.x * k + a.z * s, a.z * a.x * k - a.y * s,
      a.x * a.y * k - a.z * s, c + a.y * a.y * k, a.z * a.y * k + a.x * s,
      a.x * a.z * k + a.y * s, a.y * a.z * k - a.x * s, c + a.z * a.z * k
    );
  }

  void main() {
    vec2 z = position.xy / uRes * 2.0 - 1.0;
    gl_Position = vec4(z.x, -z.y, 0.0, 1.0);
    gl_PointSize = aSize * uDpr * uSprite;
    vAlpha = aAlpha;
    vColor = aColor;
    mat3 R = axisAngle(normalize(aAxis), aPhase + uTime * aSpin + aTumble);
    vR0 = R[0];
    vR1 = R[1];
    vR2 = R[2];
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uSprite;
  uniform vec3 uLight;
  uniform float uAmbient;
  uniform float uDiffuse;
  varying float vAlpha;
  varying vec3 vColor;
  varying vec3 vR0;
  varying vec3 vR1;
  varying vec3 vR2;

  void main() {
    // Sprite space in cube-edge units: the cube spans -0.5..0.5 on each axis.
    vec2 q = (gl_PointCoord - 0.5) * uSprite;
    vec3 ro = vec3(q.x, -q.y, 2.0);
    vec3 rd = vec3(0.0, 0.0, -1.0);
    // Into the cube's frame (the inverse of a rotation is its transpose).
    vec3 o = vec3(dot(vR0, ro), dot(vR1, ro), dot(vR2, ro));
    vec3 d = vec3(dot(vR0, rd), dot(vR1, rd), dot(vR2, rd));
    d += vec3(equal(d, vec3(0.0))) * 1e-6;
    vec3 t0 = (vec3(-0.5) - o) / d;
    vec3 t1 = (vec3(0.5) - o) / d;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    float tn = max(max(tmin.x, tmin.y), tmin.z);
    float tf = min(min(tmax.x, tmax.y), tmax.z);
    if (tn > tf) discard;
    vec3 nl = tn == tmin.x ? vec3(-sign(d.x), 0.0, 0.0)
            : tn == tmin.y ? vec3(0.0, -sign(d.y), 0.0)
            : vec3(0.0, 0.0, -sign(d.z));
    vec3 n = mat3(vR0, vR1, vR2) * nl;
    float lit = max(0.0, dot(n, uLight));
    // Black ink (cubes drawn on a colour block) can't be shaded by darkening it, so its faces
    // differ in opacity instead: the lit face lets more of the block show through. Still flat tones.
    if (max(vColor.r, max(vColor.g, vColor.b)) < 0.04) {
      float a = vAlpha * (1.0 - 0.5 * lit);
      gl_FragColor = vec4(0.0, 0.0, 0.0, a);
      return;
    }
    float shade = uAmbient + uDiffuse * lit;
    gl_FragColor = vec4(vColor * shade * vAlpha, vAlpha);
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
  private tumble: THREE.BufferAttribute;

  constructor(canvas: HTMLCanvasElement, private sys: ParticleSystem) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    const n = sys.n;
    const cube = ENGINE.cube;
    // Static per-cube orientation: random axis, random starting angle, random idle spin.
    const axis = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    const spin = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      axis[i * 3] = r * Math.cos(a);
      axis[i * 3 + 1] = r * Math.sin(a);
      axis[i * 3 + 2] = u;
      phase[i] = Math.random() * Math.PI * 2;
      spin[i] = sys.reduced ? 0 : (Math.random() * 2 - 1) * cube.idleSpin;
    }
    this.position = new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.alpha = new THREE.BufferAttribute(sys.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    this.color = new THREE.BufferAttribute(sys.color, 3).setUsage(THREE.DynamicDrawUsage);
    this.size = new THREE.BufferAttribute(sys.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.tumble = new THREE.BufferAttribute(sys.tumble, 1).setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute('position', this.position);
    this.geometry.setAttribute('aAlpha', this.alpha);
    this.geometry.setAttribute('aColor', this.color);
    this.geometry.setAttribute('aSize', this.size);
    this.geometry.setAttribute('aTumble', this.tumble);
    this.geometry.setAttribute('aAxis', new THREE.BufferAttribute(axis, 3));
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    this.geometry.setAttribute('aSpin', new THREE.BufferAttribute(spin, 1));
    const light = new THREE.Vector3(...cube.light).normalize();
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uDpr: { value: 1 },
        uTime: { value: 0 },
        uSprite: { value: cube.sprite },
        uLight: { value: light },
        uAmbient: { value: cube.ambient },
        uDiffuse: { value: cube.diffuse },
      },
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

  /** `time` (seconds) drives the cubes' idle tumble. */
  render(time: number): void {
    const p = this.position.array as Float32Array;
    const { x, y, n } = this.sys;
    for (let i = 0; i < n; i++) {
      p[i * 3] = x[i];
      p[i * 3 + 1] = y[i];
    }
    this.material.uniforms.uTime.value = time;
    this.position.needsUpdate = true;
    this.alpha.needsUpdate = true;
    this.color.needsUpdate = true;
    this.size.needsUpdate = true;
    this.tumble.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
