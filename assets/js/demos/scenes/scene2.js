/**
 * Scene 2: Identity Through Distinction
 *
 * Interactive protractor with dynamic angle measurement. Drag vectors to create angles
 * and observe real-time classification as acute, right, or obtuse with corresponding
 * cosine values.
 *
 * A small Fourier spectrum panel shows how the current angle decomposes into
 * cosine and sine series terms. The spectrum updates live as the angle changes.
*/

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene2 {
    /**
     * Constructor for the scene
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} settings - Settings object from the framework
     */
    constructor(canvas, ctx, settings, physics, math, eventManager, stateManager, renderPipeline) {
        // Core properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;
        
        // Scene-specific state
        this.angle = 45;
        this.targetAngle = 45;
        this.isAnimating = false;
        this.time = 0;
        this.lastTime = 0;
        this.angleType = 'Acute';
        this.angleColor = '#00d4ff';
        this.cosineValue = Math.cos(this.angle * Math.PI / 180);
        this.spectrumTerms = 5;

        // Vectors for dragging
        this.vectors = {
            fixed: { x: 1, y: 0 }, // Unit vector along x-axis
            movable: { x: Math.cos(this.angle * Math.PI / 180), y: Math.sin(this.angle * Math.PI / 180) }
        };
        
        // Dragging state
        this.isDragging = false;
        
        // Interactive controller (initialized in init)
        this.controller = null;
        this.interactiveElements = [];
        this.angleHandle = null;
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Initialize the interactive controller
        this.controller = new InteractiveController(
            this,
            this.canvas,
            this.ctx,
            this.eventManager,
            this.stateManager,
            this.renderPipeline
        ).init();

        this.reset();
        return Promise.resolve();
    }
        return Promise.resolve();
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.updateAngle(this.settings.intensity * 1.8); // 0-100 mapped to 0-180
    }
