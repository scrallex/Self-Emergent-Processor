class LavaLamp {
  constructor(canvas, ctx, options = {}) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.options = Object.assign({ blobCount: 15 }, options);
    this.blobs = [];
    this.hueOffset = 0;
    this.width = canvas.width;
    this.height = canvas.height;
    this.lastTime = 0;
  }

  init() {
    this.resize();
    this.createBlobs();
    return Promise.resolve();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createBlobs() {
    this.blobs = [];
    for (let i = 0; i < this.options.blobCount; i++) {
      this.blobs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 60 + Math.random() * 40
      });
    }
  }

  animate(ts) {
    if (!this.lastTime) this.lastTime = ts;
    const dt = ts - this.lastTime;
    this.lastTime = ts;
    this.update(dt);
    this.draw();
  }

  update(dt) {
    for (const b of this.blobs) {
      b.x += b.vx * dt * 0.05;
      b.y += b.vy * dt * 0.05;
      if (b.x < -b.r) b.x = this.width + b.r;
      if (b.x > this.width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = this.height + b.r;
      if (b.y > this.height + b.r) b.y = -b.r;
    }
    this.hueOffset = (this.hueOffset + dt * 0.02) % 360;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.blobs.length; i++) {
      const b = this.blobs[i];
      const hue = (this.hueOffset + i * 20) % 360;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, `hsla(${hue},80%,60%,0.8)`);
      grad.addColorStop(1, `hsla(${hue},80%,60%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

(function () {
  const palettes = {
    light: {
      '--dark': '#f4f7fc',
      '--light': '#1a202c',
      '--gray': '#5a667d',
      'nav-bg': 'rgba(255, 255, 255, 0.7)',
      'border': 'rgba(0, 0, 0, 0.08)',
      'card-bg': '#ffffff',
      'card-shadow': '0 4px 6px rgba(0,0,0,0.05)'
    },
    dark: {
      '--dark': '#0a0a0a',
      '--light': '#ffffff',
      '--gray': '#888',
      'nav-bg': 'rgba(10, 10, 10, 0.8)',
      'border': 'rgba(255, 255, 255, 0.1)',
      'card-bg': 'rgba(255, 255, 255, 0.03)',
      'card-shadow': 'none'
    }
  };

  let isLight = true;
  const root = document.documentElement;

  const applyTheme = theme => {
    for (const [key, value] of Object.entries(theme)) {
      root.style.setProperty(key, value);
    }
    document.querySelector('nav').style.background = theme['nav-bg'];
    document.querySelector('nav').style.borderColor = theme['border'];
    document.querySelectorAll('.tech-card').forEach(card => {
      card.style.background = theme['card-bg'];
      card.style.borderColor = theme['border'];
      card.style.boxShadow = theme['card-shadow'];
    });
    document.querySelector('footer').style.borderColor = theme['border'];
  };

  const transitionTheme = () => {
    const nextTheme = isLight ? palettes.dark : palettes.light;
    document.body.style.transition = 'background-color 5s ease-in-out, color 5s ease-in-out';
    root.style.setProperty('--dark', nextTheme['--dark']);
    root.style.setProperty('--light', nextTheme['--light']);
    root.style.setProperty('--gray', nextTheme['--gray']);
    setTimeout(() => {
      applyTheme(nextTheme);
      document.body.style.transition = '';
    }, 5000);
    isLight = !isLight;
  };

  const canvas = document.createElement('canvas');
  canvas.id = 'lava-lamp-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const lamp = new LavaLamp(canvas, ctx, { blobCount: 20 });
  lamp.init();
  window.addEventListener('resize', () => lamp.resize());

  function loop(ts) {
    lamp.animate(ts);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  setInterval(() => {
    applyTheme(palettes.light);
    isLight = true;
    setTimeout(transitionTheme, 1000);
  }, 15000);

  applyTheme(palettes.light);
  setTimeout(transitionTheme, 1000);
})();
