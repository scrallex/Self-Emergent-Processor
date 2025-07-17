/**
 * SEP Logo Generator
 * 
 * Utility to generate and animate the SEP logo with propagating coherence waves.
 * This provides the visual representation of the Self-Emergent Processor concept
 * with dynamic wave effects that visualize the coherence property.
 */

export default class LogoGenerator {
    /**
     * Create a new logo generator
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            size: 100,
            color: '#00ff88',
            secondaryColor: '#00d4ff',
            accentColor: '#ff00aa',
            waveCount: 3,
            waveSpeed: 1,
            waveAmplitude: 0.5,
            ...options
        };
        
        // Animation state
        this.time = 0;
        this.waves = [];
        
        // Initialize waves
        this.initWaves();
    }
    
    /**
     * Initialize wave properties
     */
    initWaves() {
        this.waves = [];
        
        for (let i = 0; i < this.options.waveCount; i++) {
            this.waves.push({
                phase: Math.random() * Math.PI * 2,
                frequency: 0.5 + Math.random() * 0.5,
                amplitude: this.options.waveAmplitude * (0.5 + Math.random() * 0.5),
                speed: this.options.waveSpeed * (0.8 + Math.random() * 0.4)
            });
        }
    }
    
    /**
     * Update animation state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        // Update wave phases
        for (const wave of this.waves) {
            wave.phase += deltaTime * wave.speed;
        }
    }
    
    /**
     * Draw the SEP logo with coherence waves
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size override (optional)
     * @param {Object} options - Drawing options override (optional)
     */
    draw(ctx, x, y, size = null, options = {}) {
        const logoSize = size || this.options.size;
        const drawOptions = { ...this.options, ...options };
        
        // Save context state
        ctx.save();
        
        // Draw waves first (behind logo)
        this.drawCoherenceWaves(ctx, x, y, logoSize, drawOptions);
        
        // Draw main logo components
        this.drawLogo(ctx, x, y, logoSize, drawOptions);
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Draw propagating coherence waves
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Logo size
     * @param {Object} options - Drawing options
     */
    drawCoherenceWaves(ctx, x, y, size, options) {
        // Wave radius range from size to 3x size
        const minRadius = size * 1.1;
        const maxRadius = size * 3;
        
        // Draw each wave as a circle with varying opacity
        for (let i = 0; i < this.waves.length; i++) {
            const wave = this.waves[i];
            
            // Calculate wave position based on phase (0 to 1)
            const phaseNorm = (Math.sin(wave.phase) + 1) / 2;
            const radius = minRadius + phaseNorm * (maxRadius - minRadius);
            
            // Calculate opacity based on radius (fade out as it expands)
            const opacity = 0.7 * (1 - (radius - minRadius) / (maxRadius - minRadius));
            
            // Draw wave
            const gradient = ctx.createRadialGradient(
                x, y, radius * 0.8,
                x, y, radius
            );
            
            gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
            gradient.addColorStop(0.5, `rgba(0, 255, 136, ${opacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw center glow
        const glowGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, size * 1.2
        );
        
        glowGradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        glowGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw the SEP logo
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Logo size
     * @param {Object} options - Drawing options
     */
    drawLogo(ctx, x, y, size, options) {
        // Calculate dimensions
        const outerRadius = size * 0.5;
        const innerRadius = outerRadius * 0.6;
        const coreRadius = innerRadius * 0.4;
        
        // Draw outer hexagon
        this.drawHexagon(ctx, x, y, outerRadius, options.color, this.time * 0.2);
        
        // Draw inner hexagon (rotated opposite direction)
        this.drawHexagon(ctx, x, y, innerRadius, options.secondaryColor, -this.time * 0.3);
        
        // Draw connecting lines between hexagons
        this.drawConnectors(ctx, x, y, innerRadius, outerRadius, options);
        
        // Draw center core
        ctx.fillStyle = options.accentColor;
        ctx.beginPath();
        ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw "SEP" text if large enough
        if (size >= 60) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `${Math.floor(coreRadius)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEP', x, y);
        }
    }
    
    /**
     * Draw a hexagon
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Hexagon radius
     * @param {string} color - Hexagon color
     * @param {number} rotation - Rotation angle
     */
    drawHexagon(ctx, x, y, radius, color, rotation = 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = radius * 0.1;
        ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = rotation + (i / 6) * Math.PI * 2;
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(vx, vy);
            } else {
                ctx.lineTo(vx, vy);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }
    
    /**
     * Draw connectors between hexagons
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} innerRadius - Inner hexagon radius
     * @param {number} outerRadius - Outer hexagon radius
     * @param {Object} options - Drawing options
     */
    drawConnectors(ctx, x, y, innerRadius, outerRadius, options) {
        // Draw lines connecting the hexagons at each vertex
        ctx.strokeStyle = options.accentColor;
        ctx.lineWidth = innerRadius * 0.05;
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const innerX = x + Math.cos(angle) * innerRadius;
            const innerY = y + Math.sin(angle) * innerRadius;
            const outerX = x + Math.cos(angle) * outerRadius;
            const outerY = y + Math.sin(angle) * outerRadius;
            
            // Create dynamic connection based on time
            const pulsePhase = (this.time * 2 + i) % 1;
            const pulseX = innerX + (outerX - innerX) * pulsePhase;
            const pulseY = innerY + (outerY - innerY) * pulsePhase;
            
            // Draw connector line
            ctx.beginPath();
            ctx.moveTo(innerX, innerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
            
            // Draw pulse particle
            ctx.fillStyle = options.accentColor;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, innerRadius * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Create a standalone logo image
     * @param {number} size - Image size
     * @param {Object} options - Drawing options
     * @returns {HTMLCanvasElement} Canvas element with the rendered logo
     */
    createLogoImage(size, options = {}) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        
        // Get context and draw logo
        const ctx = canvas.getContext('2d');
        this.draw(ctx, size, size, size, options);
        
        return canvas;
    }
}