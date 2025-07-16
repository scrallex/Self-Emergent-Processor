// Scene 4: Sine Deviation - Tangent Explosion with Spring Boundary System
export default class Scene4 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Demo parameters
        this.angle = Math.PI / 4; // 45 degrees
        this.maxAngle = Math.PI / 2 - 0.01; // Just before 90°
        this.animationAngle = 0;
        this.autoAnimate = true;
        
        // Billiard ball physics
        this.ball = {
            x: 150,
            y: canvas.height / 2,
            vx: 3,
            vy: 2,
            radius: 10,
            trail: []
        };
        
        // Boundary springs
        this.springs = [];
        this.springK = 0.1; // Spring constant
        this.springDamping = 0.95;
        
        // Billiard area
        this.billiardBounds = {
            left: 50,
            right: canvas.width / 2 - 50,
            top: 150,
            bottom: canvas.height - 150
        };
        
        // Interaction state
        this.dragging = false;
        this.sliderRect = null;
        
        // Visual state
        this.tangentExplosion = false;
        this.explosionTime = 0;
        this.normalForces = [];
        
        // Mouse handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    init() {
        // Initialize springs
      this.resize();
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        return Promise.resolve();
    }

  resize() {
    this.billiardBounds = {
      left: 50,
      right: this.canvas.width / 2 - 50,
      top: 150,
      bottom: this.canvas.height - 150
    };
    this.initializeSprings();
  }

    initializeSprings() {
        this.springs = [];
        const springCount = 20;
        
        // Top and bottom springs
        for (let i = 0; i <= springCount; i++) {
            const x = this.billiardBounds.left + 
                      (this.billiardBounds.right - this.billiardBounds.left) * i / springCount;
            
            // Top spring
            this.springs.push({
                x: x,
                y: this.billiardBounds.top,
                restLength: 0,
                currentLength: 0,
                force: 0,
                side: 'top'
            });
            
            // Bottom spring
            this.springs.push({
                x: x,
                y: this.billiardBounds.bottom,
                restLength: 0,
                currentLength: 0,
                force: 0,
                side: 'bottom'
            });
        }
        
        // Left and right springs
        for (let i = 0; i <= springCount; i++) {
            const y = this.billiardBounds.top + 
                      (this.billiardBounds.bottom - this.billiardBounds.top) * i / springCount;
            
            // Left spring
            this.springs.push({
                x: this.billiardBounds.left,
                y: y,
                restLength: 0,
                currentLength: 0,
                force: 0,
                side: 'left'
            });
            
            // Right spring
            this.springs.push({
                x: this.billiardBounds.right,
                y: y,
                restLength: 0,
                currentLength: 0,
                force: 0,
                side: 'right'
            });
        }
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if clicking on slider
        if (this.sliderRect && 
            mouseX >= this.sliderRect.x && 
            mouseX <= this.sliderRect.x + this.sliderRect.width &&
            mouseY >= this.sliderRect.y - 20 && 
            mouseY <= this.sliderRect.y + 20) {
            this.dragging = true;
            this.autoAnimate = false;
        }
    }
    
    handleMouseMove(e) {
        if (this.dragging && this.sliderRect) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            // Update angle based on mouse position
            const normalized = (mouseX - this.sliderRect.x) / this.sliderRect.width;
            this.angle = Math.max(0, Math.min(this.maxAngle, normalized * this.maxAngle));
        }
    }
    
    handleMouseUp() {
        this.dragging = false;
    }
    
    animate(timestamp) {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Auto-animate angle if enabled
        if (this.autoAnimate) {
            this.animationAngle += 0.01 * this.settings.speed;
            this.angle = (Math.sin(this.animationAngle) * 0.5 + 0.5) * this.maxAngle;
        }
        
        // Check for tangent explosion
        this.tangentExplosion = this.angle > (Math.PI / 2 - 0.1);
        if (this.tangentExplosion) {
            this.explosionTime += 0.016;
        } else {
            this.explosionTime = 0;
        }
        
        // Update physics
        this.updateBallPhysics();
        this.updateSprings();
        
        // Draw components
        this.drawBilliardArea();
        this.drawSprings();
        this.drawBall();
        this.drawAngleSlider();
        this.drawTrigonometricGraphs();
        this.drawTangentVisualization();
        
        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }
    
    updateBallPhysics() {
        // Update position
        this.ball.x += this.ball.vx * this.settings.speed;
        this.ball.y += this.ball.vy * this.settings.speed;
        
        // Add to trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 50) {
            this.ball.trail.shift();
        }
        
        // Boundary collisions with spring response
        const tangentFactor = Math.tan(this.angle);
        const springStrength = this.tangentExplosion ? 
            Math.min(tangentFactor * 0.5, 10) : 1;
        
        // Clear normal forces
        this.normalForces = [];
        
        if (this.ball.x - this.ball.radius < this.billiardBounds.left) {
            this.ball.vx = Math.abs(this.ball.vx) * springStrength;
            this.ball.x = this.billiardBounds.left + this.ball.radius;
            this.normalForces.push({ 
                x: this.ball.x - this.ball.radius, 
                y: this.ball.y, 
                magnitude: springStrength 
            });
        }
        
        if (this.ball.x + this.ball.radius > this.billiardBounds.right) {
            this.ball.vx = -Math.abs(this.ball.vx) * springStrength;
            this.ball.x = this.billiardBounds.right - this.ball.radius;
            this.normalForces.push({ 
                x: this.ball.x + this.ball.radius, 
                y: this.ball.y, 
                magnitude: springStrength 
            });
        }
        
        if (this.ball.y - this.ball.radius < this.billiardBounds.top) {
            this.ball.vy = Math.abs(this.ball.vy) * springStrength;
            this.ball.y = this.billiardBounds.top + this.ball.radius;
            this.normalForces.push({ 
                x: this.ball.x, 
                y: this.ball.y - this.ball.radius, 
                magnitude: springStrength 
            });
        }
        
        if (this.ball.y + this.ball.radius > this.billiardBounds.bottom) {
            this.ball.vy = -Math.abs(this.ball.vy) * springStrength;
            this.ball.y = this.billiardBounds.bottom - this.ball.radius;
            this.normalForces.push({ 
                x: this.ball.x, 
                y: this.ball.y + this.ball.radius, 
                magnitude: springStrength 
            });
        }
        
        // Apply damping
        this.ball.vx *= this.springDamping;
        this.ball.vy *= this.springDamping;
    }
    
    updateSprings() {
        const tangentFactor = Math.tan(this.angle);
        
        for (const spring of this.springs) {
            // Calculate distance to ball
            const dx = this.ball.x - spring.x;
            const dy = this.ball.y - spring.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate spring compression based on tangent
            if (distance < 100) {
                const compression = (100 - distance) / 100;
                spring.currentLength = compression * tangentFactor * 20;
                spring.force = spring.currentLength * this.springK;
            } else {
                spring.currentLength *= 0.9; // Damping
                spring.force = spring.currentLength * this.springK;
            }
        }
    }
    
    drawBilliardArea() {
        // Draw boundary
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.billiardBounds.left,
            this.billiardBounds.top,
            this.billiardBounds.right - this.billiardBounds.left,
            this.billiardBounds.bottom - this.billiardBounds.top
        );
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = this.billiardBounds.left; x <= this.billiardBounds.right; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.billiardBounds.top);
            this.ctx.lineTo(x, this.billiardBounds.bottom);
            this.ctx.stroke();
        }
        
        for (let y = this.billiardBounds.top; y <= this.billiardBounds.bottom; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.billiardBounds.left, y);
            this.ctx.lineTo(this.billiardBounds.right, y);
            this.ctx.stroke();
        }
    }
    
    drawSprings() {
        for (const spring of this.springs) {
            if (spring.currentLength > 0) {
                let endX = spring.x;
                let endY = spring.y;
                
                // Calculate spring end position based on side
                switch (spring.side) {
                    case 'top':
                        endY -= spring.currentLength;
                        break;
                    case 'bottom':
                        endY += spring.currentLength;
                        break;
                    case 'left':
                        endX -= spring.currentLength;
                        break;
                    case 'right':
                        endX += spring.currentLength;
                        break;
                }
                
                // Draw spring
                const intensity = Math.min(spring.force * 5, 1);
                this.ctx.strokeStyle = this.tangentExplosion ? 
                    `rgba(255, ${100 - intensity * 100}, 0, ${intensity})` :
                    `rgba(0, 255, 136, ${intensity})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(spring.x, spring.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }
    }
    
    drawBall() {
        // Draw trail
        if (this.ball.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < this.ball.trail.length; i++) {
                if (i === 0) {
                    this.ctx.moveTo(this.ball.trail[i].x, this.ball.trail[i].y);
                } else {
                    this.ctx.lineTo(this.ball.trail[i].x, this.ball.trail[i].y);
                }
            }
            
            this.ctx.stroke();
        }
        
        // Draw ball
        this.ctx.fillStyle = this.tangentExplosion ? '#ff6600' : '#00d4ff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw normal forces
        for (const force of this.normalForces) {
            const length = force.magnitude * 20;
            
            // Draw force arrow
            this.ctx.strokeStyle = '#ff0066';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            
            let endX = force.x;
            let endY = force.y;
            
            if (force.x < this.billiardBounds.left + 10) {
                endX = force.x + length;
            } else if (force.x > this.billiardBounds.right - 10) {
                endX = force.x - length;
            } else if (force.y < this.billiardBounds.top + 10) {
                endY = force.y + length;
            } else {
                endY = force.y - length;
            }
            
            this.ctx.moveTo(force.x, force.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }
    
    drawAngleSlider() {
        const sliderX = this.canvas.width / 2 + 50;
        const sliderY = 100;
        const sliderWidth = 300;
        
        this.sliderRect = { x: sliderX, y: sliderY, width: sliderWidth };
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(sliderX - 10, sliderY - 40, sliderWidth + 20, 80);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Angle Control', sliderX + sliderWidth / 2, sliderY - 20);
        
        // Slider track
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(sliderX, sliderY);
        this.ctx.lineTo(sliderX + sliderWidth, sliderY);
        this.ctx.stroke();
        
        // Slider handle
        const handleX = sliderX + (this.angle / this.maxAngle) * sliderWidth;
        this.ctx.fillStyle = this.dragging ? '#ffff00' : '#00d4ff';
        this.ctx.beginPath();
        this.ctx.arc(handleX, sliderY, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Angle value
        const degrees = this.angle * 180 / Math.PI;
        this.ctx.fillStyle = this.tangentExplosion ? '#ff0066' : '#00ff88';
        this.ctx.font = 'bold 18px monospace';
        this.ctx.fillText(`${degrees.toFixed(1)}°`, sliderX + sliderWidth / 2, sliderY + 25);
    }
    
    drawTrigonometricGraphs() {
        const graphX = this.canvas.width / 2 + 50;
        const graphY = 250;
        const graphWidth = 300;
        const graphHeight = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(graphX - 10, graphY - 10, graphWidth + 20, graphHeight * 2 + 30);
        
        // Draw sine/cosine graph
        this.drawTrigGraph(graphX, graphY, graphWidth, graphHeight, 'Sine & Cosine');
        
        // Draw tangent graph
        this.drawTrigGraph(graphX, graphY + graphHeight + 20, graphWidth, graphHeight, 'Tangent');
    }
    
    drawTrigGraph(x, y, width, height, title) {
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x, y - 5);
        
        // Axes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height / 2);
        this.ctx.lineTo(x + width, y + height / 2);
        this.ctx.stroke();
        
        // Draw functions
        if (title === 'Sine & Cosine') {
            // Sine
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let px = 0; px < width; px++) {
                const angle = (px / width) * Math.PI;
                const py = y + height / 2 - Math.sin(angle) * height / 2;
                
                if (px === 0) {
                    this.ctx.moveTo(x + px, py);
                } else {
                    this.ctx.lineTo(x + px, py);
                }
            }
            this.ctx.stroke();
            
            // Cosine
            this.ctx.strokeStyle = '#00d4ff';
            this.ctx.beginPath();
            
            for (let px = 0; px < width; px++) {
                const angle = (px / width) * Math.PI;
                const py = y + height / 2 - Math.cos(angle) * height / 2;
                
                if (px === 0) {
                    this.ctx.moveTo(x + px, py);
                } else {
                    this.ctx.lineTo(x + px, py);
                }
            }
            this.ctx.stroke();
        } else {
            // Tangent
            this.ctx.strokeStyle = this.tangentExplosion ? '#ff0066' : '#ff9900';
            this.ctx.lineWidth = 2;
          this.ctx.beginPath();
            
          let lastY = null;
            for (let px = 0; px < width; px++) {
                const angle = (px / width) * Math.PI;
              const tanValue = Math.tan(angle);
              const py = y + height / 2 - tanValue * height / 10;

              if (angle > Math.PI / 2 - 0.02 && angle < Math.PI / 2 + 0.02) {
                // Asymptote, break the line
                this.ctx.moveTo(x + px, py);
                lastY = null;
              } else if (lastY !== null) {
                this.ctx.lineTo(x + px, py);
                } else {
                  this.ctx.moveTo(x + px, py);
                  lastY = py;
                }
            }
          this.ctx.stroke();
        }
        
        // Current angle indicator
        const currentX = x + (this.angle / Math.PI) * width;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, y);
        this.ctx.lineTo(currentX, y + height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawTangentVisualization() {
        if (this.tangentExplosion) {
            // Draw explosion effect
            const centerX = this.canvas.width / 2 + 200;
            const centerY = this.canvas.height - 150;
            
            // Pulsing circles
            const pulseCount = 5;
            for (let i = 0; i < pulseCount; i++) {
                const phase = (this.explosionTime * 0.05 + i / pulseCount) % 1;
                const radius = phase * 100;
                const opacity = 1 - phase;
                
                this.ctx.strokeStyle = `rgba(255, 0, 102, ${opacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Warning text
            this.ctx.fillStyle = '#ff0066';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('TANGENT EXPLOSION!', centerX, centerY);
            
            // Value
            const tanValue = Math.tan(this.angle);
            this.ctx.font = '18px monospace';
            this.ctx.fillText(`tan(θ) = ${tanValue.toFixed(2)}`, centerX, centerY + 30);
        }
    }
    
    drawInfo() {
        const infoX = this.canvas.width / 2 + 50;
        const infoY = this.canvas.height - 100;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(infoX, infoY, 300, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const cosValue = Math.cos(this.angle);
        const sinValue = Math.sin(this.angle);
        const tanValue = Math.tan(this.angle);
        
        this.ctx.fillText(`cos(${(this.angle * 180 / Math.PI).toFixed(1)}°) = ${cosValue.toFixed(3)}`, infoX + 10, infoY + 20);
        this.ctx.fillText(`sin(${(this.angle * 180 / Math.PI).toFixed(1)}°) = ${sinValue.toFixed(3)}`, infoX + 10, infoY + 40);
        this.ctx.fillText(`tan(${(this.angle * 180 / Math.PI).toFixed(1)}°) = ${tanValue.toFixed(3)}`, infoX + 10, infoY + 60);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        
        // Clear arrays
        this.springs = [];
        this.normalForces = [];
        this.ball.trail = [];
    }
}