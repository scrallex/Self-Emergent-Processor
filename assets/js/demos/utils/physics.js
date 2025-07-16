/**
 * Physics Engine for SEP Demos
 * Provides physics calculations and simulations for demos
 */

class Physics {
    constructor() {
        // Physics configuration
        this.gravity = 9.81;
        this.friction = 0.1;
        this.elasticity = 0.8;
        this.collisionPrecision = 3;
        
        // Collision detection system
        this.collisionGroups = new Map();
        this.colliders = [];
        
        // Particle systems
        this.particleSystems = [];
    }
    
    /**
     * Initialize the physics engine
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init() {
        console.log('Initializing physics engine...');
        return Promise.resolve();
    }
    
    /**
     * Update physics simulation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update all particle systems
        this.particleSystems.forEach(system => {
            system.update(deltaTime);
        });
        
        // Update all colliders
        this.updateColliders(deltaTime);
    }
    
    /**
     * Update all colliders and check for collisions
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateColliders(deltaTime) {
        // Skip if no colliders
        if (this.colliders.length === 0) return;
        
        // Update positions based on velocity
        this.colliders.forEach(collider => {
            // Apply gravity if enabled for this collider
            if (collider.useGravity) {
                collider.vy += this.gravity * deltaTime;
            }
            
            // Apply velocity
            collider.x += collider.vx * deltaTime;
            collider.y += collider.vy * deltaTime;
            
            // Apply friction
            if (collider.useFriction) {
                const frictionFactor = Math.pow(1 - this.friction, deltaTime);
                collider.vx *= frictionFactor;
                collider.vy *= frictionFactor;
            }
        });
        
        // Check for collisions between colliders
        for (let i = 0; i < this.colliders.length; i++) {
            for (let j = i + 1; j < this.colliders.length; j++) {
                this.checkCollision(this.colliders[i], this.colliders[j]);
            }
        }
    }
    
    /**
     * Check collision between two colliders
     * @param {Object} a - First collider
     * @param {Object} b - Second collider
     * @returns {boolean} - Whether a collision occurred
     */
    checkCollision(a, b) {
        // Skip collision check if they are in different collision groups
        if (a.group !== b.group && a.group !== 0 && b.group !== 0) {
            return false;
        }
        
        // Circle-circle collision
        if (a.type === 'circle' && b.type === 'circle') {
            return this.circleCircleCollision(a, b);
        }
        
        // Rectangle-rectangle collision
        if (a.type === 'rect' && b.type === 'rect') {
            return this.rectRectCollision(a, b);
        }
        
        // Circle-rectangle collision
        if ((a.type === 'circle' && b.type === 'rect') || 
            (a.type === 'rect' && b.type === 'circle')) {
            const circle = a.type === 'circle' ? a : b;
            const rect = a.type === 'rect' ? a : b;
            return this.circleRectCollision(circle, rect);
        }
        
        return false;
    }
    
    /**
     * Handle collision between two circles
     * @param {Object} a - First circle
     * @param {Object} b - Second circle
     * @returns {boolean} - Whether a collision occurred
     */
    circleCircleCollision(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // No collision if distance is greater than sum of radii
        if (distance > a.radius + b.radius) {
            return false;
        }
        
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        
        // Calculate velocity along normal
        const velocityAlongNormal = dvx * nx + dvy * ny;
        
        // Exit if velocities are separating
        if (velocityAlongNormal > 0) {
            return false;
        }
        
        // Calculate restitution (elasticity)
        const e = Math.min(a.elasticity || this.elasticity, b.elasticity || this.elasticity);
        
        // Calculate impulse scalar
        let j = -(1 + e) * velocityAlongNormal;
        j /= 1/a.mass + 1/b.mass;
        
        // Apply impulse
        const impulseX = j * nx;
        const impulseY = j * ny;
        
        a.vx -= impulseX / a.mass;
        a.vy -= impulseY / a.mass;
        b.vx += impulseX / b.mass;
        b.vy += impulseY / b.mass;
        
        // Correct position to prevent sinking
        const correctionPercent = 0.2; // Penetration correction factor
        const correction = correctionPercent * (distance - a.radius - b.radius) / 2;
        
        a.x += nx * correction;
        a.y += ny * correction;
        b.x -= nx * correction;
        b.y -= ny * correction;
        
        // Trigger collision handlers if they exist
        if (a.onCollide) a.onCollide(b);
        if (b.onCollide) b.onCollide(a);
        
        return true;
    }
    
