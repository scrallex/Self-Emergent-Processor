// Scene 3: Complex Boundaries

export default class Scene3 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.balls = [];
      this.lastTime = 0;
      this.impactInfo = { cosine: 0, transfer: 0, time: 0 };
        
      this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    init() {
      this.canvas.addEventListener('click', this.handleMouseClick);
      this.reset();
        return Promise.resolve();
    }

  handleMouseClick() {
    this.reset();
  }

  reset() {
    const impactAngle = this.settings.intensity * 1.8; // Map 0-100 to 0-180 degrees
    const rad = impactAngle * Math.PI / 180;
    const radius = 20;

      this.balls = [
        { x: this.canvas.width * 0.25, y: this.canvas.height * 0.5, vx: 200 * Math.cos(rad), vy: 200 * Math.sin(rad), r: radius, color: '#00d4ff' },
        { x: this.canvas.width * 0.75, y: this.canvas.height * 0.5, vx: 0, vy: 0, r: radius, color: '#7c3aed' }
        ];
      this.lastTime = 0;
    }

    animate(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;

      this.update(deltaTime * this.settings.speed);
      this.draw();
    }

  update(dt) {
    // Move balls
    this.balls.forEach(ball => {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
    });

      // Wall collisions form boundaries
      this.balls.forEach(ball => {
        if (ball.x - ball.r < 0) { ball.vx *= -1; ball.x = ball.r; }
        if (ball.x + ball.r > this.canvas.width) { ball.vx *= -1; ball.x = this.canvas.width - ball.r; }
        if (ball.y - ball.r < 0) { ball.vy *= -1; ball.y = ball.r; }
        if (ball.y + ball.r > this.canvas.height) { ball.vy *= -1; ball.y = this.canvas.height - ball.r; }
      });

      // Ball-ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
              const b1 = this.balls[i];
              const b2 = this.balls[j];

              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < b1.r + b2.r) {
                // Collision normal
                const nx = dx / dist;
                const ny = dy / dist;

                  // Relative velocity
                  const dvx = b2.vx - b1.vx;
                  const dvy = b2.vy - b1.vy;
                    
                  // Impulse if moving towards each other
                  const impulse = dvx * nx + dvy * ny;
                  if (impulse > 0) continue;

                  // Apply impulse (elastic collision)
                  b1.vx += impulse * nx;
                  b1.vy += impulse * ny;
                  b2.vx -= impulse * nx;
                  b2.vy -= impulse * ny;

                  // Store impact info
                  this.impactInfo = {
                    cosine: Math.abs(nx), // cosine alignment
                    transfer: Math.abs(nx) * 100, // %
                    time: performance.now()
                  };

                  // Prevent sticking
                  const overlap = (b1.r + b2.r - dist) / 2;
                  b1.x -= overlap * nx;
                  b1.y -= overlap * ny;
                  b2.x += overlap * nx;
                  b2.y += overlap * ny;
                }
            }
        }
    }

  draw() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw balls
      this.balls.forEach(ball => {
        this.ctx.beginPath();
          this.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
          this.ctx.fillStyle = ball.color;
            this.ctx.fill();
        });

      if (!this.settings.videoMode) {
        this.drawInfo();
        }
    }

    drawInfo() {
      const now = performance.now();
      const age = (now - this.impactInfo.time) / 1000;
      const opacity = Math.max(0, 1 - age * 2);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(10, 10, 280, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText('Complex Boundaries', 20, 35);
        
        this.ctx.font = '14px Arial';
      this.ctx.fillStyle = `rgba(204, 204, 204, ${opacity})`;
      this.ctx.fillText(`Last Impact Cosine: ${this.impactInfo.cosine.toFixed(3)}`, 20, 60);
      this.ctx.fillText(`Energy Transfer: ${this.impactInfo.transfer.toFixed(1)}%`, 20, 80);
      this.ctx.fillText('Click to reset with new angle', 20, 100);
    }

  updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
      // The intensity setting will be used on the next reset.
    }

    cleanup() {
      this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}