n    /**
     * Create interactive elements specific to this scene
     * @param {InteractiveUtils} utils - Interactive utilities instance
     * @returns {Array} Array of interactive elements
     */
    createInteractiveElements(utils) {
        const elements = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        const size = 12;

        this.angleHandle = utils.createDraggable({
            id: "angle_handle",
            x: centerX + radius * this.vectors.movable.x - size / 2,
            y: centerY + radius * this.vectors.movable.y - size / 2,
            width: size,
            height: size,
            shape: "circle",
            color: this.angleColor,
            tooltip: "Drag to adjust angle",
            onDragStart: () => { this.isDragging = true; },
            onDrag: (dx, dy, x, y) => {
                const vx = x + size / 2 - centerX;
                const vy = y + size / 2 - centerY;
                let rad = Math.atan2(vy, vx);
                if (rad < 0) rad += 2 * Math.PI;
                const ang = Math.min(180, rad * 180 / Math.PI);
                this.targetAngle = ang;
                this.updateAngle(ang);
            },
            onDragEnd: () => { this.isDragging = false; }
        });
        elements.push(this.angleHandle);

        const toggleBtn = utils.createButton({
            id: "toggle_anim",
            x: this.canvas.width / 2 - 60,
            y: this.canvas.height - 60,
            width: 120,
            height: 36,
            text: "Toggle Animation",
            onClick: () => { this.isAnimating = !this.isAnimating; }
        });
        elements.push(toggleBtn);

        return elements;
    }

    // Mouse handlers removed as they're replaced by InteractiveController

    /**
     * Provide custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'angle_slider',
                type: 'slider',
                label: 'Angle',
                min: 0,
                max: 180,
                value: this.angle,
                step: 1,
                onChange: (value) => {
                    this.targetAngle = value;
                    this.updateAngle(value);
                }
            },
            {
                id: 'spectrum_terms',
                type: 'slider',
                label: 'Spectrum Terms',
                min: 1,
                max: 10,
                value: this.spectrumTerms,
                step: 1,
                onChange: (value) => {
                    this.spectrumTerms = value;
                }
            }
        ];
    }

    /**
     * Update the angle and related properties
     * @param {number} newAngle - The new angle in degrees
     */
    updateAngle(newAngle) {
        this.angle = Math.max(0, Math.min(180, newAngle));
        const angleRad = this.angle * Math.PI / 180;
        
        // Update vector position
        this.vectors.movable = {
            x: Math.cos(angleRad),
            y: Math.sin(angleRad)
        };
        
        // Update classification
        if (Math.abs(this.angle - 90) < 0.5) {
            this.angleColor = '#ffaa00'; // Right
            this.angleType = 'Right';
        } else if (this.angle < 90) {
            this.angleColor = '#00d4ff'; // Acute
            this.angleType = 'Acute';
        } else {
            this.angleColor = '#7c3aed'; // Obtuse
            this.angleType = 'Obtuse';
        }
        
        // Update cosine
        this.cosineValue = Math.cos(angleRad);

        if (this.angleHandle) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
            this.angleHandle.x = centerX + radius * this.vectors.movable.x - this.angleHandle.width / 2;
            this.angleHandle.y = centerY + radius * this.vectors.movable.y - this.angleHandle.height / 2;
            this.angleHandle.color = this.angleColor;
        }
    }

    /**
     * Handle mouse down event - start dragging
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        if (this.isAnimating) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        // Check if click is near the end of the movable vector
        const vectorEndX = centerX + radius * this.vectors.movable.x;
        const vectorEndY = centerY + radius * this.vectors.movable.y;
        const distance = Math.hypot(mouseX - vectorEndX, mouseY - vectorEndY);
        
        if (distance < 20) {
            this.isDragging = true;
        }
    }

    /**
     * Handle mouse move event - update angle while dragging
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        if (this.isAnimating || !this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Calculate angle from center to mouse position
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        let rad = Math.atan2(dy, dx);
        if (rad < 0) rad += 2 * Math.PI;
        
        this.targetAngle = Math.min(180, rad * 180 / Math.PI);
        this.updateAngle(this.targetAngle);
    }

    /**
     * Handle mouse up event - end dragging
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        this.isDragging = false;
    }

    /**
     * Handle mouse click event - toggle animation
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        // Only toggle animation if not dragging
        if (!this.isDragging) {
            this.isAnimating = !this.isAnimating;
        }
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
        this.time = timestamp;
        
        // Update scene state
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();

        if (this.controller) {
            this.controller.updateInfoPanel({
                'Angle': this.angle.toFixed(1) + '°',
                'Cosine': this.cosineValue.toFixed(3)
            });
            this.controller.render(timestamp);
        }
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        if (this.isAnimating) {
            // Automatic rotation
            const newAngle = (this.angle + 30 * dt) % 180;
            this.updateAngle(newAngle);
            this.targetAngle = newAngle;
        } else if (!this.isDragging) {
            // Smooth easing to target angle
            const easing = 1 - Math.exp(-dt * 3);
            const newAngle = this.angle + (this.targetAngle - this.angle) * easing;
            this.updateAngle(newAngle);
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.3;

        // Draw coordinate system
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Draw protractor markings
        this.drawProtractor(centerX, centerY, radius);

        // Draw angle
        const angleRad = this.angle * Math.PI / 180;

        // Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius / 2, 0, angleRad, false);
        ctx.strokeStyle = this.angleColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Fixed vector (along x-axis)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw vector handle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX + radius, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Movable vector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * this.vectors.movable.x,
            centerY + radius * this.vectors.movable.y
        );
        ctx.strokeStyle = this.angleColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw vector handle
        ctx.fillStyle = this.angleColor;
        ctx.beginPath();
        ctx.arc(
            centerX + radius * this.vectors.movable.x,
            centerY + radius * this.vectors.movable.y,
            6, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Draw angle label
        const labelX = centerX + (radius / 2) * Math.cos(angleRad / 2);
        const labelY = centerY + (radius / 2) * Math.sin(angleRad / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.angle.toFixed(1)}°`, labelX, labelY - 10);
        ctx.textAlign = 'left'; // Reset alignment

        // Fourier spectrum beside the protractor
        this.drawFourierDecomposition(centerX, centerY, radius);

        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw protractor markings
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} radius - Radius of the protractor
     */
    drawProtractor(centerX, centerY, radius) {
        // Draw protractor base
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI, false);
        this.ctx.stroke();
        
        // Draw angle markings
        for (let angle = 0; angle <= 180; angle += 10) {
            const rad = angle * Math.PI / 180;
            const startX = centerX + (radius - 10) * Math.cos(rad);
            const startY = centerY + (radius - 10) * Math.sin(rad);
            const endX = centerX + radius * Math.cos(rad);
            const endY = centerY + radius * Math.sin(rad);
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            // Add labels for major angles
            if (angle % 30 === 0) {
                const labelX = centerX + (radius + 15) * Math.cos(rad);
                const labelY = centerY + (radius + 15) * Math.sin(rad);
                
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${angle}°`, labelX, labelY + 5);
            }
        }
        
        // Highlight key angles
        const keyAngles = [
            { angle: 0, color: '#00d4ff', label: 'Acute' },
            { angle: 90, color: '#ffaa00', label: 'Right' },
            { angle: 180, color: '#7c3aed', label: 'Obtuse' }
        ];
        
        keyAngles.forEach(({ angle, color, label }) => {
            const rad = angle * Math.PI / 180;
            const markerX = centerX + radius * Math.cos(rad);
            const markerY = centerY + radius * Math.sin(rad);
            
            this.ctx.beginPath();
            this.ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
        
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Draw a simple magnitude spectrum for the first few Fourier terms.
     * Bars are shown to the right of the protractor and update with the angle.
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} radius - Radius of the protractor
     */
    drawFourierDecomposition(centerX, centerY, radius) {
        const { ctx } = this;
        const theta = this.angle * Math.PI / 180;
        const terms = this.spectrumTerms;
        const magnitudes = [];
        for (let k = 1; k <= terms; k++) {
            const a = Math.sin(k * theta) / k;
            const b = (1 - Math.cos(k * theta)) / k;
            magnitudes.push(Math.sqrt(a * a + b * b));
        }

        // Position spectrum beside the protractor
        const startX = centerX + radius + 40;
        const baseY = centerY + radius;
        const barWidth = 12;
        const maxHeight = radius * 0.8;

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('Spectrum', startX, baseY - maxHeight - 10);

        for (let i = 0; i < terms; i++) {
            const h = magnitudes[i] * maxHeight;
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(startX + i * (barWidth + 6), baseY - h, barWidth, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(
                (i + 1).toString(),
                startX + i * (barWidth + 6) + barWidth / 2,
                baseY + 12
            );
        }
        ctx.textAlign = 'left';
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 280, 130);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Identity Through Distinction', 20, 35);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, 20, 60);
        
        // Type with color
        this.ctx.fillText(`Type: `, 20, 80);
        this.ctx.fillStyle = this.angleColor;
        this.ctx.fillText(`${this.angleType}`, 60, 80);
        
        // Cosine value
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Cosine: ${this.cosineValue.toFixed(3)}`, 20, 100);
        
        // Angle type explanation
        const explanations = {
            'Acute': 'Contained by its boundary (< 90°)',
            'Right': 'Forms a perpendicular boundary (= 90°)',
            'Obtuse': 'Extends beyond its boundary (> 90°)'
        };
        this.ctx.font = '12px Arial';
        this.ctx.fillText(explanations[this.angleType], 20, 125);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        this.ctx.fillStyle = this.angleColor;
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this.angleType} Angle: ${this.angle.toFixed(1)}°`, this.canvas.width - 20, 30);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`cos(θ) = ${this.cosineValue.toFixed(3)}`, this.canvas.width - 20, 60);
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update angle based on intensity if not animating or dragging
        if (!this.isAnimating && !this.isDragging) {
            this.targetAngle = this.settings.intensity * 1.8; // 0-100 -> 0-180
        }
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
        this.interactiveElements = [];
    }
}
