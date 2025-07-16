// Scene 3: Cosine Alignment - Billiard Ball Collision with Cosine Highlighting
export default class Scene3 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Physics parameters
        this.gravity = 0.0;
        this.friction = 0.99;
        this.restitution = 0.9;
        
        // Balls array
        this.balls = [];
        
        // Collision state
        this.collisionPairs = [];
        this.impactHistory = [];
        this.cosineThreshold = 0.7;
        
        // Animation timing
        this.lastTime = performance.now();
        
        // Interaction state
        this.mouseX = 0;
        this.mouseY = 0;
        this.dragging = false;
        this.dragBall = null;
        
        // Event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    init() {
        // Initialize balls
        this.initializeBalls();
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        return Promise.resolve();
    }
    
    initializeBalls() {
        this.balls = [];
        
        // Create initial balls with different velocities
        const configs = [
            { x: 150, y: 200, vx: 2, vy: 1, color: '#ff6b6b' },
            { x: this.canvas.width - 200, y: 300, vx: -1.5, vy: 1.5, color: '#4ecdc4' },
            { x: this.canvas.width / 2, y: 100, vx: 0.5, vy: 2, color: '#45b7d1' },
            { x: 300, y: this.canvas.height - 150, vx: -0.8, vy: -1.2, color: '#f7b731' },
            { x: this.canvas.width - 300, y: this.canvas.height - 250, vx: 1.2, vy: -0.7, color: '#5f27cd' }
        ];
        
        configs.forEach((config, index) => {
            this.balls.push({
                id: index,
                x: config.x,
                y: config.y,
                vx: config.vx * this.settings.speed,
                vy: config.vy * this.settings.speed,
                radius: 20,
                mass: 1,
                color: config.color,
                trail: []
            });
        });
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if clicking on a ball
        for (const ball of this.balls) {
            const dist = Math.sqrt(
                Math.pow(this.mouseX - ball.x, 2) + 
                Math.pow(this.mouseY - ball.y, 2)
            );
            
            if (dist < ball.radius) {
                this.dragging = true;
                this.dragBall = ball;
                this.dragBall.vx = 0;
                this.dragBall.vy = 0;
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        if (this.dragging && this.dragBall) {
            this.dragBall.x = this.mouseX;
            this.dragBall.y = this.mouseY;
        }
    }
    
    handleMouseUp() {
        if (this.dragging && this.dragBall) {
            // Give the ball some velocity based on mouse movement
            this.dragBall.vx = (Math.random() - 0.5) * 4;
            this.dragBall.vy = (Math.random() - 0.5) * 4;
        }
        this.dragging = false;
        this.dragBall = null;
    }
    
    animate(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1) * this.settings.speed;
        this.lastTime = timestamp;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Draw everything
        this.drawBalls();
        this.drawCollisionInfo();
        this.drawImpactHistory();
        
        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }
    
    updatePhysics(deltaTime) {
        for (const ball of this.balls) {
            if (this.dragging && ball === this.dragBall) continue;
            
            // Apply gravity and friction
            ball.vy += this.gravity * deltaTime;
            ball.vx *= this.friction;
            ball.vy *= this.friction;
            
            // Update position
            ball.x += ball.vx * deltaTime * 60;
            ball.y += ball.vy * deltaTime * 60;
            
            // Boundary collisions
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
                ball.vx *= -this.restitution;
                ball.x = ball.x - ball.radius < 0 ? ball.radius : this.canvas.width - ball.radius;
            }
            
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.canvas.height) {
                ball.vy *= -this.restitution;
                ball.y = ball.y - ball.radius < 0 ? ball.radius : this.canvas.height - ball.radius;
            }
            
            // Update trail
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 30) {
                ball.trail.shift();
            }
        }
    }
    
    checkCollisions() {
        this.collisionPairs = [];
        
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball1 = this.balls[i];
                const ball2 = this.balls[j];
                
                const dx = ball2.x - ball1.x;
                const dy = ball2.y - ball1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball1.radius + ball2.radius) {
                    // Collision detected
                    this.resolveCollision(ball1, ball2);
                    
                    // Calculate cosine of angle between velocities
                    const v1Mag = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
                    const v2Mag = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);
                    
                    if (v1Mag > 0 && v2Mag > 0) {
                        const cosine = (ball1.vx * ball2.vx + ball1.vy * ball2.vy) / (v1Mag * v2Mag);
                        
                        this.collisionPairs.push({
                            ball1: ball1,
                            ball2: ball2,
                            cosine: cosine,
                            distance: distance
                        });
                        
                        // Add to impact history
                        this.impactHistory.push({
                            x: (ball1.x + ball2.x) / 2,
                            y: (ball1.y + ball2.y) / 2,
                            cosine: cosine,
                            time: Date.now(),
                            intensity: Math.abs(cosine)
                        });
                        
                        // Keep only recent impacts
                        const now = Date.now();
                        this.impactHistory = this.impactHistory.filter(impact => 
                            now - impact.time < 3000
                        );
                    }
                }
            }
        }
    }
    
    resolveCollision(ball1, ball2) {
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Relative velocity
        const dvx = ball2.vx - ball1.vx;
        const dvy = ball2.vy - ball1.vy;
        
        // Relative velocity in collision normal direction
        const dvn = dvx * nx + dvy * ny;
        
        // Do not resolve if velocities are separating
        if (dvn > 0) return;
        
        // Collision impulse
        const impulse = 2 * dvn / (ball1.mass + ball2.mass);
        
        // Update velocities
        ball1.vx += impulse * ball2.mass * nx * this.restitution;
        ball1.vy += impulse * ball2.mass * ny * this.restitution;
        ball2.vx -= impulse * ball1.mass * nx * this.restitution;
        ball2.vy -= impulse * ball1.mass * ny * this.restitution;
        
        // Separate balls
        const overlap = ball1.radius + ball2.radius - distance;
        const separationX = nx * overlap / 2;
        const separationY = ny * overlap / 2;
        
        ball1.x -= separationX;
        ball1.y -= separationY;
        ball2.x += separationX;
        ball2.y += separationY;
    }
    
    drawBalls() {
        for (const ball of this.balls) {
            // Draw trail
            if (ball.trail.length > 1) {
                this.ctx.strokeStyle = ball.color + '40';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                for (let i = 0; i < ball.trail.length; i++) {
                    if (i === 0) {
                        this.ctx.moveTo(ball.trail[i].x, ball.trail[i].y);
                    } else {
                        this.ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
                    }
                }
                
                this.ctx.stroke();
            }
            
            // Draw ball
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw velocity vector
            const velocityScale = 10;
            this.ctx.strokeStyle = ball.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(ball.x, ball.y);
            this.ctx.lineTo(
                ball.x + ball.vx * velocityScale,
                ball.y + ball.vy * velocityScale
            );
            this.ctx.stroke();
        }
    }
    
    drawCollisionInfo() {
        // Draw collision connections
        for (const pair of this.collisionPairs) {
            const intensity = Math.abs(pair.cosine);
            const color = intensity > this.cosineThreshold ? '#00ff88' : '#ff9900';
            
            this.ctx.strokeStyle = color + Math.floor(intensity * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 3 * intensity;
            this.ctx.beginPath();
            this.ctx.moveTo(pair.ball1.x, pair.ball1.y);
            this.ctx.lineTo(pair.ball2.x, pair.ball2.y);
            this.ctx.stroke();
        }
    }
    
    drawImpactHistory() {
        const now = Date.now();
        
        for (const impact of this.impactHistory) {
            const age = (now - impact.time) / 3000; // Normalize to 0-1
            const opacity = 1 - age;
            
            // Draw impact ripple
            const radius = 30 * age + 10;
            this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity * impact.intensity})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw cosine value
            if (age < 0.5) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.font = '14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    `cos: ${impact.cosine.toFixed(2)}`,
                    impact.x,
                    impact.y - radius - 10
                );
            }
        }
    }
    
    drawInfo() {
        // Info box
        const boxX = 20;
        const boxY = 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX, boxY, 300, 120);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Cosine Alignment Demo', boxX + 10, boxY + 25);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('Drag balls to reposition', boxX + 10, boxY + 50);
        this.ctx.fillText(`Active collisions: ${this.collisionPairs.length}`, boxX + 10, boxY + 70);
        this.ctx.fillText(`Threshold: ${this.cosineThreshold}`, boxX + 10, boxY + 90);
        
        // Legend
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(boxX + 180, boxY + 40, 20, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Aligned', boxX + 205, boxY + 49);
        
        this.ctx.fillStyle = '#ff9900';
        this.ctx.fillRect(boxX + 180, boxY + 60, 20, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Orthogonal', boxX + 205, boxY + 69);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update ball velocities based on speed setting
        for (const ball of this.balls) {
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed > 0) {
                ball.vx = (ball.vx / speed) * speed * (newSettings.speed / this.settings.speed);
                ball.vy = (ball.vy / speed) * speed * (newSettings.speed / this.settings.speed);
            }
        }
    }
    
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        
        // Clear arrays
        this.balls = [];
        this.collisionPairs = [];
        this.impactHistory = [];
    }
}