// Scene 5: Information Pressure Dynamics - Emergent Patterns
export default class Scene5 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Parameters
        this.numParticles = 100;
        this.interactionRadius = 50;
        this.cohesionFactor = 0.1;
        this.alignmentFactor = 0.1;
        this.separationFactor = 0.2;
        this.boundaryStrength = 0.05;
        
        // Particles
        this.particles = [];
        this.initializeParticles();
    }
    
    init() {
        return Promise.resolve();
    }
    
    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                pressure: 0,
                interactions: 0
            });
        }
    }
    
    update(deltaTime) {
        const speed = this.settings.speed;
        
        for (const particle of this.particles) {
            let avgDx = 0;
            let avgDy = 0;
            let alignmentVx = 0;
            let alignmentVy = 0;
            let separationX = 0;
            let separationY = 0;
            let interactions = 0;
            
            for (const other of this.particles) {
                if (particle !== other) {
                    const dx = other.x - particle.x;
                    const dy = other.y - particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.interactionRadius) {
                        interactions++;
                        avgDx += dx;
                        avgDy += dy;
                        alignmentVx += other.vx;
                        alignmentVy += other.vy;
                        
                        // Separation (avoid crowding)
                        separationX -= dx / dist;
                        separationY -= dy / dist;
                    }
                }
            }
            
            particle.interactions = interactions;
            particle.pressure = interactions / this.numParticles;
            
            if (interactions > 0) {
                // Cohesion (move towards center of neighbors)
                avgDx /= interactions;
                avgDy /= interactions;
                particle.vx += avgDx * this.cohesionFactor * 0.01 * speed;
                particle.vy += avgDy * this.cohesionFactor * 0.01 * speed;
                
                // Alignment (match velocity with neighbors)
                alignmentVx /= interactions;
                alignmentVy /= interactions;
                particle.vx += (alignmentVx - particle.vx) * this.alignmentFactor * 0.005 * speed;
                particle.vy += (alignmentVy - particle.vy) * this.alignmentFactor * 0.005 * speed;
                
                // Apply separation
                particle.vx += separationX * this.separationFactor * 0.02 * speed;
                particle.vy += separationY * this.separationFactor * 0.02 * speed;
            }
            
            // Apply momentum
            particle.x += particle.vx * speed;
            particle.y += particle.vy * speed;
            
            // Boundary conditions (gentle repulsion)
            if (particle.x < 0) {
                particle.vx += this.boundaryStrength * speed;
            } else if (particle.x > this.canvas.width) {
                particle.vx -= this.boundaryStrength * speed;
            }
            if (particle.y < 0) {
                particle.vy += this.boundaryStrength * speed;
            } else if (particle.y > this.canvas.height) {
                particle.vy -= this.boundaryStrength * speed;
            }
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            const hue = 200 + Math.floor(particle.pressure * 100);
            this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Optional: Draw pressure indicator
            // this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            // this.ctx.font = '10px Arial';
            // this.ctx.fillText(particle.pressure.toFixed(2), particle.x + 10, particle.y);
        }
    }
    
    animate(timestamp) {
        const deltaTime = (timestamp - (this.lastTime || timestamp)) / 1000;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        // Update this.time if needed, for potential time-based effects
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        // Apply any setting changes that need to be propagated to the simulation
    }
    
    cleanup() {
        // Clean up resources if necessary (e.g., event listeners)
        this.particles = [];
    }
}
