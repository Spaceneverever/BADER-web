// The Core: a noise-displaced sphere, a wire shell, a particle field and two
// orbit rings. Pointer tilts it; scroll position moves it between states.
import * as THREE from 'three';

const NOISE = /* glsl */ `
// 3D simplex noise, Ashima Arts / Stefan Gustavson (MIT)
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const coreVert = /* glsl */ `
uniform float uTime;
uniform float uDistort;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
varying vec3 vPos;
${NOISE}
float field(vec3 p){
  return snoise(p * uFreq + vec3(0.0, uTime * 0.18, uTime * 0.07)) * 0.82
       + snoise(p * uFreq * 2.1 - vec3(uTime * 0.11)) * 0.18;
}
void main(){
  vec3 p = position;
  float n = field(normalize(p));
  vec3 displaced = p + normal * n * uDistort;
  // approximate the displaced normal with neighbouring samples
  vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.001)));
  vec3 b = normalize(cross(normal, t));
  float e = 0.035;
  vec3 pt = normalize(p + t * e);
  vec3 pb = normalize(p + b * e);
  vec3 dt = pt * length(p) + normalize(pt) * field(pt) * uDistort;
  vec3 db = pb * length(p) + normalize(pb) * field(pb) * uDistort;
  vec3 nrm = normalize(cross(dt - displaced, db - displaced));
  if (dot(nrm, normal) < 0.0) nrm = -nrm;
  vNoise = n;
  vPos = displaced;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * nrm);
  gl_Position = projectionMatrix * mv;
}`;

const coreFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform float uScan;
uniform float uGlow;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
varying vec3 vPos;
void main(){
  vec3 n = normalize(vNormal);
  float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.6);
  // fake studio environment: cold key from upper left, dark floor
  vec3 key = normalize(vec3(-0.6, 0.8, 0.5));
  float diff = max(dot(n, key), 0.0);
  vec3 h = normalize(key + vView);
  float spec = pow(max(dot(n, h), 0.0), 48.0);
  float env = smoothstep(-0.2, 1.0, n.y) * 0.5 + 0.08;
  // chrome-like reflection of a dark studio with two strip lights
  vec3 r = reflect(-vView, n);
  float strip1 = smoothstep(0.06, 0.0, abs(r.y - 0.55)) * smoothstep(-0.6, 0.2, r.x);
  float strip2 = smoothstep(0.04, 0.0, abs(r.x + 0.7)) * smoothstep(-0.8, 0.6, r.y) * 0.6;
  float horizon = smoothstep(0.0, -0.25, r.y) * 0.08;
  vec3 base = vec3(0.022, 0.032, 0.027);
  vec3 metal = base
    + vec3(0.62, 0.70, 0.66) * (diff * 0.12 + env * 0.16)
    + vec3(0.85, 0.95, 0.9) * (strip1 + strip2) * 0.75
    + vec3(0.2, 0.9, 0.5) * horizon
    + vec3(0.9, 1.0, 0.95) * spec * 0.5;
  // horizontal scan band that travels the surface
  float band = smoothstep(0.035, 0.0, abs(fract(vPos.y * 0.6 - uTime * 0.08) - 0.5)) * uScan;
  // contour lines from the noise field
  float iso = 1.0 - smoothstep(0.0, 0.035, abs(fract(vNoise * 4.0 + 0.5) - 0.5));
  vec3 col = metal;
  col += uAccent * fres * (0.55 * uGlow);
  col += uAccent * band * 0.55;
  col += uAccent * iso * 0.22 * (0.35 + fres);
  gl_FragColor = vec4(col, 1.0);
}`;

