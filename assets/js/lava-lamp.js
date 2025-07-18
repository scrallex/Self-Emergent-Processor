class GravityLamp {
    constructor(canvas, ctx, options = {}) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.options = Object.assign({
            particleCount: 150,
            maxSpeed: 1.2,
            neighborRadius: 80,
            separationDist: 20,
            cooldown: 60000, // 60 seconds
            gridSize: 100
        }, options);

        this.particles = [];
        this.hueOffset = 0;
        this.width = canvas.width;
        this.height = canvas.height;
        this.lastTime = 0;
        this.time = 0;

        this.nuclearEvent = {
            triggered: false,
            x: 0,
            y: 0,
            radius: 0,
            alpha: 0,
            maxRadius: Math.max(this.width, this.height)
        };
        
        this.lastResetTime = 0;
        this.themeManager = new ThemeManager();
        this.grid = new SpatialGrid(this.width, this.height, this.options.gridSize);
    }

    init() {
        this.resize();
        this.createParticles();
        this.lastResetTime = performance.now();
        this.themeManager.init();
        return Promise.resolve();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.nuclearEvent.maxRadius = Math.max(this.width, this.height);
        this.grid.resize(this.width, this.height);
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.options.maxSpeed,
                vy: (Math.random() - 0.5) * this.options.maxSpeed,
                r: 3 + Math.random() * 4,
                mass: 1,
                trail: [],
                coalescence: 0
            });
        }
    }

    animate(ts) {
        if (!this.lastTime) this.lastTime = ts;
        const dt = ts - this.lastTime;
        this.time = ts;
        this.lastTime = ts;
        
        this.update(dt);
        this.draw();
    }

    update(dt) {
        if (this.nuclearEvent.triggered) {
            this.nuclearEvent.radius += dt * 2.5;
            this.nuclearEvent.alpha = Math.max(0, 1 - this.nuclearEvent.radius / this.nuclearEvent.maxRadius);
            if (this.nuclearEvent.radius > this.nuclearEvent.maxRadius) {
                this.nuclearEvent.triggered = false;
                this.createParticles();
                this.lastResetTime = this.time;
                this.themeManager.resume();
            }
            return;
        }

        const now = this.time;
        if (now - this.lastResetTime > this.options.cooldown) {
            this.triggerNuclearEvent(this.width / 2, this.height / 2);
        }

        this.grid.clear();
        for (const p of this.particles) {
            this.grid.insert(p);
        }

        let coalescedCount = 0;
        let centerX = 0, centerY = 0;

        for (const p of this.particles) {
            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;
            let sepX = 0, sepY = 0;
            let neighborCount = 0;

            const neighbors = this.grid.getNeighbors(p, this.options.neighborRadius);
            for (const other of neighbors) {
                if (p === other) continue;

                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.options.neighborRadius) {
                    neighborCount++;
                    alignX += other.vx;
                    alignY += other.vy;
                    cohX += other.x;
                    cohY += other.y;

                    if (dist < this.options.separationDist) {
                        const force = (this.options.separationDist - dist) / this.options.separationDist;
                        sepX -= dx * force * 0.1;
                        sepY -= dy * force * 0.1;
                    }
                }
            }
            
            p.coalescence = neighborCount / (this.options.particleCount * 0.3);


            if (neighborCount > 0) {
                alignX /= neighborCount;
                alignY /= neighborCount;
                cohX = cohX / neighborCount - p.x;
                cohY = cohY / neighborCount - p.y;

                p.vx += alignX * 0.02 + cohX * 0.0005 + sepX * 0.05;
                p.vy += alignY * 0.02 + cohY * 0.0005 + sepY * 0.05;
            }

            const speed = Math.hypot(p.vx, p.vy);
            if (speed > this.options.maxSpeed) {
                p.vx = (p.vx / speed) * this.options.maxSpeed;
                p.vy = (p.vy / speed) * this.options.maxSpeed;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -p.r) p.x = this.width + p.r;
            if (p.x > this.width + p.r) p.x = -p.r;
            if (p.y < -p.r) p.y = this.height + p.r;
            if (p.y > this.height + p.r) p.y = -p.r;

            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 15) {
                p.trail.shift();
            }

            if (neighborCount > this.options.particleCount * 0.4) {
                coalescedCount++;
                centerX += p.x;
                centerY += p.y;
            }
        }

        if (coalescedCount > this.options.particleCount * 0.6) {
            this.triggerNuclearEvent(centerX / coalescedCount, centerY / coalescedCount);
        }
    }

    triggerNuclearEvent(x, y) {
        this.nuclearEvent.triggered = true;
        this.nuclearEvent.x = x;
        this.nuclearEvent.y = y;
        this.nuclearEvent.radius = 0;
        this.nuclearEvent.alpha = 1;
        this.themeManager.pause();
    }

    draw() {
        const ctx = this.ctx;
        const elapsedTime = this.time - this.lastResetTime;
        const darkness = Math.min(1, elapsedTime / this.options.cooldown);
        const bgColor = `hsl(0, 0%, ${100 - darkness * 95}%)`;
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, this.width, this.height);

        if (this.nuclearEvent.triggered) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.nuclearEvent.alpha})`;
            ctx.beginPath();
            ctx.arc(this.nuclearEvent.x, this.nuclearEvent.y, this.nuclearEvent.radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        for (const p of this.particles) {
            const neighbors = this.grid.getNeighbors(p, this.options.neighborRadius);
            for (const other of neighbors) {
                if (p === other) continue;
                const dist = Math.hypot(other.x - p.x, other.y - p.y);
                if (dist < this.options.neighborRadius) {
                    ctx.strokeStyle = `rgba(128, 128, 128, ${0.3 * (1 - dist / this.options.neighborRadius)})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        }

        for (const p of this.particles) {
            const particleDarkness = 1 - darkness;
            const particleColor = `hsl(0, 0%, ${particleDarkness * 100}%)`;

            ctx.strokeStyle = `rgba(${particleDarkness * 255}, ${particleDarkness * 255}, ${particleDarkness * 255}, 0.1)`;
            ctx.beginPath();
            ctx.moveTo(p.trail[0]?.x, p.trail[0]?.y);
            for (const point of p.trail) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();

            ctx.fillStyle = particleColor;
            if (p.coalescence > 0.5) {
                ctx.fillStyle = `hsl(0, 100%, ${50 + p.coalescence * 50}%)`;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.grid.push([]);
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.clear();
    }

    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }

    insert(particle) {
        const x = Math.floor(particle.x / this.cellSize);
        const y = Math.floor(particle.y / this.cellSize);
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[y * this.cols + x].push(particle);
        }
    }

    getNeighbors(particle, radius) {
        const neighbors = [];
        const x = Math.floor(particle.x / this.cellSize);
        const y = Math.floor(particle.y / this.cellSize);
        const searchRadius = Math.ceil(radius / this.cellSize);

        for (let i = -searchRadius; i <= searchRadius; i++) {
            for (let j = -searchRadius; j <= searchRadius; j++) {
                const cellX = x + j;
                const cellY = y + i;
                if (cellX >= 0 && cellX < this.cols && cellY >= 0 && cellY < this.rows) {
                    const cell = this.grid[cellY * this.cols + cellX];
                    for (const other of cell) {
                        neighbors.push(other);
                    }
                }
            }
        }
        return neighbors;
    }
}