    /**
     * Handle collision between two rectangles
     * @param {Object} a - First rectangle
     * @param {Object} b - Second rectangle
     * @returns {boolean} - Whether a collision occurred
     */
    rectRectCollision(a, b) {
        // Calculate rectangle bounds
        const aLeft = a.x - a.width / 2;
        const aRight = a.x + a.width / 2;
        const aTop = a.y - a.height / 2;
        const aBottom = a.y + a.height / 2;
        
        const bLeft = b.x - b.width / 2;
        const bRight = b.x + b.width / 2;
        const bTop = b.y - b.height / 2;
        const bBottom = b.y + b.height / 2;
        
        // Check for overlap
        if (aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom) {
            return false; // No collision
        }
        
        // Calculate overlap
        const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
        const overlapY = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);
        
        // Determine collision normal
        let nx = 0;
        let ny = 0;
        
        if (overlapX < overlapY) {
            nx = a.x < b.x ? -1 : 1;
        } else {
            ny = a.y < b.y ? -1 : 1;
        }
        
        // Calculate relative velocity
        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        
        // Calculate velocity along normal
        const velocityAlongNormal = dvx * nx + dvy * ny;
        
        // Exit if velocities are separating
        if (velocityAlongNormal > 0) {
            return false;
        }
        
        // Calculate restitution (elasticity)
        const e = Math.min(a.elasticity || this.elasticity, b.elasticity || this.elasticity);
        
        // Calculate impulse scalar
        let j = -(1 + e) * velocityAlongNormal;
        j /= 1/a.mass + 1/b.mass;
        
        // Apply impulse
        const impulseX = j * nx;
        const impulseY = j * ny;
        
        a.vx -= impulseX / a.mass;
        a.vy -= impulseY / a.mass;
        b.vx += impulseX / b.mass;
        b.vy += impulseY / b.mass;
        
        // Correct position
        const correctionPercent = 0.2;
        const correction = overlapX < overlapY ? 
            correctionPercent * overlapX / 2 : 
            correctionPercent * overlapY / 2;
        
        a.x -= nx * correction;
        a.y -= ny * correction;
        b.x += nx * correction;
        b.y += ny * correction;
        
        // Trigger collision handlers if they exist
        if (a.onCollide) a.onCollide(b);
        if (b.onCollide) b.onCollide(a);
        
