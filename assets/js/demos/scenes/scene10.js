/**
 * Scene 10: Conway's Game of Life
 *
 * Interactive cellular automaton showing how complex patterns emerge from simple rules.
 * Create, save, and load patterns to observe gliders, oscillators, and other emergent structures.
 */

export default class Scene10 {
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
        
        // Animation and timing
        this.time = 0;
        this.lastTime = 0;
        this.animationSpeed = 1.0;
        this.lastStepTime = 0;
        this.stepInterval = 100; // ms between generations
        
        // Grid parameters
        this.cellSize = 15;
        this.rows = Math.floor(canvas.height / this.cellSize);
        this.cols = Math.floor(canvas.width / this.cellSize);
        
        // Game state
        this.grid = [];
        this.nextGrid = [];
        this.isRunning = false;
        this.generation = 0;
        this.populationCount = 0;
        
        // Preset patterns
        this.presets = this.createPresets();
        
        // Interaction state
        this.isDrawing = false;
        this.drawMode = 1; // 1 = draw, 0 = erase
        this.brushSize = 1;
        this.mouseCell = { x: -1, y: -1 };
        
        // Display options
        this.showGrid = true;
        this.showHud = true;
        this.colorMode = 'age'; // 'binary', 'age', 'heatmap'
        
        // Cell history for visualization
        this.cellAge = [];
        this.cellHeat = [];
        
        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Initialize grids
        this.initializeGrids();
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('keydown', this.handleKeyDown);
        
        // Add a random pattern to start
        this.randomizeGrid(0.3);
        
