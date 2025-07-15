// Coherence Map Visualization
// Q-value phase alignment heatmap
// ================================

window.initCoherenceMap = function() {
    const canvas = document.getElementById('coherence-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const thresholdInput = document.getElementById('coherence-threshold');
    const speedInput = document.getElementById('coherence-speed');
    
    let threshold = parseInt(thresholdInput.value) / 100;
    let updateSpeed = parseInt(speedInput.value);
    let animationId = null;
    let frameCount = 0;
    
    // Grid parameters
    const gridSize = 50;
    let cellSize;
    let grid = [];
    let nextGrid = [];
    
    // Phase and coherence tracking
    class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.phase = Math.random() * Math.PI * 2;
            this.coherence = Math.random();
            this.prime = this.calculatePrime();
            this.neighbors = [];
        }
        
        calculatePrime() {
            // Associate each cell with a prime based on position
            const index = this.y * gridSize + this.x;
            return getNthPrime(index + 1);
        }
        
        updatePhase() {
            // Phase evolution based on prime-indexed time
            const primeStep = isPrime(frameCount) ? 1 : 0.1;
            
            // Calculate average neighbor phase
            let sumSin = 0;
            let sumCos = 0;
            let neighborCount = 0;
            
            this.neighbors.forEach(neighbor => {
                if (neighbor) {
                    sumSin += Math.sin(neighbor.phase);
                    sumCos += Math.cos(neighbor.phase);
                    neighborCount++;
                }
            });
            
            if (neighborCount > 0) {
                const avgPhase = Math.atan2(sumSin / neighborCount, sumCos / neighborCount);
                
                // Kuramoto model coupling
                const coupling = 0.1 * primeStep;
                this.phase += coupling * Math.sin(avgPhase - this.phase);
            }
            
            // Add intrinsic frequency based on prime
            this.phase += (Math.log(this.prime) / 100) * primeStep;
            
            // Keep phase in [0, 2π]
            this.phase = (this.phase + Math.PI * 2) % (Math.PI * 2);
        }
        
        updateCoherence() {
            // Calculate local coherence (order parameter)
            let sumSin = Math.sin(this.phase);
            let sumCos = Math.cos(this.phase);
            let count = 1;
            
            this.neighbors.forEach(neighbor => {
                if (neighbor) {
                    sumSin += Math.sin(neighbor.phase);
                    sumCos += Math.cos(neighbor.phase);
                    count++;
                }
            });
            
            // Kuramoto order parameter
            const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / count;
            
            // Smooth coherence update
            this.coherence = this.coherence * 0.9 + r * 0.1;
        }
        
        getColor() {
            // Color based on phase and coherence
            const hue = (this.phase / (Math.PI * 2)) * 360;
            const saturation = 70;
            const lightness = 20 + this.coherence * 60;
            const alpha = this.coherence > threshold ? 1 : 0.3;
            
            return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        }
    }
    
    // Prime number utilities
    const primeCache = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    
    function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        
        return true;
    }
    
    function getNthPrime(n) {
        while (primeCache.length < n) {
            let candidate = primeCache[primeCache.length - 1] + 2;
            while (!isPrime(candidate)) {
                candidate += 2;
            }
            primeCache.push(candidate);
        }
        return primeCache[n - 1];
    }
    
    // Initialize grid
    function initGrid() {
        grid = [];
        nextGrid = [];
        
        for (let y = 0; y < gridSize; y++) {
            grid[y] = [];
            nextGrid[y] = [];
            
            for (let x = 0; x < gridSize; x++) {
                grid[y][x] = new Cell(x, y);
                nextGrid[y][x] = new Cell(x, y);
            }
        }
        
        // Set up neighbor references
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = grid[y][x];
                
                // 8-connected neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                            cell.neighbors.push(grid[ny][nx]);
                        }
                    }
                }
            }
        }
    }
    
    // Update grid state
    function updateGrid() {
        // Update phases
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                grid[y][x].updatePhase();
            }
        }
        
        // Update coherence
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                grid[y][x].updateCoherence();
            }
        }
    }
    
    // Draw grid
    function drawGrid() {
        const width = canvas.width;
        const height = canvas.height;
        cellSize = Math.min(width, height) / gridSize;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw cells
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = grid[y][x];
                const pixelX = x * cellSize;
                const pixelY = y * cellSize;
                
                // Draw cell
                ctx.fillStyle = cell.getColor();
                ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                
                // Draw prime number for highly coherent cells
                if (cell.coherence > threshold && cellSize > 15) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = '8px JetBrains Mono';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        cell.prime, 
                        pixelX + cellSize / 2, 
                        pixelY + cellSize / 2
                    );
                }
            }
        }
        
        // Draw coherence waves
        drawCoherenceWaves();
        
        // Draw info
        drawInfo();
    }
    
    // Draw coherence wave patterns
    function drawCoherenceWaves() {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 2;
        
        // Find high coherence regions
        const highCoherenceRegions = [];
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (grid[y][x].coherence > threshold + 0.2) {
                    highCoherenceRegions.push({ x, y, coherence: grid[y][x].coherence });
                }
            }
        }
        
        // Draw connections between high coherence regions
        highCoherenceRegions.forEach((region1, i) => {
            highCoherenceRegions.slice(i + 1).forEach(region2 => {
                const dist = Math.sqrt(
                    Math.pow(region1.x - region2.x, 2) + 
                    Math.pow(region1.y - region2.y, 2)
                );
                
                if (dist < 10) {
                    ctx.beginPath();
                    ctx.moveTo(
                        region1.x * cellSize + cellSize / 2,
                        region1.y * cellSize + cellSize / 2
                    );
                    ctx.lineTo(
                        region2.x * cellSize + cellSize / 2,
                        region2.y * cellSize + cellSize / 2
                    );
                    ctx.globalAlpha = (region1.coherence + region2.coherence) / 2 - threshold;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });
        });
    }
    
    // Draw information overlay
    function drawInfo() {
        // Calculate global coherence
        let totalCoherence = 0;
        let primeStepCells = 0;
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                totalCoherence += grid[y][x].coherence;
                if (isPrime(frameCount) && grid[y][x].coherence > threshold) {
                    primeStepCells++;
                }
            }
        }
        
        const avgCoherence = totalCoherence / (gridSize * gridSize);
        
        // Draw info box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 250, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        ctx.fillText(`Frame: ${frameCount} ${isPrime(frameCount) ? '(Prime)' : ''}`, 20, 20);
        ctx.fillText(`Global Coherence: ${(avgCoherence * 100).toFixed(1)}%`, 20, 40);
        ctx.fillText(`Active Cells: ${primeStepCells}`, 20, 60);
    }
    
    // Animation loop
    function animate() {
        if (frameCount % (60 / updateSpeed) === 0) {
            updateGrid();
        }
        
        drawGrid();
        frameCount++;
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 400;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listeners
    thresholdInput.addEventListener('input', (e) => {
        threshold = parseInt(e.target.value) / 100;
    });
    
    speedInput.addEventListener('input', (e) => {
        updateSpeed = parseInt(e.target.value);
    });
    
    // Initialize and start
    initGrid();
    animate();
    
    // Cleanup on navigation away
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
};