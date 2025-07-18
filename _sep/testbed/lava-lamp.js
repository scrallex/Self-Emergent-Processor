export default class LavaLamp {
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
    this.width = this.canvas.width;
    this.height = this.canvas.height;
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

  cleanup() {
    this.blobs = [];
  }
}
