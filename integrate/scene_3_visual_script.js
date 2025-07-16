// Scene 3: "Cosine Alignment" - Billiard Ball Collision with Cosine Highlighting
// Physics simulation showing cosine values as color intensity during impacts

class CosineAlignmentDemo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Physics world parameters
        this.gravity = 0.0;
        this.friction = 0.99;
        this.restitution = 0.9;
        
        // Balls array
        this.balls = [];
        this.initializeBalls();
        
        // Lattice formation threshold
        this.cosineThreshold = 0.7;
        this.latticePoints = [];
        
        // Collision detection state
        this.collisionPairs = [];
        this.impactHistory = [];
        
        // Animation timing
        this.lastTime = 0;
        this.animationId = null;
        
        // Interaction state
        this.mouseX = 0;
        this.mouseY = 0;
        this.dragging = false;
        this.dragBall = null;
        
        this.setupEventListeners();
        this.animate();
    }
    
    initializeBalls() {
        // Create initial balls with different velocities
        const configs = [
            { x: 150, y: 200, vx: 2, vy: 1, color: '#ff6b6b' },
            { x: 600, y: 300, vx: -1.5, vy: 1.5, color: '#4ecdc4' },
            { x: 400, y: 100, vx: 0.5, vy: 2, color: '#45b7d1' },
            { x: 300, y: 450, vx: -0.8, vy: -1.2, color: '#f7b731' },
            { x: 500, y: 350, vx: 1.2, vy: -0.7, color: '#5f27cd' }
        ];
        
        this.balls = configs.map((config, index) => ({
            id: index,
            x: config.x,
            y: config.y,
            vx: config.vx,
            vy: config.vy,
            radius: 15,
            mass: 1,
            color: config.color,
            highlightColor: config.color,
            cosineValue: 0,
            lastImpactTime: 0,
            trail: []
        }));
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if clicking on any ball
            for (const ball of this.balls) {
                const dist = Math.sqrt(
                    Math.pow(mouseX - ball.x, 2) + 
                    Math.pow(mouseY - ball.y, 2)
                );
                
                if (dist < ball.radius) {
                    this.dragging = true;
                    this.dragBall = ball;
                    // Stop the ball when grabbing
                    ball.vx = 0;
                    ball.vy = 0;
                    break;
                }
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            if (this.dragging && this.dragBall) {
                this.dragBall.x = this.mouseX;
                this.dragBall.y = this.mouseY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.dragging && this.dragBall) {
                // Give the ball some velocity based on mouse movement
                this.dragBall.vx = (this.mouseX - this.dragBall.x) * 0.1;
                this.dragBall.vy = (this.mouseY - this.dragBall.y) * 0.1;
            }
            this.dragging = false;
            this.dragBall = null;
        });
        
        // Reset button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.initializeBalls();
                this.latticePoints = [];
                this.impactHistory = [];
            }
        });
    }
    
    updatePhysics(deltaTime) {
        // Clear previous collision data
        this.collisionPairs = [];
        
        // Update ball positions
        for (const ball of this.balls) {
            if (ball !== this.dragBall) {
                ball.x += ball.vx * deltaTime;
                ball.y += ball.vy * deltaTime;
                
                // Apply friction
                ball.vx *= this.friction;
                ball.vy *= this.friction;
                
                // Update trail
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > 30) {
                    ball.trail.shift();
                }
            }
        }
        
        // Wall collisions
        for (const ball of this.balls) {
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
                ball.vx = -ball.vx * this.restitution;
                ball.x = Math.max(ball.radius, Math.min(this.canvas.width - ball.radius, ball.x));
            }
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.canvas.height) {
                ball.vy = -ball.vy * this.restitution;
                ball.y = Math.max(ball.radius, Math.min(this.canvas.height - ball.radius, ball.y));
            }
        }
        
        // Ball-to-ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                const dx = ball2.x - ball1.x;
                const dy = ball2.y - ball1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball1.radius + ball2.radius) {
                    this.handleCollision(ball1, ball2, dx, dy, distance);
                }
            }
        }
        
        // Update lattice formation
        this.updateLatticeFormation();
    }
    
    handleCollision(ball1, ball2, dx, dy, distance) {
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Separate balls
        const overlap = ball1.radius + ball2.radius - distance;
        const separationX = nx * overlap * 0.5;
        const separationY = ny * overlap * 0.5;
        
        ball1.x -= separationX;
        ball1.y -= separationY;
        ball2.x += separationX;
        ball2.y += separationY;
        
        // Calculate relative velocity
        const dvx = ball2.vx - ball1.vx;
        const dvy = ball2.vy - ball1.vy;
        
        // Calculate relative velocity in collision normal direction
        const dvn = dvx * nx + dvy * ny;
        
        // Do not resolve if velocities are separating
        if (dvn > 0) return;
        
        // Calculate impulse scalar
        const impulse = 2 * dvn / (ball1.mass + ball2.mass);
        
        // Apply impulse
        ball1.vx += impulse * ball2.mass * nx;
        ball1.vy += impulse * ball2.mass * ny;
        ball2.vx -= impulse * ball1.mass * nx;
        ball2.vy -= impulse * ball1.mass * ny;
        
        // Calculate cosine of impact angle
        const v1Magnitude = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
        const v2Magnitude = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
        
        if (v1Magnitude > 0 && v2Magnitude > 0) {
            const dotProduct = (ball1.vx * ball2.vx + ball1.vy * ball2.vy);
            const cosineValue = dotProduct / (v1Magnitude * v2Magnitude);
            
            // Store collision data
            this.collisionPairs.push({
                ball1: ball1,
                ball2: ball2,
                cosine: cosineValue,
                x: (ball1.x + ball2.x) / 2,
                y: (ball1.y + ball2.y) / 2,
                time: Date.now()
            });
            
            // Update ball cosine values for visualization
            ball1.cosineValue = cosineValue;
            ball2.cosineValue = cosineValue;
            ball1.lastImpactTime = Date.now();
            ball2.lastImpactTime = Date.now();
            
            // Record impact history
            this.impactHistory.push({
                cosine: cosineValue,
                time: Date.now(),
                type: this.classifyAngle(cosineValue)
            });
            
            // Keep only recent history
            if (this.impactHistory.length > 100) {
                this.impactHistory.shift();
            }
        }
    }
    
    classifyAngle(cosineValue) {
        if (cosineValue > 0.5) return 'acute';
        if (cosineValue < -0.5) return 'obtuse';
        return 'right';
    }
    
    updateLatticeFormation() {
        // Clear existing lattice points
        this.latticePoints = [];
        
        // Find stable configurations where cosine > threshold
        for (const ball of this.balls) {
            if (ball.cosineValue > this.cosineThreshold) {
                this.latticePoints.push({
                    x: ball.x,
                    y: ball.y,
                    strength: ball.cosineValue
                });
            }
        }
    }
    
    drawBalls() {
        const currentTime = Date.now();
        
        for (const ball of this.balls) {
            const { ctx } = this;
            
            // Draw trail
            if (ball.trail.length > 1) {
                ctx.strokeStyle = ball.color + '30';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
                for (let i = 1; i < ball.trail.length; i++) {
                    ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
                }
                ctx.stroke();
            }
            
            // Calculate color intensity based on cosine value and time since impact
            const timeSinceImpact = currentTime - ball.lastImpactTime;
            const impactFade = Math.max(0, 1 - timeSinceImpact / 1000);
            
            let intensity = 0.3; // Base intensity
            if (impactFade > 0) {
                intensity = Math.abs(ball.cosineValue) * impactFade;
            }
            
            // Color based on cosine value
            let color = ball.color;
            if (ball.cosineValue > 0.5) {
                color = '#4ecdc4'; // Acute - bright teal
            } else if (ball.cosineValue < -0.5) {
                color = '#ff6b6b'; // Obtuse - bright red
            } else if (Math.abs(ball.cosineValue) < 0.1) {
                color = '#f7b731'; // Right angle - yellow
            }
            
            // Draw ball with glow effect
            const alpha = Math.min(1, 0.3 + intensity * 0.7);
            
            // Outer glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 20 * intensity;
            ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            
            // Inner circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 0.7, 0, 2 * Math.PI);
            ctx.fill();
            
            // Display cosine value
            if (impactFade > 0) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    ball.cosineValue.toFixed(2),
                    ball.x,
                    ball.y - ball.radius - 10
                );
            }
        }
    }
    
    drawCollisionEffects() {
        const currentTime = Date.now();
        
        for (const collision of this.collisionPairs) {
            const age = currentTime - collision.time;
            if (age < 500) { // Show effect for 500ms
                const fade = 1 - age / 500;
                
                // Color based on cosine value
                let color = '#fff';
                if (collision.cosine > 0.5) {
                    color = '#4ecdc4'; // Acute
                } else if (collision.cosine < -0.5) {
                    color = '#ff6b6b'; // Obtuse
                } else {
                    color = '#f7b731'; // Right angle
                }
                
                // Draw collision burst
                this.ctx.strokeStyle = color + Math.floor(fade * 255).toString(16).padStart(2, '0');
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(collision.x, collision.y, 30 * (1 - fade), 0, 2 * Math.PI);
                this.ctx.stroke();
                
                // Draw cosine value
                this.ctx.fillStyle = color;
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    `cos: ${collision.cosine.toFixed(2)}`,
                    collision.x,
                    collision.y - 40
                );
            }
        }
        
        // Clean up old collision effects
        this.collisionPairs = this.collisionPairs.filter(c => currentTime - c.time < 500);
    }
    
    drawLatticeFormation() {
        if (this.latticePoints.length === 0) return;
        
        const { ctx } = this;
        
        // Draw lattice connections
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        for (let i = 0; i < this.latticePoints.length; i++) {
            for (let j = i + 1; j < this.latticePoints.length; j++) {
                const p1 = this.latticePoints[i];
                const p2 = this.latticePoints[j];
                
                const distance = Math.sqrt(
                    Math.pow(p2.x - p1.x, 2) + 
                    Math.pow(p2.y - p1.y, 2)
                );
                
                if (distance < 100) { // Only connect nearby points
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.setLineDash([]);
    }
    
    drawUI() {
        const { ctx } = this;
        
        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 300, 180);
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Cosine Alignment Demo', 20, 35);
        
        // Instructions
        ctx.font = '12px Arial';
        ctx.fillText('Drag balls to adjust collision angles', 20, 55);
        ctx.fillText('Press R to reset', 20, 75);
        
        // Color legend
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(20, 85, 15, 15);
        ctx.fillStyle = '#fff';
        ctx.fillText('Acute (cos > 0.5): Contained/Coherent', 45, 97);
        
        ctx.fillStyle = '#f7b731';
        ctx.fillRect(20, 105, 15, 15);
        ctx.fillStyle = '#fff';
        ctx.fillText('Right (cos ≈ 0): Orthogonal/Independent', 45, 117);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(20, 125, 15, 15);
        ctx.fillStyle = '#fff';
        ctx.fillText('Obtuse (cos < -0.5): Dispersive/Opposition', 45, 137);
        
        // Impact statistics
        if (this.impactHistory.length > 0) {
            const recentImpacts = this.impactHistory.slice(-20);
            const acuteCount = recentImpacts.filter(i => i.type === 'acute').length;
            const rightCount = recentImpacts.filter(i => i.type === 'right').length;
            const obtuseCount = recentImpacts.filter(i => i.type === 'obtuse').length;
            
            ctx.fillStyle = '#fff';
            ctx.fillText(`Recent impacts: A:${acuteCount} R:${rightCount} O:${obtuseCount}`, 20, 157);
            ctx.fillText(`Lattice threshold: cos > ${this.cosineThreshold}`, 20, 177);
        }
    }
    
    animate(currentTime = 0) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2); // Cap at 2 frames
        this.lastTime = currentTime;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Draw everything
        this.drawLatticeFormation();
        this.drawBalls();
        this.drawCollisionEffects();
        this.drawUI();
        
        // Continue animation
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    const demo = new CosineAlignmentDemo('cosineCanvas');
});

// HTML structure needed:
/*
<canvas id="cosineCanvas" style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
<div style="margin-top: 20px; font-family: Arial;">
    <h3>Cosine Alignment Physics</h3>
    <p>This demo shows how cosine values determine collision outcomes:</p>
    <ul>
        <li><strong>Acute angles (cos > 0.5)</strong>: Create contained, coherent bounces that can form crystal-like lattices</li>
        <li><strong>Right angles (cos ≈ 0)</strong>: Orthogonal collisions where balls separate independently</li>
        <li><strong>Obtuse angles (cos < -0.5)</strong>: Dispersive collisions that push objects apart</li>
    </ul>
    <p>Drag balls to create different collision angles and observe how cosine values affect the physics!</p>
</div>
*/