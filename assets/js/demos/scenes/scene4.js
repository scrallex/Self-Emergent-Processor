/**
 * Scene 4: Sine Deviation
 *
 * This scene demonstrates the tangent explosion at boundaries, showing how
 * the tangent function approaches infinity as the angle approaches 90 degrees.
 * Includes an interactive angle slider and spring animation demonstrating
 * the restoring force with real-time boundary limits.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene4 {
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
        this.physics = physics;
        this.math = math;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;
        
        // Scene-specific state
        this.angle = 45; // in degrees
        this.isAnimating = false;
        this.time = 0;
        this.lastTime = 0;
        
        // Trigonometric values
        this.sine = Math.sin(this.angle * Math.PI / 180);
        this.cosine = Math.cos(this.angle * Math.PI / 180);
        this.tangent = Math.tan(this.angle * Math.PI / 180);
        
        // Spring animation properties with improved physics
        this.spring = {
            position: 0,
            velocity: 0,
            target: 0,
            stiffness: 0.3,  // Increased for better response
            damping: 0.7     // Adjusted for smoother motion
        };
        
        // Interactive controller (initialized in init)
        this.controller = null;
        
        // Interactive elements (defined in createInteractiveElements)
        this.interactiveElements = [];
        
        // Animation state
        this.isAnimating = false;
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

    /**
     * Create interactive elements specific to this scene
     * @param {InteractiveUtils} utils - Interactive utilities instance
     * @returns {Array} - Array of interactive elements
     */
    createInteractiveElements(utils) {
        const elements = [];
        
        // Create angle slider
        const slider = utils.createDraggable({
            id: 'angle_slider',
            x: this.canvas.width * 0.5,
            y: this.canvas.height - 50,
            width: 200,
            height: 20,
            shape: 'rectangle',
            constrainToCanvas: true,
            
            onDrag: (dx, dy, x, y) => {
                // Calculate angle from slider position
                let ratio = (x - (this.canvas.width * 0.5 - 100)) / 200;
                ratio = Math.max(0, Math.min(1, ratio));
                this.updateAngle(ratio * 89.9);
            }
        });
        
        elements.push(slider);
        
        // Create animation toggle button
        const toggleBtn = utils.createButton({
            id: 'toggle_animation',
            x: this.canvas.width * 0.5 - 150,
            y: this.canvas.height - 50,
            width: 100,
            height: 30,
            label: 'Toggle Animation',
            onClick: () => {
                this.isAnimating = !this.isAnimating;
            }
        });
        
        elements.push(toggleBtn);
        
        return elements;
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.updateAngle(this.settings.intensity * 0.899); // 0-100 mapped to 0-89.9
        this.spring.position = 0;
        this.spring.velocity = 0;
        
        // Setup slider position
        this.slider.x = this.canvas.width * 0.5;
        this.slider.y = this.canvas.height - 50;
    }

    /**
     * Update the angle and related values
     * @param {number} newAngle - The new angle in degrees
     */
    updateAngle(newAngle) {
        // Keep angle between 0 and 89.9 to prevent infinite tangent
        this.angle = Math.max(0, Math.min(89.9, newAngle));
        const rad = this.angle * Math.PI / 180;
        
        // Update trigonometric values
        this.sine = Math.sin(rad);
        this.cosine = Math.cos(rad);
        this.tangent = Math.tan(rad);
        
        // Update spring target based on tangent (scaled down for visualization)
        // As angle approaches 90, tangent approaches infinity
        const scaledTangent = Math.min(10, this.tangent); // Limit for visualization
        this.spring.target = scaledTangent / 10; // Normalize to 0-1 range
    }

    /**
     * Get custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'angle_slider',
                type: 'slider',
                label: 'Angle',
                min: 0,
                max: 89.9,
                value: this.angle,
                step: 0.1,
                onChange: (value) => {
                    this.updateAngle(value);
                }
            },
            {
                id: 'spring_stiffness',
                type: 'slider',
                label: 'Spring Stiffness',
                min: 0.1,
                max: 1.0,
                value: this.spring.stiffness,
                step: 0.1,
                onChange: (value) => {
                    this.spring.stiffness = value;
                }
            },
            {
                id: 'toggle_animation',
                type: 'button',
                label: this.isAnimating ? 'Stop Animation' : 'Start Animation',
                onClick: () => {
                    this.isAnimating = !this.isAnimating;
                }
            }
        ];
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
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        if (this.isAnimating) {
            // Animate angle approaching 90 degrees with slowdown near boundary
            const distTo90 = 89.9 - this.angle;
            const step = Math.min(dt * 10, distTo90 * 0.1);
            this.updateAngle(this.angle + step);
            
            // If we get very close to 90, reset to 0
            if (distTo90 < 0.1) {
                this.updateAngle(0);
            }
        } else if (!this.slider.isDragging) {
            // When not animating or dragging, smoothly transition to intensity-based angle
            const targetAngle = this.settings.intensity * 0.899; // 0-100 mapped to 0-89.9
            const easing = 1 - Math.exp(-dt * 3);
            this.updateAngle(this.angle + (targetAngle - this.angle) * easing);
        }
        
        // Update spring physics with improved response
        const springForce = (this.spring.target - this.spring.position) * this.spring.stiffness;
        this.spring.velocity += springForce * dt * 60; // Scale with deltaTime for consistent behavior
        this.spring.velocity *= Math.pow(this.spring.damping, dt * 60); // Time-scaled damping
        this.spring.position += this.spring.velocity * dt * 60;
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Layout
        const unitCircleCenter = {
            x: canvas.width * 0.25,
            y: canvas.height * 0.45
        };
        const graphCenter = {
            x: canvas.width * 0.7,
            y: canvas.height * 0.45
        };
        const radius = Math.min(canvas.height * 0.35, 150);
        
        // Draw unit circle visualization
        this.drawUnitCircle(unitCircleCenter, radius);
        
        // Draw graph of sine, cosine, tangent
        this.drawGraph(graphCenter, radius);
        
        // Draw spring visualization
        this.drawSpring(graphCenter, radius);
        
        // Draw slider control
        this.drawSlider();
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            if (this.controller) {
                this.controller.updateInfoPanel({
                    'Angle': `${this.angle.toFixed(1)}°`,
                    'Sine': this.sine.toFixed(3),
                    'Cosine': this.cosine.toFixed(3),
                    'Tangent': this.angle >= 89.5 ? '∞' : this.tangent.toFixed(3),
                    'Spring Force': (this.spring.target * 10).toFixed(2),
                    'Status': this.isAnimating ? 'Animating' : 'Static'
                });
                this.controller.render(timestamp);
            }
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw unit circle with angle visualization
     * @param {Object} center - Center coordinates {x, y}
     * @param {number} radius - Circle radius
     */
    drawUnitCircle(center, radius) {
        const { ctx } = this;
        const rad = this.angle * Math.PI / 180;
        
        // Draw unit circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(center.x - radius - 10, center.y);
        ctx.lineTo(center.x + radius + 10, center.y);
        ctx.moveTo(center.x, center.y - radius - 10);
        ctx.lineTo(center.x, center.y + radius + 10);
        ctx.stroke();
        
        // Calculate point on circle
        const x = center.x + radius * Math.cos(rad);
        const y = center.y - radius * Math.sin(rad);
        
        // Draw angle arc
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius * 0.2, 0, -rad, true);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        
        // Draw angle label
        const labelRadius = radius * 0.3;
        const labelX = center.x + labelRadius * Math.cos(rad / 2);
        const labelY = center.y - labelRadius * Math.sin(rad / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.angle.toFixed(1)}°`, labelX, labelY);
        ctx.textAlign = 'left';
        
        // Draw radius line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw point on circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sine line (vertical)
        ctx.strokeStyle = '#00d4ff';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, center.y);
        ctx.stroke();
        
        // Draw cosine line (horizontal)
        ctx.strokeStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(x, center.y);
        ctx.lineTo(center.x, center.y);
        ctx.stroke();
        
        // Draw tangent line
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        
        // Calculate tangent height, with limits for visualization
        let tanHeight = radius * this.tangent;
        let tanY = center.y - tanHeight;
        
        // If tangent would go off-screen, draw an arrow
        const maxTanLength = radius * 3;
        if (Math.abs(tanHeight) > maxTanLength) {
            tanHeight = Math.sign(tanHeight) * maxTanLength;
            tanY = center.y - tanHeight;
        }
        
        // Draw tangent line
        ctx.beginPath();
        ctx.moveTo(center.x + radius, center.y);
        ctx.lineTo(center.x + radius, tanY);
        ctx.stroke();
        
        // Draw arrow if tangent is large
        if (Math.abs(this.tangent) > 3) {
            ctx.beginPath();
            ctx.moveTo(center.x + radius, tanY);
            ctx.lineTo(center.x + radius - 5, tanY + 10 * Math.sign(this.tangent));
            ctx.lineTo(center.x + radius + 5, tanY + 10 * Math.sign(this.tangent));
            ctx.closePath();
            ctx.fillStyle = '#00ff88';
            ctx.fill();
        }
        
        // Label tangent line
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'left';
        ctx.fillText(`tan(θ) = ${this.tangent.toFixed(2)}`, center.x + radius + 10, tanY);
        
        // Add boundary line (90 degrees)
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y - radius - 20);
        ctx.lineTo(center.x, center.y + radius + 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Add boundary label
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('90° Boundary', center.x + 5, center.y - radius - 5);
    }
    
    /**
     * Draw graph showing sine, cosine, and tangent functions
     * @param {Object} center - Center coordinates {x, y}
     * @param {number} radius - Graph height scale
     */
    drawGraph(center, radius) {
        const { ctx } = this;
        const graphWidth = radius * 2;
        const graphHeight = radius * 1.5;
        
        // Draw graph axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // X-axis (0 to 90 degrees)
        ctx.beginPath();
        ctx.moveTo(center.x - graphWidth / 2, center.y);
        ctx.lineTo(center.x + graphWidth / 2, center.y);
        ctx.stroke();
        
        // Y-axis (-1.5 to 1.5)
        ctx.beginPath();
        ctx.moveTo(center.x - graphWidth / 2, center.y + graphHeight * 0.75);
        ctx.lineTo(center.x - graphWidth / 2, center.y - graphHeight * 0.75);
        ctx.stroke();
        
        // Draw grid lines and labels
        for (let deg = 0; deg <= 90; deg += 15) {
            const x = center.x - graphWidth / 2 + (deg / 90) * graphWidth;
            
            // Vertical grid line
            ctx.beginPath();
            ctx.moveTo(x, center.y - graphHeight * 0.75);
            ctx.lineTo(x, center.y + graphHeight * 0.75);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${deg}°`, x, center.y + graphHeight * 0.75 + 15);
        }
        
        // Horizontal grid lines for -1, 0, 1
        for (let val = -1; val <= 1; val += 0.5) {
            const y = center.y - val * graphHeight * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(center.x - graphWidth / 2, y);
            ctx.lineTo(center.x + graphWidth / 2, y);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(val.toFixed(1), center.x - graphWidth / 2 - 5, y + 4);
        }
        
        // Plot sine curve
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let deg = 0; deg <= 90; deg++) {
            const x = center.x - graphWidth / 2 + (deg / 90) * graphWidth;
            const sinVal = Math.sin(deg * Math.PI / 180);
            const y = center.y - sinVal * graphHeight * 0.5;
            
            if (deg === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Plot cosine curve
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let deg = 0; deg <= 90; deg++) {
            const x = center.x - graphWidth / 2 + (deg / 90) * graphWidth;
            const cosVal = Math.cos(deg * Math.PI / 180);
            const y = center.y - cosVal * graphHeight * 0.5;
            
            if (deg === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Plot tangent curve (with bounds)
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        let lastY = center.y;
        for (let deg = 0; deg < 89; deg++) {
            const x = center.x - graphWidth / 2 + (deg / 90) * graphWidth;
            const tanVal = Math.tan(deg * Math.PI / 180);
            
            // Limit tangent for visualization
            const limitedTan = Math.max(-3, Math.min(3, tanVal));
            const y = center.y - limitedTan * graphHeight * 0.25;
            
            if (deg === 0) ctx.moveTo(x, y);
            else if (Math.abs(y - lastY) < graphHeight * 0.5) {
                // Only draw if the jump isn't too large
                ctx.lineTo(x, y);
            } else {
                // Start a new path segment
                ctx.moveTo(x, y);
            }
            
            lastY = y;
        }
        ctx.stroke();
        
        // Draw current angle marker on graph
        const markerX = center.x - graphWidth / 2 + (this.angle / 90) * graphWidth;
        
        // Draw vertical indicator line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(markerX, center.y - graphHeight * 0.75);
        ctx.lineTo(markerX, center.y + graphHeight * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw point markers at current values
        const sineY = center.y - this.sine * graphHeight * 0.5;
        const cosineY = center.y - this.cosine * graphHeight * 0.5;
        
        // Calculate limited tangent for marker
        const limitedTan = Math.max(-3, Math.min(3, this.tangent));
        const tangentY = center.y - limitedTan * graphHeight * 0.25;
        
        // Sine marker
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(markerX, sineY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Cosine marker
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(markerX, cosineY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Tangent marker
        if (Math.abs(this.tangent) <= 3) {
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(markerX, tangentY, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Graph labels
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Trigonometric Functions', center.x, center.y - graphHeight * 0.75 - 20);
        
        // Legend
        const legendX = center.x - 80;
        const legendY = center.y - graphHeight * 0.75 - 5;
        
        // Sine
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.fillText('Sine', legendX + 10, legendY + 5);
        
        // Cosine
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(legendX + 70, legendY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('Cosine', legendX + 80, legendY + 5);
        
        // Tangent
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(legendX + 160, legendY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('Tangent', legendX + 170, legendY + 5);
    }
    
    /**
     * Draw spring visualization showing tangent force
     * @param {Object} center - Center coordinates {x, y}
     * @param {number} radius - Scale factor
     */
    drawSpring(center, radius) {
        const { ctx } = this;
        const springBaseX = center.x;
        const springBaseY = center.y + radius * 0.8;
        const springWidth = radius * 1.5;
        const springHeight = radius * 0.4;
        
        // Spring base
        ctx.fillStyle = '#333333';
        ctx.fillRect(springBaseX - springWidth / 2, springBaseY, springWidth, 10);
        
        // Draw spring coils
        const numCoils = 10;
        const coilWidth = springWidth * 0.8;
        const displacement = this.spring.position * springWidth * 0.4;
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Start at left anchor
        ctx.moveTo(springBaseX - springWidth / 2, springBaseY - springHeight / 2);
        
        // Draw zigzag spring
        const segmentWidth = coilWidth / (numCoils * 2);
        let currentX = springBaseX - springWidth / 2;
        let direction = 1;
        
        for (let i = 0; i < numCoils * 2; i++) {
            currentX += segmentWidth;
            const offset = direction * springHeight / 2;
            ctx.lineTo(currentX, springBaseY - springHeight / 2 + offset);
            direction *= -1;
        }
        
        // Connect to mass with displacement
        ctx.lineTo(springBaseX + springWidth / 2 + displacement, springBaseY - springHeight / 2);
        ctx.stroke();
        
        // Draw mass
        const massWidth = 30;
        const massHeight = 30;
        
        // Draw direction arrow
        if (Math.abs(this.spring.velocity) > 0.001) {
            const arrowLength = 20 * Math.sign(this.spring.velocity);
            ctx.beginPath();
            ctx.moveTo(springBaseX + springWidth / 2 + displacement + massWidth / 2, springBaseY - springHeight / 2);
            ctx.lineTo(springBaseX + springWidth / 2 + displacement + massWidth / 2 + arrowLength, springBaseY - springHeight / 2);
            ctx.stroke();
            
            // Arrow head
            ctx.beginPath();
            ctx.moveTo(springBaseX + springWidth / 2 + displacement + massWidth / 2 + arrowLength, springBaseY - springHeight / 2);
            ctx.lineTo(springBaseX + springWidth / 2 + displacement + massWidth / 2 + arrowLength - 10 * Math.sign(arrowLength), springBaseY - springHeight / 2 - 5);
            ctx.lineTo(springBaseX + springWidth / 2 + displacement + massWidth / 2 + arrowLength - 10 * Math.sign(arrowLength), springBaseY - springHeight / 2 + 5);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        
        // Mass with gradient based on angle
        const gradient = ctx.createLinearGradient(
            springBaseX + springWidth / 2 + displacement,
            springBaseY - springHeight / 2 - massHeight / 2,
            springBaseX + springWidth / 2 + displacement + massWidth,
            springBaseY - springHeight / 2 + massHeight / 2
        );
        
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(0.5, '#7c3aed');
        gradient.addColorStop(1, '#00ff88');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            springBaseX + springWidth / 2 + displacement - massWidth / 2,
            springBaseY - springHeight / 2 - massHeight / 2,
            massWidth,
            massHeight
        );
        
        // Add labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Spring Force Visualization', springBaseX, springBaseY + 40);
        
        // Force label
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Tangent Force: ${(this.spring.target * 10).toFixed(2)}`, springBaseX, springBaseY + 60);
    }
    
    /**
     * Draw angle slider control
     */
    drawSlider() {
        const { ctx } = this;
        
        // Draw slider track
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.slider.x, this.slider.y - this.slider.height / 2, this.slider.width, this.slider.height);
        
        // Draw slider markers
        for (let i = 0; i <= 9; i++) {
            const markerX = this.slider.x + (i / 9) * this.slider.width;
            const markerHeight = (i % 3 === 0) ? 10 : 5;
            
            ctx.fillStyle = '#666666';
            ctx.fillRect(markerX - 1, this.slider.y - markerHeight, 2, markerHeight * 2);
            
            // Add labels for major marks
            if (i % 3 === 0) {
                ctx.fillStyle = '#999999';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${i * 10}°`, markerX, this.slider.y + 20);
            }
        }
        
        // Draw handle
        const handleX = this.slider.x + (this.angle / 89.9) * this.slider.width;
        
        // Handle gradient based on angle
        const handleGradient = ctx.createRadialGradient(
            handleX, this.slider.y,
            0,
            handleX, this.slider.y,
            this.slider.handleRadius
        );
        
        if (this.angle < 30) {
            handleGradient.addColorStop(0, '#00d4ff');
            handleGradient.addColorStop(1, '#0077aa');
        } else if (this.angle < 60) {
            handleGradient.addColorStop(0, '#7c3aed');
            handleGradient.addColorStop(1, '#5c1acd');
        } else {
            handleGradient.addColorStop(0, '#00ff88');
            handleGradient.addColorStop(1, '#00aa66');
        }
        
        // Draw handle
        ctx.fillStyle = handleGradient;
        ctx.beginPath();
        ctx.arc(handleX, this.slider.y, this.slider.handleRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Handle border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Slider label
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, this.slider.x + this.slider.width / 2, this.slider.y - 20);
        
        // Warning for near-boundary values
        if (this.angle > 85) {
            ctx.fillStyle = '#ffaa00';
            ctx.fillText('Approaching 90° boundary!', this.slider.x + this.slider.width / 2, this.slider.y - 40);
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 280, 150);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Sine Deviation', 20, 35);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, 20, 60);
        
        ctx.fillStyle = '#00d4ff';
        ctx.fillText(`Sine: ${this.sine.toFixed(3)}`, 20, 85);
        
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(`Cosine: ${this.cosine.toFixed(3)}`, 20, 110);
        
        // Format tangent value, with special handling for very large values
        let tangentText;
        if (this.angle >= 89.5) {
            tangentText = '∞ (approaching infinity)';
        } else {
            tangentText = this.tangent.toFixed(3);
        }
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Tangent: ${tangentText}`, 20, 135);
        
        // Explosion warning
        if (this.angle > 85) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px Arial';
            ctx.fillText('Tangent explosion at 90° boundary!', 20, 155);
        }
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, canvas.width - 20, 30);
        
        // Format tangent value, with special handling for very large values
        let tangentText;
        if (this.angle >= 89.5) {
            tangentText = '∞';
        } else {
            tangentText = this.tangent.toFixed(2);
        }
        
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`tan(θ) = ${tangentText}`, canvas.width - 20, 60);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        if (!this.isAnimating && !this.slider.isDragging) {
            // Update angle based on intensity
            const targetAngle = this.settings.intensity * 0.899; // 0-100 mapped to 0-89.9
            this.updateAngle(targetAngle);
        }
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        // Clean up the interactive controller
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
        
        // Clear interactive elements
        this.interactiveElements = [];
    }
}