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
    constructor(canvas, ctx, settings, interactiveController) {
        // Core properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.interactiveController = interactiveController;
        
        // Scene-specific state
        this.time = 0;
        this.lastTime = 0;
        this.blocks = [];
        this.collisionCount = 0;
        this.piApproximation = 0;
        this.initialVelocity = -100;
        
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
        
        // Initialize controls
        this.controls = {
            massRatio: {
                value: this.massRatio,
                min: 1,
                max: 5,
                step: 1,
                label: 'Mass Ratio (10^x)'
            },
            velocity: {
                value: Math.abs(this.initialVelocity),
                min: 50,
                max: 200,
                step: 10,
                label: 'Initial Velocity'
            }
        };
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Register with interactive controller
        if (this.interactiveController) {
            this.interactiveController.registerControls(this.controls, (control, value) => {
                if (control === 'massRatio') {
                    this.massRatio = value;
                    this.reset();
                } else if (control === 'velocity') {
                    this.initialVelocity = -value;
                    this.reset();
                }
            });
        }
        
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
    /**
     * Handle user interaction through the interactive controller
     * @param {string} action - The action type
     * @param {Object} data - Action data
     */
    handleInteraction(action, data) {
        if (action === 'click') {
            if (this.isComplete) {
                this.reset();
            } else {
                this.isRunning = !this.isRunning;
            }
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
        
        // Continuous collision detection
        let timeLeft = dt;
        const maxIterations = 10;
        let iterations = 0;
        
        while (timeLeft > 0.0001 && iterations < maxIterations) {
            // Find earliest collision time
            let earliestCollision = {
                time: timeLeft,
                type: null,
                block1: null,
                block2: null
            };
            
            // Check block-wall collisions
            for (const block of blocks) {
                // Left wall
                if (block.vx < 0) {
                    const timeToWall = -block.x / block.vx;
                    if (timeToWall >= 0 && timeToWall < earliestCollision.time) {
                        earliestCollision = {
                            time: timeToWall,
                            type: 'wall',
                            block1: block,
                            block2: 'left'
                        };
                    }
                }
                
                // Right wall
                if (block.vx > 0) {
                    const timeToWall = (this.canvas.width - block.width - block.x) / block.vx;
                    if (timeToWall >= 0 && timeToWall < earliestCollision.time) {
                        earliestCollision = {
                            time: timeToWall,
                            type: 'wall',
                            block1: block,
                            block2: 'right'
                        };
                    }
                }
            }
            
            // Check block-block collisions
            for (let i = 0; i < blocks.length; i++) {
                for (let j = i + 1; j < blocks.length; j++) {
                    const b1 = blocks[i];
                    const b2 = blocks[j];
                    const relativeVel = b1.vx - b2.vx;
                    
                    if (relativeVel > 0 && b2.x > b1.x) {
                        const timeToCollision = (b2.x - (b1.x + b1.width)) / relativeVel;
                        if (timeToCollision >= 0 && timeToCollision < earliestCollision.time) {
                            earliestCollision = {
                                time: timeToCollision,
                                type: 'block',
                                block1: b1,
                                block2: b2
                            };
                        }
                    } else if (relativeVel < 0 && b1.x > b2.x) {
                        const timeToCollision = (b1.x - (b2.x + b2.width)) / -relativeVel;
                        if (timeToCollision >= 0 && timeToCollision < earliestCollision.time) {
                            earliestCollision = {
                                time: timeToCollision,
                                type: 'block',
                                block1: b1,
                                block2: b2
                            };
                        }
                    }
                }
            }
            
            // Move blocks forward to collision time
            const dt = Math.min(timeLeft, earliestCollision.time);
            for (const block of blocks) {
                block.x += block.vx * dt;
            }
            
            // Handle collision if one occurred
            if (earliestCollision.type === 'wall') {
                const block = earliestCollision.block1;
                block.vx = -block.vx * this.elasticity;
                this.collisionCount++;
                block.collisions++;
                this.collisionHistory.push({
                    time: this.time,
                    type: 'wall',
                    block: blocks.indexOf(block)
                });
            } else if (earliestCollision.type === 'block') {
                this.resolveCollision(earliestCollision.block1, earliestCollision.block2);
                this.collisionCount++;
                earliestCollision.block1.collisions++;
                earliestCollision.block2.collisions++;
                this.collisionHistory.push({
                    time: this.time,
                    type: 'block',
                    blocks: [
                        blocks.indexOf(earliestCollision.block1),
                        blocks.indexOf(earliestCollision.block2)
                    ]
                });
            }
            
            timeLeft -= dt;
            iterations++;
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
        
        // Galperin's theorem: As mass ratio approaches infinity,
        // π = lim(n→∞) N(n)/(n^(1/4))
        // where N(n) is number of collisions and n is mass ratio
        const massRatioPower = Math.pow(100, this.massRatio);
        const collisionScaling = Math.pow(massRatioPower, 0.25);
        
        // Apply correction factor for finite mass ratio
        const correction = 1 + 1 / (2 * massRatioPower); // First-order correction
        return (this.collisionCount / collisionScaling) * correction;
    }

    /**
     * Predict future collision points for visualization
     * @returns {Array} Array of predicted collision points
     */
    predictCollisions() {
        const predictions = [];
        const maxPredictions = 5;
        
        // Clone current state
        const blocks = this.blocks.map(b => ({
            x: b.x,
            vx: b.vx,
            width: b.width,
            mass: b.mass
        }));
        
        let time = 0;
        for (let i = 0; i < maxPredictions; i++) {
            // Find next collision
            let nextCollision = null;
            let minTime = Infinity;
            
            // Check wall collisions
            for (const block of blocks) {
                if (block.vx < 0) {
                    const t = -block.x / block.vx;
                    if (t > 0 && t < minTime) {
                        minTime = t;
                        nextCollision = { type: 'wall', block, time: time + t };
                    }
                } else if (block.vx > 0) {
                    const t = (this.canvas.width - block.width - block.x) / block.vx;
                    if (t > 0 && t < minTime) {
                        minTime = t;
                        nextCollision = { type: 'wall', block, time: time + t };
                    }
                }
            }
            
            // Check block collisions
            if (blocks[0].vx > blocks[1].vx) {
                const t = (blocks[1].x - blocks[0].x - blocks[0].width) / (blocks[0].vx - blocks[1].vx);
                if (t > 0 && t < minTime) {
                    minTime = t;
                    nextCollision = { type: 'block', time: time + t };
                }
            }
            
            if (!nextCollision) break;
            
            // Add prediction
            predictions.push(nextCollision);
            
            // Update state
            time = nextCollision.time;
            for (const block of blocks) {
                block.x += block.vx * minTime;
            }
            
            // Update velocities
            if (nextCollision.type === 'wall') {
                nextCollision.block.vx *= -this.elasticity;
            } else {
                const totalMass = blocks[0].mass + blocks[1].mass;
                const massDiff = blocks[0].mass - blocks[1].mass;
                const v1 = ((massDiff) * blocks[0].vx + 2 * blocks[1].mass * blocks[1].vx) / totalMass;
                const v2 = ((2 * blocks[0].mass * blocks[0].vx) - (massDiff) * blocks[1].vx) / totalMass;
                blocks[0].vx = v1 * this.elasticity;
                blocks[1].vx = v2 * this.elasticity;
            }
        }
        
        return predictions;
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
        
        // Draw predicted collision points
        const predictions = this.predictCollisions();
        for (const pred of predictions) {
            ctx.beginPath();
            ctx.arc(
                pred.type === 'wall' ?
                    (pred.block === this.blocks[0] ? 0 : this.canvas.width) :
                    this.blocks[1].x,
                this.canvas.height / 2,
                5,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        }
        
        // Draw blocks
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
        
        // Draw info panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 130, 350, 180);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('π Through Elastic Collisions', 20, 155);
        
        // Theoretical background
        ctx.font = '12px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText("Galperin's Theorem: π emerges from the collision count", 20, 175);
        ctx.fillText("scaled by the fourth root of the mass ratio", 20, 190);
        
        // Statistics
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        
        // Mass ratio with scientific notation
        const massRatioExp = 2 * this.massRatio;
        ctx.fillText(`Mass Ratio: 1:10^${massRatioExp}`, 20, 215);
        
        // Collision count with thousands separator
        ctx.fillText(
            `Collisions: ${this.collisionCount.toLocaleString()}`,
            20, 235
        );
        
        // π approximation with color-coded accuracy
        const error = Math.abs(this.piApproximation - Math.PI) / Math.PI * 100;
        ctx.fillStyle = error < 1 ? '#00ff88' : error < 5 ? '#ffaa00' : '#ff4444';
        ctx.fillText(
            `π ≈ ${this.piApproximation.toFixed(8)}`,
            20, 255
        );
        
        // Error percentage
        ctx.fillText(
            `Error: ${error.toFixed(6)}%`,
            20, 275
        );
        
        // Convergence rate
        if (this.collisionCount > 0) {
            const convergenceRate = Math.log(error) / Math.log(this.collisionCount);
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(
                `Convergence Rate: ~1/n^${Math.abs(convergenceRate).toFixed(3)}`,
                20, 295
            );
        }
        
        // Status message with enhanced visibility
        if (this.isComplete) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText('✓ Simulation complete! Click to reset.', 20, 315);
        } else {
            ctx.fillStyle = this.isRunning ? '#00ff88' : '#ffaa00';
            const statusIcon = this.isRunning ? '▶' : '❚❚';
            ctx.fillText(
                `${statusIcon} ${this.isRunning ? 'Running... Click to pause' : 'Paused. Click to start'}`,
                20, 315
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