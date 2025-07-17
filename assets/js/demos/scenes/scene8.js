/**
 * Scene 8: Multi-Perspective Coherence - Flocking Simulation
 *
 * Implements a boids-style flocking system with cosine-based alignment and
 * obtuse-angle dispersion. Birds attempt to align with neighbors when the
 * angle between their headings is acute (cosine positive) and disperse when
 * the angle becomes obtuse (cosine negative).
 */
export default class Scene8 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.boids = [];
        this.time = 0;
        this.lastTime = 0;

        // parameters
        this.neighborRadius = 50;
        this.separationDist = 20;
        this.maxSpeed = 2;
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createFlock(50);
        return Promise.resolve();
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    createFlock(count) {
        this.boids = [];
        for (let i = 0; i < count; i++) {
            this.boids.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.maxSpeed,
                vy: (Math.random() - 0.5) * this.maxSpeed
            });
        }
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.time = timestamp;

        this.update(dt * (this.settings.speed || 1));
        this.draw();
    }

    update(dt) {
        const boids = this.boids;
        for (let b of boids) {
            let ax = 0, ay = 0;
            let count = 0;
            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;
            let sepX = 0, sepY = 0;

            for (let other of boids) {
                if (other === b) continue;
                const dx = other.x - b.x;
                const dy = other.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < this.neighborRadius) {
                    count++;
                    const ovMag = Math.hypot(other.vx, other.vy) || 1;
                    const bvMag = Math.hypot(b.vx, b.vy) || 1;
                    const cos = (b.vx * other.vx + b.vy * other.vy) / (bvMag * ovMag);
                    alignX += (other.vx / ovMag) * cos;
                    alignY += (other.vy / ovMag) * cos;
                    cohX += other.x;
                    cohY += other.y;
                    if (cos < 0 || dist < this.separationDist) {
                        const repulse = -cos || 1;
                        sepX -= dx * repulse / dist;
                        sepY -= dy * repulse / dist;
                    }
                }
            }

            if (count > 0) {
                alignX /= count;
                alignY /= count;
                cohX = cohX / count - b.x;
                cohY = cohY / count - b.y;

                ax += alignX * 0.05;
                ay += alignY * 0.05;
                ax += cohX * 0.001;
                ay += cohY * 0.001;
                ax += sepX * 0.05;
                ay += sepY * 0.05;
            }

            b.vx += ax;
            b.vy += ay;

            const speed = Math.hypot(b.vx, b.vy);
            if (speed > this.maxSpeed) {
                b.vx = (b.vx / speed) * this.maxSpeed;
                b.vy = (b.vy / speed) * this.maxSpeed;
            }

            b.x += b.vx * dt * 60;
            b.y += b.vy * dt * 60;

            if (b.x < 0) b.x += this.width;
            if (b.x > this.width) b.x -= this.width;
            if (b.y < 0) b.y += this.height;
            if (b.y > this.height) b.y -= this.height;
        }
    }

    draw() {
        const { ctx, width, height } = this;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00ff88';
        for (const b of this.boids) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 220, 60);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Flocking Coherence', 20, 35);
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Boids: ${this.boids.length}`, 20, 55);
    }

    drawVideoInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Flocking Coherence', this.canvas.width - 20, 30);
        this.ctx.textAlign = 'left';
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        if (newSettings.intensity !== undefined) {
            const count = Math.floor(10 + newSettings.intensity);
            if (count !== this.boids.length) {
                this.createFlock(count);
            }
        }
    }

    cleanup() {
        window.removeEventListener('resize', this.resize);
        this.boids = [];
    }
}

