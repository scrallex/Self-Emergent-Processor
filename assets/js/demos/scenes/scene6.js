// Scene 6: System Learning Evolution - Recursive Processing and Pattern Formation
export default class Scene6 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        this.gridSize = 20;
        this.cells = [];
        this.initializeCells();
        
        this.time = 0;
    }
    
    init() {
        return Promise.resolve();
    }
    
    initializeCells() {
        this.cells = [];
        for (let x = 0; x < this.canvas.width / this.gridSize; x++) {
            this.cells[x] = [];
            for (let y = 0; y < this.canvas.height / this.gridSize; y++) {
                this.cells[x][y] = {
                    value: Math.random() > 0.5 ? 1 : 0,
                    nextValue: 0
                };
            }
        }
    }
    
    update(deltaTime) {
        const speed = this.settings.speed;
        
        // Apply rules based on neighbors
        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells[x].length; y++) {
                let neighbors = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const nx = (x + i + this.cells.length) % this.cells.length;
                        const ny = (y + j + this.cells[x].length) % this.cells[x].length;
                        neighbors += this.cells[nx][ny].value;
                    }
                }
                
                // Simple rules:
              if (this.cells[x][y].value === 1) {
                    // Cell is alive
                    if (neighbors < 2 || neighbors > 3) {
                        this.cells[x][y].nextValue = 0; // Dies
                    } else {
                        this.cells[x][y].nextValue = 1; // Survives
                    }
                } else {
                    // Cell is dead
                    if (neighbors === 3) {
                        this.cells[x][y].nextValue = 1; // Becomes alive
                    } else {
                        this.cells[x][y].nextValue = 0; // Remains dead
                    }
                }
            }
        }
        
        // Apply the next values
        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells[x].length; y++) {
                this.cells[x][y].value = this.cells[x][y].nextValue;
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.9)'; // More opaque background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let x = 0; x < this.cells.length; x++) {
            for (let y = 0; y < this.cells[x].length; y++) {
                if (this.cells[x][y].value === 1) {
                    const hue = 200 + Math.floor(Math.sin(this.time + x + y) * 50);
                    this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                    this.ctx.fillRect(
                        x * this.gridSize,
                        y * this.gridSize,
                        this.gridSize,
                        this.gridSize
                    );
                }
            }
        }
    }
    
    animate(timestamp) {
        const deltaTime = (timestamp - (this.lastTime || timestamp)) / 1000;
        this.lastTime = timestamp;
        
        this.time += deltaTime * this.settings.speed;
        
        this.update(deltaTime);
        this.draw();
        
        // You might add some global effect based on this.time
        // For example, a subtle pulsing background
        // const bgIntensity = 0.1 + 0.05 * Math.sin(this.time * 0.5);
        // this.ctx.fillStyle = `rgba(10, 10, 10, ${bgIntensity})`;
        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        // Apply any setting changes that need to be propagated to the simulation
    }
    
    cleanup() {
        // Clean up resources if necessary
        this.cells = [];
    }
}