// Scene 2: Identity Through Distinction - Interactive Geometric Classification
export default class Scene2 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Center point
        this.center = { x: canvas.width / 2, y: canvas.height / 2 };
        
        // Vector endpoints
        this.vector1 = { x: this.center.x + 100, y: this.center.y }; // Fixed horizontal
        this.vector2 = { x: this.center.x + 100, y: this.center.y - 100 }; // Draggable
        
        // Interaction state
        this.dragging = false;
        this.hovering = false;
        
        // Animation state
        this.angle = 0;
        this.targetAngle = Math.PI / 4; // 45 degrees
        this.cosineValue = 0;
        this.sineValue = 0;
        this.angleType = 'acute';
        
        // Fourier visualization
        this.fourierAmplitude = 0;
        this.fourierPhase = 0;
        this.time = 0;
        
        // Mouse handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    init() {
        // Update center on resize
        this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.vector1 = { x: this.center.x + 100, y: this.center.y };
        this.vector2 = { x: this.center.x + 100, y: this.center.y - 100 };
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        return Promise.resolve();
    }
    
    handleMouseDown(e) {
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
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check hover state
        const dist = Math.sqrt(
            Math.pow(mouseX - this.vector2.x, 2) + 
            Math.pow(mouseY - this.vector2.y, 2)
        );
        this.hovering = dist < 20;
        
        if (this.dragging) {
            // Update vector2 position
            const dx = mouseX - this.center.x;
            const dy = mouseY - this.center.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                // Normalize to fixed length
                this.vector2.x = this.center.x + (dx / length) * 100;
                this.vector2.y = this.center.y + (dy / length) * 100;
                
                // Update angle
                this.targetAngle = Math.atan2(-dy, dx);
                if (this.targetAngle < 0) this.targetAngle += Math.PI * 2;
            }
        }
    }
    
    handleMouseUp() {
        this.dragging = false;
    }
    
    animate(timestamp) {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update time
        this.time += 0.016 * this.settings.speed;
        
        // Smooth angle transition
        const angleDiff = this.targetAngle - this.angle;
        this.angle += angleDiff * 0.1;
        
        // Calculate trigonometric values
        this.cosineValue = Math.cos(this.angle);
        this.sineValue = Math.sin(this.angle);
        
        // Classify angle
        const degrees = (this.angle * 180 / Math.PI) % 360;
        if (degrees < 90) this.angleType = 'acute';
        else if (degrees === 90) this.angleType = 'right';
        else if (degrees < 180) this.angleType = 'obtuse';
        else if (degrees === 180) this.angleType = 'straight';
        else this.angleType = 'reflex';
        
        // Update Fourier components
        this.fourierAmplitude = Math.abs(this.cosineValue) * this.settings.intensity / 100;
        this.fourierPhase = this.angle;
        
        // Draw components
        this.drawProtractor();
        this.drawVectors();
        this.drawAngleArc();
        this.drawTrigValues();
        this.drawFourierVisualization();
        
        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }
    
    drawProtractor() {
        const radius = 150;
        
        // Draw circle
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw degree markers
        for (let angle = 0; angle < 360; angle += 30) {
            const rad = angle * Math.PI / 180;
            const x1 = this.center.x + Math.cos(rad) * (radius - 10);
            const y1 = this.center.y - Math.sin(rad) * (radius - 10);
            const x2 = this.center.x + Math.cos(rad) * radius;
            const y2 = this.center.y - Math.sin(rad) * radius;
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // Draw degree labels
            if (angle % 90 === 0) {
                const labelX = this.center.x + Math.cos(rad) * (radius + 20);
                const labelY = this.center.y - Math.sin(rad) * (radius + 20);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${angle}°`, labelX, labelY);
            }
        }
    }
    
    drawVectors() {
        // Draw vector1 (fixed horizontal)
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.center.x, this.center.y);
        this.ctx.lineTo(this.vector1.x, this.vector1.y);
        this.ctx.stroke();
        
        // Draw vector2 (draggable)
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.center.x, this.center.y);
        this.ctx.lineTo(this.vector2.x, this.vector2.y);
        this.ctx.stroke();
        
        // Draw draggable endpoint
        this.ctx.fillStyle = this.hovering || this.dragging ? '#ffff00' : '#00ff88';
        this.ctx.beginPath();
        this.ctx.arc(this.vector2.x, this.vector2.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw center point
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawAngleArc() {
        const radius = 50;
        
        // Fill angle arc
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.abs(this.cosineValue) * 0.2})`;
        this.ctx.beginPath();
        this.ctx.moveTo(this.center.x, this.center.y);
        this.ctx.arc(this.center.x, this.center.y, radius, 0, -this.angle, true);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw angle arc
        this.ctx.strokeStyle = this.getAngleColor();
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, radius, 0, -this.angle, true);
        this.ctx.stroke();
        
        // Draw angle value
        const labelAngle = -this.angle / 2;
        const labelX = this.center.x + Math.cos(labelAngle) * (radius + 20);
        const labelY = this.center.y + Math.sin(labelAngle) * (radius + 20);
        
        this.ctx.fillStyle = this.getAngleColor();
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${Math.round(this.angle * 180 / Math.PI)}°`, labelX, labelY);
    }
    
    getAngleColor() {
        switch (this.angleType) {
            case 'acute': return '#00ff88';
            case 'right': return '#ffff00';
            case 'obtuse': return '#ff9900';
            case 'straight': return '#ff0066';
            case 'reflex': return '#9900ff';
            default: return '#ffffff';
        }
    }
    
    drawTrigValues() {
        const boxX = 50;
        const boxY = 50;
        const boxWidth = 250;
        const boxHeight = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Trigonometric Values', boxX + 10, boxY + 25);
        
        // Values
        const values = [
            { label: 'cos θ', value: this.cosineValue.toFixed(3), color: '#00d4ff' },
            { label: 'sin θ', value: this.sineValue.toFixed(3), color: '#00ff88' },
            { label: 'tan θ', value: (this.sineValue / this.cosineValue).toFixed(3), color: '#ff9900' },
            { label: 'Type', value: this.angleType, color: this.getAngleColor() }
        ];
        
        values.forEach((item, index) => {
            const y = boxY + 50 + index * 25;
            
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`${item.label}:`, boxX + 10, y);
            
            this.ctx.fillStyle = item.color;
            this.ctx.font = 'bold 14px monospace';
            this.ctx.fillText(item.value, boxX + 70, y);
        });
    }
    
    drawFourierVisualization() {
        const boxX = this.canvas.width - 320;
        const boxY = 50;
        const boxWidth = 270;
        const boxHeight = 200;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Fourier Component', boxX + 10, boxY + 25);
        
        // Draw waveform
        const waveY = boxY + boxHeight / 2;
        const waveHeight = 60;
        
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let x = 0; x < boxWidth - 20; x++) {
            const t = (x / (boxWidth - 20)) * Math.PI * 4;
            const y = waveY + Math.sin(t + this.time) * waveHeight * this.fourierAmplitude;
            
            if (x === 0) {
                this.ctx.moveTo(boxX + 10 + x, y);
            } else {
                this.ctx.lineTo(boxX + 10 + x, y);
            }
        }
        
        this.ctx.stroke();
        
        // Draw amplitude indicator
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`Amplitude: ${(this.fourierAmplitude * 100).toFixed(1)}%`, boxX + 10, boxY + boxHeight - 20);
    }
    
    drawInfo() {
        if (this.hovering || this.dragging) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(this.vector2.x + 20, this.vector2.y - 30, 150, 25);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Drag to change angle', this.vector2.x + 25, this.vector2.y - 15);
        }
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
}