const pointsVert = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uSpread;
attribute float aSeed;
varying float vAlpha;
void main(){
  vec3 p = position * uSpread;
  float a = uTime * (0.03 + aSeed * 0.05);
  float c = cos(a), s = sin(a);
  p.xz = mat2(c, -s, s, c) * p.xz;
  p.y += sin(uTime * 0.4 + aSeed * 20.0) * 0.04;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.6 + aSeed) * (3.0 / -mv.z);
  vAlpha = 0.25 + 0.75 * fract(aSeed * 7.13 + uTime * 0.05);
  gl_Position = projectionMatrix * mv;
}`;

const pointsFrag = /* glsl */ `
uniform vec3 uAccent;
uniform float uOpacity;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uAccent, a * vAlpha * uOpacity);
}`;

export function createCore(canvas, { reducedMotion, onStatus }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    return null;
  }
  if (!renderer.getContext()) return null;

  const isWebGL2 = renderer.capabilities.isWebGL2;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const accent = new THREE.Color('#57e38f');
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  root.add(tilt);
  scene.add(root);

  // Solid core
  const coreUniforms = {
    uTime: { value: 0 },
    uDistort: { value: 0.17 },
    uFreq: { value: 1.25 },
    uAccent: { value: accent },
    uScan: { value: 1 },
    uGlow: { value: 1 },
  };
  const detail = window.innerWidth < 760 ? 48 : 96;
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, detail),
    new THREE.ShaderMaterial({ vertexShader: coreVert, fragmentShader: coreFrag, uniforms: coreUniforms })
  );
  tilt.add(core);

  // Wire shell
  const shellMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.16, depthWrite: false });
  const shell = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.75, 1)), shellMat);
  tilt.add(shell);

  // Vertices of the shell get small nodes: "connection points"
  const nodeGeo = new THREE.IcosahedronGeometry(1.75, 1);
  const nodeMat = new THREE.PointsMaterial({ color: accent, size: 0.045, transparent: true, opacity: 0.8, depthWrite: false });
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  shell.add(nodes);

  // Orbit rings with tick marks
  const ringGroup = new THREE.Group();
  const makeRing = (r, ticks, tiltX, tiltZ, opacity) => {
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x9fb8a8, transparent: true, opacity, depthWrite: false })
    );
    const tickPts = [];
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2;
      const len = i % 6 === 0 ? 0.12 : 0.05;
      tickPts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      tickPts.push(new THREE.Vector3(Math.cos(a) * (r + len), 0, Math.sin(a) * (r + len)));
    }
    const tick = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(tickPts),
      new THREE.LineBasicMaterial({ color: 0x9fb8a8, transparent: true, opacity: opacity * 1.4, depthWrite: false })
    );
    ring.add(tick);
    ring.rotation.set(tiltX, 0, tiltZ);
    ringGroup.add(ring);
    return ring;
  };
  const ringA = makeRing(2.35, 72, 1.25, 0.18, 0.22);
  const ringB = makeRing(2.75, 120, 1.62, -0.42, 0.12);
  tilt.add(ringGroup);

  // Particle field
  const COUNT = window.innerWidth < 760 ? 900 : 2200;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = 2.2 + Math.pow(Math.random(), 1.6) * 3.2;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = Math.cos(th) * s * r;
    pos[i * 3 + 1] = u * r * 0.7;
    pos[i * 3 + 2] = Math.sin(th) * s * r;
    seed[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const pUniforms = {
    uTime: { value: 0 },
    uSize: { value: 7 * Math.min(window.devicePixelRatio, 2) },
    uSpread: { value: 1 },
    uAccent: { value: accent },
    uOpacity: { value: 0.75 },
  };
  const particles = new THREE.Points(
    pGeo,
    new THREE.ShaderMaterial({
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      uniforms: pUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  root.add(particles);

  // ── State driven from outside (scroll timeline) ──
  const state = {
    x: 0.0, // offset as a fraction of the visible half-width
    y: 0.0,
    scale: 1,
    distort: 0.17,
    freq: 1.25,
    shell: 0.16,
    spread: 1,
    spin: 1,
    glow: 1,
    opacity: 1,
  };

  const REST = { x: 0.42, y: 0.02, scale: 0.92 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 0, height = 0, halfW = 1, halfH = 1;
  let running = false;
  let raf = 0;
  let last = performance.now();
  let time = 0;
  let frames = 0, fpsClock = 0;
  let needsRender = true;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 760 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    needsRender = true;
  }

  function apply() {
    const narrow = width < 760;
    // On narrow screens the core sits higher and smaller so text stays legible.
    const baseScale = narrow ? 0.72 : Math.min(1.15, Math.max(0.8, camera.aspect * 0.62));
    // Reduced motion: the core holds its place; only its surface and brightness change.
    const place = reducedMotion.value ? REST : state;
    root.position.x = place.x * halfW * (narrow ? 0.25 : 1);
    root.position.y = (place.y + (narrow ? 0.34 : 0)) * halfH;
    root.scale.setScalar(place.scale * baseScale);
    coreUniforms.uDistort.value = state.distort;
    coreUniforms.uFreq.value = state.freq;
    coreUniforms.uGlow.value = state.glow;
    shellMat.opacity = state.shell * state.opacity;
    nodeMat.opacity = Math.min(1, state.shell * 5) * state.opacity;
    pUniforms.uSpread.value = state.spread;
    pUniforms.uOpacity.value = 0.75 * state.opacity;
    if (canvas.classList.contains('is-live')) canvas.style.opacity = state.opacity.toFixed(3);
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reducedMotion.value) time += dt * state.spin;

    // dt-normalised lerp toward the pointer
    const k = 1 - Math.pow(0.0025, dt);
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;

    coreUniforms.uTime.value = time;
    pUniforms.uTime.value = time;
    tilt.rotation.y = time * 0.12 + pointer.x * 0.45;
    tilt.rotation.x = pointer.y * 0.3;
    shell.rotation.y = -time * 0.2;
    shell.rotation.z = time * 0.05;
    ringA.rotation.y = time * 0.25;
    ringB.rotation.y = -time * 0.16;
    particles.rotation.y = pointer.x * 0.15;
    particles.rotation.x = pointer.y * 0.08;

    apply();
    renderer.render(scene, camera);
    needsRender = false;

    frames++;
    fpsClock += dt;
    if (fpsClock >= 1) {
      onStatus?.(`${isWebGL2 ? 'WEBGL2' : 'WEBGL'} · ${Math.round(frames / fpsClock)} FPS`);
      frames = 0;
      fpsClock = 0;
    }

    if (running && !reducedMotion.value) raf = requestAnimationFrame(tick);
    else raf = 0;
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  // In reduced motion we only draw when something changes.
  function renderOnce() {
    if (raf) return;
    raf = requestAnimationFrame((t) => {
      raf = 0;
      last = t;
      tick(t);
    });
  }

  function setPointer(nx, ny) {
    if (reducedMotion.value) return;
    pointer.tx = nx;
    pointer.ty = ny;
  }

  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion.value || !running) renderOnce();
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    onStatus?.('CONTEXT LOST');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    onStatus?.('RESTORED');
    start();
  });

  resize();
  apply();
  renderer.render(scene, camera);
  onStatus?.(isWebGL2 ? 'WEBGL2' : 'WEBGL');

  return {
    state,
    start,
    stop,
    renderOnce,
    setPointer,
    get needsRender() { return needsRender; },
  };
}

// SVG fallback when WebGL is not available: a wire globe with the same language.
export function createFallback(container) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '-200 -200 400 400');
  let html = '<g fill="none" stroke="#57e38f" stroke-opacity="0.35" stroke-width="0.8">';
  html += '<circle r="150" stroke-opacity="0.6"/>';
  for (let i = 1; i < 8; i++) {
    const ry = Math.abs(Math.cos((i / 8) * Math.PI)) * 150;
    html += `<ellipse rx="150" ry="${ry.toFixed(1)}" transform="rotate(90)"/>`;
    const y = Math.cos((i / 8) * Math.PI) * 150;
    const rx = Math.sin((i / 8) * Math.PI) * 150;
    html += `<ellipse cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * 0.18).toFixed(1)}"/>`;
  }
  html += '</g><g fill="none" stroke="#9fb8a8" stroke-opacity="0.25"><ellipse rx="190" ry="46" transform="rotate(-14)"/></g>';
  svg.innerHTML = html;
  container.appendChild(svg);
  container.classList.add('is-on');
}
