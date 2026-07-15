/* Scanning-grid WebGL background for the "Get In Touch" section.
   Vanilla port of the React Bits <GridScan /> component (JS + CSS variant).
   Instead of three.js + postprocessing + face-api.js, this renders the same
   fragment shader on a fullscreen triangle with ogl (the library the hero
   particles already use), loaded as an ES module from jsDelivr — no build
   step. Webcam/gyro tracking and the postprocessing pass are omitted; the
   scan glow, aura and film grain live in the shader itself. */

(async function () {
  const container = document.getElementById("gridscan-contact");
  if (!container) return;

  const config = {
    sensitivity: 0.55,
    lineThickness: 1,
    linesColor: "#2f4a41",
    scanColor: "#1DCD9F",
    scanOpacity: 0.35,
    gridScale: 0.1,
    lineStyle: 0, // 0 solid, 1 dashed, 2 dotted
    lineJitter: 0.1,
    scanDirection: 2, // 0 forward, 1 backward, 2 pingpong
    bloomIntensity: 0.6,
    noiseIntensity: 0.01,
    scanGlow: 0.5,
    scanSoftness: 2,
    scanPhaseTaper: 0.9,
    scanDuration: 2.0,
    scanDelay: 2.0,
    snapBackDelay: 250
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const vert = /* glsl */ `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  // FW() resolves to fwidth() where derivatives exist (any real browser);
  // otherwise to wpx, an analytic estimate of the pixel footprint in grid UV
  // units, so the shader still compiles and antialiases on bare WebGL1.
  const frag = /* glsl */ `
    #ifdef HAS_DERIVATIVES
      #define FW(x) fwidth(x)
    #else
      #define FW(x) wpx
    #endif
    precision highp float;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec2 uSkew;
    uniform float uTilt;
    uniform float uYaw;
    uniform float uLineThickness;
    uniform vec3 uLinesColor;
    uniform vec3 uScanColor;
    uniform float uGridScale;
    uniform float uLineStyle;
    uniform float uLineJitter;
    uniform float uScanOpacity;
    uniform float uScanDirection;
    uniform float uNoise;
    uniform float uBloomOpacity;
    uniform float uScanGlow;
    uniform float uScanSoftness;
    uniform float uPhaseTaper;
    uniform float uScanDuration;
    uniform float uScanDelay;
    varying vec2 vUv;

    uniform float uScanStarts[8];
    uniform float uScanCount;

    const int MAX_SCANS = 8;

    float smoother01(float a, float b, float x){
      float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord)
    {
        vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

        vec3 ro = vec3(0.0);
        vec3 rd = normalize(vec3(p, 2.0));

        float cR = cos(uTilt), sR = sin(uTilt);
        rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

        float cY = cos(uYaw), sY = sin(uYaw);
        rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

        vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
        rd.xy += skew * rd.z;

        vec3 color = vec3(0.0);
      float minT = 1e20;
      float gridScale = max(1e-5, uGridScale);
        float fadeStrength = 2.0;
        vec2 gridUV = vec2(0.0);

      float hitIsY = 1.0;
        for (int i = 0; i < 4; i++)
        {
            float isY = float(i < 2);
            float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
            float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
            float den = isY * rd.y + (1.0 - isY) * rd.x;
            float t = num / den;
            vec3 h = ro + rd * t;

            float depthBoost = smoothstep(0.0, 3.0, h.z);
            h.xy += skew * 0.15 * depthBoost;

        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
        }

        vec3 hit = ro + rd * minT;
        float dist = length(hit - ro);

      // Pixel footprint in grid-UV units for the no-derivatives fallback
      float wpx = dist * 2.4 / (iResolution.y * gridScale);

      float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
      if (jitterAmt > 0.0) {
        vec2 j = vec2(
          sin(gridUV.y * 2.7 + iTime * 1.8),
          cos(gridUV.x * 2.3 - iTime * 1.6)
        ) * (0.15 * jitterAmt);
        gridUV += j;
      }
      float fx = fract(gridUV.x);
      float fy = fract(gridUV.y);
      float ax = min(fx, 1.0 - fx);
      float ay = min(fy, 1.0 - fy);
      float wx = FW(gridUV.x);
      float wy = FW(gridUV.y);
      float halfPx = max(0.0, uLineThickness) * 0.5;

      float tx = halfPx * wx;
      float ty = halfPx * wy;

      float aax = wx;
      float aay = wy;

      float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
      float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
      if (uLineStyle > 0.5) {
        float dashRepeat = 4.0;
        float dashDuty = 0.5;
        float vy = fract(gridUV.y * dashRepeat);
        float vx = fract(gridUV.x * dashRepeat);
        float dashMaskY = step(vy, dashDuty);
        float dashMaskX = step(vx, dashDuty);
        if (uLineStyle < 1.5) {
          lineX *= dashMaskY;
          lineY *= dashMaskX;
        } else {
          float dotRepeat = 6.0;
          float dotWidth = 0.18;
          float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
          float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
          float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + FW(gridUV.y * dotRepeat), cy);
          float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + FW(gridUV.x * dotRepeat), cx);
          lineX *= dotMaskY;
          lineY *= dotMaskX;
        }
      }
      float primaryMask = max(lineX, lineY);

      vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
      if (jitterAmt > 0.0) {
        vec2 j2 = vec2(
          cos(gridUV2.y * 2.1 - iTime * 1.4),
          sin(gridUV2.x * 2.5 + iTime * 1.7)
        ) * (0.15 * jitterAmt);
        gridUV2 += j2;
      }
      float fx2 = fract(gridUV2.x);
      float fy2 = fract(gridUV2.y);
      float ax2 = min(fx2, 1.0 - fx2);
      float ay2 = min(fy2, 1.0 - fy2);
      float wx2 = FW(gridUV2.x);
      float wy2 = FW(gridUV2.y);
      float tx2 = halfPx * wx2;
      float ty2 = halfPx * wy2;
      float aax2 = wx2;
      float aay2 = wy2;
      float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
      float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
      if (uLineStyle > 0.5) {
        float dashRepeat2 = 4.0;
        float dashDuty2 = 0.5;
        float vy2m = fract(gridUV2.y * dashRepeat2);
        float vx2m = fract(gridUV2.x * dashRepeat2);
        float dashMaskY2 = step(vy2m, dashDuty2);
        float dashMaskX2 = step(vx2m, dashDuty2);
        if (uLineStyle < 1.5) {
          lineX2 *= dashMaskY2;
          lineY2 *= dashMaskX2;
        } else {
          float dotRepeat2 = 6.0;
          float dotWidth2 = 0.18;
          float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
          float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
          float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + FW(gridUV2.y * dotRepeat2), cy2);
          float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + FW(gridUV2.x * dotRepeat2), cx2);
          lineX2 *= dotMaskY2;
          lineY2 *= dotMaskX2;
        }
      }
        float altMask = max(lineX2, lineY2);

        float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
        float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
        float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
        float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
        altMask *= edgeGate;

      float lineMask = max(primaryMask, altMask);

        float fade = exp(-dist * fadeStrength);

        float dur = max(0.05, uScanDuration);
        float del = max(0.0, uScanDelay);
        float scanZMax = 2.0;
        float widthScale = max(0.1, uScanGlow);
        float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
        float sigmaA = sigma * 2.0;

        float combinedPulse = 0.0;
        float combinedAura = 0.0;

        float cycle = dur + del;
        float tCycle = mod(iTime, cycle);
        float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
        float phase = scanPhase;
        if (uScanDirection > 0.5 && uScanDirection < 1.5) {
          phase = 1.0 - phase;
        } else if (uScanDirection > 1.5) {
          float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
          phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
        }
        float scanZ = phase * scanZMax;
        float dz = abs(hit.z - scanZ);
        float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
        float taper = clamp(uPhaseTaper, 0.0, 0.49);
        float headW = taper;
        float tailW = taper;
        float headFade = smoother01(0.0, headW, phase);
        float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
        float phaseWindow = headFade * tailFade;
        float pulseBase = lineBand * phaseWindow;
        combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
        float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
        combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

        for (int i = 0; i < MAX_SCANS; i++) {
          if (float(i) >= uScanCount) break;
          float tActiveI = iTime - uScanStarts[i];
          float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
          if (uScanDirection > 0.5 && uScanDirection < 1.5) {
            phaseI = 1.0 - phaseI;
          } else if (uScanDirection > 1.5) {
            phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
          }
          float scanZI = phaseI * scanZMax;
          float dzI = abs(hit.z - scanZI);
          float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
          float headFadeI = smoother01(0.0, headW, phaseI);
          float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
          float phaseWindowI = headFadeI * tailFadeI;
          combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
          float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
          combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
        }

      float lineVis = lineMask;
      vec3 gridCol = uLinesColor * lineVis * fade;
      vec3 scanCol = uScanColor * combinedPulse;
      vec3 scanAura = uScanColor * combinedAura;

        color = gridCol + scanCol + scanAura;

      float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
      color += (n - 0.5) * uNoise;
      color = clamp(color, 0.0, 1.0);
      float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
      float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
      float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
      float halo = max(gx, gy) * fade;
      alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
      fragColor = vec4(color, alpha);
    }

    void main(){
      vec4 c;
      mainImage(c, vUv * iResolution.xy);
      gl_FragColor = c;
    }
  `;

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map(function (c) { return c + c; }).join("");
    }
    const int = parseInt(hex, 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
  }

  // Critically-damped spring smoothing (port of the component's smoothDamp)
  function smoothDamp(current, target, vel, smoothTime, dt) {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (vel.v + omega * change) * dt;
    vel.v = (vel.v - omega * temp) * exp;
    let out = target + (change + temp) * exp;
    if ((target - current) * (out - target) > 0) {
      out = target;
      vel.v = 0;
    }
    return out;
  }

  try {
    const { Renderer, Program, Mesh, Triangle } =
      await import("https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({ dpr: dpr, alpha: true, depth: false });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    // fwidth() needs ESSL 3.00 on WebGL2 (the OES extension doesn't exist
    // there), so upgrade the shaders with the same preprocessor shim
    // three.js uses. On WebGL1 the extension provides it; without either,
    // FW() falls back to the analytic wpx estimate.
    let vertFinal, fragFinal;
    if (renderer.isWebgl2) {
      vertFinal = "#version 300 es\n#define attribute in\n#define varying out\n" + vert;
      fragFinal =
        "#version 300 es\n#define HAS_DERIVATIVES 1\n#define varying in\n" +
        "layout(location = 0) out highp vec4 glFragColor;\n#define gl_FragColor glFragColor\n" +
        frag;
    } else {
      const hasDerivatives = !!gl.getExtension("OES_standard_derivatives");
      vertFinal = vert;
      fragFinal =
        (hasDerivatives
          ? "#define HAS_DERIVATIVES 1\n#extension GL_OES_standard_derivatives : enable\n"
          : "") + frag;
    }

    const s = Math.min(1, Math.max(0, config.sensitivity));
    const lerp = function (a, b, t) { return a + (b - a) * t; };
    const skewScale = lerp(0.06, 0.2, s);
    const smoothTime = lerp(0.45, 0.12, s);
    const yBoost = lerp(1.2, 1.6, s);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertFinal,
      fragment: fragFinal,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        iResolution: { value: [container.clientWidth, container.clientHeight, dpr] },
        iTime: { value: 0 },
        uSkew: { value: [0, 0] },
        uTilt: { value: 0 },
        uYaw: { value: 0 },
        uLineThickness: { value: config.lineThickness },
        uLinesColor: { value: hexToRgb(config.linesColor) },
        uScanColor: { value: hexToRgb(config.scanColor) },
        uGridScale: { value: config.gridScale },
        uLineStyle: { value: config.lineStyle },
        uLineJitter: { value: config.lineJitter },
        uScanOpacity: { value: config.scanOpacity },
        uNoise: { value: config.noiseIntensity },
        uBloomOpacity: { value: config.bloomIntensity },
        uScanGlow: { value: config.scanGlow },
        uScanSoftness: { value: config.scanSoftness },
        uPhaseTaper: { value: config.scanPhaseTaper },
        uScanDuration: { value: config.scanDuration },
        uScanDelay: { value: config.scanDelay },
        uScanDirection: { value: config.scanDirection },
        uScanStarts: { value: new Float32Array(8) },
        uScanCount: { value: 0 }
      }
    });
    const mesh = new Mesh(gl, { geometry: geometry, program: program });

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.iResolution.value = [w, h, dpr];
    }
    window.addEventListener("resize", resize, false);
    resize();

    // Static frame for reduced-motion users (grid only, scan idle)
    if (reduceMotion) {
      program.uniforms.iTime.value = 1.0;
      renderer.render({ scene: mesh });
      return;
    }

    // Mouse steers the grid perspective; recenters shortly after leaving
    const section = container.closest("section") || container;
    const lookTarget = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    const velX = { v: 0 };
    const velY = { v: 0 };
    let leaveTimer = null;

    section.addEventListener("mousemove", function (e) {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      const rect = container.getBoundingClientRect();
      lookTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      lookTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });
    section.addEventListener("mouseleave", function () {
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(function () {
        lookTarget.x = 0;
        lookTarget.y = 0;
      }, config.snapBackDelay);
    });

    // Only animate while the section is on screen
    let visible = true;
    let rafId = 0;
    let last = performance.now();

    function tick(now) {
      rafId = requestAnimationFrame(tick);
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;

      look.x = smoothDamp(look.x, lookTarget.x, velX, smoothTime, dt);
      look.y = smoothDamp(look.y, lookTarget.y, velY, smoothTime, dt);

      program.uniforms.uSkew.value[0] = look.x * skewScale;
      program.uniforms.uSkew.value[1] = -look.y * yBoost * skewScale;
      program.uniforms.iTime.value = now / 1000;

      renderer.render({ scene: mesh });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !visible) {
            visible = true;
            last = performance.now();
            rafId = requestAnimationFrame(tick);
          } else if (!entry.isIntersecting && visible) {
            visible = false;
            cancelAnimationFrame(rafId);
          }
        });
      }).observe(container);
    }

    rafId = requestAnimationFrame(tick);
  } catch (err) {
    // Section keeps its plain dark background if WebGL/CDN fails
    console.error("GridScan background failed:", err);
  }
})();
