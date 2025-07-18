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
        this.gridSize = settings.blockSize || 30; // Size of each cell
        this.gridCenter = { x: 0, y: 0 };
        this.gridOffset = { x: 0, y: 0 };
        this.spiralMaxN = 400; // Maximum number in spiral
        
        // Animation parameters
        this.trajectories = [];
        this.animationPhase = 0;
        this.viewMode = 'spiral'; // view modes: 'spiral', 'grid', '3d' (sphere)
        this.zoom = 1.0;
        
        // Interactive parameters
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };
        this.isRotating = false;
        this.rotation = { x: 0, y: 0, z: 0 };
        this.impactEffects = [];
        this.latticePoints = [];
        this.showLatticeConnections = true;
        
        // Statistics
        this.primeCount = 0;
        this.primeDensity = 0;
        
        // Bind event handlers to maintain 'this' context
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
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
        window.addEventListener('keydown', this.handleKeyDown);
        
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
        this.spiralRange = 1;
        
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
        
        let maxCoord = 0;
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
            maxCoord = Math.max(maxCoord, Math.abs(x), Math.abs(y));
        }
        this.spiralRange = Math.max(1, maxCoord);
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
                active: false,
                effectsCreated: false
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
     * Calculate the maximum gap between consecutive primes
     * @returns {number} The maximum gap found
     */
    calculateMaxPrimeGap() {
        if (this.primes.length < 2) return 0;
        
        let maxGap = 0;
        for (let i = 1; i < this.primes.length; i++) {
            const gap = this.primes[i] - this.primes[i-1];
            if (gap > maxGap) maxGap = gap;
        }
        
        return maxGap;
    }
    
    /**
     * Calculate the average gap between consecutive primes
     * @returns {number} The average gap
     */
    calculateAveragePrimeGap() {
        if (this.primes.length < 2) return 0;
        
        let totalGap = 0;
        for (let i = 1; i < this.primes.length; i++) {
            totalGap += this.primes[i] - this.primes[i-1];
        }
        
        return totalGap / (this.primes.length - 1);
    }
    
    /**
     * Count the number of twin primes (pairs of primes that differ by 2)
     * @returns {number} The count of twin primes
     */
    countTwinPrimes() {
        if (this.primes.length < 2) return 0;
        
        let count = 0;
        for (let i = 0; i < this.primes.length - 1; i++) {
            if (this.primes[i+1] - this.primes[i] === 2) {
                count++;
            }
        }
        
        return count;
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
            // Rotate the sphere (3D view only)
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
                // Cycle through spiral, grid, and sphere views
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
     * Handle keyboard controls for rotation and view toggling
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                if (this.viewMode === '3d') this.rotation.y -= 0.1;
                break;
            case 'ArrowRight':
                if (this.viewMode === '3d') this.rotation.y += 0.1;
                break;
            case 'ArrowUp':
                if (this.viewMode === '3d') this.rotation.x -= 0.1;
                break;
            case 'ArrowDown':
                if (this.viewMode === '3d') this.rotation.x += 0.1;
                break;
            case 'v':
            case 'V':
                if (this.viewMode === 'spiral') {
                    this.viewMode = 'grid';
                } else if (this.viewMode === 'grid') {
                    this.viewMode = '3d';
                } else {
                    this.viewMode = 'spiral';
                }
                this.reset();
                break;
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
                    trajectory.effectsCreated = false; // Reset for next activation
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

        // Update impact effects
        this.impactEffects = this.impactEffects.filter(effect => {
            effect.life -= dt;
            effect.radius = effect.maxRadius * (1 - Math.pow(1 - effect.life, 2));
            effect.alpha = effect.life;
            return effect.life > 0;
        });
        
        // Update lattice point lifetimes
        this.latticePoints = this.latticePoints.filter(p => {
            p.life -= dt * 0.125; // Slower decay for lattice points
            return p.life > 0;
        });
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
        
        // Draw prime connecting paths first (so they appear behind the numbers)
        this.drawPrimeConnections(centerX, centerY, cellSize);
        
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
     * Draw connections between consecutive primes to visualize their ordering
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     * @param {number} cellSize - Size of each cell
     */
    drawPrimeConnections(centerX, centerY, cellSize) {
        const { ctx } = this;
        
        if (this.primes.length < 2) return;
        
        // Set up styles for prime connections
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        
        // Sort primes by value (they should already be sorted, but just to be sure)
        const sortedPrimes = [...this.primes].sort((a, b) => a - b);
        
        // Start at the first prime
        const firstNumber = this.numbers.find(n => n.value === sortedPrimes[0]);
        if (!firstNumber) return;
        
        let firstX = centerX + firstNumber.x * cellSize;
        let firstY = centerY + firstNumber.y * cellSize;
        
        ctx.moveTo(firstX, firstY);
        
        // Connect to each subsequent prime in order
        for (let i = 1; i < sortedPrimes.length; i++) {
            const number = this.numbers.find(n => n.value === sortedPrimes[i]);
            if (!number) continue;
            
            const x = centerX + number.x * cellSize;
            const y = centerY + number.y * cellSize;
            
            // Create a curved path between consecutive primes for visual appeal
            if (i % 2 === 0) {
                // Use a bezier curve for even indices
                const midX = (firstX + x) / 2;
                const midY = (firstY + y) / 2;
                const controlX = midX + Math.sin(this.animationPhase) * cellSize * 0.5;
                const controlY = midY + Math.cos(this.animationPhase) * cellSize * 0.5;
                
                ctx.quadraticCurveTo(controlX, controlY, x, y);
            } else {
                // Use a straight line for odd indices
                ctx.lineTo(x, y);
            }
            
            firstX = x;
            firstY = y;
        }
        
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern
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
     * Draw spherical projection view
     */
    draw3DProjection() {
        const { ctx, canvas } = this;
        const centerX = this.gridCenter.x + this.gridOffset.x;
        const centerY = this.gridCenter.y + this.gridOffset.y;
        const radius = this.gridSize * this.spiralRange * 0.5 * this.zoom;

        // Process numbers for z-sorting
        const renderObjects = [];
        
        const projectTo3D = (x, y, z) => {
            // Apply sphere rotation
            const sinX = Math.sin(this.rotation.x);
            const cosX = Math.cos(this.rotation.x);
            const sinY = Math.sin(this.rotation.y);
            const cosY = Math.cos(this.rotation.y);
            const sinZ = Math.sin(this.rotation.z);
            const cosZ = Math.cos(this.rotation.z);

            // Rotate around X axis
            const y1 = y * cosX - z * sinX;
            const z1 = y * sinX + z * cosX;

            // Rotate around Y axis
            const x2 = x * cosY + z1 * sinY;
            const z2 = -x * sinY + z1 * cosY;

            // Rotate around Z axis
            const x3 = x2 * cosZ - y1 * sinZ;
            const y3 = x2 * sinZ + y1 * cosZ;

            // Perspective projection
            const distance = radius * 2;
            const projX = centerX + (x3 * distance) / (distance + z2);
            const projY = centerY + (y3 * distance) / (distance + z2);
            const projSize = this.gridSize * this.zoom / (distance + z2);

            return { x: projX, y: projY, z: z2, size: projSize };
        };

        for (const number of this.numbers) {
            const theta = (number.x / this.spiralRange) * Math.PI; // longitude
            const phi = (number.y / this.spiralRange) * (Math.PI / 2); // latitude

            let x = radius * Math.cos(phi) * Math.cos(theta);
            let y = radius * Math.sin(phi);
            let z = radius * Math.cos(phi) * Math.sin(theta);

            const proj = projectTo3D(x, y, z);

            renderObjects.push({
                type: 'number',
                number,
                x: proj.x,
                y: proj.y,
                z: proj.z,
                size: proj.size
            });
        }

        for (const effect of this.impactEffects) {
            const proj = projectTo3D(effect.x, effect.y, 0);
            renderObjects.push({ type: 'effect', effect, ...proj });
        }

        for (const point of this.latticePoints) {
            const proj = projectTo3D(point.x, point.y, 0);
            renderObjects.push({ type: 'lattice', point, ...proj });
        }
        
        // Sort by z-coordinate (painter's algorithm)
        renderObjects.sort((a, b) => b.z - a.z);
        
        // Draw connections behind other objects
        this.drawLatticeConnections(renderObjects);

        // Draw objects
        for (const obj of renderObjects) {
            if (obj.type === 'number') {
                this.drawNumberCell(obj.number, obj.x, obj.y, obj.size * 2);
            } else if (obj.type === 'effect') {
                const effect = obj.effect;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, effect.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${effect.color}${Math.floor(effect.alpha * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            } else if (obj.type === 'lattice') {
                const point = obj.point;
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${point.life})`;
                ctx.fill();
            }
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
                
                // Enhanced geometric rays to show prime order
                // Get the index of this prime in the ordered list of primes
                const primeIndex = this.primes.indexOf(number.value);
                if (primeIndex !== -1) {
                    // Calculate ray properties based on prime's order
                    const primeOrder = primeIndex + 1; // 1-indexed position in prime sequence
                    const rayCount = Math.min(primeOrder, 11); // Scale ray count based on prime order
                    
                    // Display prime order number
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = `${Math.max(6, size * 0.2)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`p${primeOrder}`, x, y - halfSize * 1.2);
                    
                    // Draw rays in golden ratio spiral pattern
                    const goldenRatio = 1.618033988749895;
                    ctx.strokeStyle = 'rgba(0, 255, 136, 0.7)';
                    ctx.lineWidth = 1.5;
                    
                    for (let i = 0; i < rayCount; i++) {
                        // Use golden angle to distribute rays (more mathematically significant)
                        const angle = i * (Math.PI * 2 / goldenRatio) + this.animationPhase * 0.5;
                        // Scale ray length based on prime's position in sequence
                        const rayLength = glowSize * (1 + (0.1 * Math.min(primeOrder, 10)));
                        
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(
                            x + Math.cos(angle) * rayLength,
                            y + Math.sin(angle) * rayLength
                        );
                        ctx.stroke();
                    }
                }
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
        
        // Draw cell background with shape based on number properties
        ctx.fillStyle = fillColor;
        
        if (number.isPrime) {
            // Draw prime numbers as circles (representing their uniqueness)
            ctx.beginPath();
            ctx.arc(x, y, halfSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a border for clarity
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (number.value === 1) {
            // Draw 1 as a diamond
            ctx.beginPath();
            ctx.moveTo(x, y - halfSize * 0.8);
            ctx.lineTo(x + halfSize * 0.8, y);
            ctx.lineTo(x, y + halfSize * 0.8);
            ctx.lineTo(x - halfSize * 0.8, y);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw composite numbers as squares (representing their composite nature)
            const squareSize = halfSize * 1.4;
            ctx.beginPath();
            ctx.rect(x - squareSize/2, y - squareSize/2, squareSize, squareSize);
            ctx.fill();
            
            // For highlighted composites, show factor structure
            if (number.highlighted) {
                const factors = number.factors.filter(f => f > 1 && f < number.value);
                if (factors.length > 0 && factors.length <= 4) {
                    // Display visual representation of factors
                    const gridSize = Math.ceil(Math.sqrt(factors.length));
                    const cellSize = squareSize / gridSize;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    for (let i = 0; i < factors.length; i++) {
                        const row = Math.floor(i / gridSize);
                        const col = i % gridSize;
                        const fx = x - squareSize/2 + col * cellSize + cellSize/2;
                        const fy = y - squareSize/2 + row * cellSize + cellSize/2;
                        
                        ctx.beginPath();
                        ctx.arc(fx, fy, cellSize * 0.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        
        // Draw number text
        ctx.fillStyle = textColor;
        ctx.font = `${Math.max(8, size * 0.4)}px Arial`;
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
            
            // Calculate control points for curved paths
            // This creates more interesting geometric demonstrations of number relationships
            const controlPoint1X = startX + (endX - startX) * 0.5 + (Math.sin(this.animationPhase) * 50);
            const controlPoint1Y = startY + (endY - startY) * 0.5 - (Math.cos(this.animationPhase) * 50);
            
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            const controlPoint2X = midX + (targetX - midX) * 0.5 + (Math.cos(this.animationPhase + trajectory.factors[0]) * 50);
            const controlPoint2Y = midY + (targetY - midY) * 0.5 - (Math.sin(this.animationPhase + trajectory.factors[1]) * 50);
            
            // Draw enhanced path with thicker, more visible lines
            const alpha = 0.6 + (Math.sin(this.animationPhase * 0.5) * 0.2);
            ctx.strokeStyle = trajectory.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2;
            
            // Path from factor 1 to factor 2 with curved Bezier
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlPoint1X, controlPoint1Y, endX, endY);
            ctx.stroke();
            
            // Add glow effect to show prime number relationships more clearly
            if (trajectory.factors.some(f => this.isPrime(f))) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = trajectory.color;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            
            // Path from midpoint to product with curved Bezier
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.quadraticCurveTo(controlPoint2X, controlPoint2Y, targetX, targetY);
            ctx.stroke();
            
            // Draw connection nodes at intersection points for better visualization
            ctx.fillStyle = trajectory.color;
            ctx.beginPath();
            ctx.arc(midX, midY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw particles moving along the curved trajectory
            for (const particle of trajectory.particles) {
                let particleX, particleY;
                
                if (particle.progress < 0.5) {
                    // First half: moving along the bezier curve from start to end
                    const t = particle.progress * 2;
                    particleX = Math.pow(1-t, 2) * startX + 2 * (1-t) * t * controlPoint1X + Math.pow(t, 2) * endX;
                    particleY = Math.pow(1-t, 2) * startY + 2 * (1-t) * t * controlPoint1Y + Math.pow(t, 2) * endY;
                } else {
                    // Second half: moving along the bezier curve from midpoint to target
                    const t = (particle.progress - 0.5) * 2;
                    particleX = Math.pow(1-t, 2) * midX + 2 * (1-t) * t * controlPoint2X + Math.pow(t, 2) * targetX;
                    particleY = Math.pow(1-t, 2) * midY + 2 * (1-t) * t * controlPoint2Y + Math.pow(t, 2) * targetY;
                }
                
                // Draw enhanced particles with glowing effect
                ctx.fillStyle = trajectory.color;
                
                // Outer glow
                const glowSize = particle.size * 1.5;
                const gradient = ctx.createRadialGradient(
                    particleX, particleY, 0,
                    particleX, particleY, glowSize
                );
                gradient.addColorStop(0, trajectory.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particleX, particleY, glowSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Core particle
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(particleX, particleY, particle.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add number order visualization with sequence markers
            if (trajectory.factors.every(f => this.isPrime(f))) {
                // Highlight special case of prime factors
                const markerCount = 5;
                for (let i = 0; i < markerCount; i++) {
                    const t = i / (markerCount - 1);
                    const markerX = midX + (targetX - midX) * t;
                    const markerY = midY + (targetY - midY) * t;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.beginPath();
                    ctx.arc(markerX, markerY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 350, 240); // Increased height for additional info

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
            case '3d': viewModeText = 'Sphere View'; break;
            default: viewModeText = this.viewMode;
        }
        
        ctx.fillText(`View: ${viewModeText}`, 20, 60);
        ctx.fillText(`Primes: ${this.primeCount} (${this.primeDensity.toFixed(1)}%)`, 20, 85);
        ctx.fillText(`Active Trajectories: ${this.trajectories.filter(t => t.active).length}`, 20, 110);
        
        // Prime pattern information
        if (this.primes.length > 0) {
            const lastPrimeGap = this.primes.length > 1 ?
                this.primes[this.primes.length-1] - this.primes[this.primes.length-2] : 0;
            const maxGap = this.calculateMaxPrimeGap();
            const avgGap = this.calculateAveragePrimeGap();
            
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`Last Prime: ${this.primes[this.primes.length-1]}`, 20, 135);
            ctx.fillText(`Current Gap: ${lastPrimeGap}`, 20, 155);
            ctx.fillText(`Max Gap: ${maxGap}`, 180, 155);
            ctx.fillText(`Avg Gap: ${avgGap.toFixed(2)}`, 180, 175);
            
            // Add prime distribution insights
            const twinPrimes = this.countTwinPrimes();
            ctx.fillStyle = '#7c3aed'; // Purple for special insights
            ctx.fillText(`Twin Primes: ${twinPrimes}`, 20, 195);
            
            // Show golden ratio connection to prime distribution
            const goldenRatio = 1.618033988749895;
            ctx.fillStyle = '#ffaa00'; // Gold color for golden ratio
            ctx.fillText(`Golden Ratio: ${goldenRatio.toFixed(3)}`, 20, 215);
        }
        
        // Controls hint
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Double-click to change view, drag to pan', 20, 235);
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
            case '3d': viewModeText = 'Sphere View'; break;
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
        if (typeof newSettings.blockSize !== 'undefined') {
            this.gridSize = newSettings.blockSize;
        }
        Object.assign(this.settings, newSettings);
    }

    /**
     * Draw connections between lattice points
     */
    drawLatticeConnections(renderObjects) {
        const { ctx } = this;
        const latticeRenderObjects = renderObjects.filter(obj => obj.type === 'lattice');
        const MAX_DISTANCE = 150; // Max screen distance for connection

        for (let i = 0; i < latticeRenderObjects.length; i++) {
            const p1 = latticeRenderObjects[i];
            for (let j = i + 1; j < latticeRenderObjects.length; j++) {
                const p2 = latticeRenderObjects[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.hypot(dx, dy);

                if (dist < MAX_DISTANCE) {
                    const strength = 1 - (dist / MAX_DISTANCE);
                    const alpha = Math.min(p1.point.life, p2.point.life) * strength;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * 0.7})`;
                    ctx.lineWidth = 2 * alpha;
                    ctx.stroke();
                }
            }
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
        this.canvas.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        this.numbers = [];
        this.primes = [];
        this.composites = [];
        this.trajectories = [];
    }
}