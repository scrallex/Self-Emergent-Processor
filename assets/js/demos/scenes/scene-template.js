/**
 * Scene Template
 * 
 * This is a standardized template for all SEP demo scenes to ensure consistency
 * and proper integration with the framework components.
 */

export default class SceneTemplate {
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
        
        // Bind event handlers to maintain 'this' context
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * Setup event listeners, initialize objects, etc.
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleMouseClick);
        
        // Initialize scene objects, reset to default state
        this.reset();
        
        return Promise.resolve();
    }

    /**
     * Reset the scene to its initial state
     * Usually called from init() and when the user clicks reset
     */
    reset() {
        // Reset time
        this.time = 0;
        this.lastTime = 0;
        
        // Reset scene-specific state
        // ...
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
        
        // Update physics/state based on deltaTime * speed
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Update scene objects, physics calculations, etc.
        // ...
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw scene objects
        // ...
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        // Draw background panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 280, 100);
        
        // Draw title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Scene Title', 20, 35);
        
        // Draw info text
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('Info line 1', 20, 60);
        this.ctx.fillText('Info line 2', 20, 80);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        // Draw minimal info for video mode
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Video mode info', this.canvas.width - 20, 30);
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Handle mouse down logic
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Handle mouse move logic
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        // Handle mouse up logic
    }

    /**
     * Handle mouse click event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        // Handle mouse click logic
        // Often used for simple interactions like reset
        this.reset();
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        // Handle any special logic needed when settings change
    }

    /**
     * Clean up resources when scene is unloaded
     * Remove event listeners, stop animations, etc.
     */
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleMouseClick);
        
        // Clean up any other resources
        // ...
    }
}