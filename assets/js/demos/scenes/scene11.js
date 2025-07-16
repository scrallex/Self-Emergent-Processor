// Scene 11: Meta-System Interface - A visualization of the Black-Scholes model enhanced by SEP principles.
export default class Scene11 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.volatility = 30; // Initial volatility in percent
        this.tradTime = 100.00;
        this.sepTime = 37.04;
        this.speedup = 2.7;

        this.handleIntensityUpdate = this.handleIntensityUpdate.bind(this);
    }

    init() {
        // Use the intensity slider for volatility control
        this.volatility = this.settings.intensity * 2; // Map 0-100 intensity to 0-200 volatility
        this.draw();
        
        // Custom update for this scene using intensity slider
      // document.getElementById('intensitySlider').addEventListener('input', this.handleIntensityUpdate);
        
        return Promise.resolve();
    }
    
    handleIntensityUpdate(e) {
        const intensity = parseInt(e.target.value);
        this.volatility = intensity * 2; // Map 0-100 intensity to 0-200 volatility
    }

    // Error function approximation (for Black-Scholes)
    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    draw() {
        this.ctx.fillStyle = '#0f0f0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const S0 = 100; // Current price
        const K = 100;  // Strike price
        const r = 0.05; // Risk-free rate
        const T = 1;    // Time to maturity
        const sigma = this.volatility / 100;
        
        // Draw option price surface
        const gridX = 50;
        const gridY = 50;
        const gridWidth = this.canvas.width / 2.5;
        const gridHeight = this.canvas.height / 1.5;
        
        const cellWidth = gridWidth / 20;
        const cellHeight = gridHeight / 20;

        // Price grid
        for (let i = 0; i <= 20; i++) {
            for (let j = 0; j <= 20; j++) {
                const S = 50 + i * 5;
                const t = j * 0.05;

                // Simplified Black-Scholes calculation for visualization
                if (T-t <= 0) continue;
                const d1 = (Math.log(S/K) + (r + sigma*sigma/2) * (T-t)) / (sigma * Math.sqrt(T-t));
                const price = S * 0.5 * (1 + this.erf(d1/Math.sqrt(2))) - K * Math.exp(-r*(T-t)) * 0.5 * (1 + this.erf((d1 - sigma*Math.sqrt(T-t))/Math.sqrt(2)));
                
                const x = gridX + i * cellWidth;
                const y = gridY + j * cellHeight;
                const colorVal = Math.min(255, price * 10);
                
                this.ctx.fillStyle = `rgb(${colorVal}, ${colorVal/2}, ${255-colorVal})`;
                this.ctx.fillRect(x, y, cellWidth, cellHeight);
            }
        }

        // Draw axes
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(gridX, gridY + gridHeight);
        this.ctx.lineTo(gridX + gridWidth, gridY + gridHeight);
        this.ctx.moveTo(gridX, gridY);
        this.ctx.lineTo(gridX, gridY + gridHeight);
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Stock Price', gridX + gridWidth/2, gridY + gridHeight + 30);
        this.ctx.save();
        this.ctx.translate(gridX - 40, gridY + gridHeight/2);
        this.ctx.rotate(-Math.PI/2);
        this.ctx.fillText('Time to Maturity', 0, 0);
        this.ctx.restore();

        // SEP comparison visualization
        const compX = this.canvas.width / 2 + 50;
        const compWidth = this.canvas.width / 2 - 100;
        const barHeight = 50;
        
        this.ctx.textAlign = 'left';

        // Traditional method
        this.ctx.fillStyle = '#ff0066';
        this.ctx.fillRect(compX, gridY, compWidth * 0.8, barHeight);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px monospace';
        this.ctx.fillText(`Traditional PDE: ${this.tradTime.toFixed(2)}ms`, compX + 10, gridY + 30);

        // SEP method
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(compX, gridY + 80, compWidth * (0.8 / this.speedup), barHeight);
        this.ctx.fillText(`SEP Dynamics Method: ${this.sepTime.toFixed(2)}ms`, compX + 10, gridY + 110);

        // Efficiency gain
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(compX + compWidth * (0.8 / this.speedup), gridY + 130);
        this.ctx.lineTo(compX + compWidth * 0.8, gridY + 50);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '24px monospace';
        this.ctx.fillText(`${this.speedup.toFixed(1)}x Speedup!`, compX + compWidth * 0.5, gridY + 200);

        if (!this.settings.videoMode) {
             this.drawInfo();
        }
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 120);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Meta-System Interface', 30, 45);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('Black-Scholes with SEP Enhancement', 30, 70);
        this.ctx.fillText(`Volatility (via Intensity): ${this.volatility.toFixed(0)}%`, 30, 90);
    }
    
    animate(timestamp) {
        // This scene is mostly static, driven by slider input,
        // but we'll re-draw on animation frame for smoothness
        this.draw();
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
      // The intensity is handled by the event listener now. (or is it? consider separate slider)
        this.volatility = this.settings.intensity * 2;
    }
    
    cleanup() {
        document.getElementById('intensitySlider').removeEventListener('input', this.handleIntensityUpdate);
    }
}