        return true;
    }
    
    /**
     * Handle collision between a circle and a rectangle
     * @param {Object} circle - Circle collider
     * @param {Object} rect - Rectangle collider
     * @returns {boolean} - Whether a collision occurred
     */
    circleRectCollision(circle, rect) {
        // Find the closest point on the rectangle to the circle
        const closestX = Math.max(rect.x - rect.width / 2, Math.min(circle.x, rect.x + rect.width / 2));
        const closestY = Math.max(rect.y - rect.height / 2, Math.min(circle.y, rect.y + rect.height / 2));
        
        // Calculate distance between the circle's center and the closest point
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        // No collision if the distance is greater than the circle's radius
        if (distanceSquared > circle.radius * circle.radius) {
            return false;
        }
        
        // Calculate collision normal
        const distance = Math.sqrt(distanceSquared);
        const nx = distance > 0 ? distanceX / distance : 0;
        const ny = distance > 0 ? distanceY / distance : 1;
        
        // Calculate relative velocity
        const dvx = rect.vx - circle.vx;
        const dvy = rect.vy - circle.vy;
        
        // Calculate velocity along normal
        const velocityAlongNormal = dvx * -nx + dvy * -ny;
        
        // Exit if velocities are separating
        if (velocityAlongNormal > 0) {
            return false;
        }
        
        // Calculate restitution (elasticity)
        const e = Math.min(circle.elasticity || this.elasticity, rect.elasticity || this.elasticity);
        
        // Calculate impulse scalar
        let j = -(1 + e) * velocityAlongNormal;
        j /= 1/circle.mass + 1/rect.mass;
        
        // Apply impulse
        const impulseX = j * nx;
        const impulseY = j * ny;
        
        circle.vx += impulseX / circle.mass;
        circle.vy += impulseY / circle.mass;
        rect.vx -= impulseX / rect.mass;
        rect.vy -= impulseY / rect.mass;
        
        // Correct position
        const correctionPercent = 0.2;
        const penetration = circle.radius - distance;
        const correction = correctionPercent * penetration;
        
        circle.x += nx * correction;
        circle.y += ny * correction;
        rect.x -= nx * correction;
        rect.y -= ny * correction;
        
        // Trigger collision handlers if they exist
        if (circle.onCollide) circle.onCollide(rect);
        if (rect.onCollide) rect.onCollide(circle);
        
        return true;
    }
    
    /**
     * Create a particle system
     * @param {Object} options - Particle system options
     * @returns {Object} - Particle system object
     */
    createParticleSystem(options = {}) {
        const defaultOptions = {
            x: 0,
            y: 0,
            count: 100,
            spawnRate: 10,
            lifetime: 2,
            speed: 50,
            size: 5,
            sizeVariation: 2,
            color: '#ffffff',
            gravity: true,
            bounce: 0.5
        };
        
        const settings = { ...defaultOptions, ...options };
        
        const system = {
            ...settings,
            particles: [],
            age: 0,
            active: true,
            
            update(dt) {
                this.age += dt;
                
                // Spawn new particles
                const spawnCount = Math.floor(this.spawnRate * dt);
                for (let i = 0; i < spawnCount && this.particles.length < this.count; i++) {
                    this.spawnParticle();
                }
                
                // Update existing particles
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.age += dt;
                    
                    // Remove dead particles
                    if (p.age >= p.lifetime) {
                        this.particles.splice(i, 1);
                        continue;
                    }
                    
                    // Apply gravity
                    if (this.gravity) {
                        p.vy += 9.81 * dt;
                    }
                    
                    // Apply velocity
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    
                    // Fade out based on lifetime
                    p.opacity = 1 - (p.age / p.lifetime);
                }
            },
            
            spawnParticle() {
                const angle = Math.random() * Math.PI * 2;
                const speed = this.speed * (0.5 + Math.random() * 0.5);
                
                this.particles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: this.size + (Math.random() * 2 - 1) * this.sizeVariation,
                    color: this.color,
                    age: 0,
                    lifetime: this.lifetime * (0.8 + Math.random() * 0.4),
                    opacity: 1
                });
            },
            
            render(ctx) {
                for (const p of this.particles) {
                    ctx.globalAlpha = p.opacity;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        };
        
        this.particleSystems.push(system);
        return system;
    }
    
    /**
     * Create a circle collider
     * @param {Object} options - Collider options
     * @returns {Object} - Circle collider
     */
    createCircleCollider(options = {}) {
        const defaultOptions = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 10,
            mass: 1,
            elasticity: this.elasticity,
            useFriction: true,
            useGravity: false,
            group: 0, // 0 collides with all groups
            type: 'circle',
            color: '#ffffff'
        };
        
        const collider = { ...defaultOptions, ...options };
        this.colliders.push(collider);
        return collider;
    }
    
    /**
     * Create a rectangle collider
     * @param {Object} options - Collider options
     * @returns {Object} - Rectangle collider
     */
    createRectCollider(options = {}) {
        const defaultOptions = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            width: 20,
            height: 20,
            mass: 1,
            elasticity: this.elasticity,
            useFriction: true,
            useGravity: false,
            group: 0,
            type: 'rect',
            color: '#ffffff'
        };
        
        const collider = { ...defaultOptions, ...options };
        this.colliders.push(collider);
        return collider;
    }
    
    /**
     * Remove a collider from the physics engine
     * @param {Object} collider - Collider to remove
     */
    removeCollider(collider) {
        const index = this.colliders.indexOf(collider);
        if (index !== -1) {
            this.colliders.splice(index, 1);
        }
    }
    
    /**
     * Remove a particle system from the physics engine
     * @param {Object} system - Particle system to remove
     */
    removeParticleSystem(system) {
        const index = this.particleSystems.indexOf(system);
        if (index !== -1) {
            this.particleSystems.splice(index, 1);
        }
    }
    
    /**
     * Clear all physics objects
     */
    clear() {
        this.colliders = [];
        this.particleSystems = [];
    }
}

export default Physics;