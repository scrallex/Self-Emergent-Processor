/**
 * Scene 7: Prime Uniqueness
 *
 * Visualize prime numbers on a coordinate grid with y=x boundary lines.
 * Animate non-trivial trajectory solutions and observe how composite
 * numbers form multi-path configurations.
 */

export default class Scene7 {
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
        this.numbers = [];
        this.primes = [];
        this.composites = [];
        
        // Grid parameters
        this.gridSize = 30; // Size of each cell
        this.gridCenter = { x: 0, y: 0 };
        this.gridOffset = { x: 0, y: 0 };
        this.spiralMaxN = 400; // Maximum number in spiral
        
        // Animation parameters
        this.trajectories = [];
        this.animationPhase = 0;
        this.viewMode = 'spiral'; // 'spiral', 'grid', '3d'
        this.zoom = 1.0;
        
        // Interactive parameters
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };
        this.isRotating = false;
        this.rotation = { x: 0, y: 0, z: 0 };
        
        // Statistics
        this.primeCount = 0;
        this.primeDensity = 0;
        
        // Bind event handlers to maintain 'this' context
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
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
        this.canvas.addEventListener('wheel', this.handleWheel);
        
        this.gridCenter = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        
        this.reset();
        return Promise.resolve();
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.numbers = [];
        this.primes = [];
        this.composites = [];
        this.trajectories = [];
        this.gridOffset = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.zoom = 1.0;
        
        // Generate Ulam spiral
        this.generateUlamSpiral();
        
        // Generate trajectories
        this.generateTrajectories();
        
        // Calculate statistics
        this.calculateStatistics();
    }

    /**
     * Generate the Ulam spiral of numbers
     */
    generateUlamSpiral() {
        const maxN = this.spiralMaxN;
        let x = 0, y = 0;
        let dx = 0, dy = -1;
        
        for (let i = 1; i <= maxN; i++) {
            // Add the number to our grid
            this.numbers.push({
                value: i,
                x: x,
                y: y,
                isPrime: this.isPrime(i),
                factors: this.getFactors(i),
                trajectories: [],
                highlighted: false,
                animation: {
                    phase: Math.random() * Math.PI * 2,
                    amplitude: 0
                }
            });
            
            // If prime, add to primes list
            if (this.isPrime(i)) {
                this.primes.push(i);
            } else if (i > 1) {
                this.composites.push(i);
            }
            
            // Check if we need to turn
            if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
                // Turn following Ulam spiral pattern
                [dx, dy] = [-dy, dx];
            }
            
            // Move to next position
            x += dx;
            y += dy;
        }
    }
    
    /**
     * Generate trajectory paths for numbers
     */
    generateTrajectories() {
        // Create trajectories for some composite numbers
        for (const composite of this.composites) {
            if (composite <= 4) continue; // Skip small composites
            
            // Get the number object
            const numberObj = this.numbers.find(n => n.value === composite);
            if (!numberObj) continue;
            
            // Generate different trajectory paths for factorizations
            this.generateFactorTrajectories(numberObj);
        }
    }
    
    /**
     * Generate trajectories based on factorizations
     * @param {Object} numberObj - The number object
     */
    generateFactorTrajectories(numberObj) {
        const factors = numberObj.factors;
        
        // Skip numbers with too many factors for visual clarity
        if (factors.length > 6) return;
        
        // For each unique factorization
        for (let i = 0; i < factors.length; i += 2) {
            if (i + 1 >= factors.length) continue;
            
            const factor1 = factors[i];
            const factor2 = factors[i + 1];
            
            // Find the corresponding number objects
            const factorObj1 = this.numbers.find(n => n.value === factor1);
            const factorObj2 = this.numbers.find(n => n.value === factor2);
            
            if (!factorObj1 || !factorObj2) continue;
            
            // Create a trajectory
            const trajectory = {
                start: { x: factorObj1.x, y: factorObj1.y },
                end: { x: factorObj2.x, y: factorObj2.y },
                target: { x: numberObj.x, y: numberObj.y },
                product: numberObj.value,
                factors: [factor1, factor2],
                color: this.getFactorColor(factor1, factor2),
                progress: 0,
                particles: [],
                active: false
            };
            
            // Add the trajectory
            this.trajectories.push(trajectory);
            
            // Reference in the number object
            numberObj.trajectories.push(trajectory);
        }
    }
    
    /**
     * Get a color based on factor properties
     * @param {number} f1 - First factor
     * @param {number} f2 - Second factor
     * @returns {string} Color in CSS format
     */
    getFactorColor(f1, f2) {
        // Determine color based on factor properties
        if (this.isPrime(f1) && this.isPrime(f2)) {
            return '#00ff88'; // Green for prime * prime
        } else if (this.isPrime(f1) || this.isPrime(f2)) {
            return '#00d4ff'; // Cyan for prime * composite
        } else {
            return '#7c3aed'; // Purple for composite * composite
        }
    }
    
    /**
     * Calculate statistics about the prime distribution
     */
    calculateStatistics() {
        this.primeCount = this.primes.length;
        this.primeDensity = (this.primeCount / this.spiralMaxN) * 100;
    }
    
    /**
     * Check if a number is prime
     * @param {number} num - The number to check
     * @returns {boolean} True if prime, false otherwise
     */
    isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        
        let i = 5;
        while (i * i <= num) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
            i += 6;
        }
        return true;
    }
    
    /**
     * Get all factors of a number
     * @param {number} num - The number to factorize
     * @returns {number[]} Array of factors
     */
    getFactors(num) {
        const factors = [];
        
        // Find all factors
        for (let i = 1; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                factors.push(i);
                if (i !== num / i) {
                    factors.push(num / i);
                }
            }
        }
        
        // Sort factors
        factors.sort((a, b) => a - b);
        
        return factors;
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        this.dragStart = { x: mouseX, y: mouseY };
        this.lastMousePosition = { x: mouseX, y: mouseY };
        
        if (e.shiftKey) {
            this.isRotating = true;
        } else {
            this.isDragging = true;
        }
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        if (!this.isDragging && !this.isRotating) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (this.isDragging) {
            // Pan the view
            this.gridOffset.x += mouseX - this.lastMousePosition.x;
            this.gridOffset.y += mouseY - this.lastMousePosition.y;
        } else if (this.isRotating && this.viewMode === '3d') {
            // Rotate the view (3D mode only)
            this.rotation.y += (mouseX - this.lastMousePosition.x) * 0.01;
            this.rotation.x += (mouseY - this.lastMousePosition.y) * 0.01;
        }
        
        this.lastMousePosition = { x: mouseX, y: mouseY };
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        this.isDragging = false;
        this.isRotating = false;
    }

    /**
     * Handle mouse click event - toggle view mode
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        // Only process clicks, not drags
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const dragDistance = Math.hypot(
            mouseX - this.dragStart.x,
            mouseY - this.dragStart.y
        );
        
        if (dragDistance < 5) {
            // Check if it's a double-click (switch view mode)
            const now = performance.now();
            if (now - this.lastClickTime < 300) {
                // Cycle through view modes
                if (this.viewMode === 'spiral') {
                    this.viewMode = 'grid';
                } else if (this.viewMode === 'grid') {
                    this.viewMode = '3d';
                } else {
                    this.viewMode = 'spiral';
                }
                this.reset();
            }
            
            this.lastClickTime = now;
        }
    }
    
    /**
     * Handle mouse wheel event - zoom
     * @param {WheelEvent} e - The wheel event
     */
    handleWheel(e) {
        e.preventDefault();
        
        // Adjust zoom level
        this.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
        
        // Clamp zoom level
        this.zoom = Math.max(0.1, Math.min(5, this.zoom));
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
        // Update animation phase
        this.animationPhase += dt * 0.5;
        
        // Activate trajectories based on time
        const numTrajectories = Math.floor(this.settings.intensity / 10);
        const activeTrajectories = this.trajectories.filter(t => t.active);
        
        if (activeTrajectories.length < numTrajectories) {
            // Activate some trajectories
            const inactiveTrajectories = this.trajectories.filter(t => !t.active);
            if (inactiveTrajectories.length > 0) {
                const toActivate = Math.min(
                    numTrajectories - activeTrajectories.length,
                    Math.ceil(inactiveTrajectories.length * 0.05)
                );
                
                for (let i = 0; i < toActivate; i++) {
                    const idx = Math.floor(Math.random() * inactiveTrajectories.length);
                    if (idx < inactiveTrajectories.length) {
                        inactiveTrajectories[idx].active = true;
                        inactiveTrajectories[idx].progress = 0;
                        
                        // Create particles for the trajectory
                        const numParticles = 5 + Math.floor(Math.random() * 5);
                        inactiveTrajectories[idx].particles = [];
                        
                        for (let j = 0; j < numParticles; j++) {
                            inactiveTrajectories[idx].particles.push({
                                progress: Math.random() * 0.3,
                                speed: 0.2 + Math.random() * 0.3,
                                size: 2 + Math.random() * 3
                            });
                        }
                    }
                }
            }
        }
        
        // Update active trajectories
        for (const trajectory of this.trajectories) {
            if (trajectory.active) {
                // Update progress
                trajectory.progress += dt * 0.3;
                
                // Update particles
                for (const particle of trajectory.particles) {
                    particle.progress += dt * particle.speed;
                    
                    // Reset particle if it reaches the end
                    if (particle.progress >= 1) {
                        particle.progress = 0;
                    }
                }
                
                // Deactivate if completed
                if (trajectory.progress >= 1.5) {
                    trajectory.active = false;
                }
            }
        }
        
        // Update number animations
        for (const number of this.numbers) {
            number.animation.phase += dt;
            
            // Highlight primes
            number.highlighted = false;
            if (number.isPrime) {
                number.highlighted = true;
                number.animation.amplitude = 0.3 + 0.2 * Math.sin(number.animation.phase);
            }
            
            // Highlight numbers with active trajectories
            if (number.trajectories.some(t => t.active)) {
                number.highlighted = true;
                number.animation.amplitude = 0.5 + 0.3 * Math.sin(number.animation.phase * 2);
            }
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
        
        // Draw grid background
        this.drawGrid();
        
        // Draw based on current view mode
        if (this.viewMode === 'spiral') {
            this.drawSpiral();
        } else if (this.viewMode === 'grid') {
            this.drawCoordinateGrid();
        } else if (this.viewMode === '3d') {
            this.draw3DProjection();
        }
        
        // Draw boundary lines
        this.drawBoundaryLines();
        
        // Draw trajectories
        this.drawTrajectories();
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw the background grid
     */
    drawGrid() {
        const { ctx, canvas } = this;
        const gridStep = 50;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let x = this.gridOffset.x % gridStep; x < canvas.width; x += gridStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = this.gridOffset.y % gridStep; y < canvas.height; y += gridStep) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    /**
     * Draw the Ulam spiral
     */
    drawSpiral() {
        const { ctx, canvas } = this;
        const cellSize = this.gridSize * this.zoom;
        const centerX = this.gridCenter.x + this.gridOffset.x;
        const centerY = this.gridCenter.y + this.gridOffset.y;
        
        // Draw numbers
        for (const number of this.numbers) {
            const x = centerX + number.x * cellSize;
            const y = centerY + number.y * cellSize;
            
            // Skip if outside canvas
            if (x < -cellSize || x > canvas.width + cellSize ||
                y < -cellSize || y > canvas.height + cellSize) {
                continue;
            }
            
            // Draw cell
            this.drawNumberCell(number, x, y, cellSize);
        }
    }
    
    /**
     * Draw the coordinate grid view
     */
    drawCoordinateGrid() {
        const { ctx, canvas } = this;
        const cellSize = this.gridSize * this.zoom;
        const centerX = this.gridCenter.x + this.gridOffset.x;
        const centerY = this.gridCenter.y + this.gridOffset.y;
        
        // Draw coordinate axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // Draw numbers in grid formation
        const gridColumns = Math.ceil(Math.sqrt(this.spiralMaxN));
        
        for (const number of this.numbers) {
            // Convert to grid coordinates
            const col = (number.value - 1) % gridColumns;
            const row = Math.floor((number.value - 1) / gridColumns);
            
            const x = centerX + (col - gridColumns/2) * cellSize;
            const y = centerY + (row - gridColumns/2) * cellSize;
            
            // Skip if outside canvas
            if (x < -cellSize || x > canvas.width + cellSize ||
                y < -cellSize || y > canvas.height + cellSize) {
                continue;
            }
            
            // Draw cell
            this.drawNumberCell(number, x, y, cellSize);
        }
    }
    
    /**
     * Draw 3D projection view
     */
    draw3DProjection() {
        const { ctx, canvas } = this;
        const centerX = this.gridCenter.x + this.gridOffset.x;
        const centerY = this.gridCenter.y + this.gridOffset.y;
        const scale = this.gridSize * 0.8 * this.zoom;
        
        // Apply 3D rotation
        const sinX = Math.sin(this.rotation.x);
        const cosX = Math.cos(this.rotation.x);
        const sinY = Math.sin(this.rotation.y);
        const cosY = Math.cos(this.rotation.y);
        const sinZ = Math.sin(this.rotation.z);
        const cosZ = Math.cos(this.rotation.z);
        
        // Process numbers for z-sorting
        const renderObjects = [];
        
        for (const number of this.numbers) {
            // Get prime factors
            const factors = number.isPrime ? [number.value] : number.factors.filter(f => this.isPrime(f));
            
            // Convert factors to coordinates (max 3 dimensions)
            let x = 0, y = 0, z = 0;
            
            if (factors.length >= 1) x = Math.log(factors[0]);
            if (factors.length >= 2) y = Math.log(factors[1]);
            if (factors.length >= 3) z = Math.log(factors[2]);
            
            // Apply rotation
            // Rotate around X axis
            const y1 = y * cosX - z * sinX;
            const z1 = y * sinX + z * cosX;
            
            // Rotate around Y axis
            const x2 = x * cosY + z1 * sinY;
            const z2 = -x * sinY + z1 * cosY;
            
            // Rotate around Z axis
            const x3 = x2 * cosZ - y1 * sinZ;
            const y3 = x2 * sinZ + y1 * cosZ;
            
            // Project to screen
            const distance = 5;
            const projX = centerX + x3 * scale / (1 + z2 / distance);
            const projY = centerY + y3 * scale / (1 + z2 / distance);
            const projSize = scale * 0.5 / (1 + z2 / distance);
            
            renderObjects.push({
                number,
                x: projX,
                y: projY,
                z: z2,
                size: projSize
            });
        }
        
        // Sort by z-coordinate (painter's algorithm)
        renderObjects.sort((a, b) => b.z - a.z);
        
        // Draw numbers
        for (const obj of renderObjects) {
            this.drawNumberCell(obj.number, obj.x, obj.y, obj.size * 2);
        }
    }
    
    /**
     * Draw a single number cell
     * @param {Object} number - The number object
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} size - The cell size
     */
    drawNumberCell(number, x, y, size) {
        const { ctx } = this;
        const halfSize = size / 2;
        
        // Determine cell color based on number properties
        let fillColor, textColor;
        
        if (number.isPrime) {
            // Prime numbers - green with glow
            fillColor = '#00ff88';
            textColor = '#ffffff';
            
            // Add glow for highlighted primes
            if (number.highlighted) {
                const glowSize = size * (1 + number.animation.amplitude);
                const gradient = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, glowSize
                );
                gradient.addColorStop(0, 'rgba(0, 255, 136, 0.5)');
                gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (number.value === 1) {
            // Special case for 1
            fillColor = '#ffaa00';
            textColor = '#ffffff';
        } else {
            // Composite numbers
            fillColor = '#333333';
            textColor = '#aaaaaa';
            
            // Highlight composites with active trajectories
            if (number.highlighted) {
                fillColor = '#7c3aed';
                textColor = '#ffffff';
            }
        }
        
        // Draw cell background
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x, y, halfSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw number text
        ctx.fillStyle = textColor;
        ctx.font = `${Math.max(8, size * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number.value.toString(), x, y);
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    /**
     * Draw y=x boundary lines
     */
    drawBoundaryLines() {
        const { ctx, canvas } = this;
        const centerX = this.gridCenter.x + this.gridOffset.x;
        const centerY = this.gridCenter.y + this.gridOffset.y;
        
        // Draw y=x line
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(0, centerY + (0 - centerX));
        ctx.lineTo(canvas.width, centerY + (canvas.width - centerX));
        ctx.stroke();
        
        // Draw y=-x line
        ctx.beginPath();
        ctx.moveTo(0, centerY - (0 - centerX));
        ctx.lineTo(canvas.width, centerY - (canvas.width - centerX));
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    /**
     * Draw factor trajectories
     */
    drawTrajectories() {
        const { ctx } = this;
        
        // Draw active trajectories
        for (const trajectory of this.trajectories) {
            if (!trajectory.active) continue;
            
            // Get screen coordinates based on view mode
            let startX, startY, endX, endY, targetX, targetY;
            
            if (this.viewMode === 'spiral') {
                const cellSize = this.gridSize * this.zoom;
                const centerX = this.gridCenter.x + this.gridOffset.x;
                const centerY = this.gridCenter.y + this.gridOffset.y;
                
                startX = centerX + trajectory.start.x * cellSize;
                startY = centerY + trajectory.start.y * cellSize;
                endX = centerX + trajectory.end.x * cellSize;
                endY = centerY + trajectory.end.y * cellSize;
                targetX = centerX + trajectory.target.x * cellSize;
                targetY = centerY + trajectory.target.y * cellSize;
            } else if (this.viewMode === 'grid') {
                const cellSize = this.gridSize * this.zoom;
                const centerX = this.gridCenter.x + this.gridOffset.x;
                const centerY = this.gridCenter.y + this.gridOffset.y;
                const gridColumns = Math.ceil(Math.sqrt(this.spiralMaxN));
                
                // Convert to grid coordinates
                const startCol = (trajectory.factors[0] - 1) % gridColumns;
                const startRow = Math.floor((trajectory.factors[0] - 1) / gridColumns);
                startX = centerX + (startCol - gridColumns/2) * cellSize;
                startY = centerY + (startRow - gridColumns/2) * cellSize;
                
                const endCol = (trajectory.factors[1] - 1) % gridColumns;
                const endRow = Math.floor((trajectory.factors[1] - 1) / gridColumns);
                endX = centerX + (endCol - gridColumns/2) * cellSize;
                endY = centerY + (endRow - gridColumns/2) * cellSize;
                
                const targetCol = (trajectory.product - 1) % gridColumns;
                const targetRow = Math.floor((trajectory.product - 1) / gridColumns);
                targetX = centerX + (targetCol - gridColumns/2) * cellSize;
                targetY = centerY + (targetRow - gridColumns/2) * cellSize;
            } else {
                // 3D mode - skip trajectories in this mode
                continue;
            }
            
            // Draw path
            ctx.strokeStyle = trajectory.color + '40'; // Semi-transparent
            ctx.lineWidth = 1;
            
            // Path from factor 1 to factor 2
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Path from factors to product
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            
            // Draw particles moving along the trajectory
            for (const particle of trajectory.particles) {
                let particleX, particleY;
                
                if (particle.progress < 0.5) {
                    // First half: moving from start to end
                    const t = particle.progress * 2;
                    particleX = startX + (endX - startX) * t;
                    particleY = startY + (endY - startY) * t;
                } else {
                    // Second half: moving from midpoint to target
                    const t = (particle.progress - 0.5) * 2;
                    particleX = midX + (targetX - midX) * t;
                    particleY = midY + (targetY - midY) * t;
                }
                
                // Draw particle
                ctx.fillStyle = trajectory.color;
                ctx.beginPath();
                ctx.arc(particleX, particleY, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 130);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Prime Uniqueness', 20, 35);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        
        // Show view mode
        let viewModeText;
        switch (this.viewMode) {
            case 'spiral': viewModeText = 'Ulam Spiral'; break;
            case 'grid': viewModeText = 'Coordinate Grid'; break;
            case '3d': viewModeText = '3D Prime Factor Space'; break;
            default: viewModeText = this.viewMode;
        }
        
        ctx.fillText(`View: ${viewModeText}`, 20, 60);
        ctx.fillText(`Primes: ${this.primeCount} (${this.primeDensity.toFixed(1)}%)`, 20, 85);
        ctx.fillText(`Active Trajectories: ${this.trajectories.filter(t => t.active).length}`, 20, 110);
        
        // Controls hint
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Double-click to change view, drag to pan', 20, 135);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        // Show prime count
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Primes: ${this.primeCount}`, canvas.width - 20, 30);
        
        // Show view mode
        let viewModeText;
        switch (this.viewMode) {
            case 'spiral': viewModeText = 'Ulam Spiral'; break;
            case 'grid': viewModeText = 'Grid View'; break;
            case '3d': viewModeText = '3D View'; break;
            default: viewModeText = this.viewMode;
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(viewModeText, canvas.width - 20, 60);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleMouseClick);
        this.canvas.removeEventListener('wheel', this.handleWheel);
        
        this.numbers = [];
        this.primes = [];
        this.composites = [];
        this.trajectories = [];
    }
}