// Scene 8: Pattern Recognition - 1D Cellular Automaton
export default class Scene8 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.rule = 30; // A classic chaotic rule
        this.ruleset = [];

        this.cellSize = 8;
        this.cols = 0;
        this.rows = 0;
        this.generations = [];
        this.currentRow = 0;

        // Pattern recognition
        this.patterns = {
            // Pre-defined patterns for some interesting rules
            30: [{ name: 'Triangle', sequence: [1, 1, 0, 1, 1] }],
            90: [{ name: 'Sierpinski', sequence: [1, 0, 1] }],
            110: [
                { name: 'Glider', sequence: [0, 1, 1, 1, 0, 1, 1] },
                { name: 'Stable Block', sequence: [1, 1, 1] }
            ]
        };
        this.recognized = [];
        this.lastEvolveTime = 0;

        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    init() {
        this.canvas.addEventListener('click', this.handleMouseClick);
        this.resize();
        return Promise.resolve();
    }

    resize() {
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.resetAutomaton();
    }

    resetAutomaton() {
        // Set ruleset from rule number
        this.ruleset = this.rule.toString(2).padStart(8, '0').split('').map(Number).reverse();
        
        this.generations = [];
        this.recognized = [];
        this.currentRow = 0;

        // Create initial generation (a single '1' in the middle)
        let initialGen = Array(this.cols).fill(0);
        initialGen[Math.floor(this.cols / 2)] = 1;
        this.generations.push(initialGen);
        this.scanForRow(initialGen, 0);
    }

    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        const col = Math.floor(mouseX / this.cellSize);
        if (this.generations[0] && col >= 0 && col < this.cols) {
            // Flip the state of the clicked cell in the first row and restart
            this.generations[0][col] = 1 - this.generations[0][col];
            const initialGen = [...this.generations[0]];
            this.resetAutomaton();
            this.generations[0] = initialGen;
        }
    }

    evolve() {
        if (this.currentRow >= this.rows -1) {
            // Shift everything up when screen is full
            this.generations.shift();
            this.recognized = this.recognized.filter(r => {
                r.row--;
                return r.row >= 0;
            });
        } else {
            this.currentRow++;
        }

        const lastGen = this.generations[this.generations.length - 1];
        const newGen = Array(this.cols).fill(0);

        for (let i = 0; i < this.cols; i++) {
            const left = lastGen[(i - 1 + this.cols) % this.cols];
            const middle = lastGen[i];
            const right = lastGen[(i + 1) % this.cols];
            newGen[i] = this.applyRule(left, middle, right);
        }

        this.generations.push(newGen);
        this.scanForRow(newGen, this.currentRow);
    }

    applyRule(a, b, c) {
        const index = a * 4 + b * 2 + c * 1;
        return this.ruleset[index];
    }

    scanForRow(row, rowIndex) {
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
                    time: performance.now()
                });
                index = rowStr.indexOf(seqStr, index + 1);
            }
        }
    }

    animate(timestamp) {
        const evolutionInterval = 100 / this.settings.speed;
        if (timestamp - this.lastEvolveTime > evolutionInterval) {
            this.evolve();
            this.lastEvolveTime = timestamp;
        }
        
        this.draw();
    }

    draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw generations
        for (let r = 0; r < this.generations.length; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.generations[r][c] === 1) {
                    const hue = 180 + (c / this.cols) * 60; // Cyan to Green
                    this.ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
                    this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        // Draw recognized patterns
        const now = performance.now();
        this.recognized.forEach(rec => {
            const age = (now - rec.time) / 1000;
            const opacity = Math.max(0, 1 - age);
            if (opacity > 0) {
                this.ctx.fillStyle = `rgba(255, 170, 0, ${opacity * 0.7})`;
                this.ctx.fillRect(
                    rec.col * this.cellSize,
                    rec.row * this.cellSize,
                    rec.length * this.cellSize,
                    this.cellSize
                );

                if (opacity > 0.5) {
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.font = '10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(rec.name, (rec.col + rec.length / 2) * this.cellSize, rec.row * this.cellSize - 5);
                }
            }
        });
        
        this.recognized = this.recognized.filter(r => (now - r.time) < 1000);


        if (!this.settings.videoMode) {
            this.drawInfo();
        }
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Pattern Recognition', 30, 45);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText(`Rule: ${this.rule}`, 30, 70);
        this.ctx.fillText('Click first row to change seed.', 30, 90);
    }

    updateSettings(newSettings) {
        let needsReset = false;
        if (newSettings.intensity && this.rule !== newSettings.intensity) {
            // A bit of a hack: use intensity slider to select rule (0-100)
            const newRule = Math.floor(newSettings.intensity * 2.55); // map 0-100 to 0-255
            if (this.rule !== newRule) {
                this.rule = newRule;
                needsReset = true;
            }
        }

        Object.assign(this.settings, newSettings);

        if (needsReset) {
            this.resetAutomaton();
        }
    }

    cleanup() {
        this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}