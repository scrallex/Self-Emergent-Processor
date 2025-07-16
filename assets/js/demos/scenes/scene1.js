/**
 * Scene 1: The Hidden Code
 *
 * This scene demonstrates basic wave interference patterns, showing how
 * complex signals emerge from sine/cosine components with real-time
 * Fourier transform visualization.
 */

export default class Scene1 {
    /**
     * Constructor for the scene
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} settings - Settings object from the framework
     */
    constructor(canvas, ctx, settings) {
        // Core properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Scene-specific state
        this.time = 0;
        this.lastTime = 0;
        this.frequency = 3; // Default frequency value
        this.interference = 'Constructive';
        this.waveValues = [];
        
        // Bind event handlers to maintain 'this' context
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleMouseClick);
        
        this.reset();
        return Promise.resolve();
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.waveValues = new Array(this.canvas.width).fill(0);
    }

    /**
     * Handle mouse click event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        // Change frequency on click for interactive exploration
        this.frequency = 2 + Math.random() * 4;
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Start interactive adjustment
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Interactive adjustment if mouse is down
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        // End interactive adjustment
    }

    /**
     * Main animation loop - called by the framework on each frame
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    animate(timestamp) {
        // Calculate delta time
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;
        
        // Use generic settings from the framework's control panel
        const amplitude = this.settings.intensity || 50;
        const speed = this.settings.speed || 1.0;
        
        // Update scene state
        this.update(deltaTime * speed, amplitude);
        
        // Render the scene
        this.draw(amplitude);
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     * @param {number} amplitude - Wave amplitude from settings
     */
    update(dt, amplitude) {
        // Increment time
        this.time += dt;
        
        // Calculate interference type
        let sumAtCenter = 0;
        for (let wave = 0; wave < 3; wave++) {
            sumAtCenter += amplitude * Math.sin(this.time * 2 * this.frequency * 0.01 + wave * Math.PI / 3);
        }
        
        // Determine if interference is constructive or destructive
        const normalizedSum = sumAtCenter / amplitude;
        if (Math.abs(normalizedSum) > 1.5) {
            this.interference = 'Constructive';
        } else if (Math.abs(normalizedSum) < 0.5) {
            this.interference = 'Destructive';
        } else {
            this.interference = 'Mixed';
        }
        
        // Store wave values for analysis
        for (let x = 0; x < this.canvas.width; x++) {
            let ySum = 0;
            for (let wave = 0; wave < 3; wave++) {
                ySum += (amplitude / 3) * Math.sin((x + this.time * 2) * this.frequency * 0.01 + wave * Math.PI / 3);
            }
            this.waveValues[x] = ySum;
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     * @param {number} amplitude - Wave amplitude from settings
     */
    draw(amplitude) {
        const { ctx, canvas } = this;
        
        // Clear canvas with a dark background
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a subtle grid for reference
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Draw three individual waves with slight phase offsets
        for (let wave = 0; wave < 3; wave++) {
            ctx.strokeStyle = `hsl(${240 + wave * 30}, 70%, 60%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + amplitude * Math.sin((x + this.time * 2) * this.frequency * 0.01 + wave * Math.PI / 3);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Draw the resulting interference pattern (sum of the waves)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4; // Make it stand out
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            let ySum = canvas.height / 2;
            for (let wave = 0; wave < 3; wave++) {
                ySum += (amplitude / 3) * Math.sin((x + this.time * 2) * this.frequency * 0.01 + wave * Math.PI / 3);
            }
            if (x === 0) ctx.moveTo(x, ySum);
            else ctx.lineTo(x, ySum);
        }
        ctx.stroke();
        
        // Draw simple frequency domain representation at the bottom
        this.drawFrequencyDomain(amplitude);
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw a simple frequency domain representation
     * @param {number} amplitude - Wave amplitude
     */
    drawFrequencyDomain(amplitude) {
        const { ctx, canvas } = this;
        const height = canvas.height * 0.15;
        const y = canvas.height - height - 20;
        
        // Draw frequency domain background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, y, canvas.width, height);
        
        // Draw frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, y, canvas.width, height);
        
        // Draw frequency components
        for (let f = 1; f <= 10; f++) {
            // Calculate amplitude for this frequency
            let freqAmplitude = 0;
            if (Math.abs(f - this.frequency) < 1) {
                freqAmplitude = amplitude * (1 - Math.abs(f - this.frequency));
            }
            
            const x = (f / 10) * canvas.width;
            const barHeight = (freqAmplitude / 100) * height;
            
            // Draw frequency bar
            ctx.fillStyle = `rgba(255, 0, 255, ${freqAmplitude / 100})`;
            ctx.fillRect(x - 10, y + height - barHeight, 20, barHeight);
            
            // Label
            if (f % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '10px Arial';
                ctx.fillText(`${f}Hz`, x - 10, y + height + 12);
            }
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 280, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('The Hidden Code', 20, 35);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Phase: ${(this.time * 0.1).toFixed(2)} rad`, 20, 60);
        
        // Set color based on interference type
        if (this.interference === 'Constructive') {
            ctx.fillStyle = '#00ff88';
        } else if (this.interference === 'Destructive') {
            ctx.fillStyle = '#ff5500';
        } else {
            ctx.fillStyle = '#ffaa00';
        }
        
        ctx.fillText(`Interference: ${this.interference}`, 20, 80);
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Frequency: ${this.frequency.toFixed(1)}`, 20, 100);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        // Set color based on interference type
        if (this.interference === 'Constructive') {
            ctx.fillStyle = '#00ff88';
        } else if (this.interference === 'Destructive') {
            ctx.fillStyle = '#ff5500';
        } else {
            ctx.fillStyle = '#ffaa00';
        }
        
        ctx.fillText(`${this.interference} Interference`, canvas.width - 20, 30);
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        // You could also update internal scene parameters here based on settings
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}