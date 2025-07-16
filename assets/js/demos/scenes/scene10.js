// Scene 10: Memory Formation - A Hopfield-like network for pattern consolidation.
export default class Scene10 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

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
        
        // Animation
        this.time = 0;
        this.updatesPerFrame = 100;
        this.energy = 0;

        // Interaction
        this.isDrawing = false;
        
        // Event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    init() {
        this.defineMemories();
        this.storeMemories();
        this.scrambleNetwork(0.3); // Start with a noisy pattern

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseup', this.handleMouseUp); // Global mouse up

        return Promise.resolve();
    }
    
    defineMemories() {
        this.memories = [];
        // Define some patterns (e.g., letters, simple shapes)
        const patterns = [
            // Pattern 1: A vertical bar
            (c, r) => (c > this.cols/2 - 2 && c < this.cols/2 + 2),
            // Pattern 2: A horizontal bar
            (c, r) => (r > this.rows/2 - 2 && r < this.rows/2 + 2),
            // Pattern 3: A cross
            (c, r) => (c > this.cols/2 - 2 && c < this.cols/2 + 2) || (r > this.rows/2 - 2 && r < this.rows/2 + 2),
            // Pattern 4: A checkerboard
            (c, r) => (c % 4 < 2) ^ (r % 4 < 2)
        ];

        patterns.forEach(p_func => {
            const pattern = new Array(this.numNeurons).fill(-1);
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (p_func(c, r)) {
                        pattern[r * this.cols + c] = 1;
                    }
                }
            }
            this.memories.push(pattern);
        });
    }

    storeMemories() {
        this.weights = new Array(this.numNeurons).fill(0).map(() => new Array(this.numNeurons).fill(0));
        
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
            for(let i=0; i<row.length; i++) {
                row[i] /= this.memories.length;
            }
        });
        
        this.storedPatternCount = this.memories.length;
    }

    scrambleNetwork(noiseLevel = 0.5) {
        for (let i = 0; i < this.numNeurons; i++) {
            this.neurons[i] = Math.random() < noiseLevel ? -1 : 1;
        }
    }
    
    loadNoisyMemory(index, noiseLevel = 0.2) {
        if(index >= this.memories.length) return;
        const pattern = this.memories[index];
        for(let i=0; i < this.numNeurons; i++) {
            this.neurons[i] = Math.random() < noiseLevel ? -pattern[i] : pattern[i];
        }
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        this.drawOnCanvas(e);
    }
    
    handleMouseMove(e) {
        if(this.isDrawing) {
            this.drawOnCanvas(e);
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
    }

    drawOnCanvas(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const c = Math.floor(mouseX / this.gridSize);
        const r = Math.floor(mouseY / this.gridSize);
        const index = r * this.cols + c;

        if (index >= 0 && index < this.numNeurons) {
            this.neurons[index] = e.buttons === 1 ? 1 : -1; // Left-click for ON, other clicks (like right) for OFF
        }
    }

    updateNetwork() {
        for (let i = 0; i < this.updatesPerFrame * this.settings.speed; i++) {
            // Pick a random neuron
            const neuronIndex = Math.floor(Math.random() * this.numNeurons);
            
            // Calculate its activation
            let activation = 0;
            for (let j = 0; j < this.numNeurons; j++) {
                activation += this.weights[neuronIndex][j] * this.neurons[j];
            }
            
            // Update state (threshold rule)
            this.neurons[neuronIndex] = activation >= 0 ? 1 : -1;
        }
    }

    calculateEnergy() {
        let energy = 0;
        for (let i = 0; i < this.numNeurons; i++) {
            for (let j = 0; j < this.numNeurons; j++) {
                energy -= this.weights[i][j] * this.neurons[i] * this.neurons[j];
            }
        }
        this.energy = energy / (2 * this.numNeurons * this.numNeurons); // Normalize
    }
    
    animate(timestamp) {
        this.time++;
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateNetwork();
        
        if (this.time % 10 === 0) { // Calculate energy less frequently
            this.calculateEnergy();
        }

        this.drawGrid();

        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }
    
    drawGrid() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const index = r * this.cols + c;
                const value = this.neurons[index];
                
                if (value === 1) {
                    this.ctx.fillStyle = '#00d4ff';
                } else {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                }

                this.ctx.fillRect(c * this.gridSize + 1, r * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
            }
        }
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 120);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Memory Formation', 30, 45);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText(`Stored Patterns: ${this.storedPatternCount}`, 30, 70);
        this.ctx.fillText(`Network Energy: ${this.energy.toFixed(4)}`, 30, 90);
        this.ctx.fillText('Click/drag to set neuron states.', 30, 110);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}