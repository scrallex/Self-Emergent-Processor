/**
 * Scene 10: Particle Fluid Simulation
 *
 * Particle-based fluid demonstration showing vorticity colouring
 * and boundary induced rotation.
 */
export default class Scene10 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.particles = [];
        this.numParticles = 300;
        this.radius = this.settings.size || 3;
        this.boundaryPadding = 10;
        this.mouse = { x: 0, y: 0, down: false };
        this.animation = true;

        // Timing values for update loop
        this.time = 0;
        this.lastTime = 0;

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    init() {
        this.initParticles();
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        return Promise.resolve();
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0,
                vort: 0
            });
        }
    }

    handleMouseDown(e) {
        this.mouse.down = true;
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    handleMouseUp() {
        this.mouse.down = false;
    }

    handleMouseMove(e) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.time = timestamp;
        this.update(delta * (this.settings.speed || 1));
        this.draw();
    }

    update(delta) {
        if (!this.animation) return;
        const dt = delta * 0.001;
        for (const p of this.particles) {
            // Interaction with mouse drag - swirl particles
            if (this.mouse.down) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist2 = dx * dx + dy * dy;
                const r2 = 80 * 80;
                if (dist2 < r2 && dist2 > 0) {
                    const dist = Math.sqrt(dist2);
                    const force = (1 - dist / 80) * 50;
                    p.vx += (-dy / dist) * force * dt;
                    p.vy += (dx / dist) * force * dt;
                }
            }

            // Boundary rotation
            if (p.x < this.boundaryPadding) {
                p.vx = Math.abs(p.vx);
                p.vy += 0.2;
            } else if (p.x > this.canvas.width - this.boundaryPadding) {
                p.vx = -Math.abs(p.vx);
                p.vy -= 0.2;
            }
            if (p.y < this.boundaryPadding) {
                p.vy = Math.abs(p.vy);
                p.vx -= 0.2;
            } else if (p.y > this.canvas.height - this.boundaryPadding) {
                p.vy = -Math.abs(p.vy);
                p.vx += 0.2;
            }
        }

        // Neighbor interactions and integration
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            let vort = 0;
            let count = 0;
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                const q = this.particles[j];
                const dx = q.x - p.x;
                const dy = q.y - p.y;
                const dist2 = dx * dx + dy * dy;
                if (dist2 < 900 && dist2 > 0) {
                    const dvx = q.vx - p.vx;
                    const dvy = q.vy - p.vy;
                    vort += dx * dvy - dy * dvx;
                    p.vx += dx * 0.0005;
                    p.vy += dy * 0.0005;
                    count++;
                }
            }
            p.vort = count ? vort / count : 0;
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
        }
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const p of this.particles) {
            const hue = 200 + Math.max(-50, Math.min(50, p.vort)) * 2;
            this.ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (newSettings.size !== undefined) {
            this.radius = newSettings.size;
        }
    }

    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.particles = [];
    }
}
