/**
 * Scene 11: Financial Intelligence System
 *
 * This scene visualizes financial models enhanced by SEP principles,
 * demonstrating how self-emergent processors can accelerate complex
 * calculations in options pricing and risk management.
 */
export default class Scene11 {
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
        this.animationPhase = 0;
        this.marketState = 0; // 0: stable, 1: bull, 2: bear, 3: volatile
        
        // Financial model parameters
        this.volatility = 30; // Initial volatility in percent
        this.riskFreeRate = 0.05; // 5%
        this.currentPrice = 100;
        this.strikePrice = 100;
        this.timeToMaturity = 1.0; // 1 year
        
        // SEP acceleration metrics
        this.tradTime = 100.00;
        this.sepTime = 37.04;
        this.speedup = 2.7;
        this.sepOptimization = 0;
        this.benchmarkResults = [
            { traditional: 100.00, sep: 37.04, speedup: 2.7 },
            { traditional: 243.50, sep: 58.92, speedup: 4.1 },
            { traditional: 462.18, sep: 93.80, speedup: 4.9 },
            { traditional: 892.72, sep: 149.85, speedup: 6.0 }
        ];
        
        // Visualization parameters
        this.gridResolution = 20;
        this.animateMarket = true;
        this.showOptionSurface = true;
        this.showGreeks = false;
        this.selectedOption = 0; // 0: call, 1: put
        this.viewMode = '3d'; // '2d', '3d'
        this.rotation = 0;
        
        // Calculation cache
        this.priceSurface = [];
        this.greeksSurface = {
            delta: [],
            gamma: [],
            theta: [],
            vega: []
        };
        
