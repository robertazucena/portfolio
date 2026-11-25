/* Aztec prism: a flowing silk mesh gradient in navy, blue and sky (smooth bands, no blobs),
   fixed behind every page. Full strength in the hero, calmer behind reading sections.
   Plain WebGL (no library), works from file://. Falls back to the CSS mesh in
   styles.css when WebGL is unavailable. Pauses off-screen; one still frame
   for reduced motion. */
(() => {
  'use strict';
  const canvas = document.querySelector('[data-mesh]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // data-hero="none": no bright hero zone (the platform); data-calm: how much of the prism shows behind content (0-1)
  const noHero = canvas.dataset.hero === 'none';
  const calm = parseFloat(canvas.dataset.calm || '0.46');
  const heroAt = () => noHero ? 0 : ((!location.hash || location.hash === '#home') ? Math.max(0, 1 - scrollY / innerHeight * 1.2) : 0);

  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // 0..1, smoothed
uniform float uPress;    // 0..1 pointer energy
uniform float uHero;     // 1 at the top of the home page, 0 once past the hero
uniform float uScroll;   // page scroll in viewport heights
uniform float uCalm;     // share of the prism shown behind reading content

// Ashima simplex noise (MIT)
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){ float f = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ f += a * snoise(p); p = p * 1.9 + 7.3; a *= 0.5; } return f; }

// colour ramp: navy -> deep -> blue -> sky, then back down
vec3 ramp(float t){
  vec3 navy = vec3(0.020, 0.047, 0.122);   // #050C1F
  vec3 deep = vec3(0.040, 0.105, 0.300);
  vec3 blue = vec3(0.120, 0.330, 0.860);
  vec3 sky  = vec3(0.541, 0.831, 1.000);   // #8AD4FF
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(navy, deep, smoothstep(0.0, 0.35, t));
  c = mix(c, blue, smoothstep(0.30, 0.68, t));
  c = mix(c, sky, smoothstep(0.62, 0.95, t));
  return c;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  p.y += uScroll * 0.32;   // the bands travel as you scroll
  float t = uTime * 0.035;

  // the pointer gently bends the flow (no bulge)
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  vec2 toM = p - m;
  p += toM * 0.10 * uPress * exp(-dot(toM, toM) * 2.0);

  // low-frequency warp only: long, smooth bands like silk
  vec2 w = vec2(fbm(p * 0.9 + vec2(t, -t * 0.6)), fbm(p * 0.9 + vec2(3.1 - t * 0.8, 1.7 + t)));
  vec2 q = p + 0.55 * w;

  // a diagonal sweep, bending with the warp
  float band = dot(q, normalize(vec2(0.85, 0.55))) * 0.95 + 0.18 * snoise(q * 0.7 + t * 0.5);
  float v = 0.5 + 0.5 * sin(band * 3.2 - t * 2.0);
  // weight the light to the right, where the phone sits
  float side = smoothstep(-0.2, 0.9, uv.x);
  vec3 col = ramp(0.12 + v * mix(0.5, 1.0, side));

  // a soft silk sheen running along the bands (thin, not round)
  float sheen = pow(0.5 + 0.5 * sin(band * 3.2 - t * 2.0 + 1.1), 14.0);
  col += vec3(0.80, 0.93, 1.0) * sheen * 0.22 * side;


  // vignette + melt into the page below
  float vig = smoothstep(1.3, 0.4, length((uv - vec2(0.62, 0.5)) * vec2(1.0, 1.2)));
  col *= mix(0.7, 1.0, vig);
  vec3 navyC = vec3(0.020, 0.047, 0.122);
  col = mix(col, navyC, smoothstep(0.5, 0.0, uv.y) * 0.85 * uHero);   // hero melts into the page
  col = mix(navyC, col, mix(uCalm, 1.0, uHero));                       // calmer behind reading sections

  // film grain against banding
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  col += (g - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uPress = U('uPress'), uHero = U('uHero'), uScroll = U('uScroll'), uCalm = U('uCalm');

  // render below native resolution: the surface is soft, so this is invisible and cheap
  const SCALE = 0.55;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width * SCALE)), h = Math.max(2, Math.round(r.height * SCALE));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uRes, w, h);
  };

  const mouse = { x: .68, y: .52, tx: .68, ty: .52, e: 0, te: 0 };
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
    mouse.te = 1;
  }, { passive: true });

  let visible = true, raf = 0, t0 = performance.now(), last = t0, hero = noHero ? 0 : 1, sc = 0;
  const frame = now => {
    raf = 0;
    const dt = Math.min(64, now - last); last = now;
    const s = 1 - Math.pow(0.001, dt / 1000);       // frame-rate independent smoothing
    mouse.x += (mouse.tx - mouse.x) * s * 2.2;
    mouse.y += (mouse.ty - mouse.y) * s * 2.2;
    mouse.e += (mouse.te - mouse.e) * s * 1.5;
    mouse.te *= Math.pow(0.2, dt / 1000);           // energy fades when the pointer rests
    gl.uniform1f(uTime, (now - t0) / 1000 + 40.0);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uPress, mouse.e);
    const sy = scrollY / innerHeight;
    hero += (heroAt() - hero) * s * 3;
    sc += (sy - sc) * s * 3;
    gl.uniform1f(uHero, hero);
    gl.uniform1f(uScroll, sc);
    gl.uniform1f(uCalm, calm);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !reduced && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  resize();
  addEventListener('resize', () => { resize(); if (reduced) frame(performance.now()); });
  if (reduced) addEventListener('scroll', () => { hero = heroAt(); sc = scrollY / innerHeight; frame(performance.now()); }, { passive: true });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  canvas.classList.add('is-live');
  start();
})();
