/**
 * Scene 8: Emergent Patterns - 1D Cellular Automaton
 *
 * This scene simulates a 1D cellular automaton system based on elementary cellular automata
 * rules (0-255). It visualizes the evolution of simple rules that produce complex patterns
 * and provides pattern recognition to identify known structures that emerge.
 */
export default class Scene8 {
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
        
        // Animation state
        this.time = 0;
        this.lastTime = 0;
        this.lastEvolveTime = 0;
        
        // Cellular automaton state
        this.rule = 30; // Default rule (classic chaotic pattern)
        this.ruleset = [];
        this.cellSize = 8;
        this.cols = 0;
        this.rows = 0;
        this.generations = [];
        this.currentRow = 0;
        
        // Pattern recognition
        this.patterns = {
            // Pre-defined patterns for various rules
            30: [
                { name: 'Triangle', sequence: [1, 1, 0, 1, 1] },
                { name: 'Chaos Edge', sequence: [1, 0, 1, 0, 1, 0] }
            ],
            90: [
                { name: 'Sierpinski', sequence: [1, 0, 1] },
                { name: 'Double', sequence: [1, 0, 1, 0, 1] }
            ],
            110: [
                { name: 'Glider', sequence: [0, 1, 1, 1, 0, 1, 1] },
                { name: 'Block', sequence: [1, 1, 1] }
            ],
            184: [
                { name: 'Traffic', sequence: [1, 1, 0, 0, 1, 1] },
                { name: 'Flow', sequence: [1, 0, 0, 1] }
            ],
            45: [
                { name: 'Oscillator', sequence: [1, 1, 0, 0, 1, 1, 0, 0] }
            ],
            54: [
                { name: 'Stripes', sequence: [1, 0, 0, 1, 0, 0, 1] },
                { name: 'Boundary', sequence: [1, 1, 0, 0, 1, 1] }
            ]
        };
        this.recognized = [];
        
        // Display options
        this.colorMode = 'gradient'; // 'gradient', 'rule', 'single'
        this.showPatterns = true;
        this.showRuleViz = true;
        
        // Presets for different interesting rules
        this.presets = [
            { name: 'Rule 30 - Chaos', rule: 30 },
            { name: 'Rule 90 - Sierpinski', rule: 90 },
            { name: 'Rule 110 - Turing Complete', rule: 110 },
            { name: 'Rule 184 - Traffic', rule: 184 },
            { name: 'Rule 45 - Oscillating', rule: 45 },
            { name: 'Rule 54 - Complex', rule: 54 },
            { name: 'Rule 22 - Triangles', rule: 22 },
            { name: 'Rule 126 - Spikes', rule: 126 }
        ];
        this.currentPreset = 0;
        
        // Bind event handlers
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoveredRow = -1;
        this.hoveredCol = -1;
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Add event listeners
        this.canvas.addEventListener('click', this.handleMouseClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('keydown', this.handleKeyDown);
        
        // Initialize automaton
        this.resize();
        
        return Promise.resolve();
    }

    /**
     * Resize handler - recalculates dimensions when canvas size changes
     */
    resize() {
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.resetAutomaton();
    }

    /**
     * Reset the cellular automaton with current rule
     */
    resetAutomaton() {
        // Set ruleset from rule number (binary representation)
        this.ruleset = this.rule.toString(2).padStart(8, '0').split('').map(Number).reverse();
        
        // Reset state
        this.generations = [];
        this.recognized = [];
        this.currentRow = 0;

        // Create initial generation with a single activated cell in the middle
        let initialGen = Array(this.cols).fill(0);
        initialGen[Math.floor(this.cols / 2)] = 1;
        this.generations.push(initialGen);
        
        // Scan for patterns in the initial row
        this.scanForRow(initialGen, 0);
    }

    /**
     * Handle mouse click event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate cell coordinates
        const col = Math.floor(mouseX / this.cellSize);
        const row = Math.floor(mouseY / this.cellSize);
        
        // Handle clicks on the rule visualization
        if (this.showRuleViz && row >= this.canvas.height / this.cellSize - 5) {
            this.cyclePreset();
            return;
        }
        
        // Handle clicks on the first row (change initial state)
        if (row === 0 && this.generations[0] && col >= 0 && col < this.cols) {
            // Flip the state of the clicked cell in the first row
            this.generations[0][col] = 1 - this.generations[0][col];
            const initialGen = [...this.generations[0]];
            this.resetAutomaton();
            this.generations[0] = initialGen;
            this.scanForRow(this.generations[0], 0);
        }
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Calculate hovered cell
        this.hoveredCol = Math.floor(this.mouseX / this.cellSize);
        this.hoveredRow = Math.floor(this.mouseY / this.cellSize);
    }
    
    /**
     * Handle key down event
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowRight':
                // Next preset
                this.cyclePreset(1);
                break;
            case 'ArrowLeft':
                // Previous preset
                this.cyclePreset(-1);
                break;
            case 'c':
                // Cycle color modes
                this.cycleColorMode();
                break;
            case 'p':
                // Toggle pattern recognition
                this.showPatterns = !this.showPatterns;
                break;
            case 'r':
                // Reset with current rule
                this.resetAutomaton();
                break;
            case ' ':
                // Random initial state
                this.randomizeInitialState();
                break;
        }
    }
    
    /**
     * Cycle through the presets
     * @param {number} direction - Direction to cycle (1 for next, -1 for previous)
     */
    cyclePreset(direction = 1) {
        this.currentPreset = (this.currentPreset + direction + this.presets.length) % this.presets.length;
        this.rule = this.presets[this.currentPreset].rule;
        this.resetAutomaton();
    }
    
