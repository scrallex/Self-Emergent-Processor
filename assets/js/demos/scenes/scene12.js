// Scene 12: Unified Meta-Visualization - All Systems Working Together

export default class Scene12 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.time = 0;
        this.particleCount = 100;
        this.particles = [];
    }

    init() {
        this.initializeParticles();
        return Promise.resolve();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    update() {
        // Update particle positions
        this.particles.forEach(particle => {
            particle.x += particle.vx * this.settings.speed;
            particle.y += particle.vy * this.settings.speed;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }

    draw() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Central rotating shape (fractal?)
        this.drawRotatingShape(this.canvas.width / 2, this.canvas.height / 2, 100 + Math.sin(this.time * 0.1) * 50);

        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }

    drawRotatingShape(x, y, size) {
        const angle = this.time * 0.05;
        const numPoints = 6;

        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = 0; i < numPoints; i++) {
            const angleOffset = (i / numPoints) * Math.PI * 2 + angle;
            const px = x + Math.cos(angleOffset) * size;
            const py = y + Math.sin(angleOffset) * size;
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }

        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 120);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Full System Visualization', 30, 45);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('All