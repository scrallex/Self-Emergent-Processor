/**
 * Scene 6: Boundary Enforcement
 *
 * Classic billiard algorithm for computing π through particle collisions.
 * Watch as the system counts collisions to approximate π with frequency
 * domain emergence and threshold visualization.
 */

export default class Scene6 {
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
        this.blocks = [];
        this.collisionCount = 0;
        this.piApproximation = 0;
        this.initialVelocity = -80;
        
        // Physics
        this.elasticity = 1.0; // Perfect elastic collisions
        this.baseSize = 30;
        this.gravity = 0;
        
        // Simulation state
        this.isRunning = false;
        this.isComplete = false;
        this.targetCollisions = 100000;
        
        // Visualization
        this.timeScale = [];
        this.collisionHistory = [];
        this.massRatio = 1; // Power of 10
        this.digits = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]; // First digits of π
        
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
        this.collisionCount = 0;
        this.piApproximation = 0;
        this.isRunning = false;
        this.isComplete = false;
        this.collisionHistory = [];
        
        // Set mass ratio based on intensity
        this.massRatio = Math.max(1, Math.floor(this.settings.intensity / 20)); // 1-5 based on intensity
        const smallMass = 1;
        const largeMass = smallMass * Math.pow(100, this.massRatio);
        
        // Create blocks
        const blockWidth = this.baseSize;
        this.blocks = [
            // Small block (moving)
            {
                x: this.canvas.width * 0.3,
                y: this.canvas.height / 2 - blockWidth / 2,
                width: blockWidth,
                height: blockWidth,
                vx: this.initialVelocity,
                vy: 0,
                mass: smallMass,
                color: '#00d4ff', // Cyan
                collisions: 0
            },
            // Large block (stationary)
            {
                x: this.canvas.width * 0.7,
                y: this.canvas.height / 2 - blockWidth / 2,
                width: blockWidth * 1.5,
                height: blockWidth * 1.5,
                vx: 0,
                vy: 0,
                mass: largeMass,
                color: '#ffaa00', // Orange
                collisions: 0
            }
        ];
        
        // Initialize time scale for visualization
        this.timeScale = [];
        for (let i = 0; i < 100; i++) {
            this.timeScale.push({
                time: 0,
                collisions: 0
            });
        }
    }

    /**
     * Start the simulation
     */
    startSimulation() {
        if (!this.isRunning && !this.isComplete) {
            this.isRunning = true;
        }
    }

    /**
     * Pause the simulation
     */
    pauseSimulation() {
        this.isRunning = false;
    }

    /**
     * Handle mouse click event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        if (this.isComplete) {
            this.reset();
        } else {
            this.isRunning = !this.isRunning;
        }
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check for slider control
        // Add any mouse down logic here
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Add any mouse move logic here
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        // Add any mouse up logic here
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
        
        // Only update physics if simulation is running
        if (this.isRunning) {
            // Use smaller timesteps for more accurate collision detection
            const substeps = 10;
            const dt = deltaTime * this.settings.speed / substeps;
            
            for (let i = 0; i < substeps; i++) {
                this.update(dt);
            }
            
            // Check if we've reached the target number of collisions
            if (this.collisionCount >= this.targetCollisions) {
                this.isRunning = false;
                this.isComplete = true;
            }
        }
        
        // Render the scene
        this.draw();
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        const blocks = this.blocks;
        const collisionPairs = [];
        
        // Update positions
        for (const block of blocks) {
            block.x += block.vx * dt;
            block.vy += this.gravity * dt;
            block.y += block.vy * dt;
        }
        
        // Handle wall collisions
        for (const block of blocks) {
            // Left wall
            if (block.x < 0) {
                block.x = 0;
                block.vx = -block.vx * this.elasticity;
                this.collisionCount++;
                block.collisions++;
                this.collisionHistory.push({
                    time: this.time,
                    type: 'wall',
                    block: blocks.indexOf(block)
                });
            }
            
            // Right wall
            if (block.x + block.width > this.canvas.width) {
                block.x = this.canvas.width - block.width;
                block.vx = -block.vx * this.elasticity;
                this.collisionCount++;
                block.collisions++;
                this.collisionHistory.push({
                    time: this.time,
                    type: 'wall',
                    block: blocks.indexOf(block)
                });
            }
        }
        
        // Check for block-block collisions
        for (let i = 0; i < blocks.length; i++) {
            for (let j = i + 1; j < blocks.length; j++) {
                const b1 = blocks[i];
                const b2 = blocks[j];
                
                // Simple AABB collision check
                if (b1.x < b2.x + b2.width &&
                    b1.x + b1.width > b2.x &&
                    b1.y < b2.y + b2.height &&
                    b1.y + b1.height > b2.y) {
                    
                    // Resolve collision
                    this.resolveCollision(b1, b2);
                    
                    // Count collision
                    this.collisionCount++;
                    b1.collisions++;
                    b2.collisions++;
                    
                    this.collisionHistory.push({
                        time: this.time,
                        type: 'block',
                        blocks: [i, j]
                    });
                }
            }
        }
        
        // Update π approximation
        this.piApproximation = this.calculatePi();
        
        // Update time scale for visualization
        const timeScaleIndex = Math.floor((this.collisionCount / this.targetCollisions) * this.timeScale.length);
        if (timeScaleIndex < this.timeScale.length) {
            this.timeScale[timeScaleIndex] = {
                time: this.time,
                collisions: this.collisionCount
            };
        }
    }
    
    /**
     * Resolve a collision between two blocks (conserving momentum and energy)
     * @param {Object} b1 - First block
     * @param {Object} b2 - Second block
     */
    resolveCollision(b1, b2) {
        // 1D elastic collision formula
        const totalMass = b1.mass + b2.mass;
        const massDiff = b1.mass - b2.mass;
        
        // New velocities
        const v1 = ((massDiff) * b1.vx + 2 * b2.mass * b2.vx) / totalMass;
        const v2 = ((2 * b1.mass * b1.vx) - (massDiff) * b2.vx) / totalMass;
        
        // Update velocities
        b1.vx = v1 * this.elasticity;
        b2.vx = v2 * this.elasticity;
        
        // Move blocks apart to prevent sticking
        const overlap = (b1.x + b1.width) - b2.x;
        const b1Ratio = b2.mass / totalMass;
        const b2Ratio = b1.mass / totalMass;
        
        b1.x -= overlap * b1Ratio;
        b2.x += overlap * b2Ratio;
    }
    
    /**
     * Calculate π approximation based on collision count and mass ratio
     * @returns {number} Approximation of π
     */
    calculatePi() {
        if (this.collisionCount === 0) return 0;
        
        // The number of collisions approaches π × (mass ratio)^(1/4) as mass ratio increases
        return this.collisionCount / Math.pow(Math.pow(100, this.massRatio), 0.25);
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw boundary walls
        this.drawWalls();
        
        // Draw blocks
        this.drawBlocks();
        
        // Draw collision visualization
        this.drawCollisionVisualizer();
        
        // Draw π approximation
        this.drawPiApproximation();
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw boundary walls
     */
    drawWalls() {
        const { ctx, canvas } = this;
        
        // Draw walls
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw floor
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2 + this.baseSize * 1.5);
        ctx.lineTo(canvas.width, canvas.height / 2 + this.baseSize * 1.5);
        ctx.stroke();
        
        // Draw left wall (with pulsing effect if collision recently occurred)
        const leftWallOpacity = Math.min(1, this.blocks[0].collisions * 0.1);
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 + leftWallOpacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2 - this.baseSize * 2);
        ctx.lineTo(0, canvas.height / 2 + this.baseSize * 1.5);
        ctx.stroke();
        
        // Draw right wall (with pulsing effect if collision recently occurred)
        const rightWallOpacity = Math.min(1, this.blocks[1].collisions * 0.1);
        ctx.strokeStyle = `rgba(255, 170, 0, ${0.5 + rightWallOpacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width, canvas.height / 2 - this.baseSize * 2);
        ctx.lineTo(canvas.width, canvas.height / 2 + this.baseSize * 1.5);
        ctx.stroke();
    }
    
    /**
     * Draw the blocks
     */
    drawBlocks() {
        const { ctx } = this;
        
        for (const block of this.blocks) {
            // Create gradient fill based on velocity
            const speed = Math.abs(block.vx);
            const normalizedSpeed = Math.min(1, speed / 100);
            
            // Draw with glow effect based on collisions
            const glow = Math.min(20, block.collisions * 0.5);
            
            if (glow > 0) {
                // Create glow effect
                const gradient = ctx.createRadialGradient(
                    block.x + block.width / 2,
                    block.y + block.height / 2,
                    0,
                    block.x + block.width / 2,
                    block.y + block.height / 2,
                    block.width + glow
                );
                
                gradient.addColorStop(0, block.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    block.x - glow,
                    block.y - glow,
                    block.width + glow * 2,
                    block.height + glow * 2
                );
            }
            
            // Draw block
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Draw velocity vector
            if (block.vx !== 0) {
                const arrowLength = Math.min(50, Math.abs(block.vx) * 0.5);
                const direction = Math.sign(block.vx);
                
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(block.x + block.width / 2, block.y + block.height / 2);
                ctx.lineTo(
                    block.x + block.width / 2 + arrowLength * direction,
                    block.y + block.height / 2
                );
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.moveTo(
                    block.x + block.width / 2 + arrowLength * direction,
                    block.y + block.height / 2
                );
                ctx.lineTo(
                    block.x + block.width / 2 + (arrowLength - 5) * direction,
                    block.y + block.height / 2 - 5
                );
                ctx.lineTo(
                    block.x + block.width / 2 + (arrowLength - 5) * direction,
                    block.y + block.height / 2 + 5
                );
                ctx.closePath();
                ctx.fill();
            }
            
            // Add mass label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            // Format mass with proper exponent
            let massText;
            if (block.mass === 1) {
                massText = '1';
            } else {
                massText = `100^${this.massRatio}`;
            }
            
            ctx.fillText(
                massText,
                block.x + block.width / 2,
                block.y + block.height / 2 + 4
            );
            ctx.textAlign = 'left';
        }
    }
    
    /**
     * Draw collision frequency visualizer
     */
    drawCollisionVisualizer() {
        const { ctx, canvas } = this;
        const visualizerHeight = 100;
        const visualizerY = canvas.height - visualizerHeight - 20;
        
        // Draw visualizer background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(20, visualizerY, canvas.width - 40, visualizerHeight);
        
        // Draw visualizer border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, visualizerY, canvas.width - 40, visualizerHeight);
        
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Collision Frequency', 30, visualizerY - 5);
        
        // Draw collision graph
        if (this.collisionHistory.length > 1) {
            const maxCollisions = this.targetCollisions;
            const graphWidth = canvas.width - 60;
            
            // Draw time axis
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(30, visualizerY + visualizerHeight - 20);
            ctx.lineTo(30 + graphWidth, visualizerY + visualizerHeight - 20);
            ctx.stroke();
            
            // Draw collision graph
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let prevX = 30;
            let prevY = visualizerY + visualizerHeight - 20;
            
            this.timeScale.forEach((point, index) => {
                if (point.time > 0) {
                    const x = 30 + (index / this.timeScale.length) * graphWidth;
                    const y = visualizerY + visualizerHeight - 20 -
                        (point.collisions / maxCollisions) * (visualizerHeight - 30);
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    
                    prevX = x;
                    prevY = y;
                }
            });
            
            ctx.stroke();
            
            // Draw π threshold line
            const piY = visualizerY + visualizerHeight - 20 -
                (Math.PI / maxCollisions * Math.pow(Math.pow(100, this.massRatio), 0.25)) *
                (visualizerHeight - 30);
            
            ctx.strokeStyle = '#ffaa00';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(30, piY);
            ctx.lineTo(30 + graphWidth, piY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Add π label
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px Arial';
            ctx.fillText('π', 15, piY + 4);
        }
    }
    
    /**
     * Draw π approximation visualization
     */
    drawPiApproximation() {
        const { ctx, canvas } = this;
        const centerX = canvas.width / 2;
        const centerY = 80;
        
        // Draw π symbol
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffaa00';
        ctx.textAlign = 'center';
        ctx.fillText('π', centerX, centerY - 30);
        
        // Draw approximation
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        
        const piApprox = this.piApproximation.toFixed(10);
        ctx.fillText(piApprox, centerX, centerY);
        
        // Draw digits visualization
        const digitWidth = 20;
        const digitSpacing = 25;
        const startX = centerX - (piApprox.length * digitSpacing) / 2;
        
        for (let i = 0; i < piApprox.length; i++) {
            const digit = piApprox.charAt(i);
            
            // Skip the decimal point
            if (digit === '.') continue;
            
            // Check if digit matches π
            const matchesPI = i < 2 ? digit === '3' :
                i - 1 < this.digits.length && parseInt(digit) === this.digits[i - 1];
            
            // Draw digit highlight
            if (matchesPI) {
                ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
                ctx.fillRect(
                    startX + i * digitSpacing - digitWidth/2,
                    centerY - 20,
                    digitWidth,
                    25
                );
            }
        }
        
        ctx.textAlign = 'left';
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 130, 300, 120);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Boundary Enforcement', 20, 155);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Mass Ratio: 1:${Math.pow(100, this.massRatio)}`, 20, 180);
        ctx.fillText(`Collisions: ${this.collisionCount}`, 20, 200);
        ctx.fillText(`π Approximation: ${this.piApproximation.toFixed(6)}`, 20, 220);
        
        const error = Math.abs(this.piApproximation - Math.PI) / Math.PI * 100;
        ctx.fillText(`Error: ${error.toFixed(4)}%`, 20, 240);
        
        // Status message
        if (this.isComplete) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText('Simulation complete! Click to reset.', 20, 270);
        } else {
            ctx.fillStyle = this.isRunning ? '#00ff88' : '#ffaa00';
            ctx.fillText(
                this.isRunning ? 'Running... Click to pause' : 'Paused. Click to start',
                20, 270
            );
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
        
        ctx.fillText(`Collisions: ${this.collisionCount}`, canvas.width - 20, 30);
        
        const error = Math.abs(this.piApproximation - Math.PI) / Math.PI * 100;
        ctx.fillStyle = error < 1 ? '#00ff88' : '#ffaa00';
        ctx.fillText(`π ≈ ${this.piApproximation.toFixed(6)}`, canvas.width - 20, 60);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        const oldIntensity = this.settings.intensity;
        Object.assign(this.settings, newSettings);
        
        // If intensity changed significantly, reset with new mass ratio
        if (Math.abs(oldIntensity - this.settings.intensity) > 20) {
            this.reset();
        }
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleMouseClick);
        
        this.blocks = [];
        this.collisionHistory = [];
        this.timeScale = [];
    }
}