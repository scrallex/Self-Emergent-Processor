// Scene 3: Cosine Alignment Demo
// Billiard ball physics with cosine-based collision analysis

class CosineAlignmentDemo {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Scene 3: Cosine Alignment";
        
        // Physics parameters
        this.balls = [];
        this.collisionEffects = [];
        this.impactHistory = [];
        this.latticePoints = [];
        this.cosineThreshold = 0.5;
        this.dampingFactor = 0.99;
        this.elasticity = 0.85;
        
        // Interaction state
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Animation state
        this.animationId = null;
        this.lastTime = 0;
        
        // Stats
        this.stats = {
            collisions: 0,
            acuteCollisions: 0,
            rightCollisions: 0,
            obtuseCollisions: 0,
            latticeFormations: 0
        };
        
        this.initialize();
        this.setupEventListeners();
    }
    
    get legend() {
        return [
            { color: '#4ade80', label: 'Acute (cos > 0.5): Coherent/Contained' },
            { color: '#fbbf24', label: 'Right (cos ≈ 0): Independent' },
            { color: '#f87171', label: 'Obtuse (cos < -0.5): Dispersive/Opposition' },
            { color: '#60a5fa', label: 'Lattice Formation Points' },
            { color: '#a78bfa', label: 'Collision Effects' }
        ];
    }
    
    get parameters() {
        return [
            { id: 'cosineThreshold', label: 'Cosine Threshold', min: 0, max: 1, step: 0.1, value: this.cosineThreshold },
            { id: 'elasticity', label: 'Elasticity', min: 0.1, max: 1, step: 0.05, value: this.elasticity },
            { id: 'dampingFactor', label: 'Damping Factor', min: 0.9, max: 1, step: 0.01, value: this.dampingFactor }
        ];
    }
    
    initialize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Create initial balls
        this.balls = [
            {
                x: this.width * 0.3,
                y: this.height * 0.3,
                vx: 2,
                vy: 1.5,
                radius: 15,
                mass: 1,
                color: '#60a5fa',
                trail: []
            },
            {
                x: this.width * 0.7,
                y: this.height * 0.7,
                vx: -1.5,
                vy: -2,
                radius: 15,
                mass: 1,
                color: '#f87171',
                trail: []
            },
            {
                x: this.width * 0.5,
                y: this.height * 0.5,
                vx: 0.5,
                vy: -1,
                radius: 12,
                mass: 0.8,
                color: '#4ade80',
                trail: []
            }
        ];
        
        this.collisionEffects = [];
        this.impactHistory = [];
        this.latticePoints = [];
        this.resetStats();
    }
    
    resetStats() {
        this.stats = {
            collisions: 0,
            acuteCollisions: 0,
            rightCollisions: 0,
            obtuseCollisions: 0,
            latticeFormations: 0
        };
    }
    
    setupEventListeners() {
        // Mouse events for ball dragging
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let ball of this.balls) {
            const dx = x - ball.x;
            const dy = y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius) {
                this.dragging = ball;
                this.dragOffset = { x: dx, y: dy };
                ball.vx = 0;
                ball.vy = 0;
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.dragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragging.x = x - this.dragOffset.x;
        this.dragging.y = y - this.dragOffset.y;
        
        // Keep ball within bounds
        this.dragging.x = Math.max(this.dragging.radius, Math.min(this.width - this.dragging.radius, this.dragging.x));
        this.dragging.y = Math.max(this.dragging.radius, Math.min(this.height - this.dragging.radius, this.dragging.y));
    }
    
    handleMouseUp(e) {
        if (this.dragging) {
            // Add some velocity based on drag direction
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.dragging.vx = (x - this.dragOffset.x - this.dragging.x) * 0.1;
            this.dragging.vy = (y - this.dragOffset.y - this.dragging.y) * 0.1;
            
            this.dragging = null;
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            this.handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
    
    update(deltaTime) {
        if (!deltaTime) deltaTime = 1;
        
        // Update ball positions
        for (let ball of this.balls) {
            if (ball !== this.dragging) {
                ball.x += ball.vx * deltaTime;
                ball.y += ball.vy * deltaTime;
                
                // Apply damping
                ball.vx *= this.dampingFactor;
                ball.vy *= this.dampingFactor;
                
                // Update trail
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > 20) {
                    ball.trail.shift();
                }
            }
        }
        
        // Handle wall collisions
        this.handleWallCollisions();
        
        // Handle ball-to-ball collisions
        this.handleBallCollisions();
        
        // Update collision effects
        this.updateCollisionEffects(deltaTime);
        
        // Update lattice formations
        this.updateLatticeFormations();
    }
    
    handleWallCollisions() {
        for (let ball of this.balls) {
            if (ball === this.dragging) continue;
            
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.width) {
                ball.vx = -ball.vx * this.elasticity;
                ball.x = ball.radius < ball.x ? this.width - ball.radius : ball.radius;
            }
            
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.height) {
                ball.vy = -ball.vy * this.elasticity;
                ball.y = ball.radius < ball.y ? this.height - ball.radius : ball.radius;
            }
        }
    }
    
    handleBallCollisions() {
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                if (ball1 === this.dragging || ball2 === this.dragging) continue;
                
                const dx = ball2.x - ball1.x;
                const dy = ball2.y - ball1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = ball1.radius + ball2.radius;
                
                if (distance < minDistance) {
                    this.resolveCollision(ball1, ball2, dx, dy, distance);
                }
            }
        }
    }
    
    resolveCollision(ball1, ball2, dx, dy, distance) {
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity
        const dvx = ball2.vx - ball1.vx;
        const dvy = ball2.vy - ball1.vy;
        
        // Calculate relative velocity along normal
        const dvn = dvx * nx + dvy * ny;
        
        // Calculate cosine of impact angle
        const v1mag = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const v2mag = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
        
        let cosineAngle = 0;
        if (v1mag > 0 && v2mag > 0) {
            cosineAngle = (ball1.vx * ball2.vx + ball1.vy * ball2.vy) / (v1mag * v2mag);
        }
        
        // Classify collision type
        let collisionType = 'right';
        let effectColor = '#fbbf24';
        
        if (cosineAngle > this.cosineThreshold) {
            collisionType = 'acute';
            effectColor = '#4ade80';
            this.stats.acuteCollisions++;
        } else if (cosineAngle < -this.cosineThreshold) {
            collisionType = 'obtuse';
            effectColor = '#f87171';
            this.stats.obtuseCollisions++;
        } else {
            this.stats.rightCollisions++;
        }
        
        // Add to impact history
        this.impactHistory.push({
            type: collisionType,
            cosine: cosineAngle,
            position: { x: (ball1.x + ball2.x) / 2, y: (ball1.y + ball2.y) / 2 },
            time: Date.now()
        });
        
        // Keep only recent impacts
        if (this.impactHistory.length > 50) {
            this.impactHistory.shift();
        }
        
        // Create collision effect
        this.collisionEffects.push({
            x: (ball1.x + ball2.x) / 2,
            y: (ball1.y + ball2.y) / 2,
            radius: 0,
            maxRadius: 30,
            color: effectColor,
            alpha: 1,
            cosine: cosineAngle,
            type: collisionType,
            lifetime: 0,
            maxLifetime: 60
        });
        
        // Handle lattice formation for acute collisions
        if (collisionType === 'acute') {
            this.createLatticePoint((ball1.x + ball2.x) / 2, (ball1.y + ball2.y) / 2);
        }
        
        // Physical collision response
        if (dvn > 0) return; // Objects separating
        
        // Calculate impulse
        const impulse = 2 * dvn / (ball1.mass + ball2.mass);
        
        // Update velocities
        ball1.vx += impulse * ball2.mass * nx * this.elasticity;
        ball1.vy += impulse * ball2.mass * ny * this.elasticity;
        ball2.vx -= impulse * ball1.mass * nx * this.elasticity;
        ball2.vy -= impulse * ball1.mass * ny * this.elasticity;
        
        // Separate balls
        const overlap = ball1.radius + ball2.radius - distance;
        const separationX = nx * overlap * 0.5;
        const separationY = ny * overlap * 0.5;
        
        ball1.x -= separationX;
        ball1.y -= separationY;
        ball2.x += separationX;
        ball2.y += separationY;
        
        this.stats.collisions++;
    }
    
    createLatticePoint(x, y) {
        // Check if point is close to existing lattice points
        for (let point of this.latticePoints) {
            const dx = x - point.x;
            const dy = y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                point.strength = Math.min(point.strength + 0.2, 1);
                return;
            }
        }
        
        // Create new lattice point
        this.latticePoints.push({
            x: x,
            y: y,
            strength: 0.3,
            age: 0,
            maxAge: 300
        });
        
        this.stats.latticeFormations++;
    }
    
    updateCollisionEffects(deltaTime) {
        this.collisionEffects = this.collisionEffects.filter(effect => {
            effect.lifetime += deltaTime;
            effect.radius = (effect.lifetime / effect.maxLifetime) * effect.maxRadius;
            effect.alpha = 1 - (effect.lifetime / effect.maxLifetime);
            
            return effect.lifetime < effect.maxLifetime;
        });
    }
    
    updateLatticeFormations() {
        this.latticePoints = this.latticePoints.filter(point => {
            point.age++;
            point.strength *= 0.995; // Gradual decay
            
            return point.age < point.maxAge && point.strength > 0.1;
        });
    }
    
    render(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background grid
        this.drawGrid(ctx);
        
        // Draw lattice formations
        this.drawLatticeFormations(ctx);
        
        // Draw ball trails
        this.drawTrails(ctx);
        
        // Draw balls
        this.drawBalls(ctx);
        
        // Draw collision effects
        this.drawCollisionEffects(ctx);
        
        // Draw UI elements
        this.drawUI(ctx);
    }
    
    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = 0; x <= this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }
    
    drawLatticeFormations(ctx) {
        for (let point of this.latticePoints) {
            const alpha = point.strength;
            const radius = point.strength * 20;
            
            // Draw lattice point
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.3})`;
            ctx.fill();
            
            // Draw lattice connections
            for (let other of this.latticePoints) {
                if (other === point) continue;
                
                const dx = other.x - point.x;
                const dy = other.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * other.strength * 0.5})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }
    
    drawTrails(ctx) {
        for (let ball of this.balls) {
            if (ball.trail.length < 2) continue;
            
            ctx.strokeStyle = ball.color;
            ctx.lineWidth = 2;
            
            for (let i = 1; i < ball.trail.length; i++) {
                const alpha = i / ball.trail.length;
                ctx.globalAlpha = alpha * 0.5;
                
                ctx.beginPath();
                ctx.moveTo(ball.trail[i-1].x, ball.trail[i-1].y);
                ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
        }
    }
    
    drawBalls(ctx) {
        for (let ball of this.balls) {
            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw velocity vector
            const vMag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (vMag > 0.1) {
                const scale = 10;
                ctx.beginPath();
                ctx.moveTo(ball.x, ball.y);
                ctx.lineTo(ball.x + ball.vx * scale, ball.y + ball.vy * scale);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Arrow head
                const angle = Math.atan2(ball.vy, ball.vx);
                const arrowSize = 5;
                ctx.beginPath();
                ctx.moveTo(ball.x + ball.vx * scale, ball.y + ball.vy * scale);
                ctx.lineTo(
                    ball.x + ball.vx * scale - arrowSize * Math.cos(angle - Math.PI/6),
                    ball.y + ball.vy * scale - arrowSize * Math.sin(angle - Math.PI/6)
                );
                ctx.lineTo(
                    ball.x + ball.vx * scale - arrowSize * Math.cos(angle + Math.PI/6),
                    ball.y + ball.vy * scale - arrowSize * Math.sin(angle + Math.PI/6)
                );
                ctx.closePath();
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
            
            // Highlight if dragging
            if (ball === this.dragging) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }
    
    drawCollisionEffects(ctx) {
        for (let effect of this.collisionEffects) {
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = effect.alpha;
            ctx.stroke();
            
            // Draw cosine value
            ctx.font = '12px monospace';
            ctx.fillStyle = effect.color;
            ctx.textAlign = 'center';
            ctx.fillText(
                `cos: ${effect.cosine.toFixed(2)}`,
                effect.x,
                effect.y + 4
            );
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawUI(ctx) {
        // Draw statistics
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        const stats = [
            `Total Collisions: ${this.stats.collisions}`,
            `Acute (cos > ${this.cosineThreshold}): ${this.stats.acuteCollisions}`,
            `Right (cos ≈ 0): ${this.stats.rightCollisions}`,
            `Obtuse (cos < -${this.cosineThreshold}): ${this.stats.obtuseCollisions}`,
            `Lattice Points: ${this.latticePoints.length}`
        ];
        
        stats.forEach((stat, index) => {
            ctx.fillText(stat, 20, 30 + index * 20);
        });
        
        // Draw instructions
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Drag balls to create collisions', this.width - 20, this.height - 20);
    }
    
    updateParameter(id, value) {
        switch (id) {
            case 'cosineThreshold':
                this.cosineThreshold = value;
                break;
            case 'elasticity':
                this.elasticity = value;
                break;
            case 'dampingFactor':
                this.dampingFactor = value;
                break;
        }
    }
    
    getStats() {
        return {
            'Total Collisions': this.stats.collisions,
            'Acute Collisions': this.stats.acuteCollisions,
            'Lattice Points': this.latticePoints.length,
            'Active Effects': this.collisionEffects.length
        };
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        // Keep balls within new bounds
        for (let ball of this.balls) {
            ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
            ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
        }
    }
    
    reset() {
        this.initialize();
    }
    
    destroy() {
        // Clean up event listeners and animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// Register the demo with the global demo system
document.addEventListener('DOMContentLoaded', () => {
    if (window.demoSystem) {
        window.demoSystem.registerDemo('cosine-alignment', CosineAlignmentDemo);
    }
});