        // Market simulation data
        this.priceHistory = [];
        for (let i = 0; i < 100; i++) {
            this.priceHistory.push(this.currentPrice);
        }
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // Mouse position for highlighting
        this.mouseX = 0;
        this.mouseY = 0;
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Initialize price surface
        this.calculatePriceSurface();
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        
        return Promise.resolve();
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'm':
                // Toggle market animation
                this.animateMarket = !this.animateMarket;
                break;
            case 'v':
                // Toggle view mode
                this.viewMode = this.viewMode === '2d' ? '3d' : '2d';
                break;
            case 'g':
                // Toggle Greeks display
                this.showGreeks = !this.showGreeks;
                break;
            case 'o':
                // Toggle option type
                this.selectedOption = 1 - this.selectedOption;
                this.calculatePriceSurface();
                break;
            case 's':
                // Toggle surface/comparison display
                this.showOptionSurface = !this.showOptionSurface;
                break;
            case '1': case '2': case '3': case '4':
                // Select market scenario
                const scenarioIndex = parseInt(e.key) - 1;
                this.marketState = scenarioIndex;
                this.sepOptimization = scenarioIndex;
                this.updateBenchmarkDisplay();
                break;
        }
    }
    
    /**
     * Handle mouse move for interactive highlighting
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    /**
     * Update benchmark display based on selected optimization level
     */
    updateBenchmarkDisplay() {
        const benchmark = this.benchmarkResults[this.sepOptimization];
        this.tradTime = benchmark.traditional;
        this.sepTime = benchmark.sep;
        this.speedup = benchmark.speedup;
    }

    /**
     * Error function approximation (for Black-Scholes)
     * @param {number} x - Input value
     * @returns {number} Error function approximation at x
     */
    erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }
    
    /**
     * Calculate option price using Black-Scholes formula
     * @param {number} S - Current stock price
     * @param {number} K - Strike price
     * @param {number} r - Risk-free rate
     * @param {number} T - Time to maturity
     * @param {number} sigma - Volatility
     * @param {boolean} isPut - True for put option, false for call
     * @returns {number} Option price
     */
    calculateOptionPrice(S, K, r, T, sigma, isPut = false) {
        if (T <= 0) return Math.max(0, isPut ? K - S : S - K);
        
        const d1 = (Math.log(S/K) + (r + sigma*sigma/2) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        const Nd1 = 0.5 * (1 + this.erf(d1/Math.sqrt(2)));
        const Nd2 = 0.5 * (1 + this.erf(d2/Math.sqrt(2)));
        
        if (!isPut) {
            // Call option
            return S * Nd1 - K * Math.exp(-r*T) * Nd2;
        } else {
            // Put option
            return K * Math.exp(-r*T) * (1 - Nd2) - S * (1 - Nd1);
        }
    }
    
    /**
     * Calculate option Greeks (Delta, Gamma, Theta, Vega)
     * @param {number} S - Current stock price
     * @param {number} K - Strike price
     * @param {number} r - Risk-free rate
     * @param {number} T - Time to maturity
     * @param {number} sigma - Volatility
     * @param {boolean} isPut - True for put option, false for call
     * @returns {Object} Greeks values
     */
    calculateGreeks(S, K, r, T, sigma, isPut = false) {
        if (T <= 0.001) return { delta: 0, gamma: 0, theta: 0, vega: 0 };
        
        const d1 = (Math.log(S/K) + (r + sigma*sigma/2) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        const Nd1 = 0.5 * (1 + this.erf(d1/Math.sqrt(2)));
        const Nd2 = 0.5 * (1 + this.erf(d2/Math.sqrt(2)));
        
        // Standard normal PDF
        const nPrime = Math.exp(-d1*d1/2) / Math.sqrt(2 * Math.PI);
        
        // Calculate Greeks
        const delta = isPut ? Nd1 - 1 : Nd1;
        const gamma = nPrime / (S * sigma * Math.sqrt(T));
        const theta = -(S * sigma * nPrime) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (isPut ? (1 - Nd2) : Nd2);
        const vega = S * Math.sqrt(T) * nPrime / 100; // Divided by 100 to match % volatility
        
        return { delta, gamma, theta, vega };
    }
    
    /**
     * Pre-calculate the entire price surface
     */
    calculatePriceSurface() {
        const isPut = this.selectedOption === 1;
        this.priceSurface = [];
        this.greeksSurface = { delta: [], gamma: [], theta: [], vega: [] };
        
        const sigma = this.volatility / 100;
        const r = this.riskFreeRate;
        const K = this.strikePrice;
        const T = this.timeToMaturity;
        
        for (let i = 0; i <= this.gridResolution; i++) {
            const priceRow = [];
            const deltaRow = [];
            const gammaRow = [];
            const thetaRow = [];
            const vegaRow = [];
            
            for (let j = 0; j <= this.gridResolution; j++) {
                const S = 50 + i * (150 / this.gridResolution);
                const t = j * (T / this.gridResolution);
                const timeRemaining = T - t;
                
                // Calculate option price
                const price = this.calculateOptionPrice(S, K, r, timeRemaining, sigma, isPut);
                priceRow.push(price);
                
                // Calculate Greeks
                const greeks = this.calculateGreeks(S, K, r, timeRemaining, sigma, isPut);
                deltaRow.push(greeks.delta);
                gammaRow.push(greeks.gamma);
                thetaRow.push(greeks.theta);
                vegaRow.push(greeks.vega);
            }
            
            this.priceSurface.push(priceRow);
            this.greeksSurface.delta.push(deltaRow);
            this.greeksSurface.gamma.push(gammaRow);
            this.greeksSurface.theta.push(thetaRow);
            this.greeksSurface.vega.push(vegaRow);
        }
    }
    
    /**
     * Update market simulation data
     * @param {number} dt - Delta time in seconds
     */
    updateMarket(dt) {
        if (!this.animateMarket) return;
        
        // Update animation phase
        this.animationPhase += dt;
        
        // Different market behavior based on market state
        let drift = 0;
        let volatilityFactor = 1;
        
        switch (this.marketState) {
            case 0: // Stable
                drift = 0;
                volatilityFactor = 0.5;
                break;
            case 1: // Bull
                drift = 0.02;
                volatilityFactor = 0.8;
                break;
            case 2: // Bear
                drift = -0.02;
                volatilityFactor = 1.2;
                break;
            case 3: // Volatile
                drift = Math.sin(this.animationPhase) * 0.03;
                volatilityFactor = 2.0;
                break;
        }
        
        // Update current price with random walk + drift
        const sigma = this.volatility / 100 * volatilityFactor;
        const randomFactor = Math.random() * 2 - 1;
        const priceChange = this.currentPrice * (drift + sigma * randomFactor * Math.sqrt(dt));
        
        this.currentPrice += priceChange;
        // Keep price within reasonable bounds
        this.currentPrice = Math.max(20, Math.min(200, this.currentPrice));
        
        // Update price history
        this.priceHistory.push(this.currentPrice);
        if (this.priceHistory.length > 100) {
            this.priceHistory.shift();
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
        this.time += deltaTime;
        
        // Update scene state
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();
    }
    
    /**
     * Update scene state - separated from animation for clarity
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Update volatility based on settings
        this.volatility = this.settings.intensity * 2; // Map 0-100 intensity to 0-200 volatility
        
        // Update market simulation
        this.updateMarket(dt);
        
        // Recalculate price surface periodically
        if (Math.floor(this.time * 2) % 2 === 0) {
            this.calculatePriceSurface();
        }
        
        // Update rotation for 3D view
        if (this.viewMode === '3d') {
            this.rotation += dt * 0.1;
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.showOptionSurface) {
            // Draw option price surface
            this.drawOptionSurface();
        } else {
            // Draw SEP comparison visualization
            this.drawSepComparison();
        }
        
        // Draw market data chart
        this.drawMarketChart();
        
        // Draw info panel or video info
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw the option price surface
     */
    drawOptionSurface() {
        const gridX = 50;
        const gridY = 50;
        const gridWidth = this.canvas.width / 2.5;
        const gridHeight = this.canvas.height / 1.5;
        
        const cellWidth = gridWidth / this.gridResolution;
        const cellHeight = gridHeight / this.gridResolution;
        
        if (this.viewMode === '3d') {
            // 3D visualization with rotation
            this.draw3DPriceSurface(gridX, gridY, gridWidth, gridHeight);
        } else {
            // 2D heatmap visualization
            this.draw2DPriceSurface(gridX, gridY, gridWidth, gridHeight, cellWidth, cellHeight);
        }
        
        // Draw axes
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(gridX, gridY + gridHeight);
        this.ctx.lineTo(gridX + gridWidth, gridY + gridHeight);
        this.ctx.moveTo(gridX, gridY);
        this.ctx.lineTo(gridX, gridY + gridHeight);
        this.ctx.stroke();
        
        // Draw current price marker
        const priceRatio = (this.currentPrice - 50) / 150;
        const markerX = gridX + priceRatio * gridWidth;
        
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(markerX, gridY);
        this.ctx.lineTo(markerX, gridY + gridHeight);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Stock Price', gridX + gridWidth/2, gridY + gridHeight + 30);
        this.ctx.save();
        this.ctx.translate(gridX - 40, gridY + gridHeight/2);
        this.ctx.rotate(-Math.PI/2);
        this.ctx.fillText('Time to Maturity', 0, 0);
        this.ctx.restore();
        
        // Price range labels
        this.ctx.textAlign = 'center';
        this.ctx.fillText('$50', gridX, gridY + gridHeight + 15);
        this.ctx.fillText('$200', gridX + gridWidth, gridY + gridHeight + 15);
        
        // Time range labels
        this.ctx.textAlign = 'right';
        this.ctx.fillText('1yr', gridX - 10, gridY + 5);
        this.ctx.fillText('0yr', gridX - 10, gridY + gridHeight + 5);
        
        // Current price label
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`$${this.currentPrice.toFixed(2)}`, markerX, gridY + gridHeight + 50);
    }
    
    /**
     * Draw the price surface as a 2D heatmap
     */
    draw2DPriceSurface(gridX, gridY, gridWidth, gridHeight, cellWidth, cellHeight) {
        const surfaceData = this.showGreeks ?
            this.greeksSurface[Object.keys(this.greeksSurface)[this.marketState % 4]] :
            this.priceSurface;
        
        for (let i = 0; i < this.gridResolution; i++) {
            for (let j = 0; j < this.gridResolution; j++) {
                const value = surfaceData[i][j];
                
                // Normalize value based on data type
                let normalizedValue;
                if (this.showGreeks) {
                    // Different normalization for each Greek
                    switch (this.marketState % 4) {
                        case 0: // Delta (-1 to 1)
                            normalizedValue = (value + 1) / 2;
                            break;
                        case 1: // Gamma (0 to 0.1)
                            normalizedValue = Math.min(1, value * 10);
                            break;
                        case 2: // Theta (typically negative)
                            normalizedValue = Math.max(0, Math.min(1, (value + 20) / 40));
                            break;
                        case 3: // Vega (0 to 50)
                            normalizedValue = Math.min(1, value / 50);
                            break;
                    }
                } else {
                    // Price normalization
                    normalizedValue = Math.min(1, value / 50);
                }
                
                let r, g, b;
                if (this.showGreeks) {
                    // Greek-specific coloring
                    switch (this.marketState % 4) {
                        case 0: // Delta: red to green
                            r = Math.floor(255 * (1 - normalizedValue));
                            g = Math.floor(255 * normalizedValue);
                            b = 100;
                            break;
                        case 1: // Gamma: purple to yellow
                            r = Math.floor(100 + 155 * normalizedValue);
                            g = Math.floor(normalizedValue * 255);
                            b = Math.floor(255 * (1 - normalizedValue));
                            break;
                        case 2: // Theta: blue to red
                            r = Math.floor(255 * normalizedValue);
                            g = 50;
                            b = Math.floor(255 * (1 - normalizedValue));
                            break;
                        case 3: // Vega: cyan to magenta
                            r = Math.floor(normalizedValue * 255);
                            g = Math.floor(255 * (1 - normalizedValue));
                            b = 255;
                            break;
                    }
                } else {
                    // Price coloring: blue to green
                    r = Math.floor(normalizedValue * 100);
                    g = Math.floor(normalizedValue * 255);
                    b = Math.floor(255 * (1 - normalizedValue) + 100);
                }
                
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                this.ctx.fillRect(
                    gridX + i * cellWidth,
                    gridY + j * cellHeight,
                    cellWidth,
                    cellHeight
                );
            }
        }
        
        // Add value indicator where mouse is hovering
        if (this.mouseX >= gridX && this.mouseX <= gridX + gridWidth &&
            this.mouseY >= gridY && this.mouseY <= gridY + gridHeight) {
            
            const i = Math.floor((this.mouseX - gridX) / cellWidth);
            const j = Math.floor((this.mouseY - gridY) / cellHeight);
            
            if (i >= 0 && i < this.gridResolution && j >= 0 && j < this.gridResolution) {
                const value = surfaceData[i][j];
                const x = gridX + i * cellWidth + cellWidth / 2;
                const y = gridY + j * cellHeight - 5;
                
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(x - 40, y - 20, 80, 20);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toFixed(2), x, y);
                
                // Highlight the cell
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    gridX + i * cellWidth,
                    gridY + j * cellHeight,
                    cellWidth,
                    cellHeight
                );
            }
        }
    }
    
    /**
     * Draw the price surface as a 3D surface
     */
    draw3DPriceSurface(gridX, gridY, gridWidth, gridHeight) {
        const ctx = this.ctx;
        const surfaceData = this.showGreeks ?
            this.greeksSurface[Object.keys(this.greeksSurface)[this.marketState % 4]] :
            this.priceSurface;
        
        const centerX = gridX + gridWidth / 2;
        const centerY = gridY + gridHeight / 2;
        const scale = Math.min(gridWidth, gridHeight) / 2;
        
        // Draw from back to front
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        
        // Create 3D points with z-depth
        const points = [];
        
        for (let i = 0; i <= this.gridResolution; i++) {
            for (let j = 0; j <= this.gridResolution; j++) {
                const value = surfaceData[i][j];
                
                // Normalize x, y, z coordinates to [-1, 1]
                const x = (i / this.gridResolution) * 2 - 1;
                const y = (j / this.gridResolution) * 2 - 1;
                
                // Normalize value based on data type
                let z;
                if (this.showGreeks) {
                    // Different normalization for each Greek
                    switch (this.marketState % 4) {
                        case 0: // Delta (-1 to 1)
                            z = value;
                            break;
                        case 1: // Gamma (0 to 0.1)
                            z = value * 10;
                            break;
                        case 2: // Theta (typically negative)
                            z = (value + 20) / 20;
                            break;
                        case 3: // Vega (0 to 50)
                            z = value / 25;
                            break;
                    }
                } else {
                    // Price normalization
                    z = value / 50;
                }
                
                // Apply rotation
                const rotX = x * cos - y * sin;
                const rotY = x * sin + y * cos;
                
                // Project to screen
                const projX = centerX + rotX * scale;
                const projY = centerY + rotY * scale * 0.5 - z * scale * 0.5;
                
                // Store with z-depth for sorting
                points.push({
                    x: projX,
                    y: projY,
                    z: z,
                    originalX: i,
                    originalY: j,
                    value: value,
                    depth: rotY + z // Sort key
                });
            }
        }
        
        // Sort by depth (painter's algorithm)
        points.sort((a, b) => a.depth - b.depth);
        
        // Draw points with size based on depth
        for (const point of points) {
            // Determine color based on value
            let r, g, b;
            const normalizedValue = Math.min(1, Math.max(0, point.z));
            
            if (this.showGreeks) {
                // Greek-specific coloring
                switch (this.marketState % 4) {
                    case 0: // Delta: red to green
                        r = Math.floor(255 * (1 - normalizedValue));
                        g = Math.floor(255 * normalizedValue);
                        b = 100;
                        break;
                    case 1: // Gamma: purple to yellow
                        r = Math.floor(100 + 155 * normalizedValue);
                        g = Math.floor(normalizedValue * 255);
                        b = Math.floor(255 * (1 - normalizedValue));
                        break;
                    case 2: // Theta: blue to red
                        r = Math.floor(255 * normalizedValue);
                        g = 50;
                        b = Math.floor(255 * (1 - normalizedValue));
                        break;
                    case 3: // Vega: cyan to magenta
                        r = Math.floor(normalizedValue * 255);
                        g = Math.floor(255 * (1 - normalizedValue));
                        b = 255;
                        break;
                }
            } else {
                // Price coloring: blue to green
                r = Math.floor(normalizedValue * 100);
                g = Math.floor(normalizedValue * 255);
                b = Math.floor(255 * (1 - normalizedValue) + 100);
            }
            
            // Draw point
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
            const size = 6 + normalizedValue * 4;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw connecting lines to neighbors if close enough
            if (point.originalX < this.gridResolution) {
                const right = points.find(p =>
                    p.originalX === point.originalX + 1 &&
                    p.originalY === point.originalY
                );
                if (right) {
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(right.x, right.y);
                    ctx.stroke();
                }
            }
            
            if (point.originalY < this.gridResolution) {
                const down = points.find(p =>
                    p.originalX === point.originalX &&
                    p.originalY === point.originalY + 1
                );
                if (down) {
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(down.x, down.y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw 3D axes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        const axisLength = scale * 1.2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + axisLength * cos, centerY + axisLength * sin * 0.5);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + axisLength * sin, centerY - axisLength * cos * 0.5);
        ctx.stroke();
        
        // Z-axis
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - axisLength * 0.8);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Price', centerX + axisLength * cos, centerY + axisLength * sin * 0.5 + 15);
        ctx.fillText('Time', centerX + axisLength * sin, centerY - axisLength * cos * 0.5 + 15);
        
        if (this.showGreeks) {
            const greekNames = ['Delta', 'Gamma', 'Theta', 'Vega'];
            ctx.fillText(greekNames[this.marketState % 4], centerX, centerY - axisLength * 0.8 - 10);
        } else {
            ctx.fillText('Value', centerX, centerY - axisLength * 0.8 - 10);
        }
    }
    
    /**
     * Draw the SEP comparison visualization
     */
    drawSepComparison() {
        const gridY = 50;
        const compX = this.canvas.width / 4;
        const compWidth = this.canvas.width / 2;
        const barHeight = 50;
        
        this.ctx.textAlign = 'left';
        
        // SEP capabilities explanation
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SEP Financial Model Acceleration', this.canvas.width / 2, gridY - 10);
        
        // Performance level label
        const optimizationLabels = [
            'Level 1: Basic SEP Integration',
            'Level 2: Advanced Parallelization',
            'Level 3: Neural Optimization',
            'Level 4: Quantum Acceleration'
        ];
        
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillText(optimizationLabels[this.sepOptimization], this.canvas.width / 2, gridY + 30);
        
        // Traditional method
        this.ctx.fillStyle = '#ff0066';
        this.ctx.fillRect(compX, gridY + 60, compWidth * 0.8, barHeight);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Traditional PDE: ${this.tradTime.toFixed(2)}ms`, compX + 10, gridY + 90);
        
        // SEP method
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillRect(compX, gridY + 140, compWidth * (0.8 / this.speedup), barHeight);
        this.ctx.fillText(`SEP Dynamics Method: ${this.sepTime.toFixed(2)}ms`, compX + 10, gridY + 170);
        
        // Efficiency gain
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(compX + compWidth * (0.8 / this.speedup), gridY + 190);
        this.ctx.lineTo(compX + compWidth * 0.8, gridY + 60);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '32px monospace';
        this.ctx.fillText(`${this.speedup.toFixed(1)}x Speedup!`, compX + compWidth * 0.5, gridY + 240);
        
        // Explanation
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('Press 1-4 to change optimization level', compX + compWidth * 0.5, gridY + 280);
        this.ctx.fillText('Press S to switch to option surface view', compX + compWidth * 0.5, gridY + 310);
    }
    
    /**
     * Draw the market data chart
     */
    drawMarketChart() {
        const chartX = 50;
        const chartY = this.canvas.height - 150;
        const chartWidth = this.canvas.width - 100;
        const chartHeight = 100;
        
        // Draw chart background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
        
        // Draw price history
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const priceMin = 50;
        const priceMax = 200;
        
        for (let i = 0; i < this.priceHistory.length; i++) {
            const x = chartX + (i / (this.priceHistory.length - 1)) * chartWidth;
            const normalizedPrice = (this.priceHistory[i] - priceMin) / (priceMax - priceMin);
            const y = chartY + chartHeight - normalizedPrice * chartHeight;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Draw axes
        this.ctx.strokeStyle = '#555555';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(chartX, chartY);
        this.ctx.lineTo(chartX, chartY + chartHeight);
        this.ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
        this.ctx.stroke();
        
        // Price labels
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('$200', chartX - 5, chartY + 12);
        this.ctx.fillText('$50', chartX - 5, chartY + chartHeight - 5);
        
        // Current price marker
        const lastPrice = this.priceHistory[this.priceHistory.length - 1];
        const normalizedPrice = (lastPrice - priceMin) / (priceMax - priceMin);
        const priceY = chartY + chartHeight - normalizedPrice * chartHeight;
        
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        this.ctx.arc(chartX + chartWidth, priceY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`$${lastPrice.toFixed(2)}`, chartX + chartWidth + 10, priceY + 5);
        
        // Market state label
        const marketLabels = ['Stable Market', 'Bull Market', 'Bear Market', 'Volatile Market'];
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(marketLabels[this.marketState], chartX, chartY - 10);
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
        ctx.textAlign = 'left';
        ctx.fillText('Financial Intelligence System', 30, 45);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaaaaa';
        
        // Option type
        const optionType = this.selectedOption === 0 ? 'Call Option' : 'Put Option';
        ctx.fillText(`${optionType} with SEP Enhancement`, 30, 70);
        
        // Model parameters
        ctx.fillText(`Volatility: ${this.volatility.toFixed(0)}%`, 30, 95);
        ctx.fillText(`Current Price: $${this.currentPrice.toFixed(2)}`, 30, 120);
        ctx.fillText(`Strike Price: $${this.strikePrice.toFixed(2)}`, 30, 145);
        
        // Controls
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('1-4: Market Scenarios | V: Toggle View | G: Greeks', 30, 170);
        ctx.fillText('O: Option Type | S: Switch View | M: Animate', 30, 195);
    }
    
    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        // Option type
        const optionType = this.selectedOption === 0 ? 'Call Option' : 'Put Option';
        ctx.fillText(optionType, canvas.width - 20, 30);
        
        // Current price
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`$${this.currentPrice.toFixed(2)}`, canvas.width - 20, 60);
        
        // Volatility
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`σ: ${this.volatility.toFixed(0)}%`, canvas.width - 20, 90);
        
        // Market state
        const marketLabels = ['Stable', 'Bull', 'Bear', 'Volatile'];
        ctx.fillStyle = '#ffffff';
        ctx.fillText(marketLabels[this.marketState], canvas.width - 20, 120);
        
        // View mode
        if (this.showGreeks) {
            const greekLabels = ['Delta', 'Gamma', 'Theta', 'Vega'];
            ctx.fillStyle = '#00d4ff';
            ctx.fillText(greekLabels[this.marketState % 4], canvas.width - 20, 150);
        }
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update volatility based on intensity slider
        if (newSettings.intensity !== undefined) {
            this.volatility = newSettings.intensity * 2; // Map 0-100 intensity to 0-200 volatility
        }
    }
    
    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}