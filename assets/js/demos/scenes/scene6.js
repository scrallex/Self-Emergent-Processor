/**
 * Scene 6: Market Signal Coherence
 *
 * Demonstrates SEP Engine's quantum-inspired signal extraction from noisy market data.
 * Shows how coherence patterns emerge from chaotic price movements, enabling
 * superior predictive analytics for options pricing and risk management.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene6 {
    /**
     * Constructor for the scene
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} settings - Settings object from the framework
     */
    constructor(canvas, ctx, settings, eventManager, stateManager, renderPipeline) {
        // Core properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;

        // Interactive controller (initialized in init)
        this.controller = null;

        // Event unsubscribe functions
        this.eventUnsubs = [];
        
        // Scene-specific state
        this.time = 0;
        this.lastTime = 0;
        
        // Market data simulation
        this.marketData = [];
        this.coherentSignal = [];
        this.noise = [];
        this.dataPoints = 200;
        this.priceBase = 100;
        this.volatility = 0.02;
        
        // SEP Engine state
        this.coherenceThreshold = 0.7;
        this.patternBuffer = [];
        this.patternBufferSize = 50;
        this.detectedPatterns = [];
        this.coherenceMap = new Map();
        
        // Visualization modes
        this.viewMode = 'combined'; // 'raw', 'noise', 'signal', 'combined', 'coherence'
        this.showCoherenceOverlay = true;
        this.showPatternHighlights = true;
        this.animateExtraction = false;
        
        // Performance metrics
        this.signalToNoiseRatio = 0;
        this.coherenceScore = 0;
        this.patternCount = 0;
        this.extractionLatency = 0;

        // QBSA/QFH simulation parameters
        this.qbsaStates = Array(64).fill(0); // 64-bit quantum state
        this.qfhFrequencies = Array(32).fill(0); // Frequency harmonics
        this.quantumPhase = 0;

        // Visual elements
        this.particles = [];
        this.coherenceWaves = [];
        this.gridSize = 20;

        // Controls
        this.controls = {
            noiseLevel: {
                value: 30,
                min: 0,
                max: 100,
                step: 5,
                label: 'Market Noise Level'
            },
            coherenceThreshold: {
                value: 70,
                min: 50,
                max: 95,
                step: 5,
                label: 'Coherence Threshold'
            },
            timeWindow: {
                value: 50,
                min: 20,
                max: 100,
                step: 10,
                label: 'Analysis Window'
            }
        };

        // Initialize event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initialize the scene
     */
    init() {
        // Initialize the interactive controller
        this.controller = new InteractiveController(
            this,
            this.canvas,
            this.ctx,
            this.eventManager,
            this.stateManager,
            this.renderPipeline
        ).init();

        // Register input handlers via EventManager
        if (this.eventManager) {
            this.eventUnsubs.push(
                this.eventManager.on('mouse', 'move', (e) => this.handleMouseMove(e)),
                this.eventManager.on('mouse', 'down', (e) => this.handleMouseClick(e)),
                this.eventManager.on('keyboard', 'down', (e) => this.handleKeyDown(e))
            );
        }

        // Initialize market data
        this.generateMarketData();
        
        // Initialize quantum states
        this.initializeQuantumStates();

        // Create initial particles for visualization
        this.createParticles();

        // Start with animation
        this.animateExtraction = true;

        return Promise.resolve();
    }

    /**
     * Generate simulated market data with signal and noise
     */
    generateMarketData() {
        this.marketData = [];
        this.coherentSignal = [];
        this.noise = [];

        const trend = 0.0002; // Slight upward trend
        const signalFreq1 = 0.05; // Primary signal frequency
        const signalFreq2 = 0.12; // Secondary signal frequency
        const noiseLevel = this.controls.noiseLevel.value / 100;
        
        for (let i = 0; i < this.dataPoints; i++) {
            // Coherent signal components
            const signal =
                Math.sin(i * signalFreq1) * 5 +
                Math.sin(i * signalFreq2) * 3 +
                Math.cos(i * signalFreq1 * 2) * 2 +
                i * trend * 10;

            // Market noise
            const noise = (Math.random() - 0.5) * 20 * noiseLevel;

            // Combined price
            const price = this.priceBase + signal + noise;

            this.coherentSignal.push(this.priceBase + signal);
            this.noise.push(noise);
            this.marketData.push({
                price: price,
                volume: Math.random() * 1000000,
                timestamp: i,
                coherence: 0,
                isPattern: false
            });
        }

        // Run initial coherence analysis
        this.analyzeCoherence();
    }

    /**
     * Initialize quantum-inspired states
     */
    initializeQuantumStates() {
        // Initialize QBSA states with random quantum phases
        for (let i = 0; i < 64; i++) {
            this.qbsaStates[i] = Math.random() * Math.PI * 2;
        }

        // Initialize QFH frequencies
        for (let i = 0; i < 32; i++) {
            this.qfhFrequencies[i] = Math.random() * 0.1;
        }
    }

    /**
     * Analyze market data for coherence patterns using SEP algorithms
     */
    analyzeCoherence() {
        const startTime = performance.now();

        // Clear previous patterns
        this.detectedPatterns = [];
        this.coherenceMap.clear();

        const window = this.controls.timeWindow.value;
        const threshold = this.controls.coherenceThreshold.value / 100;

        // Sliding window analysis
        for (let i = window; i < this.marketData.length; i++) {
            const windowData = this.marketData.slice(i - window, i);

            // Calculate coherence using quantum-inspired algorithm
            const coherence = this.calculateQuantumCoherence(windowData);

            this.marketData[i].coherence = coherence;

            // Pattern detection
            if (coherence > threshold) {
                this.marketData[i].isPattern = true;
                this.detectedPatterns.push({
                    index: i,
                    coherence: coherence,
                    type: this.classifyPattern(windowData)
                });
            }
        }

        // Update performance metrics
        this.extractionLatency = performance.now() - startTime;
        this.calculateMetrics();
    }

    /**
     * Calculate quantum coherence for a data window
     */
    calculateQuantumCoherence(windowData) {
        let coherenceSum = 0;

        // Update quantum states based on price movements
        for (let i = 1; i < windowData.length; i++) {
            const priceChange = (windowData[i].price - windowData[i - 1].price) / windowData[i - 1].price;
            const volumeWeight = Math.log(windowData[i].volume + 1) / 20;

            // QBSA state evolution
            const stateIndex = i % 64;
            this.qbsaStates[stateIndex] += priceChange * volumeWeight;

            // QFH frequency analysis
            const freqIndex = Math.floor(i / 2) % 32;
            this.qfhFrequencies[freqIndex] =
                0.9 * this.qfhFrequencies[freqIndex] +
                0.1 * Math.abs(priceChange);
        }

        // Calculate coherence from quantum states
        for (let i = 0; i < 64; i++) {
            for (let j = i + 1; j < 64; j++) {
                const phaseDiff = Math.abs(this.qbsaStates[i] - this.qbsaStates[j]);
                const alignment = Math.cos(phaseDiff);
                coherenceSum += Math.max(0, alignment);
            }
        }

        // Normalize coherence score
        const maxPossible = (64 * 63) / 2;
        return coherenceSum / maxPossible;
    }

    /**
     * Classify detected pattern type
     */
    classifyPattern(windowData) {
        const prices = windowData.map(d => d.price);
        const avg = prices.reduce((a, b) => a + b) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
        
        // Simple pattern classification
        const trend = (prices[prices.length - 1] - prices[0]) / prices[0];
        
        if (Math.abs(trend) > 0.02) {
            return trend > 0 ? 'bullish' : 'bearish';
        } else if (variance < 0.5) {
            return 'consolidation';
        } else {
            return 'volatile';
        }
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics() {
        // Signal-to-noise ratio
        let signalPower = 0;
        let noisePower = 0;

        for (let i = 0; i < this.marketData.length; i++) {
            const signal = this.coherentSignal[i] - this.priceBase;
            const noise = this.noise[i];

            signalPower += signal * signal;
            noisePower += noise * noise;
        }

        this.signalToNoiseRatio = noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;

        // Average coherence score
        const coherenceSum = this.marketData.reduce((sum, d) => sum + (d.coherence || 0), 0);
        this.coherenceScore = coherenceSum / this.marketData.length;

        // Pattern count
        this.patternCount = this.detectedPatterns.length;
    }

    /**
     * Create particles for visualization
     */
    createParticles() {
        this.particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                coherence: 0,
                radius: 2 + Math.random() * 3,
                color: 'rgba(0, 212, 255, 0.5)'
            });
        }
    }

    /**
     * Provide custom controls for the interactive controller
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'noise_level',
                type: 'slider',
                label: 'Noise Level',
                min: 0,
                max: 100,
                step: 5,
                value: this.controls.noiseLevel.value,
                onChange: (val) => {
                    this.controls.noiseLevel.value = val;
                    this.generateMarketData();
                }
            },
            {
                id: 'coherence_threshold',
                type: 'slider',
                label: 'Coherence Threshold',
                min: 50,
                max: 95,
                step: 5,
                value: this.controls.coherenceThreshold.value,
                onChange: (val) => {
                    this.controls.coherenceThreshold.value = val;
                    this.analyzeCoherence();
                }
            },
            {
                id: 'view_mode_cycle',
                type: 'button',
                label: `View: ${this.viewMode}`,
                onClick: () => {
                    this.cycleViewMode();
                    const btn = this.controller?.interactiveUtils.components.get('custom_view_mode_cycle');
                    if (btn) btn.text = `View: ${this.viewMode}`;
                }
            }
        ];
    }

    /**
     * Update particles based on coherence field
     */
    updateParticles(dt) {
        for (let particle of this.particles) {
            // Move particles
            particle.x += particle.vx * dt * 60;
            particle.y += particle.vy * dt * 60;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Update coherence based on nearby market data
            const dataIndex = Math.floor((particle.x / this.canvas.width) * this.marketData.length);
            if (dataIndex >= 0 && dataIndex < this.marketData.length) {
                particle.coherence = this.marketData[dataIndex].coherence || 0;

                // Attract to high coherence areas
                if (particle.coherence > 0.5) {
                    particle.vx *= 0.95;
                    particle.vy *= 0.95;
                }
            }

            // Update color based on coherence
            const alpha = 0.2 + particle.coherence * 0.8;
            const green = Math.floor(255 * particle.coherence);
            const blue = Math.floor(255 * (1 - particle.coherence));
            particle.color = `rgba(0, ${green}, ${blue}, ${alpha})`;
        }
    }

    /**
     * Main animation loop
     */
    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;
        this.time += dt;
        
        // Update simulation
        this.update(dt * this.settings.speed);

        // Render
        this.draw();
    }

    /**
     * Update scene state
     */
    update(dt) {
        // Update quantum phase
        this.quantumPhase += dt * 2;
        
        // Update particles
        this.updateParticles(dt);
        
        // Animate market data if enabled
        if (this.animateExtraction) {
            // Shift data and generate new point
            if (this.time % 0.1 < dt) {
                this.marketData.shift();

                const i = this.marketData.length;
                const signal =
                    Math.sin(i * 0.05) * 5 +
                    Math.sin(i * 0.12) * 3 +
                    Math.cos(i * 0.1) * 2 +
                    i * 0.002;
                
                const noise = (Math.random() - 0.5) * 20 * (this.controls.noiseLevel.value / 100);
                const price = this.priceBase + signal + noise;

                this.marketData.push({
                    price: price,
                    volume: Math.random() * 1000000,
                    timestamp: i,
                    coherence: 0,
                    isPattern: false
                });

                // Re-analyze coherence
                this.analyzeCoherence();
            }
        }

        // Update coherence waves
        this.coherenceWaves = this.coherenceWaves.filter(wave => {
            wave.radius += dt * 100;
            wave.opacity -= dt * 0.5;
            return wave.opacity > 0;
        });

        // Create new coherence waves at pattern points
        for (let pattern of this.detectedPatterns) {
            if (Math.random() < 0.01) {
                const x = (pattern.index / this.marketData.length) * this.canvas.width;
                const y = this.canvas.height / 2;

                this.coherenceWaves.push({
                    x: x,
                    y: y,
                    radius: 0,
                    opacity: 0.5,
                    color: pattern.type === 'bullish' ? '#00ff88' :
                        pattern.type === 'bearish' ? '#ff0066' : '#ffaa00'
                });
            }
        }
    }

    /**
     * Render the scene
     */
    draw() {
        const { ctx, canvas } = this;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw market data visualization
        this.drawMarketData();

        // Draw coherence overlay
        if (this.showCoherenceOverlay) {
            this.drawCoherenceOverlay();
        }
        
        // Draw quantum state visualization
        this.drawQuantumStates();
        
        // Draw particles
        this.drawParticles();

        // Draw coherence waves
        this.drawCoherenceWaves();
        
        // Draw info panel
        this.drawInfoPanel();
        
        // Draw controls hint
        this.drawControlsHint();
    }

    /**
     * Draw background grid
     */
    drawGrid() {
        const { ctx, canvas } = this;
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < canvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw market data visualization
     */
    drawMarketData() {
        const { ctx, canvas } = this;
        const chartHeight = canvas.height * 0.4;
        const chartY = canvas.height * 0.3;
        const dataWidth = canvas.width / this.marketData.length;

        // Find price range
        const prices = this.marketData.map(d => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        // Draw based on view mode
        switch (this.viewMode) {
            case 'raw':
                this.drawPriceLine(prices, minPrice, priceRange, chartY, chartHeight, '#ffffff', 2);
                break;

            case 'noise':
                const noisePrices = this.marketData.map((d, i) =>
                    this.priceBase + this.noise[i % this.noise.length]);
                this.drawPriceLine(noisePrices, minPrice, priceRange, chartY, chartHeight, '#ff0066', 1);
                break;

            case 'signal':
                this.drawPriceLine(this.coherentSignal, minPrice, priceRange, chartY, chartHeight, '#00ff88', 2);
                break;

            case 'coherence':
                this.drawCoherenceMap(chartY, chartHeight);
                break;

            case 'combined':
            default:
                // Draw noise layer
                ctx.globalAlpha = 0.3;
                this.drawPriceLine(prices, minPrice, priceRange, chartY, chartHeight, '#ff0066', 1);

                // Draw signal layer
                ctx.globalAlpha = 1;
                this.drawPriceLine(this.coherentSignal, minPrice, priceRange, chartY, chartHeight, '#00ff88', 2);

                // Highlight patterns
                if (this.showPatternHighlights) {
                    this.drawPatternHighlights(chartY, chartHeight);
                }
                break;
        }

        ctx.globalAlpha = 1;
    }

    /**
     * Draw price line
     */
    drawPriceLine(prices, minPrice, priceRange, chartY, chartHeight, color, lineWidth) {
        const { ctx, canvas } = this;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        for (let i = 0; i < prices.length; i++) {
            const x = (i / prices.length) * canvas.width;
            const y = chartY + chartHeight - ((prices[i] - minPrice) / priceRange) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    /**
     * Draw coherence map
     */
    drawCoherenceMap(chartY, chartHeight) {
        const { ctx, canvas } = this;
        const dataWidth = canvas.width / this.marketData.length;
        
        for (let i = 0; i < this.marketData.length; i++) {
            const coherence = this.marketData[i].coherence || 0;
            const x = (i / this.marketData.length) * canvas.width;

            // Color based on coherence level
            const hue = coherence * 120; // 0 (red) to 120 (green)
            const alpha = 0.3 + coherence * 0.7;

            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.fillRect(x, chartY, dataWidth + 1, chartHeight);
        }
    }

    /**
     * Draw pattern highlights
     */
    drawPatternHighlights(chartY, chartHeight) {
        const { ctx, canvas } = this;
        
        for (let pattern of this.detectedPatterns) {
            const x = (pattern.index / this.marketData.length) * canvas.width;

            // Draw vertical highlight
            ctx.strokeStyle = pattern.type === 'bullish' ? '#00ff88' :
                pattern.type === 'bearish' ? '#ff0066' : '#ffaa00';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;

            ctx.beginPath();
            ctx.moveTo(x, chartY);
            ctx.lineTo(x, chartY + chartHeight);
            ctx.stroke();

            // Draw pattern label
            ctx.fillStyle = ctx.strokeStyle;
            ctx.globalAlpha = 1;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(pattern.type, x, chartY - 5);
        }
        
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    /**
     * Draw coherence overlay
     */
    drawCoherenceOverlay() {
        const { ctx, canvas } = this;

        // Create gradient based on overall coherence
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );

        const alpha = this.coherenceScore * 0.2;
        gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(0, 212, 255, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draw quantum state visualization
     */
    drawQuantumStates() {
        const { ctx, canvas } = this;
        const stateSize = 8;
        const startX = 20;
        const startY = canvas.height - 100;

        // Draw QBSA states
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px monospace';
        ctx.fillText('QBSA States', startX, startY - 10);

        for (let i = 0; i < 64; i++) {
            const x = startX + (i % 8) * (stateSize + 2);
            const y = startY + Math.floor(i / 8) * (stateSize + 2);

            const intensity = Math.abs(Math.cos(this.qbsaStates[i]));
            ctx.fillStyle = `rgba(0, 212, 255, ${intensity})`;
            ctx.fillRect(x, y, stateSize, stateSize);
        }

        // Draw QFH frequencies
        const freqStartX = canvas.width - 280;
        ctx.fillStyle = '#00ff88';
        ctx.fillText('QFH Spectrum', freqStartX, startY - 10);

        for (let i = 0; i < 32; i++) {
            const x = freqStartX + i * 8;
            const height = this.qfhFrequencies[i] * 50;
            const y = startY + 64 - height;
            
            ctx.fillStyle = `rgba(0, 255, 136, 0.8)`;
            ctx.fillRect(x, y, 6, height);
        }
    }

    /**
     * Draw particles
     */
    drawParticles() {
        const { ctx } = this;

        for (let particle of this.particles) {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw coherence waves
     */
    drawCoherenceWaves() {
        const { ctx } = this;

        for (let wave of this.coherenceWaves) {
            ctx.strokeStyle = wave.color;
            ctx.globalAlpha = wave.opacity;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    /**
     * Draw information panel
     */
    drawInfoPanel() {
        const { ctx, canvas } = this;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 300, 150);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('SEP Market Signal Extraction', 20, 35);

        // Metrics
        ctx.font = '14px monospace';
        ctx.fillStyle = '#00d4ff';

        const metrics = [
            `Signal/Noise: ${this.signalToNoiseRatio.toFixed(1)} dB`,
            `Coherence Score: ${(this.coherenceScore * 100).toFixed(1)}%`,
            `Patterns Detected: ${this.patternCount}`,
            `Latency: ${this.extractionLatency.toFixed(2)} ms`
        ];

        metrics.forEach((metric, i) => {
            ctx.fillText(metric, 20, 60 + i * 20);
        });

        // View mode
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`Mode: ${this.viewMode.toUpperCase()}`, 20, 140);
    }

    /**
     * Draw controls hint
     */
    drawControlsHint() {
        const { ctx, canvas } = this;

        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';

        const hints = [
            'Press SPACE to toggle animation',
            'Press 1-5 to change view mode',
            'Press C to toggle coherence overlay',
            'Press P to toggle pattern highlights'
        ];

        hints.forEach((hint, i) => {
            ctx.fillText(hint, canvas.width - 20, canvas.height - 120 + i * 15);
        });
        
        ctx.textAlign = 'left';
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.x !== undefined ? event.x : event.clientX - rect.left);
        const y = (event.y !== undefined ? event.y : event.clientY - rect.top);
        const shift = event.shiftKey || (event.modifiers && event.modifiers.shift);

        // Update particle attraction to mouse
        if (shift) {
            for (let particle of this.particles) {
                const dx = x - particle.x;
                const dy = y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100 && dist > 0) {
                    particle.vx += (dx / dist) * 0.1;
                    particle.vy += (dy / dist) * 0.1;
                }
            }
        }
    }

    /**
     * Handle mouse click
     */
    handleMouseClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.x !== undefined ? event.x : event.clientX - rect.left);
        const y = (event.y !== undefined ? event.y : event.clientY - rect.top);
        
        // Create coherence wave at click point
        this.coherenceWaves.push({
            x: x,
            y: y,
            radius: 0,
            opacity: 1,
            color: '#00d4ff'
        });
        
        // Trigger local coherence analysis
        const dataIndex = Math.floor((x / this.canvas.width) * this.marketData.length);
        if (dataIndex >= 0 && dataIndex < this.marketData.length) {
            // Boost local coherence
            for (let i = Math.max(0, dataIndex - 10); i < Math.min(this.marketData.length, dataIndex + 10); i++) {
                this.marketData[i].coherence = Math.min(1, (this.marketData[i].coherence || 0) + 0.2);
            }
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        const key = (event.key || event.keyCode || event.code || '').toLowerCase();
        switch (key) {
            case ' ':
                this.animateExtraction = !this.animateExtraction;
                break;

            case '1':
                this.viewMode = 'raw';
                break;

            case '2':
                this.viewMode = 'noise';
                break;

            case '3':
                this.viewMode = 'signal';
                break;

            case '4':
                this.viewMode = 'coherence';
                break;

            case '5':
                this.viewMode = 'combined';
                break;

            case 'c':
                this.showCoherenceOverlay = !this.showCoherenceOverlay;
                break;

            case 'p':
                this.showPatternHighlights = !this.showPatternHighlights;
                break;

            case 'r':
                this.generateMarketData();
                break;
        }
    }

    /**
     * Update settings from framework
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update noise level based on intensity
        if (newSettings.intensity !== undefined) {
            this.controls.noiseLevel.value = newSettings.intensity;
            this.generateMarketData();
        }
    }

    /**
     * Cycle through available view modes
     */
    cycleViewMode() {
        const modes = ['raw', 'noise', 'signal', 'coherence', 'combined'];
        const idx = modes.indexOf(this.viewMode);
        this.viewMode = modes[(idx + 1) % modes.length];
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Remove event subscriptions
        this.eventUnsubs.forEach((unsub) => unsub());
        this.eventUnsubs = [];

        // Cleanup controller
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
    }
}