    /**
     * Cycle through color modes
     */
    cycleColorMode() {
        const modes = ['gradient', 'rule', 'single'];
        const currentIndex = modes.indexOf(this.colorMode);
        this.colorMode = modes[(currentIndex + 1) % modes.length];
    }
    
    /**
     * Randomize the initial state
     */
    randomizeInitialState() {
        const initialGen = Array(this.cols).fill(0).map(() => Math.random() > 0.7 ? 1 : 0);
        this.generations = [initialGen];
        this.currentRow = 0;
        this.recognized = [];
        this.scanForRow(initialGen, 0);
    }

    /**
     * Evolve the automaton by one generation
     */
    evolve() {
        if (this.currentRow >= this.rows - 1) {
            // Shift everything up when screen is full
            this.generations.shift();
            this.recognized = this.recognized.filter(r => {
                r.row--;
                return r.row >= 0;
            });
        } else {
            this.currentRow++;
        }

        // Get the last generation and create a new one
        const lastGen = this.generations[this.generations.length - 1];
        const newGen = Array(this.cols).fill(0);

        // Apply the rule to each cell
        for (let i = 0; i < this.cols; i++) {
            const left = lastGen[(i - 1 + this.cols) % this.cols];
            const middle = lastGen[i];
            const right = lastGen[(i + 1) % this.cols];
            newGen[i] = this.applyRule(left, middle, right);
        }

        // Add the new generation and scan for patterns
        this.generations.push(newGen);
        this.scanForRow(newGen, this.currentRow);
    }

    /**
     * Apply the cellular automaton rule to a neighborhood
     * @param {number} a - Left cell state (0 or 1)
     * @param {number} b - Center cell state (0 or 1)
     * @param {number} c - Right cell state (0 or 1)
     * @returns {number} New cell state (0 or 1)
     */
    applyRule(a, b, c) {
        const index = a * 4 + b * 2 + c * 1;
        return this.ruleset[index];
    }

    /**
     * Scan a row for known patterns
     * @param {Array} row - The row to scan
     * @param {number} rowIndex - The row index
     */
    scanForRow(row, rowIndex) {
        if (!this.showPatterns) return;
        
        const patternsToScan = this.patterns[this.rule] || [];
        if (patternsToScan.length === 0) return;

        const rowStr = row.join('');

        for (const pattern of patternsToScan) {
            const seqStr = pattern.sequence.join('');
            let index = rowStr.indexOf(seqStr);
            
            while (index !== -1) {
                this.recognized.push({
                    name: pattern.name,
                    row: rowIndex,
                    col: index,
                    length: pattern.sequence.length,
                    time: this.time
                });
                index = rowStr.indexOf(seqStr, index + 1);
            }
        }
    }

