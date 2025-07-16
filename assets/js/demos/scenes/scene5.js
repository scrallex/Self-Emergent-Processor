// Scene 5: Information Pressure Dynamics

export default class Scene5 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

      this.bodies = [];
      this.G = 0.5;
      this.showTrails = true;
      this.lastTime = 0;
        
      this.handleClick = this.handleClick.bind(this);
      this.lastClickTime = 0;
    }

    init() {
      this.canvas.addEventListener('click', this.handleClick);
      this.reset();
        return Promise.resolve();
    }

  handleClick() {
    const now = performance.now();
    if (now - this.lastClickTime < 300) { // Double click
      this.reset();
    } else { // Single click
      this.showTrails = !this.showTrails;
      if (!this.showTrails) { // Clear trails when toggling off
        this.bodies.forEach(b => b.trail = []);
      }
        }
    this.lastClickTime = now;
    }
    
  reset() {
    this.bodies = [
      { x: this.canvas.width * 0.4, y: this.canvas.height / 2, vx: 0, vy: -50, m: 20, color: '#ff4444', trail: [] },
      { x: this.canvas.width * 0.6, y: this.canvas.height / 2, vx: 0, vy: 50, m: 20, color: '#00d4ff', trail: [] },
      { x: this.canvas.width / 2, y: this.canvas.height * 0.4, vx: 50, vy: 0, m: 20, color: '#00ff88', trail: [] }
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
    if (dt <= 0) return;

    // Calculate forces (information pressure)
    for (const body of this.bodies) {
      let fx = 0, fy = 0;
      for (const other of this.bodies) {
        if (body === other) continue;
                
          const dx = other.x - body.x;
          const dy = other.y - body.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < 100) continue; // Avoid singularity
          const r = Math.sqrt(r2);
          const force = this.G * body.m * other.m / r2;
                
        fx += force * dx / r;
        fy += force * dy / r;
      }
      body.ax = fx / body.m;
      body.ay = fy / body.m;
    }

    // Update velocities and positions
    for (const body of this.bodies) {
      body.vx += body.ax * dt;
      body.vy += body.ay * dt;
      body.x += body.vx * dt;
      body.y += body.vy * dt;

        // Add to trail
        if (this.showTrails) {
          body.trail.push({ x: body.x, y: body.y });
          if (body.trail.length > 200 / this.settings.speed) body.trail.shift();
            }

        // Boundary (simple wrap around)
        if (body.x < -body.m) body.x = this.canvas.width + body.m;
        if (body.x > this.canvas.width + body.m) body.x = -body.m;
        if (body.y < -body.m) body.y = this.canvas.height + body.m;
        if (body.y > this.canvas.height + body.m) body.y = -body.m;
        }
    }

    draw() {
      this.ctx.fillStyle = `rgba(10, 10, 10, ${this.showTrails ? 0.1 : 1.0})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw trails
      if (this.showTrails) {
        this.bodies.forEach(body => {
          this.ctx.strokeStyle = body.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          if (body.trail.length > 0) {
            this.ctx.moveTo(body.trail[0].x, body.trail[0].y);
            for (let i = 1; i < body.trail.length; i++) {
              this.ctx.lineTo(body.trail[i].x, body.trail[i].y);
            }
          }
          this.ctx.stroke();
        });
      }
        
      // Draw bodies
      this.bodies.forEach(body => {
            this.ctx.beginPath();
        this.ctx.arc(body.x, body.y, body.m / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = body.color;
            this.ctx.fill();
      });

      if (!this.settings.videoMode) {
        this.drawInfo();
        }
    }

  drawInfo() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 300, 100);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Information Pressure Dynamics', 20, 35);
        
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText(`Gravitational Constant (G): ${this.G.toFixed(2)}`, 20, 60);
    this.ctx.fillText(`Click to toggle trails`, 20, 80);
    this.ctx.fillText(`Double-click to reset`, 20, 100);
    }
    
    updateSettings(newSettings) {
      if (newSettings.intensity !== undefined) {
        // Map intensity 0-100 to G 0-2.0
        this.G = (newSettings.intensity / 50.0);
      }
      Object.assign(this.settings, newSettings);
    }

    cleanup() {
      this.canvas.removeEventListener('click', this.handleClick);
    }
}