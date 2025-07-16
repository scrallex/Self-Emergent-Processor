// Scene 1: SEP Introduction - Wave Interference
export default class Scene1 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Animation state
        this.time = 0;
        this.waves = [];
        this.fourierComponents = [];
        
        // Initialize waves
      this.init();
    }
    
    init() {
        // Setup initial state
    this.initializeWaves();
    this.resize();
    return Promise.resolve();
  }

  resize() {
        // Create wave sources
        this.waves = [
          { x: this.canvas.width * 0.3, y: this.canvas.height * 0.5, frequency: 0.02, amplitude: 50, phase: 0, color: 'rgba(0, 212, 255, 0.6)' },
          { x: this.canvas.width * 0.7, y: this.canvas.height * 0.5, frequency: 0.015, amplitude: 40, phase: Math.PI / 4, color: 'rgba(0, 255, 136, 0.6)' }
        ];
    }
    
    initializeWaves() {
        // Fourier components for display
        this.fourierComponents = [
            { n: 1, amplitude: 1.0, frequency: 1.0 },
            { n: 3, amplitude: 0.33, frequency: 3.0 },
            { n: 5, amplitude: 0.2, frequency: 5.0 },
            { n: 7, amplitude: 0.14, frequency: 7.0 }
        ];
    }
    
    animate(timestamp) {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update time
        this.time += 0.016 * this.settings.speed;
        
        // Draw wave interference pattern
        this.drawInterference();
        
        // Draw Fourier components
        this.drawFourierComponents();
        
        // Draw info overlay
        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }
    
    drawInterference() {
        const gridSize = 20;
        const intensity = this.settings.intensity / 100;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                let totalAmplitude = 0;
                
                // Calculate wave contribution from each source
                this.waves.forEach(wave => {
                    const distance = Math.sqrt(
                        Math.pow(x - wave.x, 2) + Math.pow(y - wave.y, 2)
                    );
                    
                    const amplitude = wave.amplitude * Math.sin(
                        distance * wave.frequency - this.time * 2 + wave.phase
                    ) / (1 + distance * 0.001);
                    
                    totalAmplitude += amplitude;
                });
                
                // Map amplitude to color
              const normalizedAmp = Math.min(1, Math.abs(totalAmplitude) / (50 * intensity));
                
              if (normalizedAmp > 0.1) {
                const hue = 180 + normalizedAmp * 60; // From cyan to green
                this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${normalizedAmp * 0.8})`;
                    this.ctx.fillRect(x - gridSize/2, y - gridSize/2, gridSize, gridSize);
                }
            }
        }
        
        // Draw wave sources
        this.waves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = wave.color;
            this.ctx.fill();
            
            // Ripples
            for (let i = 1; i <= 5; i++) {
                const radius = i * 30 * (1 + Math.sin(this.time * 2) * 0.1);
                this.ctx.beginPath();
                this.ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = wave.color.replace('0.6', (0.6 - i * 0.1).toString());
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }
    
    drawFourierComponents() {
        const startX = 50;
        const startY = this.canvas.height - 200;
        const width = 300;
        const height = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(startX - 10, startY - 10, width + 20, height + 40);
        
        // Draw axes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY + height/2);
        this.ctx.lineTo(startX + width, startY + height/2);
        this.ctx.stroke();
        
        // Draw Fourier synthesis
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            let y = 0;
            
            this.fourierComponents.forEach(component => {
                y += component.amplitude * Math.sin(
                    (x / width) * Math.PI * 2 * component.frequency + this.time
                ) * height / 4;
            });
            
            if (x === 0) {
                this.ctx.moveTo(startX + x, startY + height/2 + y);
            } else {
                this.ctx.lineTo(startX + x, startY + height/2 + y);
            }
        }
        
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Fourier Synthesis', startX, startY - 20);
    }
    
    drawInfo() {
        const info = [
            'Wave Interference & Fourier Decomposition',
            `f(x) = Σ Aₙsin(nωx) + Bₙcos(nωx)`,
            `Speed: ${this.settings.speed}x | Intensity: ${this.settings.intensity}%`
        ];
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 400, 100);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        info.forEach((line, i) => {
            if (i === 1) {
                this.ctx.fillStyle = '#00ff88';
                this.ctx.font = '16px monospace';
            }
            this.ctx.fillText(line, 30, 50 + i * 25);
            if (i === 1) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '18px Arial';
            }
        });
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        // Clean up any resources
        this.waves = [];
        this.fourierComponents = [];
    }
}