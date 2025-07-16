/**
 * Scene 10: Neural Memory - A Hopfield network simulation
 *
 * This scene demonstrates pattern storage and retrieval in an associative memory
 * network based on the Hopfield model. The network can store multiple patterns
 * and retrieve them even from noisy or partial inputs.
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
        this.updatesPerFrame = 100;
        
        // Network parameters
        this.gridSize = 20;
        this.rows = Math.floor(canvas.height / this.gridSize);
        this.cols = Math.floor(canvas.width / this.gridSize);
        this.numNeurons = this.rows * this.cols;
        
        // Neurons and weights
        this.neurons = new Array(this.numNeurons).fill(1);
        this.weights = new Array(this.numNeurons).fill(0).map(() => new Array(this.numNeurons).fill(0));
        
        // Memory patterns
        this.memories = [];
        this.storedPatternCount = 0;
        this.currentPattern = -1; // -1 = none, 0+ = pattern index
        this.patternNames = [];
        
        // Network dynamics
        this.energy = 0;
        this.retrievalAccuracy = 0;
        this.stabilityMetric = 0;
        this.stableCount = 0;
        this.updateHistory = [];
        
        // Interaction state
        this.isDrawing = false;
        this.drawMode = 1; // 1 = ON, -1 = OFF
        this.brushSize = 1;
        this.activationHeatmap = false;
        this.useActivationColor = true;
        this.showPatternOverlay = false;
        this.overlayPattern = 0;
        this.convergenceMode = 'async'; // 'async' or 'sync'
        
        // Visual elements
        this.activations = new Array(this.numNeurons).fill(0);
        this.cellChanges = new Array(this.numNeurons).fill(0);
        this.neuronActivities = new Array(this.numNeurons).fill(0);
        
        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Mouse coordinates
        this.mouseX = 0;
        this.mouseY = 0;
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Create predefined patterns
        this.defineMemories();
        
        // Store patterns in the network
        this.storeMemories();
        
        // Start with a noisy pattern
        this.scrambleNetwork(0.3);
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('keydown', this.handleKeyDown);
        
        return Promise.resolve();
    }
    
    /**
     * Define memory patterns for the network
     */
    defineMemories() {
        this.memories = [];
        this.patternNames = [];
        
        // Define pattern functions
        const patterns = [
            // Pattern 1: Letter T
            {
                name: "Letter T",
                func: (c, r) => (c > this.cols/2 - 6 && c < this.cols/2 + 6 && r > this.rows/2 - 10 && r < this.rows/2 - 8) ||
                               (c > this.cols/2 - 1 && c < this.cols/2 + 1 && r > this.rows/2 - 10 && r < this.rows/2 + 6)
            },
            // Pattern 2: Letter X
            {
                name: "Letter X",
                func: (c, r) => (Math.abs(c - this.cols/2) < Math.abs(r - this.rows/2) + 2 &&
                               Math.abs(c - this.cols/2) + 2 > Math.abs(r - this.rows/2) &&
                               Math.abs(c - this.cols/2) < 8 && Math.abs(r - this.rows/2) < 8)
            },
            // Pattern 3: Letter O
            {
                name: "Letter O",
                func: (c, r) => {
                    const dx = c - this.cols/2;
                    const dy = r - this.rows/2;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    return dist > 4 && dist < 7;
                }
            },
            // Pattern 4: Square
            {
                name: "Square",
                func: (c, r) => {
                    const dx = Math.abs(c - this.cols/2);
                    const dy = Math.abs(r - this.rows/2);
                    return (dx === 5 && dy <= 5) || (dy === 5 && dx <= 5);
                }
            },
            // Pattern 5: Checkerboard
            {
                name: "Checkerboard",
                func: (c, r) => (c % 4 < 2) ^ (r % 4 < 2)
            },
            // Pattern 6: Diagonal Line
            {
                name: "Diagonal",
                func: (c, r) => Math.abs(c - r) < 2 && c > this.cols/2 - 10 && c < this.cols/2 + 10
            }
        ];

        // Create patterns from functions
        patterns.forEach(pattern => {
            const patternArray = new Array(this.numNeurons).fill(-1);
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (pattern.func(c, r)) {
                        patternArray[r * this.cols + c] = 1;
                    }
                }
            }
            this.memories.push(patternArray);
            this.patternNames.push(pattern.name);
        });
    }

    /**
     * Store memory patterns in the network weights
     */
    storeMemories() {
        // Reset weights
        this.weights = new Array(this.numNeurons).fill(0).map(() => new Array(this.numNeurons).fill(0));
        
        // Hebbian learning rule
        this.memories.forEach(pattern => {
            for (let i = 0; i < this.numNeurons; i++) {
                for (let j = 0; j < this.numNeurons; j++) {
                    if (i !== j) {
                        this.weights[i][j] += pattern[i] * pattern[j];
                    }
                }
            }
        });

        // Normalize weights
        this.weights.forEach(row => {
            for (let i = 0; i < row.length; i++) {
                row[i] /= this.memories.length;
            }
        });
        
        this.storedPatternCount = this.memories.length;
    }

    /**
     * Randomize the network state with noise
     * @param {number} noiseLevel - Probability of flipping a neuron (0-1)
     */
    scrambleNetwork(noiseLevel = 0.5) {
        for (let i = 0; i < this.numNeurons; i++) {
            this.neurons[i] = Math.random() < noiseLevel ? -1 : 1;
        }
        this.currentPattern = -1;
        this.updateActivations();
    }
    
    /**
     * Load a stored pattern with noise
     * @param {number} index - Pattern index
     * @param {number} noiseLevel - Probability of flipping a neuron (0-1)
     */
    loadNoisyMemory(index, noiseLevel = 0.2) {
        if (index >= this.memories.length) return;
        
        const pattern = this.memories[index];
        for (let i = 0; i < this.numNeurons; i++) {
            this.neurons[i] = Math.random() < noiseLevel ? -pattern[i] : pattern[i];
        }
        
        this.currentPattern = index;
        this.updateActivations();
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        this.isDrawing = true;
        
        // Right click for eraser mode
        if (e.button === 2) {
            this.drawMode = -1;
            e.preventDefault();
        } else {
            this.drawMode = 1;
        }
        
        this.drawOnCanvas(e);
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        if (this.isDrawing) {
            this.drawOnCanvas(e);
        }
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        // Number keys (1-9) to load patterns
        if (e.key >= '1' && e.key <= '9') {
            const patternIndex = parseInt(e.key) - 1;
            if (patternIndex < this.memories.length) {
                this.loadNoisyMemory(patternIndex, 0.2);
            }
        }
        
        switch (e.key) {
            case 'c':
                // Clear network
                this.scrambleNetwork(0.5);
                break;
            case 'r':
                // Reset to random pattern
                this.scrambleNetwork(0.3);
                break;
            case 'a':
                // Toggle activation color mode
                this.useActivationColor = !this.useActivationColor;
                break;
            case 'h':
                // Toggle heatmap
                this.activationHeatmap = !this.activationHeatmap;
                break;
            case 'o':
                // Toggle pattern overlay
                this.showPatternOverlay = !this.showPatternOverlay;
                if (this.showPatternOverlay) {
                    this.overlayPattern = (this.overlayPattern + 1) % this.memories.length;
                }
                break;
            case 's':
                // Toggle convergence mode
                this.convergenceMode = this.convergenceMode === 'async' ? 'sync' : 'async';
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
     * Update neurons when drawing on the canvas
     * @param {MouseEvent} e - The mouse event
     */
    drawOnCanvas(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const centerC = Math.floor(mouseX / this.gridSize);
        const centerR = Math.floor(mouseY / this.gridSize);
        
        // Draw with brush size
        for (let r = centerR - this.brushSize + 1; r <= centerR + this.brushSize - 1; r++) {
            for (let c = centerC - this.brushSize + 1; c <= centerC + this.brushSize - 1; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    const index = r * this.cols + c;
                    
                    // Only draw if within the brush radius
                    const dx = c - centerC;
                    const dy = r - centerR;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < this.brushSize) {
                        if (this.neurons[index] !== this.drawMode) {
                            this.neurons[index] = this.drawMode;
                            this.cellChanges[index] = 10; // Visual feedback duration
                        }
                    }
                }
            }
        }
        
        this.currentPattern = -1; // Custom pattern
        this.updateActivations();
    }

    /**
     * Update the network state according to Hopfield dynamics
     */
    updateNetwork() {
        // Scale updates based on settings speed
        const updates = Math.max(1, Math.floor(this.updatesPerFrame * this.settings.speed));
        
        if (this.convergenceMode === 'async') {
            // Asynchronous updates (classic Hopfield)
            for (let i = 0; i < updates; i++) {
                // Pick a random neuron
                const neuronIndex = Math.floor(Math.random() * this.numNeurons);
                
                // Get current state for tracking changes
                const oldState = this.neurons[neuronIndex];
                
                // Calculate activation
                let activation = 0;
                for (let j = 0; j < this.numNeurons; j++) {
                    activation += this.weights[neuronIndex][j] * this.neurons[j];
                }
                
                // Store activation for visualization
                this.activations[neuronIndex] = activation;
                
                // Update state (threshold rule)
                this.neurons[neuronIndex] = activation >= 0 ? 1 : -1;
                
                // Record if the neuron changed state
                if (oldState !== this.neurons[neuronIndex]) {
                    this.cellChanges[neuronIndex] = 10; // Visual feedback duration
                    this.neuronActivities[neuronIndex] = 1;
                }
            }
        } else {
            // Synchronous updates (all neurons at once)
            const newStates = new Array(this.numNeurons);
            
            // Calculate all activations
            for (let i = 0; i < this.numNeurons; i++) {
                let activation = 0;
                for (let j = 0; j < this.numNeurons; j++) {
                    activation += this.weights[i][j] * this.neurons[j];
                }
                
                this.activations[i] = activation;
                newStates[i] = activation >= 0 ? 1 : -1;
                
                // Record if the neuron will change state
                if (this.neurons[i] !== newStates[i]) {
                    this.cellChanges[i] = 10; // Visual feedback duration
                    this.neuronActivities[i] = 1;
                }
            }
            
            // Update all neurons at once
            this.neurons = [...newStates];
        }
        
        // Track changes for stability metric
        const changes = this.cellChanges.filter(c => c > 0).length;
        this.stabilityMetric = 1 - changes / this.numNeurons;
        
        // Count stable neurons
        this.stableCount = this.neurons.reduce((count, _, idx) => {
            let stable = true;
            let activation = 0;
            for (let j = 0; j < this.numNeurons; j++) {
                activation += this.weights[idx][j] * this.neurons[j];
            }
            const expectedState = activation >= 0 ? 1 : -1;
            stable = this.neurons[idx] === expectedState;
            return count + (stable ? 1 : 0);
        }, 0);
    }
    
    /**
     * Update neuron activations for visualization
     */
    updateActivations() {
        for (let i = 0; i < this.numNeurons; i++) {
            let activation = 0;
            for (let j = 0; j < this.numNeurons; j++) {
                activation += this.weights[i][j] * this.neurons[j];
            }
            this.activations[i] = activation;
        }
    }

    /**
     * Calculate the network energy (Lyapunov function)
     */
    calculateEnergy() {
        let energy = 0;
        for (let i = 0; i < this.numNeurons; i++) {
            for (let j = 0; j < this.numNeurons; j++) {
                energy -= this.weights[i][j] * this.neurons[i] * this.neurons[j];
            }
        }
        this.energy = energy / (2 * this.numNeurons * this.numNeurons); // Normalize
    }
    
    /**
     * Calculate the overlap with stored patterns
     */
    calculatePatternOverlap() {
        const overlaps = this.memories.map(pattern => {
            let overlap = 0;
            for (let i = 0; i < this.numNeurons; i++) {
                overlap += this.neurons[i] * pattern[i];
            }
            return overlap / this.numNeurons;
        });
        
        // Find the best matching pattern
        const maxOverlap = Math.max(...overlaps);
        const bestMatch = overlaps.indexOf(maxOverlap);
        
        if (maxOverlap > 0.7) {
            this.currentPattern = bestMatch;
        }
        
        // Calculate retrieval accuracy
        if (this.currentPattern >= 0) {
            let matches = 0;
            const pattern = this.memories[this.currentPattern];
            for (let i = 0; i < this.numNeurons; i++) {
                if (this.neurons[i] === pattern[i]) {
                    matches++;
                }
            }
            this.retrievalAccuracy = matches / this.numNeurons;
        } else {
            this.retrievalAccuracy = 0;
        }
        
        return overlaps;
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
        this.time += deltaTime;
        
        // Update scene state
        this.update(deltaTime);
        
        // Render the scene
        this.draw();
    }
    
    /**
     * Update scene state - separated from animation for clarity
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Update network state
        this.updateNetwork();
        
        // Calculate energy every few frames for efficiency
        if (Math.floor(this.time * 10) % 2 === 0) {
            this.calculateEnergy();
            this.calculatePatternOverlap();
        }
        
        // Update cell change indicators
        for (let i = 0; i < this.numNeurons; i++) {
            if (this.cellChanges[i] > 0) {
                this.cellChanges[i] -= dt * 20;
            }
        }
        
        // Decay neuron activity for visualization
        for (let i = 0; i < this.numNeurons; i++) {
            if (this.neuronActivities[i] > 0) {
                this.neuronActivities[i] -= dt * 2;
                if (this.neuronActivities[i] < 0) this.neuronActivities[i] = 0;
            }
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw network elements
        this.drawGrid();
        
        // Draw pattern overlay if enabled
        if (this.showPatternOverlay && this.overlayPattern < this.memories.length) {
            this.drawPatternOverlay(this.overlayPattern);
        }
        
        // Draw brush preview at mouse position if drawing
        if (this.isDrawing) {
            this.drawBrushPreview();
        }
        
        // Draw info panel or video info
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw the neural network grid
     */
    drawGrid() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const index = r * this.cols + c;
                const value = this.neurons[index];
                const activation = this.activations[index];
                
                // Determine cell color based on state and settings
                let fillColor;
                
                if (this.activationHeatmap) {
                    // Heatmap mode - color based on activation strength
                    const normActivation = Math.tanh(activation * 0.5); // Normalize to [-1, 1]
                    if (normActivation >= 0) {
                        // Positive activation - blue to cyan
                        const intensity = Math.floor(normActivation * 255);
                        fillColor = `rgb(${intensity}, ${intensity}, 255)`;
                    } else {
                        // Negative activation - red to yellow
                        const intensity = Math.floor(-normActivation * 255);
                        fillColor = `rgb(255, ${intensity}, ${intensity})`;
                    }
                } else if (this.useActivationColor && value === 1) {
                    // Color active neurons based on activation strength
                    const normActivation = Math.min(1, Math.abs(activation) / 5);
                    const intensity = 127 + Math.floor(normActivation * 128);
                    fillColor = `rgb(0, ${intensity}, 255)`;
                } else {
                    // Simple binary mode
                    fillColor = value === 1 ? '#00d4ff' : 'rgba(255, 255, 255, 0.1)';
                }
                
                // Draw the cell
                this.ctx.fillStyle = fillColor;
                this.ctx.fillRect(
                    c * this.gridSize + 1,
                    r * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
                
                // Draw change indicator
                if (this.cellChanges[index] > 0) {
                    const alpha = this.cellChanges[index] / 10;
                    this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
                    this.ctx.fillRect(
                        c * this.gridSize + 1,
                        r * this.gridSize + 1,
                        this.gridSize - 2,
                        this.gridSize - 2
                    );
                }
                
                // Draw activity indicator
                if (this.neuronActivities[index] > 0) {
                    const size = this.gridSize * 0.3 * this.neuronActivities[index];
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        c * this.gridSize + this.gridSize/2,
                        r * this.gridSize + this.gridSize/2,
                        size, 0, Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }
    }
    
    /**
     * Draw a pattern overlay to show target patterns
     * @param {number} patternIndex - Index of the pattern to overlay
     */
    drawPatternOverlay(patternIndex) {
        if (patternIndex >= this.memories.length) return;
        
        const pattern = this.memories[patternIndex];
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const index = r * this.cols + c;
                
                if (pattern[index] === 1) {
                    this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        c * this.gridSize,
                        r * this.gridSize,
                        this.gridSize,
                        this.gridSize
                    );
                }
            }
        }
    }
    
    /**
     * Draw the brush preview at mouse position
     */
    drawBrushPreview() {
        const centerC = Math.floor(this.mouseX / this.gridSize);
        const centerR = Math.floor(this.mouseY / this.gridSize);
        
        this.ctx.fillStyle = this.drawMode === 1 ?
            'rgba(0, 212, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            
        this.ctx.beginPath();
        this.ctx.arc(
            centerC * this.gridSize + this.gridSize/2,
            centerR * this.gridSize + this.gridSize/2,
            this.brushSize * this.gridSize,
            0, Math.PI * 2
        );
        this.ctx.fill();
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 350, 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Neural Memory - Hopfield Network', 30, 45);

        ctx.font = '14px Arial';
        
        // Show network stats
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Stored Patterns: ${this.storedPatternCount}`, 30, 70);
        ctx.fillText(`Network Energy: ${this.energy.toFixed(4)}`, 30, 90);
        ctx.fillText(`Stability: ${(this.stabilityMetric * 100).toFixed(1)}% (${this.stableCount}/${this.numNeurons})`, 30, 110);
        
        // Show pattern recognition status
        if (this.currentPattern >= 0 && this.retrievalAccuracy > 0.7) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`Recognized: ${this.patternNames[this.currentPattern]} (${(this.retrievalAccuracy * 100).toFixed(1)}%)`, 30, 130);
        } else {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('No pattern recognized', 30, 130);
        }
        
        // Show controls
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Mode: ${this.convergenceMode.toUpperCase()} | Brush: ${this.brushSize}`, 30, 150);
        ctx.fillText('Press 1-6 for patterns, C to clear, H for heatmap', 30, 170);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        
        // Show convergence info
        ctx.fillText(`${this.convergenceMode.toUpperCase()} Updates`, canvas.width - 20, 30);
        
        // Show pattern recognition status
        if (this.currentPattern >= 0 && this.retrievalAccuracy > 0.7) {
            ctx.fillStyle = '#00ff88';
            ctx.fillText(`Pattern: ${this.patternNames[this.currentPattern]}`, canvas.width - 20, 60);
        }
        
        // Show energy level
        const energyText = `Energy: ${this.energy.toFixed(4)}`;
        ctx.fillStyle = this.stabilityMetric > 0.95 ? '#00ff88' : '#ffffff';
        ctx.fillText(energyText, canvas.width - 20, 90);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        // Intensity controls noise level during reset
        if (newSettings.intensity !== undefined &&
            newSettings.intensity !== this.settings.intensity) {
            const noiseLevel = 1 - (newSettings.intensity / 100);
            this.scrambleNetwork(noiseLevel);
        }
        
        Object.assign(this.settings, newSettings);
    }
    
    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        // Clear arrays to free memory
        this.neurons = [];
        this.weights = [];
        this.memories = [];
        this.activations = [];
        this.cellChanges = [];
        this.neuronActivities = [];
    }
}