/* Space-like WebGL particle field for the hero section.
   Vanilla port of the React Bits <Particles /> component (JS + CSS variant),
   rendered with ogl loaded as an ES module from jsDelivr — no build step.
   Falls back to the previous particles.js snowfall if WebGL/ESM fails. */

(async function () {
  const container = document.getElementById("particles-hero");
  if (!container) return;

  const config = {
    particleCount: 1000,
    particleSpread: 10,
    speed: 0.1,
    particleColors: ["#ffffff", "#ffffff", "#1DCD9F"],
    moveParticlesOnHover: true,
    particleHoverFactor: 1,
    alphaParticles: true,
    particleBaseSize: 90,
    sizeRandomness: 1,
    cameraDistance: 20,
    disableRotation: false,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fallbackToParticlesJS() {
    if (!window.particlesJS) return;
    particlesJS("particles-hero", {
      particles: {
        number: { value: 200, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        opacity: { value: 0.7, random: false },
        size: { value: 4, random: true },
        line_linked: { enable: false },
        move: { enable: true, speed: 1, direction: "bottom", out_mode: "out" }
      },
      interactivity: {
        events: { onhover: { enable: false }, onclick: { enable: false } }
      },
      retina_detect: true
    });
  }

  const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec4 random;
    attribute vec3 color;

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uSpread;
    uniform float uBaseSize;
    uniform float uSizeRandomness;

    varying vec4 vRandom;
    varying vec3 vColor;

    void main() {
      vRandom = random;
      vColor = color;

      vec3 pos = position * uSpread;
      pos.z *= 10.0;

      vec4 mPos = modelMatrix * vec4(pos, 1.0);
      float t = uTime;
      mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
      mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
      mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

      vec4 mvPos = viewMatrix * mPos;

      if (uSizeRandomness == 0.0) {
        gl_PointSize = uBaseSize;
      } else {
        gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
      }

      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uAlphaParticles;
    varying vec4 vRandom;
    varying vec3 vColor;

    void main() {
      vec2 uv = gl_PointCoord.xy;
      float d = length(uv - vec2(0.5));

      if(uAlphaParticles < 0.5) {
        if(d > 0.5) {
          discard;
        }
        gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
      } else {
        float circle = smoothstep(0.5, 0.4, d) * 0.8;
        gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
      }
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

  try {
    const { Renderer, Camera, Geometry, Program, Mesh } =
      await import("https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js");

    const renderer = new Renderer({ dpr: config.pixelRatio, depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, config.cameraDistance);

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    }
    window.addEventListener("resize", resize, false);
    resize();

    // Content sits above the particle layer, so listen on the whole hero section
    const mouse = { x: 0, y: 0 };
    if (config.moveParticlesOnHover && !reduceMotion) {
      const hero = container.closest("section") || container;
      hero.addEventListener("mousemove", function (e) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      });
    }

    const count = config.particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = config.particleColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      colors.set(hexToRgb(palette[Math.floor(Math.random() * palette.length)]), i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: config.particleSpread },
        uBaseSize: { value: config.particleBaseSize * config.pixelRatio },
        uSizeRandomness: { value: config.sizeRandomness },
        uAlphaParticles: { value: config.alphaParticles ? 1 : 0 }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    // Static frame for reduced-motion users
    if (reduceMotion) {
      program.uniforms.uTime.value = 10;
      renderer.render({ scene: particles, camera });
      return;
    }

    // Only animate while the hero is on screen
    let visible = true;
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function update(t) {
      rafId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * config.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      particles.position.x = -mouse.x * config.particleHoverFactor;
      particles.position.y = -mouse.y * config.particleHoverFactor;

      if (!config.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * config.speed;
      }

      renderer.render({ scene: particles, camera });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !visible) {
            visible = true;
            lastTime = performance.now();
            rafId = requestAnimationFrame(update);
          } else if (!entry.isIntersecting && visible) {
            visible = false;
            cancelAnimationFrame(rafId);
          }
        });
      }).observe(container);
    }

    rafId = requestAnimationFrame(update);
  } catch (err) {
    console.error("Hero WebGL particles failed, using particles.js fallback:", err);
    fallbackToParticlesJS();
  }
})();
