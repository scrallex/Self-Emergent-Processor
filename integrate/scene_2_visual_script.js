// Scene 2: "Identity Through Distinction" - Interactive Geometric Classification
// Interactive protractor with dynamic angle measurement and real-time classification

class AngleClassificationDemo {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Center point
        this.center = { x: 400, y: 300 };
        
        // Vector endpoints (draggable)
        this.vector1 = { x: 500, y: 300 }; // Fixed horizontal reference
        this.vector2 = { x: 500, y: 200 }; // Draggable vector
        
        // Interaction state
        this.dragging = false;
        this.dragTarget = null;
        
        // Animation state
        this.angle = 0;
        this.cosineValue = 0;
        this.sineValue = 0;
        this.angleType = 'acute';
        
        // Fourier components
        this.fourierAmplitude = 0;
        this.fourierPhase = 0;
        
        this.setupEventListeners();
        this.animate();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if clicking on draggable vector endpoint
            const dist = Math.sqrt(
                Math.pow(mouseX - this.vector2.x, 2) + 
                Math.pow(mouseY - this.vector2.y, 2)
            );
            
            if (dist < 20) {
                this.dragging = true;
                this.dragTarget = 'vector2';
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.dragging && this.dragTarget === 'vector2') {
                const rect = this.canvas.getBoundingClientRect();
                this.vector2.x = e.clientX - rect.left;
                this.vector2.y = e.clientY - rect.top;
                this.updateAngle();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.dragging = false;
            this.dragTarget = null;
        });
    }
    
    updateAngle() {
        // Calculate angle between vectors
        const v1 = { 
            x: this.vector1.x - this.center.x, 
            y: this.vector1.y - this.center.y 
        };
        const v2 = { 
            x: this.vector2.x - this.center.x, 
            y: this.vector2.y - this.center.y 
        };
        
        // Calculate angle using atan2
        const angle1 = Math.atan2(v1.y, v1.x);
        const angle2 = Math.atan2(v2.y, v2.x);
        
        let angleDiff = angle2 - angle1;
        
        // Normalize to [0, 2π]
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        
        this.angle = angleDiff;
        this.cosineValue = Math.cos(angleDiff);
        this.sineValue = Math.sin(angleDiff);
        
        // Classify angle
        const degrees = (angleDiff * 180) / Math.PI;
        if (degrees < 90) {
            this.angleType = 'acute';
        } else if (degrees === 90) {
            this.angleType = 'right';
        } else {
            this.angleType = 'obtuse';
        }
        
        // Update Fourier components
        this.fourierAmplitude = Math.sqrt(this.cosineValue * this.cosineValue + this.sineValue * this.sineValue);
        this.fourierPhase = Math.atan2(this.sineValue, this.cosineValue);
    }
    
    drawProtractor() {
        const { ctx, center } = this;
        
        // Draw protractor arc
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 150, 0, Math.PI, false);
        ctx.stroke();
        
        // Draw degree markings
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 180; i += 30) {
            const angle = (i * Math.PI) / 180;
            const startRadius = 140;
            const endRadius = 150;
            
            ctx.beginPath();
            ctx.moveTo(
                center.x + Math.cos(angle) * startRadius,
                center.y - Math.sin(angle) * startRadius
            );
            ctx.lineTo(
                center.x + Math.cos(angle) * endRadius,
                center.y - Math.sin(angle) * endRadius
            );
            ctx.stroke();
            
            // Draw degree labels
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                i + '°',
                center.x + Math.cos(angle) * 130,
                center.y - Math.sin(angle) * 130 + 4
            );
        }
    }
    
    drawVectors() {
        const { ctx, center, vector1, vector2 } = this;
        
        // Draw vector 1 (fixed reference)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(vector1.x, vector1.y);
        ctx.stroke();
        
        // Draw vector 2 (draggable)
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(vector2.x, vector2.y);
        ctx.stroke();
        
        // Draw draggable endpoint
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(vector2.x, vector2.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw center point
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    drawAngleArc() {
        const { ctx, center, angle, angleType } = this;
        
        // Color based on angle type
        let color;
        switch (angleType) {
            case 'acute': color = '#4ecdc4'; break;
            case 'right': color = '#ff6b6b'; break;
            case 'obtuse': color = '#45b7d1'; break;
        }
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '30'; // Add transparency
        ctx.lineWidth = 4;
        
        // Draw filled arc
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, 80, 0, -angle, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    drawMathDisplay() {
        const { ctx } = this;
        
        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(20, 20, 250, 200);
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Angle Classification', 30, 45);
        
        // Angle type display
        let typeColor;
        switch (this.angleType) {
            case 'acute': typeColor = '#4ecdc4'; break;
            case 'right': typeColor = '#ff6b6b'; break;
            case 'obtuse': typeColor = '#45b7d1'; break;
        }
        
        ctx.fillStyle = typeColor;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.angleType.toUpperCase() + ' ANGLE', 30, 75);
        
        // Numerical values
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`Angle: ${(this.angle * 180 / Math.PI).toFixed(1)}°`, 30, 100);
        ctx.fillText(`Radians: ${this.angle.toFixed(3)}`, 30, 120);
        ctx.fillText(`cos(θ): ${this.cosineValue.toFixed(3)}`, 30, 140);
        ctx.fillText(`sin(θ): ${this.sineValue.toFixed(3)}`, 30, 160);
        ctx.fillText(`Amplitude: ${this.fourierAmplitude.toFixed(3)}`, 30, 180);
        ctx.fillText(`Phase: ${this.fourierPhase.toFixed(3)}`, 30, 200);
    }
    
    drawFourierDecomposition() {
        const { ctx } = this;
        
        // Fourier panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(520, 20, 260, 300);
        
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Fourier Decomposition', 530, 45);
        
        // Cosine component
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '14px Arial';
        ctx.fillText('Cosine Component:', 530, 75);
        
        const cosineBarWidth = Math.abs(this.cosineValue) * 100;
        ctx.fillStyle = this.cosineValue >= 0 ? '#4ecdc4' : '#ff6b6b';
        ctx.fillRect(530, 85, cosineBarWidth, 20);
        
        // Sine component
        ctx.fillStyle = '#fff';
        ctx.fillText('Sine Component:', 530, 125);
        
        const sineBarWidth = Math.abs(this.sineValue) * 100;
        ctx.fillStyle = this.sineValue >= 0 ? '#4ecdc4' : '#ff6b6b';
        ctx.fillRect(530, 135, sineBarWidth, 20);
        
        // Combined wave visualization
        ctx.fillStyle = '#fff';
        ctx.fillText('Combined Wave:', 530, 175);
        
        // Draw mini sine/cosine waves
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < 200; x += 2) {
            const t = (x / 200) * 4 * Math.PI;
            const y = this.cosineValue * Math.cos(t + this.fourierPhase);
            if (x === 0) {
                ctx.moveTo(530 + x, 200 + y * 30);
            } else {
                ctx.lineTo(530 + x, 200 + y * 30);
            }
        }
        ctx.stroke();
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update angle calculations
        this.updateAngle();
        
        // Draw all components
        this.drawProtractor();
        this.drawAngleArc();
        this.drawVectors();
        this.drawMathDisplay();
        this.drawFourierDecomposition();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    const demo = new AngleClassificationDemo('angleCanvas');
});

// HTML structure needed:
/*
<canvas id="angleCanvas" style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
<div style="margin-top: 20px; font-family: Arial;">
    <h3>Instructions:</h3>
    <p>Drag the red endpoint to change the angle between vectors.</p>
    <p>Watch how the angle classification changes in real-time:</p>
    <ul>
        <li><strong style="color: #4ecdc4;">Acute</strong> (&lt; 90°): Positive cosine, convergent</li>
        <li><strong style="color: #ff6b6b;">Right</strong> (= 90°): Zero cosine, orthogonal</li>
        <li><strong style="color: #45b7d1;">Obtuse</strong> (&gt; 90°): Negative cosine, divergent</li>
    </ul>
</div>
*/