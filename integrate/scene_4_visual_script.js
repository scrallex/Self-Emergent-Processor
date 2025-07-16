// Scene 4: "Sine Deviation" - Tangent Explosion with Spring Boundary System
// Interactive angle slider showing sine/cosine curves and tangent blowup near 90°

class SineDeviationDemo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 700;
        
        // Demo parameters
        this.angle = Math.PI / 4; // 45 degrees
        this.maxAngle = Math.PI / 2 - 0.01; // Just before 90°
        this.animationAngle = 0;
        this.animationSpeed = 0.02;
        this.autoAnimate = true;
        
        // Billiard ball physics
        this.ball = {
            x: 150,
            y: 350,
            vx: 3,
            vy: 2,
            radius: 10,
            trail: []
        };
        
        // Spring system for boundary enforcement
        this.springs = [];
        this.initializeSprings();
        
        // Interaction state
        this.dragging = false;
        this.sliderX = 500;
        this.sliderY = 100;
        this.sliderWidth = 300;
        
        // Visual state
        this.tangentExplosion = false;
        this.explosionTime = 0;
        this.normalForces = [];
        
        this.setupEventListeners();
        this.animate();
    }
    
    initializeSprings() {
        // Create boundary springs around the billiard area
        const billiardBounds = {
            left: 50,
            right: 450,
            top: 200,
            bottom: 500
        };
        
        // Left wall springs
        for (let y = billiardBounds.top; y <= billiardBounds.bottom; y += 30) {
            this.springs.push({
                x: billiardBounds.left,
                y: y,
                restLength: 0,
                force: 0,
                active: false
            });
        }
        
        // Right wall springs
        for (let y = billiardBounds.top; y <= billiardBounds.bottom; y += 30) {
            this.springs.push({
                x: billiardBounds.right,
                y: y,
                restLength: 0,
                force: 0,
                active: false
            });
        }
        
        // Top wall springs
        for (let x = billiardBounds.left; x <= billiardBounds.right; x += 30) {
            this.springs.push({
                x: x,
                y: billiardBounds.top,
                restLength: 0,
                force: 0,
                active: false
            });
        }
        
        // Bottom wall springs
        for (let x = billiardBounds.left; x <= billiardBounds.right; x += 30) {
            this.springs.push({
                x: x,
                y: billiardBounds.bottom,
                restLength: 0,
                force: 0,
                active: false
            });
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if clicking on slider
            if (mouseX >= this.sliderX && mouseX <= this.sliderX + this.sliderWidth &&
                mouseY >= this.sliderY - 10 && mouseY <= this.sliderY + 10) {
                this.dragging = true;
                this.autoAnimate = false;
                this.updateAngleFromSlider(mouseX);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.dragging) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                this.updateAngleFromSlider(mouseX);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.dragging = false;
        });
        
        // Toggle animation
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                this.autoAnimate = !this.autoAnimate;
            }
            if (e.key === 'r' || e.key === 'R') {
                this.angle = Math.PI / 4;
                this.ball.x = 150;
                this.ball.y = 350;
                this.ball.vx = 3;
                this.ball.vy = 2;
                this.ball.trail = [];
            }
        });
    }
    
    updateAngleFromSlider(mouseX) {
        const sliderPos = Math.max(0, Math.min(1, (mouseX - this.sliderX) / this.sliderWidth));
        this.angle = sliderPos * this.maxAngle;
        
        // Check for tangent explosion
        if (this.angle > Math.PI / 2 - 0.1) {
            this.tangentExplosion = true;
            this.explosionTime = Date.now();
        }
    }
    
    updateBallPhysics() {
        // Update ball position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Add to trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 50) {
            this.ball.trail.shift();
        }
        
        // Clear normal forces
        this.normalForces = [];
        
        // Check boundary collisions with sine-modulated forces
        const bounds = { left: 50, right: 450, top: 200, bottom: 500 };
        
        // Left wall collision
        if (this.ball.x - this.ball.radius <= bounds.left) {
            this.ball.x = bounds.left + this.ball.radius;
            this.ball.vx = -this.ball.vx;
            this.handleBoundaryCollision(bounds.left, this.ball.y, 'vertical');
        }
        
        // Right wall collision
        if (this.ball.x + this.ball.radius >= bounds.right) {
            this.ball.x = bounds.right - this.ball.radius;
            this.ball.vx = -this.ball.vx;
            this.handleBoundaryCollision(bounds.right, this.ball.y, 'vertical');
        }
        
        // Top wall collision
        if (this.ball.y - this.ball.radius <= bounds.top) {
            this.ball.y = bounds.top + this.ball.radius;
            this.ball.vy = -this.ball.vy;
            this.handleBoundaryCollision(this.ball.x, bounds.top, 'horizontal');
        }
        
        // Bottom wall collision
        if (this.ball.y + this.ball.radius >= bounds.bottom) {
            this.ball.y = bounds.bottom - this.ball.radius;
            this.ball.vy = -this.ball.vy;
            this.handleBoundaryCollision(this.ball.x, bounds.bottom, 'horizontal');
        }
        
        // Update spring forces
        this.updateSprings();
    }
    
    handleBoundaryCollision(wallX, wallY, orientation) {
        // Calculate sine-modulated normal force
        const sineValue = Math.sin(this.angle);
        const cosineValue = Math.cos(this.angle);
        const tangentValue = sineValue / cosineValue;
        
        // Larger deviations (higher sine) amplify normal forces
        const normalForce = Math.abs(sineValue) * 50;
        
        // Create visual normal force
        this.normalForces.push({
            x: wallX,
            y: wallY,
            force: normalForce,
            orientation: orientation,
            time: Date.now()
        });
        
        // Apply tangent explosion effect near 90 degrees
        if (Math.abs(tangentValue) > 10) {
            this.tangentExplosion = true;
            this.explosionTime = Date.now();
            
            // Explosive force pushes ball away from boundary
            const pushForce = Math.min(Math.abs(tangentValue) * 0.1, 2);
            if (orientation === 'vertical') {
                this.ball.vx += this.ball.vx > 0 ? pushForce : -pushForce;
            } else {
                this.ball.vy += this.ball.vy > 0 ? pushForce : -pushForce;
            }
        }
    }
    
    updateSprings() {
        // Calculate forces on springs based on ball proximity
        for (const spring of this.springs) {
            const dx = this.ball.x - spring.x;
            const dy = this.ball.y - spring.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                spring.active = true;
                spring.force = Math.max(0, 1 - distance / 50);
            } else {
                spring.active = false;
                spring.force = 0;
            }
        }
    }
    
    drawAngleSlider() {
        const { ctx } = this;
        
        // Slider background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.sliderX, this.sliderY - 5, this.sliderWidth, 10);
        
        // Slider track
        ctx.fillStyle = '#666';
        ctx.fillRect(this.sliderX, this.sliderY - 2, this.sliderWidth, 4);
        
        // Slider handle
        const handlePos = (this.angle / this.maxAngle) * this.sliderWidth;
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(this.sliderX + handlePos, this.sliderY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Angle display
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Angle: ${(this.angle * 180 / Math.PI).toFixed(1)}°`, this.sliderX + this.sliderWidth / 2, this.sliderY - 20);
        
        // Danger zone indicator
        const dangerStart = (Math.PI / 2 - 0.2) / this.maxAngle * this.sliderWidth;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(this.sliderX + dangerStart, this.sliderY - 5, this.sliderWidth - dangerStart, 10);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('TANGENT EXPLOSION ZONE', this.sliderX + dangerStart + 5, this.sliderY - 10);
    }
    
    drawTrigFunctions() {
        const { ctx } = this;
        
        // Function plot area
        const plotX = 550;
        const plotY = 200;
        const plotWidth = 400;
        const plotHeight = 200;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(plotX, plotY, plotWidth, plotHeight);
        
        // Grid
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = plotX + (i / 10) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, plotY);
            ctx.lineTo(x, plotY + plotHeight);
            ctx.stroke();
        }
        
        for (let i = 0; i <= 10; i++) {
            const y = plotY + (i / 10) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(plotX, y);
            ctx.lineTo(plotX + plotWidth, y);
            ctx.stroke();
        }
        
        // Draw sine curve
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= plotWidth; i++) {
            const angle = (i / plotWidth) * this.maxAngle;
            const sineValue = Math.sin(angle);
            const x = plotX + i;
            const y = plotY + plotHeight - (sineValue + 1) * plotHeight / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw cosine curve
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= plotWidth; i++) {
            const angle = (i / plotWidth) * this.maxAngle;
            const cosineValue = Math.cos(angle);
            const x = plotX + i;
            const y = plotY + plotHeight - (cosineValue + 1) * plotHeight / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw tangent curve (clipped)
        ctx.strokeStyle = '#f7b731';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let tangentStarted = false;
        for (let i = 0; i <= plotWidth; i++) {
            const angle = (i / plotWidth) * this.maxAngle;
            const tangentValue = Math.tan(angle);
            
            if (Math.abs(tangentValue) < 10) { // Clip extreme values
                const x = plotX + i;
                const y = plotY + plotHeight - (tangentValue + 10) * plotHeight / 20;
                
                if (!tangentStarted) {
                    ctx.moveTo(x, y);
                    tangentStarted = true;
                } else {
                    ctx.lineTo(x, y);
                }
            } else {
                tangentStarted = false;
            }
        }
        ctx.stroke();
        
        // Current angle indicator
        const currentX = plotX + (this.angle / this.maxAngle) * plotWidth;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(currentX, plotY);
        ctx.lineTo(currentX, plotY + plotHeight);
        ctx.stroke();
        
        // Current values
        const sineValue = Math.sin(this.angle);
        const cosineValue = Math.cos(this.angle);
        const tangentValue = Math.tan(this.angle);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Functions:', plotX + 10, plotY + 20);
        
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText(`sin(θ) = ${sineValue.toFixed(3)}`, plotX + 10, plotY + 40);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText(`cos(θ) = ${cosineValue.toFixed(3)}`, plotX + 10, plotY + 60);
        
        ctx.fillStyle = '#f7b731';
        const tangentText = Math.abs(tangentValue) > 100 ? '∞' : tangentValue.toFixed(3);
        ctx.fillText(`tan(θ) = ${tangentText}`, plotX + 10, plotY + 80);
        
        // Explosion warning
        if (Math.abs(tangentValue) > 10) {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('TANGENT EXPLOSION!', plotX + 10, plotY + 110);
        }
    }
    
    drawBilliardSystem() {
        const { ctx } = this;
        
        // Billiard table bounds
        const bounds = { left: 50, right: 450, top: 200, bottom: 500 };
        
        // Table background
        ctx.fillStyle = '#2d5a2d';
        ctx.fillRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        
        // Table borders
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        
        // Draw springs
        for (const spring of this.springs) {
            if (spring.active) {
                const alpha = spring.force;
                ctx.strokeStyle = `rgba(255, 107, 107, ${alpha})`;
                ctx.lineWidth = 2 + spring.force * 4;
                
                // Draw spring coils
                const coilRadius = 5 + spring.force * 5;
                ctx.beginPath();
                
                if (spring.x === bounds.left || spring.x === bounds.right) {
                    // Vertical spring
                    ctx.arc(spring.x, spring.y, coilRadius, 0, 2 * Math.PI);
                } else {
                    // Horizontal spring
                    ctx.arc(spring.x, spring.y, coilRadius, 0, 2 * Math.PI);
                }
                ctx.stroke();
            }
        }
        
        // Draw normal forces
        const currentTime = Date.now();
        this.normalForces = this.normalForces.filter(force => currentTime - force.time < 1000);
        
        for (const force of this.normalForces) {
            const age = currentTime - force.time;
            const alpha = Math.max(0, 1 - age / 1000);
            
            ctx.strokeStyle = `rgba(247, 183, 49, ${alpha})`;
            ctx.lineWidth = 3;
            
            const forceLength = force.force * 2;
            if (force.orientation === 'vertical') {
                ctx.beginPath();
                ctx.moveTo(force.x, force.y - forceLength);
                ctx.lineTo(force.x, force.y + forceLength);
                ctx.stroke();
                
                // Arrow heads
                ctx.beginPath();
                ctx.moveTo(force.x, force.y - forceLength);
                ctx.lineTo(force.x - 5, force.y - forceLength + 10);
                ctx.lineTo(force.x + 5, force.y - forceLength + 10);
                ctx.closePath();
                ctx.fillStyle = `rgba(247, 183, 49, ${alpha})`;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(force.x - forceLength, force.y);
                ctx.lineTo(force.x + forceLength, force.y);
                ctx.stroke();
                
                // Arrow heads
                ctx.beginPath();
                ctx.moveTo(force.x - forceLength, force.y);
                ctx.lineTo(force.x - forceLength + 10, force.y - 5);
                ctx.lineTo(force.x - forceLength + 10, force.y + 5);
                ctx.closePath();
                ctx.fillStyle = `rgba(247, 183, 49, ${alpha})`;
                ctx.fill();
            }
        }
        
        // Draw ball trail
        if (this.ball.trail.length > 1) {
            ctx.strokeStyle = '#4ecdc4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.ball.trail[0].x, this.ball.trail[0].y);
            for (let i = 1; i < this.ball.trail.length; i++) {
                ctx.lineTo(this.ball.trail[i].x, this.ball.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw ball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ball velocity vector
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.ball.x, this.ball.y);
        ctx.lineTo(this.ball.x + this.ball.vx * 10, this.ball.y + this.ball.vy * 10);
        ctx.stroke();
        
        // Tangent explosion effect
        if (this.tangentExplosion) {
            const explosionAge = Date.now() - this.explosionTime;
            if (explosionAge < 1000) {
                const alpha = Math.max(0, 1 - explosionAge / 1000);
                const radius = (explosionAge / 1000) * 100;
                
                ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(this.ball.x, this.ball.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
                
                // Explosion rays
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const x1 = this.ball.x + Math.cos(angle) * radius * 0.5;
                    const y1 = this.ball.y + Math.sin(angle) * radius * 0.5;
                    const x2 = this.ball.x + Math.cos(angle) * radius;
                    const y2 = this.ball.y + Math.sin(angle) * radius;
                    
                    ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            } else {
                this.tangentExplosion = false;
            }
        }
    }
    
    drawUI() {
        const { ctx } = this;
        
        // Instructions
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 300, 150);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Sine Deviation Demo', 20, 35);
        
        ctx.font = '12px Arial';
        ctx.fillText('• Drag slider to change angle', 20, 55);
        ctx.fillText('• Watch tangent explosion near 90°', 20, 75);
        ctx.fillText('• Sine modulates boundary forces', 20, 95);
        ctx.fillText('• Space: toggle auto-animation', 20, 115);
        ctx.fillText('• R: reset ball position', 20, 135);
        
        // Status
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        const sineValue = Math.sin(this.angle);
        const deviation = Math.abs(sineValue);
        
        ctx.fillText(`Sine Deviation: ${deviation.toFixed(3)}`, 20, 580);
        ctx.fillText(`Boundary Force: ${(deviation * 100).toFixed(1)}%`, 20, 600);
        
        if (this.autoAnimate) {
            ctx.fillStyle = '#4ecdc4';
            ctx.fillText('AUTO-ANIMATE ON', 20, 640);
        }
    }
    
    animate() {
        // Auto-animate angle if enabled
        if (this.autoAnimate) {
            this.animationAngle += this.animationSpeed;
            this.angle = (Math.sin(this.animationAngle) + 1) * 0.5 * this.maxAngle;
            
            // Check for tangent explosion
            if (this.angle > Math.PI / 2 - 0.1) {
                this.tangentExplosion = true;
                this.explosionTime = Date.now();
            }
        }
        
        // Update physics
        this.updateBallPhysics();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all components
        this.drawBilliardSystem();
        this.drawAngleSlider();
        this.drawTrigFunctions();
        this.drawUI();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    const demo = new SineDeviationDemo('sineCanvas');
});

// HTML structure needed:
/*
<canvas id="sineCanvas" style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
<div style="margin-top: 20px; font-family: Arial;">
    <h3>Sine Deviation & Tangent Explosion</h3>
    <p>This demo shows how sine handles deviation and tangent "explodes" near 90°:</p>
    <ul>
        <li><strong>Sine (teal)</strong>: Measures perpendicular deviation component</li>
        <li><strong>Cosine (red)</strong>: Measures alignment component</li>
        <li><strong>Tangent (yellow)</strong>: Sine/cosine ratio - explodes as cosine → 0</li>
        <li><strong>Spring boundaries</strong>: Activate based on sine-modulated forces</li>
        <li><strong>Normal forces</strong>: Sine amplifies boundary containment</li>
    </ul>
    <p>Watch how the tangent explosion creates a spring-like restoring force that prevents decoherence!</p>
</div>
*/