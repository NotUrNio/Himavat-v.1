import { useEffect, useRef } from 'react';
import { useQuality } from '../lib/qualityContext';

interface DescentCanvasProps {
  progressRef: React.MutableRefObject<number>;
  velocityRef: React.MutableRefObject<number>;
}

const QUAD_VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform float uFlowPhase;
uniform float uProgress;
uniform float uSmoothVel;
uniform vec2 uResolution;
uniform float uOctaves;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    if (float(i) >= uOctaves) break;
    v += a * noise(p);
    p = rot * p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(1.0, uResolution.y);
  vec2 aspUv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);

  float glacierMix = smoothstep(0.06, 0.22, uProgress) * (1.0 - smoothstep(0.32, 0.48, uProgress));
  float waterfallZone = smoothstep(0.24, 0.40, uProgress) * (1.0 - smoothstep(0.56, 0.72, uProgress));
  float forestZone = smoothstep(0.58, 0.70, uProgress) * (1.0 - smoothstep(0.82, 0.92, uProgress));
  float campZone = smoothstep(0.76, 0.90, uProgress);

  float mistA = fbm(vec2(aspUv.x * 2.2 - uTime * 0.032, uv.y * 2.6 + uProgress * 1.4));
  float mist = smoothstep(0.35, 0.80, mistA * 0.8 + noise(vec2(aspUv.x * 4.2 + uTime * 0.025, uv.y * 4.4)) * 0.25);

  vec3 dawnCol = vec3(0.87, 0.48, 0.26);
  vec3 glacierCol = vec3(0.35, 0.70, 0.77);
  vec3 forestCol = vec3(0.44, 0.66, 0.49);
  vec3 campCol = vec3(0.89, 0.61, 0.31);

  vec3 mistColor = mix(dawnCol * 0.55, glacierCol * 0.7, smoothstep(0.04, 0.32, uProgress));
  mistColor = mix(mistColor, forestCol * 0.6, smoothstep(0.52, 0.74, uProgress));
  mistColor = mix(mistColor, campCol * 0.5, campZone);

  float mistAlpha = mist * (0.14 + glacierMix * 0.14 + waterfallZone * 0.16);

  float waterOpacity = 0.0;
  vec3 waterTone = vec3(0.0);
  if (waterfallZone > 0.004) {
    float cascadeCenter = 0.5 + 0.03 * sin(uv.y * 5.0 - uFlowPhase * 0.9);
    float distToCore = abs(uv.x - cascadeCenter);
    float coreMask = exp(-distToCore * distToCore * 38.0);
    float veilMask = exp(-distToCore * distToCore * 9.5);

    vec2 fallUv = vec2(aspUv.x * 7.5, uv.y * 3.2 + uFlowPhase * 1.55);
    float warp = noise(fallUv * 1.4) * 0.42;
    float ribbons = fbm(fallUv + vec2(warp, 0.0));
    float streaks = smoothstep(0.34, 0.78, ribbons);

    float basePlume = smoothstep(0.48, 0.02, uv.y);
    float splashNoise = fbm(vec2(aspUv.x * 5.0, uv.y * 5.5 - uFlowPhase * 1.1));
    float splashFoam = basePlume * veilMask * smoothstep(0.32, 0.76, splashNoise) * (0.75 + uSmoothVel * 0.65);

    waterOpacity = waterfallZone * (coreMask * streaks * 0.54 + splashFoam * 0.46);
    waterTone = mix(vec3(0.45, 0.78, 0.85), vec3(0.92, 0.97, 0.99), streaks * coreMask + splashFoam * 0.6);
  }

  float rayDiag = (uv.x * 0.9 + (1.0 - uv.y) * 0.55);
  float rayNoise = noise(vec2(rayDiag * 11.0 + uTime * 0.05, 1.3));
  float sunShafts = forestZone * smoothstep(0.48, 0.88, rayNoise) * (1.0 - uv.y * 0.7) * 0.15;

  float hearthDist = length(vec2((uv.x - 0.5) * aspect, uv.y - 0.22));
  float hearthGlow = campZone * exp(-hearthDist * 3.8) * 0.22;

  vec3 outRgb = mistColor * mistAlpha + waterTone * waterOpacity + vec3(0.84, 0.89, 0.66) * sunShafts + campCol * hearthGlow;
  float outAlpha = clamp(mistAlpha + waterOpacity + sunShafts + hearthGlow, 0.0, 0.78);

  gl_FragColor = vec4(outRgb, outAlpha);
}
`;

const PARTICLE_VERTEX = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uFlowPhase;
uniform float uProgress;
uniform float uSmoothVel;
uniform float uPixelRatio;

varying float vAlpha;
varying vec3 vColor;

void main() {
  float x0 = aSeed.x;
  float y0 = aSeed.y;
  float spd = aSeed.z;
  float phase = aSeed.w;

  float snowW = 1.0 - smoothstep(0.18, 0.34, uProgress);
  float splashW = smoothstep(0.22, 0.36, uProgress) * (1.0 - smoothstep(0.58, 0.72, uProgress));
  float emberW = smoothstep(0.78, 0.90, uProgress);

  float t = uTime * (0.28 + spd * 0.42) + phase * 6.2831;

  vec2 snowPos = vec2(
    mod(x0 + sin(t * 0.7 + phase * 5.0) * 0.07 + t * 0.04, 1.0) * 2.0 - 1.0,
    1.0 - mod(y0 + t * 0.28, 1.0) * 2.0
  );

  float splashLife = mod(uFlowPhase * (0.55 + spd * 0.6) + phase, 1.0);
  float spraySpread = (x0 - 0.5) * (0.24 + uSmoothVel * 0.28 + splashLife * 0.52);
  vec2 splashPos = vec2(
    spraySpread * 2.0,
    -0.55 + (sin(splashLife * 3.14159) * (0.28 + uSmoothVel * 0.16) - splashLife * 0.18)
  );

  vec2 risePos = vec2(
    (x0 - 0.5) * 1.85 + sin(t * 1.1 + phase * 8.0) * 0.08,
    -1.0 + mod(y0 + t * 0.24, 1.0) * 2.0
  );

  vec2 finalPos = mix(snowPos, splashPos, splashW);
  finalPos = mix(finalPos, risePos, smoothstep(0.62, 0.76, uProgress));

  vec3 snowCol = vec3(0.93, 0.96, 0.98);
  vec3 waterCol = vec3(0.65, 0.89, 0.94);
  vec3 pollenCol = vec3(0.68, 0.84, 0.62);
  vec3 emberCol = vec3(0.95, 0.62, 0.28);

  vec3 c = mix(snowCol, waterCol, splashW);
  c = mix(c, pollenCol, smoothstep(0.62, 0.75, uProgress));
  c = mix(c, emberCol, emberW);

  vColor = c;
  float splashFade = mix(1.0, sin(splashLife * 3.14159), splashW);
  vAlpha = (0.35 + spd * 0.45) * splashFade * (0.85 + 0.15 * snowW);

  gl_Position = vec4(finalPos, 0.0, 1.0);
  gl_PointSize = (2.2 + spd * 3.2 + splashW * uSmoothVel * 2.2) * uPixelRatio;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float mask = smoothstep(0.5, 0.08, d);
  if (mask <= 0.01) discard;
  gl_FragColor = vec4(vColor, mask * vAlpha);
}
`;

