/**
 * Scene 3: Cosine Alignment
 *
 * This scene demonstrates billiard ball collision dynamics and how
 * the cosine of the impact angle affects energy transfer between objects.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene3 {
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
        this.balls = [];
        this.lastTime = 0;
        this.time = 0;
        this.impactInfo = { cosine: 0, transfer: 0, time: 0 };
        
        // Interactive controller (initialized in init)
        this.controller = null;
        
        // Interactive elements (defined in createInteractiveElements)
        this.interactiveElements = [];
        
        // Dragging state
        this.draggedBall = null;
        this.isDragging = false;
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
        
        // Create draggable elements for each ball
        this.balls.forEach((ball, index) => {
            const draggable = utils.createDraggable({
                id: `ball_${index}`,
                x: ball.x,
                y: ball.y,
                width: ball.r * 2,
                height: ball.r * 2,
                shape: 'circle',
                color: ball.color,
                tooltip: `Ball ${index + 1}`,
                
                onDragStart: (x, y) => {
                    this.draggedBall = ball;
                    this.isDragging = true;
                    ball.vx = 0;
                    ball.vy = 0;
                },
                
                onDrag: (dx, dy, x, y) => {
                    if (this.draggedBall) {
                        this.draggedBall.x = x;
                        this.draggedBall.y = y;
                    }
                },
                
                onDragEnd: () => {
                    this.draggedBall = null;
                    this.isDragging = false;
                }
            });
            
            elements.push(draggable);
        });
        
        return elements;
    }

    /**
     * Reset the scene to its initial state with a new impact angle
     */
    reset() {
        const impactAngle = this.settings.intensity * 1.8; // Map 0-100 to 0-180 degrees
        const rad = impactAngle * Math.PI / 180;
        const radius = 20;

        this.balls = [
            {
                x: this.canvas.width * 0.25,
                y: this.canvas.height * 0.5,
                vx: 200 * Math.cos(rad),
                vy: 200 * Math.sin(rad),
                r: radius,
                color: '#00d4ff'
            },
            {
                x: this.canvas.width * 0.75,
                y: this.canvas.height * 0.5,
                vx: 0,
                vy: 0,
                r: radius,
                color: '#7c3aed'
            }
        ];
        this.lastTime = 0;
    }

    /**
     * Get custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'reset_btn',
                type: 'button',
                label: 'Reset Simulation',
                onClick: () => this.reset()
            },
            {
                id: 'angle_slider',
                type: 'slider',
                label: 'Initial Angle',
                min: 0,
                max: 180,
                value: this.settings.intensity * 1.8,
                step: 1,
                onChange: (value) => {
                    this.settings.intensity = value / 1.8;
                    this.reset();
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
        
        // Update physics based on deltaTime * speed
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();
    }

    /**
     * Update scene physics and collision detection
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Move balls
        this.balls.forEach(ball => {
            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;
        });

        // Wall collisions form boundaries
        this.balls.forEach(ball => {
            if (ball.x - ball.r < 0) { ball.vx *= -1; ball.x = ball.r; }
            if (ball.x + ball.r > this.canvas.width) { ball.vx *= -1; ball.x = this.canvas.width - ball.r; }
            if (ball.y - ball.r < 0) { ball.vy *= -1; ball.y = ball.r; }
            if (ball.y + ball.r > this.canvas.height) { ball.vy *= -1; ball.y = this.canvas.height - ball.r; }
        });

        // Ball-ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const b1 = this.balls[i];
                const b2 = this.balls[j];

                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < b1.r + b2.r) {
                    // Collision normal
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Relative velocity
                    const dvx = b2.vx - b1.vx;
                    const dvy = b2.vy - b1.vy;
                        
                    // Impulse if moving towards each other
                    const impulse = dvx * nx + dvy * ny;
                    if (impulse > 0) continue;

                    // Apply impulse (elastic collision)
                    b1.vx += impulse * nx;
                    b1.vy += impulse * ny;
                    b2.vx -= impulse * nx;
                    b2.vy -= impulse * ny;

                    // Store impact info
                    this.impactInfo = {
                        cosine: Math.abs(nx), // cosine alignment
                        transfer: Math.abs(nx) * 100, // %
                        time: performance.now()
                    };

                    // Prevent sticking
                    const overlap = (b1.r + b2.r - dist) / 2;
                    b1.x -= overlap * nx;
                    b1.y -= overlap * ny;
                    b2.x += overlap * nx;
                    b2.y += overlap * ny;
                }
            }
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw balls
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.fill();
        });

        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            if (this.controller) {
                this.controller.updateInfoPanel({
                    'Impact Cosine': this.impactInfo.cosine.toFixed(3),
                    'Energy Transfer': `${this.impactInfo.transfer.toFixed(1)}%`,
                    'Status': this.isDragging ? 'Dragging' : 'Simulating'
                });
                this.controller.render(timestamp);
            }
        } else {
            this.drawVideoInfo();
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const now = performance.now();
        const age = (now - this.impactInfo.time) / 1000;
        const opacity = Math.max(0, 1 - age * 2);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 280, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Cosine Alignment', 20, 35);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = `rgba(204, 204, 204, ${opacity})`;
        this.ctx.fillText(`Last Impact Cosine: ${this.impactInfo.cosine.toFixed(3)}`, 20, 60);
        this.ctx.fillText(`Energy Transfer: ${this.impactInfo.transfer.toFixed(1)}%`, 20, 80);
        this.ctx.fillText('Click to reset with new angle', 20, 100);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const now = performance.now();
        const age = (now - this.impactInfo.time) / 1000;
        const opacity = Math.max(0, 1 - age * 2);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Impact: ${this.impactInfo.cosine.toFixed(3)}`, this.canvas.width - 20, 30);
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        // The intensity setting will be used on the next reset.
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