    /**
     * Main animation loop - called by the framework on each frame
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    animate(timestamp) {
        // Calculate delta time and update time
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;
        this.time = timestamp;
        
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
        // Evolve the automaton at intervals based on speed
        const evolutionInterval = 100 / (this.settings.speed || 1);
        if (this.time - this.lastEvolveTime > evolutionInterval) {
            this.evolve();
            this.lastEvolveTime = this.time;
        }
        
        // Clean up old recognized patterns
        this.recognized = this.recognized.filter(r => (this.time - r.time) < 3000);
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw generations
        this.drawGenerations();
        
        // Draw recognized patterns
        this.drawRecognizedPatterns();
        
        // Draw rule visualization
        if (this.showRuleViz) {
            this.drawRuleVisualization();
        }
        
        // Draw hover highlight
        this.drawHoverHighlight();
        
        // Draw info panel or video info
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw all generations of the cellular automaton
     */
    drawGenerations() {
        for (let r = 0; r < this.generations.length; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.generations[r][c] === 1) {
                    // Determine cell color based on color mode
                    let fillColor;
                    
                    switch (this.colorMode) {
                        case 'gradient':
                            // Gradient from cyan to green based on position
                            const hue = 180 + (c / this.cols) * 60;
                            fillColor = `hsl(${hue}, 70%, 50%)`;
                            break;
                        case 'rule':
                            // Color based on rule number
                            const ruleHue = (this.rule % 256) / 256 * 360;
                            fillColor = `hsl(${ruleHue}, 70%, 50%)`;
                            break;
                        case 'single':
                            // Single color
                            fillColor = '#00ff88';
                            break;
                        default:
                            fillColor = '#00ff88';
                    }
                    
                    this.ctx.fillStyle = fillColor;
                    this.ctx.fillRect(
                        c * this.cellSize,
                        r * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
    }
    
    /**
     * Draw recognized patterns with highlights
     */
    drawRecognizedPatterns() {
        if (!this.showPatterns) return;
        
        for (const rec of this.recognized) {
            const age = (this.time - rec.time) / 1000;
            const opacity = Math.max(0, 1 - age / 3);
            
            if (opacity > 0) {
                // Draw highlight background
                this.ctx.fillStyle = `rgba(255, 170, 0, ${opacity * 0.5})`;
                this.ctx.fillRect(
                    rec.col * this.cellSize,
                    rec.row * this.cellSize,
                    rec.length * this.cellSize,
                    this.cellSize
                );
                
                // Draw pattern name if opacity is high enough
                if (opacity > 0.5) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.font = '10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        rec.name,
                        (rec.col + rec.length / 2) * this.cellSize,
                        rec.row * this.cellSize - 5
                    );
                }
                
                // Draw border
                this.ctx.strokeStyle = `rgba(255, 170, 0, ${opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    rec.col * this.cellSize,
                    rec.row * this.cellSize,
                    rec.length * this.cellSize,
                    this.cellSize
                );
            }
        }
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Draw visualization of the current rule
     */
    drawRuleVisualization() {
        const { ctx, canvas } = this;
        const ruleVisHeight = 70;
        const y = canvas.height - ruleVisHeight;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, y, canvas.width, ruleVisHeight);
        
        // Rule number and binary representation
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        
        const ruleBinary = this.rule.toString(2).padStart(8, '0');
        ctx.fillText(`Rule ${this.rule} (${ruleBinary})`, 20, y + 20);
        
        // Draw rule patterns
        const cellSize = 15;
        const startX = 20;
        const startY = y + 30;
        
        for (let i = 7; i >= 0; i--) {
            const pattern = (i).toString(2).padStart(3, '0').split('').map(Number);
            const result = this.ruleset[i];
            
            // Draw the 3-cell pattern
            for (let j = 0; j < 3; j++) {
                ctx.fillStyle = pattern[j] === 1 ? '#00ff88' : '#333333';
                ctx.fillRect(
                    startX + (7-i) * 8 * cellSize + j * cellSize,
                    startY,
                    cellSize - 1,
                    cellSize - 1
                );
            }
            
            // Draw arrow
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText('→',
                startX + (7-i) * 8 * cellSize + 3 * cellSize + 5,
                startY + cellSize - 3
            );
            
            // Draw result
            ctx.fillStyle = result === 1 ? '#00ff88' : '#333333';
            ctx.fillRect(
                startX + (7-i) * 8 * cellSize + 4 * cellSize + 10,
                startY,
                cellSize - 1,
                cellSize - 1
            );
        }
        
        // Draw preset name
        const preset = this.presets[this.currentPreset];
        ctx.fillStyle = '#ffaa00';
        ctx.font = '14px Arial';
        ctx.fillText(preset.name, canvas.width - 200, y + 20);
    }
    
    /**
     * Draw highlight for hovered cell
     */
    drawHoverHighlight() {
        if (this.hoveredRow >= 0 && this.hoveredCol >= 0 &&
            this.hoveredRow < this.generations.length &&
            this.hoveredCol < this.cols) {
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                this.hoveredCol * this.cellSize,
                this.hoveredRow * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        }
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        const { ctx } = this;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 300, 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Emergent Patterns - Cellular Automaton', 30, 45);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaaaaa';
        
        const controlLines = [
            `Rule: ${this.rule} - ${this.presets[this.currentPreset].name}`,
            'Click first row to change initial state',
            'Arrow keys: Change rule preset',
            'C: Change color mode',
            'P: Toggle pattern recognition',
            'Space: Randomize initial state'
        ];
        
        controlLines.forEach((line, i) => {
            ctx.fillText(line, 30, 70 + i * 18);
        });
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        const patternsToScan = this.patterns[this.rule] || [];
        const patternNames = patternsToScan.map(p => p.name).join(', ') || 'None';
        
        ctx.fillText(`Rule ${this.rule} - ${this.presets[this.currentPreset].name}`, canvas.width - 20, 30);
        
        if (patternNames !== 'None') {
            ctx.fillStyle = '#ffaa00';
            ctx.fillText(`Patterns: ${patternNames}`, canvas.width - 20, 60);
        }
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        let needsReset = false;
        
        // Use intensity slider to select rule (0-100)
        if (newSettings.intensity !== undefined) {
            const newRule = Math.floor(newSettings.intensity * 2.55); // map 0-100 to 0-255
            if (this.rule !== newRule) {
                this.rule = newRule;
                
                // Find matching preset or use custom
                const matchingPreset = this.presets.findIndex(p => p.rule === newRule);
                this.currentPreset = matchingPreset >= 0 ? matchingPreset : this.presets.length - 1;
                
                needsReset = true;
            }
        }

        // Update settings
        Object.assign(this.settings, newSettings);

        // Reset if needed
        if (needsReset) {
            this.resetAutomaton();
        }
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        this.canvas.removeEventListener('click', this.handleMouseClick);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        this.generations = [];
        this.recognized = [];
    }
}