        return Promise.resolve();
    }
    
    /**
     * Initialize the grid and related data structures
     */
    initializeGrids() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.nextGrid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.cellAge = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.cellHeat = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    /**
     * Create a library of preset patterns
     * @returns {Object} Dictionary of preset patterns
     */
    createPresets() {
        return {
            'glider': [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ],
            'blinker': [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'block': [
                [1, 1],
                [1, 1]
            ],
            'toad': [
                [0, 1, 1, 1],
                [1, 1, 1, 0]
            ],
            'beacon': [
                [1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 1, 1],
                [0, 0, 1, 1]
            ],
            'glider_gun': [
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            ]
        };
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        this.isDrawing = true;
        this.drawOnGrid(e);
        
        // Right-click for eraser
        if (e.button === 2) {
            this.drawMode = 0;
            e.preventDefault();
        } else {
            this.drawMode = 1;
        }
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Update mouse cell position
        this.mouseCell = {
            x: Math.floor(mouseX / this.cellSize),
            y: Math.floor(mouseY / this.cellSize)
        };
        
        if (this.isDrawing) {
            this.drawOnGrid(e);
        }
    }
    
    /**
     * Handle mouse up event
     */
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch (e.key) {
            case ' ':
                // Space to toggle simulation
                this.isRunning = !this.isRunning;
                break;
            case 'c':
                // C to clear grid
                this.clearGrid();
                break;
            case 'r':
                // R to randomize grid
                this.randomizeGrid(0.3);
                break;
            case 'g':
                // G to toggle grid lines
                this.showGrid = !this.showGrid;
                break;
            case 'h':
                // H to toggle HUD display
                this.showHud = !this.showHud;
                break;
            case 'n':
                // N to step a single generation
                if (!this.isRunning) {
                    this.stepGeneration();
                }
                break;
            case 'm':
                // M to cycle color modes
                const modes = ['binary', 'age', 'heatmap'];
                const currentIndex = modes.indexOf(this.colorMode);
                this.colorMode = modes[(currentIndex + 1) % modes.length];
                break;
            case '1': case '2': case '3': case '4': case '5':
                // Number keys for preset patterns
                const patternKeys = Object.keys(this.presets);
                const patternIndex = parseInt(e.key) - 1;
                if (patternIndex >= 0 && patternIndex < patternKeys.length) {
                    this.placePreset(patternKeys[patternIndex]);
                }
                break;
            case '+':
            case '=':
                // Increase brush size
                this.brushSize = Math.min(5, this.brushSize + 1);
                break;
            case '-':
                // Decrease brush size
                this.brushSize = Math.max(1, this.brushSize - 1);
                break;
        }
    }
    
    /**
     * Draw on the grid at the mouse position
     * @param {MouseEvent} e - The mouse event
     */
    drawOnGrid(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const col = Math.floor(mouseX / this.cellSize);
        const row = Math.floor(mouseY / this.cellSize);
        
        // Apply brush with size
        for (let i = -this.brushSize + 1; i < this.brushSize; i++) {
            for (let j = -this.brushSize + 1; j < this.brushSize; j++) {
                const r = row + i;
                const c = col + j;
                
                // Check if within grid bounds
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    // Only fill cells within the brush radius
                    const dx = i;
                    const dy = j;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < this.brushSize - 0.5) {
                        this.grid[r][c] = this.drawMode;
                        
                        // Reset age for newly drawn cells
                        if (this.drawMode === 1) {
                            this.cellAge[r][c] = 0;
                        } else {
                            this.cellAge[r][c] = 0;
                            this.cellHeat[r][c] = 0;
                        }
                    }
                }
            }
        }
        
        // Update population count
        this.countPopulation();
    }
    
    /**
     * Clear the entire grid
     */
    clearGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = 0;
                this.cellAge[row][col] = 0;
                this.cellHeat[row][col] = 0;
            }
        }
        this.generation = 0;
        this.populationCount = 0;
    }
    
    /**
     * Fill the grid with random cells
     * @param {number} density - Probability of live cells (0-1)
     */
    randomizeGrid(density = 0.5) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = Math.random() < density ? 1 : 0;
                this.cellAge[row][col] = 0;
                this.cellHeat[row][col] = 0;
            }
        }
        this.generation = 0;
        this.countPopulation();
    }
    
    /**
     * Place a preset pattern at the mouse position
     * @param {string} patternName - Name of the pattern to place
     */
    placePreset(patternName) {
        const pattern = this.presets[patternName];
        if (!pattern) return;
        
        const { x, y } = this.mouseCell;
        
        // Place pattern centered at mouse
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        const startRow = y - Math.floor(patternHeight / 2);
        const startCol = x - Math.floor(patternWidth / 2);
        
        for (let i = 0; i < patternHeight; i++) {
            for (let j = 0; j < patternWidth; j++) {
                const r = startRow + i;
                const c = startCol + j;
                
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    this.grid[r][c] = pattern[i][j];
                    
                    // Reset age for newly placed cells
                    if (pattern[i][j] === 1) {
                        this.cellAge[r][c] = 0;
                    }
                }
            }
        }
        
        this.countPopulation();
    }
    
    /**
     * Count the total population (live cells)
     */
    countPopulation() {
        this.populationCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.populationCount += this.grid[row][col];
            }
        }
    }
    
    /**
     * Calculate the next generation based on Conway's rules
     */
    stepGeneration() {
        // Initialize next grid to zeros
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nextGrid[row][col] = 0;
            }
        }
        
        // Apply Game of Life rules
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countNeighbors(row, col);
                const isAlive = this.grid[row][col] === 1;
                
                // Conway's Game of Life rules (B3/S23)
                if (isAlive) {
                    // Survival: 2 or 3 neighbors
                    this.nextGrid[row][col] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                    
                    // Update age for surviving cells
                    if (this.nextGrid[row][col] === 1) {
                        this.cellAge[row][col] += 1;
                    } else {
                        // Record cell death in heatmap
                        this.cellHeat[row][col] = Math.min(255, this.cellHeat[row][col] + 50);
                    }
                } else {
                    // Birth: exactly 3 neighbors
                    this.nextGrid[row][col] = (neighbors === 3) ? 1 : 0;
                    
                    // Reset age for newly born cells
                    if (this.nextGrid[row][col] === 1) {
                        this.cellAge[row][col] = 0;
                    }
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        // Update generation count and population
        this.generation++;
        this.countPopulation();
    }
    
    /**
     * Count live neighbors for a cell
     * @param {number} row - Cell row
     * @param {number} col - Cell column
     * @returns {number} Number of live neighbors (0-8)
     */
    countNeighbors(row, col) {
        let count = 0;
        
        // Check all 8 neighboring cells
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                // Skip the cell itself
                if (i === 0 && j === 0) continue;
                
                // Get neighbor coordinates with wraparound
                const r = (row + i + this.rows) % this.rows;
                const c = (col + j + this.cols) % this.cols;
                
                // Count live neighbors
                count += this.grid[r][c];
            }
        }
        
        return count;
    }
    
    /**
     * Main animation loop - called by the framework on each frame
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    animate(timestamp) {
        // Calculate delta time
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime; // in ms
        this.lastTime = timestamp;
        
        // Update simulation based on settings speed
        this.animationSpeed = this.settings.speed;
        
        // Process a step at regular intervals if running
        if (this.isRunning) {
            const adjustedInterval = this.stepInterval / this.animationSpeed;
            if (timestamp - this.lastStepTime > adjustedInterval) {
                this.stepGeneration();
                this.lastStepTime = timestamp;
            }
        }
        
        // Fade out the heatmap over time
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.cellHeat[row][col] > 0) {
                    this.cellHeat[row][col] = Math.max(0, this.cellHeat[row][col] - 0.5);
                }
            }
        }
        
        // Render the scene
        this.draw();
    }
    
    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw cells
        this.drawCells();
        
        // Draw grid lines if enabled
        if (this.showGrid) {
            this.drawGridLines();
        }
        
        // Draw mouse hover indicator
        this.drawMouseIndicator();
        
        // Draw HUD info if enabled
        if (this.showHud && !this.settings.videoMode) {
            this.drawInfo();
        } else if (this.settings.videoMode) {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw the cells based on the current grid state
     */
    drawCells() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellState = this.grid[row][col];
                
                if (cellState === 1) {
                    // Determine cell color based on color mode
                    let fillColor;
                    switch (this.colorMode) {
                        case 'binary':
                            fillColor = '#00ff88'; // Green for all live cells
                            break;
                        case 'age':
                            // Color based on cell age (younger: green -> older: blue)
                            const age = Math.min(100, this.cellAge[row][col]);
                            const ageRatio = age / 100;
                            const r = Math.floor(0 * (1 - ageRatio) + 0 * ageRatio);
                            const g = Math.floor(255 * (1 - ageRatio) + 100 * ageRatio);
                            const b = Math.floor(136 * (1 - ageRatio) + 255 * ageRatio);
                            fillColor = `rgb(${r}, ${g}, ${b})`;
                            break;
                        case 'heatmap':
                            // All live cells are white
                            fillColor = '#ffffff';
                            break;
                    }
                    
                    // Draw the cell
                    this.ctx.fillStyle = fillColor;
                    this.ctx.fillRect(
                        col * this.cellSize + 1,
                        row * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                } else if (this.colorMode === 'heatmap' && this.cellHeat[row][col] > 0) {
                    // Draw heat for dead cells in heatmap mode
                    const heat = this.cellHeat[row][col];
                    this.ctx.fillStyle = `rgba(255, 50, 50, ${heat / 255})`;
                    this.ctx.fillRect(
                        col * this.cellSize + 1,
                        row * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }
    }
    
    /**
     * Draw grid lines
     */
    drawGridLines() {
        this.ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.rows * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.cols * this.cellSize, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw indicator for mouse position
     */
    drawMouseIndicator() {
        const { x, y } = this.mouseCell;
        
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            // Draw brush outline
            this.ctx.strokeStyle = this.drawMode === 1 ? '#00ff88' : '#ff3333';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            const centerX = (x + 0.5) * this.cellSize;
            const centerY = (y + 0.5) * this.cellSize;
            const radius = this.brushSize * this.cellSize * 0.8;
            
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw information panel
     */
    drawInfo() {
        // Background for info panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 270, 180);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText("Conway's Game of Life", 30, 45);
        
        // Game stats
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Generation: ${this.generation}`, 30, 70);
        this.ctx.fillText(`Population: ${this.populationCount}`, 30, 90);
        this.ctx.fillText(`Mode: ${this.colorMode}`, 30, 110);
        this.ctx.fillText(`Brush Size: ${this.brushSize}`, 30, 130);
        this.ctx.fillText(`Status: ${this.isRunning ? 'Running' : 'Paused'}`, 30, 150);
        
        // Controls help
        this.ctx.fillText('Space: Play/Pause | C: Clear | R: Random', 30, 180);
        this.ctx.fillText('N: Step | 1-5: Patterns | M: Color Mode', 30, 200);
    }
    
    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px monospace';
        this.ctx.textAlign = 'right';
        
        // Show generation and population
        this.ctx.fillText(`Gen: ${this.generation}`, this.canvas.width - 20, 30);
        this.ctx.fillText(`Pop: ${this.populationCount}`, this.canvas.width - 20, 60);
        
        this.ctx.textAlign = 'left'; // Reset alignment
    }
    
    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Adjust simulation speed based on settings
        if (newSettings.speed !== undefined) {
            this.animationSpeed = newSettings.speed;
        }
    }
    
    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        // Clear data structures
        this.grid = [];
        this.nextGrid = [];
        this.cellAge = [];
        this.cellHeat = [];
    }
}