class ThemeManager {
    constructor() {
        this.palettes = {
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
        this.isLight = true;
        this.root = document.documentElement;
        this.intervalId = null;
        this.paused = false;
    }

    init() {
        this.applyTheme(this.palettes.light);
        this.intervalId = setInterval(() => {
            if (!this.paused) {
                this.transitionTheme();
            }
        }, 15000);
        setTimeout(() => {
            if (!this.paused) {
                this.transitionTheme();
            }
        }, 1000);
    }

    applyTheme(theme) {
        for (const [key, value] of Object.entries(theme)) {
            this.root.style.setProperty(key, value);
        }
        document.querySelector('nav').style.background = theme['nav-bg'];
        document.querySelector('nav').style.borderColor = theme['border'];
        document.querySelectorAll('.tech-card').forEach(card => {
            card.style.background = theme['card-bg'];
            card.style.borderColor = theme['border'];
            card.style.boxShadow = theme['card-shadow'];
        });
        document.querySelector('footer').style.borderColor = theme['border'];
    }

    transitionTheme() {
        const nextTheme = this.isLight ? this.palettes.dark : this.palettes.light;
        document.body.style.transition = 'background-color 5s ease-in-out, color 5s ease-in-out';
        this.root.style.setProperty('--dark', nextTheme['--dark']);
        this.root.style.setProperty('--light', nextTheme['--light']);
        this.root.style.setProperty('--gray', nextTheme['--gray']);
        setTimeout(() => {
            this.applyTheme(nextTheme);
            document.body.style.transition = '';
        }, 5000);
        this.isLight = !this.isLight;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
}

(function () {
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
    const lamp = new GravityLamp(canvas, ctx, { particleCount: 150 });
    lamp.init();
    window.addEventListener('resize', () => lamp.resize());

    function loop(ts) {
        lamp.animate(ts);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