export function DescentCanvas({ progressRef, velocityRef }: DescentCanvasProps) {
  const { webglAllowed, tier } = useQuality();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!webglAllowed) return;
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const boot = async () => {
      const { Geometry, Mesh, Program, Renderer, Triangle } = await import('ogl');
      if (disposed || !hostRef.current) return;

      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.0 : 0.75);
      const renderer = new Renderer({
        dpr,
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
      });
      const { gl } = renderer;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.display = 'block';
      host.appendChild(gl.canvas);

      const uniforms = {
        uTime: { value: 0 },
        uFlowPhase: { value: 0 },
        uProgress: { value: 0 },
        uSmoothVel: { value: 0 },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uOctaves: { value: tier === 'high' ? 3.0 : 2.0 },
      };

      const quadGeo = new Triangle(gl);
      const quadProg = new Program(gl, {
        vertex: QUAD_VERTEX,
        fragment: ATMOSPHERE_FRAGMENT,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const quadMesh = new Mesh(gl, { geometry: quadGeo, program: quadProg });

      const particleCount = tier === 'high' ? 210 : 105;
      const seeds = new Float32Array(particleCount * 4);
      for (let i = 0; i < particleCount; i++) {
        seeds[i * 4 + 0] = Math.random();
        seeds[i * 4 + 1] = Math.random();
        seeds[i * 4 + 2] = Math.random();
        seeds[i * 4 + 3] = Math.random();
      }
      const pGeo = new Geometry(gl, { aSeed: { size: 4, data: seeds } });
      const pProg = new Program(gl, {
        vertex: PARTICLE_VERTEX,
        fragment: PARTICLE_FRAGMENT,
        uniforms: {
          uTime: uniforms.uTime,
          uFlowPhase: uniforms.uFlowPhase,
          uProgress: uniforms.uProgress,
          uSmoothVel: uniforms.uSmoothVel,
          uPixelRatio: { value: dpr },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const particleMesh = new Mesh(gl, {
        mode: gl.POINTS,
        geometry: pGeo,
        program: pProg,
      });

      const handleResize = () => {
        const w = host.clientWidth || window.innerWidth;
        const h = host.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
        uniforms.uResolution.value = [w * dpr, h * dpr];
      };
      handleResize();
      window.addEventListener('resize', handleResize, { passive: true });

      let isVisible = true;
      let isTabVisible = document.visibilityState !== 'hidden';
      const io = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((e) => e.isIntersecting);
        },
        { threshold: 0.01 },
      );
      io.observe(host);

      const onVisChange = () => {
        isTabVisible = document.visibilityState !== 'hidden';
      };
      document.addEventListener('visibilitychange', onVisChange);

      let rafId = 0;
      let lastTime = performance.now();
      let smoothVel = 0;
      let elapsed = 0;
      let flowPhase = 0;

      const frame = (now: number) => {
        rafId = requestAnimationFrame(frame);
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        if (!isVisible || !isTabVisible) return;

        const rawVel = Math.min(2.6, Math.abs(velocityRef.current) * 0.018);
        smoothVel += (rawVel - smoothVel) * 0.1;

        elapsed += dt;
        flowPhase += dt * (0.48 + smoothVel * 1.15);

        uniforms.uTime.value = elapsed;
        uniforms.uFlowPhase.value = flowPhase;
        uniforms.uProgress.value = progressRef.current;
        uniforms.uSmoothVel.value = smoothVel;

        gl.clear(gl.COLOR_BUFFER_BIT);
        renderer.render({ scene: quadMesh });
        renderer.render({ scene: particleMesh, clear: false });
      };

      rafId = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisChange);
        window.removeEventListener('resize', handleResize);
        if (gl.canvas.parentNode === host) {
          host.removeChild(gl.canvas);
        }
        gl.getExtension('WEBGL_LOST_CONTEXT')?.loseContext();
      };
    };

    const timer = window.setTimeout(() => void boot(), 160);

    return () => {
      disposed = true;
      clearTimeout(timer);
      cleanup?.();
    };
  }, [webglAllowed, tier, progressRef, velocityRef]);

  if (!webglAllowed) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  );
}
