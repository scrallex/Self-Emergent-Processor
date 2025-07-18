/**
 * Scene 9: SEP Operationalization
 *
 * Implementation of actual SEP algorithms with 64-bit state pins as an interactive grid.
 * Features QBSA rupture detection and QFH spectral analysis with real-time angle modulation effects.
*/
import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene9 {
    /**
     * Constructor for the scene
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} settings - Settings object from the framework
     */
    constructor(canvas, ctx, settings, physics, math, eventManager, stateManager, renderPipeline) {
        // Core properties
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.physics = physics;
        this.math = math;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;
        this.controller = null;
        
        // Scene-specific state
        this.time = 0;
        this.lastTime = 0;
        this.stateGrid = [];
        this.stateSize = settings.gridSize || 8; // Grid dimension
        this.cellSize = 0;
        this.pulses = [];
        this.ruptures = [];
        this.coherenceLevel = 1.0;
        this.activeAlgorithm = null;
        
        // For QFH spectral analysis
        this.spectralData = {
            harmonics: [1, 2, 3, 5, 8, 13, 21],
            amplitudes: [],
            phases: [],
            maxAmplitude: 0
        };
        
        // Grid center and interaction
        this.gridCenter = { x: 0, y: 0 };
        this.selectedCell = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Bind event handlers to maintain 'this' context
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleMouseClick);
        
        // Add keyboard event handler
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        
        this.reset();

        // Initialize shared interactive controls
        this.controller = new InteractiveController(
            this,
            this.canvas,
            this.ctx,
            this.eventManager,
            this.stateManager,
            this.renderPipeline
        ).init();
        
        // Run a brief demo after initialization
        setTimeout(() => this.runDemoSequence(), 1500);
        
        return Promise.resolve();
    }
    
    /**
     * Handle keyboard input for algorithm control
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'q':
                // Run QBSA algorithm
                this.runQBSA();
                break;
            case 'f':
                // Run QFH algorithm
                this.runQFH();
                break;
            case 'r':
                // Reset the scene
                this.reset();
                break;
            case 's':
                // Toggle state of cell under mouse
                if (this.mouseX && this.mouseY) {
                    for (let i = 0; i < this.stateSize; i++) {
                        for (let j = 0; j < this.stateSize; j++) {
                            const cell = this.stateGrid[i][j];
                            const dist = Math.hypot(this.mouseX - cell.x, this.mouseY - cell.y);
                            
                            if (dist < this.cellSize / 2) {
                                cell.state = 1 - cell.state;
                                return;
                            }
                        }
                    }
                }
                break;
            case '+':
            case '=':
                this.changeGridSize(this.stateSize + 1);
                break;
            case '-':
            case '_':
                this.changeGridSize(this.stateSize - 1);
                break;
        }
    }
    
    /**
     * Run a demonstration sequence to showcase the capabilities
     */
    runDemoSequence() {
        // First show QBSA after 1 second
        setTimeout(() => {
            this.runQBSA();
            
            // Then show QFH after 3 more seconds
            setTimeout(() => {
                this.runQFH();
            }, 3000);
        }, 1000);
    }

    /**
     * Change grid size and rebuild state grid
     * @param {number} newSize - Desired grid dimension
     */
    changeGridSize(newSize) {
        const size = Math.min(16, Math.max(2, Math.floor(newSize)));
        if (size !== this.stateSize) {
            this.stateSize = size;
            if (this.settings) this.settings.gridSize = size;
            this.reset();
        }
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.activeAlgorithm = null;
        this.ruptures = [];
        this.pulses = [];
        this.coherenceLevel = 1.0;
        
        // Calculate grid layout
        this.cellSize = Math.min(this.canvas.width, this.canvas.height) * 0.7 / this.stateSize;
        this.gridCenter = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        
        // Initialize state grid
        this.stateGrid = [];
        for (let i = 0; i < this.stateSize; i++) {
            const row = [];
            for (let j = 0; j < this.stateSize; j++) {
                row.push({
                    x: this.gridCenter.x + (j - this.stateSize/2 + 0.5) * this.cellSize,
                    y: this.gridCenter.y + (i - this.stateSize/2 + 0.5) * this.cellSize,
                    state: Math.random() > 0.85 ? 1 : 0,
                    energy: Math.random(),
                    phase: Math.random() * Math.PI * 2,
                    rupture: false
                });
            }
            this.stateGrid.push(row);
        }
    }

    /**
     * Run the QBSA (Quantum Boundary Strength Analysis) algorithm
     */
    runQBSA() {
        this.activeAlgorithm = 'QBSA';
        this.ruptures = [];
        
        // Create a global flash effect when QBSA starts
        this.pulses.push({
            x: this.gridCenter.x,
            y: this.gridCenter.y,
            radius: 5,
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.6,
            hue: 30, // Orange hue for QBSA
            opacity: 0.7,
            harmonic: 0,
            isRuptureFlash: true
        });
        
        // Calculate quantum boundary strengths between adjacent cells
        const threshold = 1.0;

        for (let i = 0; i < this.stateSize; i++) {
            for (let j = 0; j < this.stateSize; j++) {
                const cell = this.stateGrid[i][j];

                // Check cells in 4 directions
                const directions = [
                    { di: -1, dj: 0 }, // top
                    { di: 1, dj: 0 },  // bottom
                    { di: 0, dj: -1 }, // left
                    { di: 0, dj: 1 }   // right
                ];

                directions.forEach(dir => {
                    const ni = i + dir.di;
                    const nj = j + dir.dj;

                    if (ni >= 0 && ni < this.stateSize && nj >= 0 && nj < this.stateSize) {
                        const neighbor = this.stateGrid[ni][nj];

                        if (cell.state !== neighbor.state) {
                            // Phase difference wrapped to [0, π]
                            let dPhi = Math.abs(cell.phase - neighbor.phase) % (Math.PI * 2);
                            if (dPhi > Math.PI) dPhi = Math.PI * 2 - dPhi;

                            // Boundary strength from documented phase imbalance
                            const strength = dPhi * ((cell.energy + neighbor.energy) / 2);

                            if (strength > threshold) {
                                this.ruptures.push({
                                    x: (cell.x + neighbor.x) / 2,
                                    y: (cell.y + neighbor.y) / 2,
                                    strength,
                                    time: this.time,
                                    direction: Math.atan2(neighbor.y - cell.y, neighbor.x - cell.x)
                                });

                                cell.rupture = true;
                                neighbor.rupture = true;
                                
                                // Create localized rupture flash
                                this.pulses.push({
                                    x: (cell.x + neighbor.x) / 2,
                                    y: (cell.y + neighbor.y) / 2,
                                    radius: 2,
                                    maxRadius: this.cellSize * 3,
                                    hue: 30, // Orange hue for QBSA
                                    opacity: 0.9,
                                    harmonic: 0,
                                    isRuptureFlash: true
                                });

                                this.coherenceLevel = Math.max(0, this.coherenceLevel - 0.05);
                            }
                        }
                    }
                });
            }
        }
    }

    /**
     * Run the QFH (Quantum Fourier Harmonics) algorithm
     */
    runQFH() {
        this.activeAlgorithm = 'QFH';
        
        // Create a global pulse effect when QFH starts
        this.pulses.push({
            x: this.gridCenter.x,
            y: this.gridCenter.y,
            radius: 5,
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.6,
            hue: 180, // Cyan hue for QFH
            opacity: 0.7,
            harmonic: 0,
            isQFHFlash: true
        });
        
        const harmonics = this.spectralData.harmonics;
        const cellCount = this.stateSize * this.stateSize;
        
        // Reset spectral data
        this.spectralData.amplitudes = [];
        this.spectralData.phases = [];
        this.spectralData.maxAmplitude = 0;

        // Calculate spectral components for each harmonic
        for (let h of harmonics) {
            let real = 0;
            let imag = 0;

            for (let i = 0; i < this.stateSize; i++) {
                for (let j = 0; j < this.stateSize; j++) {
                    const cell = this.stateGrid[i][j];
                    real += Math.cos(cell.phase * h);
                    imag += Math.sin(cell.phase * h);
                }
            }

            const amplitude = Math.sqrt(real * real + imag * imag) / cellCount;
            const phase = Math.atan2(imag, real);
            
            // Store spectral data
            this.spectralData.amplitudes.push(amplitude);
            this.spectralData.phases.push(phase);
            
            // Track maximum amplitude for normalization
            if (amplitude > this.spectralData.maxAmplitude) {
                this.spectralData.maxAmplitude = amplitude;
            }

            if (amplitude > 0.6) {
                // Create harmonic pulse
                this.pulses.push({
                    x: this.gridCenter.x,
                    y: this.gridCenter.y,
                    radius: 5,
                    maxRadius: this.cellSize * (h + 2),
                    hue: 180 + h * 20,
                    opacity: 1,
                    harmonic: h,
                    isQFHPulse: true
                });

                // Nudge phases toward alignment
                for (let i = 0; i < this.stateSize; i++) {
                    for (let j = 0; j < this.stateSize; j++) {
                        const cell = this.stateGrid[i][j];
                        cell.phase = (cell.phase + amplitude * h) % (Math.PI * 2);
                    }
                }
            }
        }

        this.coherenceLevel = Math.min(1, this.coherenceLevel + 0.1);
    }

    /**
     * Handle mouse click event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Toggle cell state on click
        for (let i = 0; i < this.stateSize; i++) {
            for (let j = 0; j < this.stateSize; j++) {
                const cell = this.stateGrid[i][j];
                const dist = Math.hypot(mouseX - cell.x, mouseY - cell.y);
                
                if (dist < this.cellSize / 2) {
                    cell.state = 1 - cell.state;
                    cell.energy = Math.random() * 0.5 + 0.5; // High energy
                    cell.phase = Math.random() * Math.PI * 2;
                    
                    // Create pulse effect
                    this.pulses.push({
                        x: cell.x,
                        y: cell.y,
                        radius: 5,
                        maxRadius: this.cellSize * 3,
                        hue: cell.state ? 160 : 260,
                        opacity: 1,
                        harmonic: 1
                    });
                    
                    return;
                }
            }
        }
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if a cell is selected
        for (let i = 0; i < this.stateSize; i++) {
            for (let j = 0; j < this.stateSize; j++) {
                const cell = this.stateGrid[i][j];
                const dist = Math.hypot(this.mouseX - cell.x, this.mouseY - cell.y);
                
                if (dist < this.cellSize / 2) {
                    this.selectedCell = { i, j };
                    break;
                }
            }
            if (this.selectedCell) break;
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
        
        // Update cell phase based on mouse movement if a cell is selected
        if (this.selectedCell) {
            const { i, j } = this.selectedCell;
            const cell = this.stateGrid[i][j];
            
            // Calculate angle from cell to mouse
            const dx = this.mouseX - cell.x;
            const dy = this.mouseY - cell.y;
            cell.phase = Math.atan2(dy, dx);
            
            // Calculate distance for energy
            const dist = Math.hypot(dx, dy);
            cell.energy = Math.min(1, dist / (this.cellSize * 2));
        }
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        this.selectedCell = null;
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
        
        // Update based on deltaTime * speed
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Update pulses
        this.pulses = this.pulses.filter(pulse => {
            pulse.radius += dt * 100;
            pulse.opacity = 1 - (pulse.radius / pulse.maxRadius);
            
            // Remove pulse when it reaches max radius or fades out
            return pulse.radius < pulse.maxRadius && pulse.opacity > 0;
        });
        
        // Update grid cells
        for (let i = 0; i < this.stateSize; i++) {
            for (let j = 0; j < this.stateSize; j++) {
                const cell = this.stateGrid[i][j];
                
                // Slowly rotate phase
                cell.phase += dt * 0.2 * (cell.state ? 1 : -1);
                
                // Slowly normalize energy
                cell.energy += (0.5 - cell.energy) * dt * 0.1;
                
                // Clear rupture status over time
                if (cell.rupture && Math.random() < dt * 0.5) {
                    cell.rupture = false;
                }
            }
        }
        
        // Slowly recover coherence if no active algorithm
        if (!this.activeAlgorithm && this.coherenceLevel < 1) {
            this.coherenceLevel += dt * 0.05;
            this.coherenceLevel = Math.min(1, this.coherenceLevel);
        }
        
        // Clear active algorithm after some time
        if (this.activeAlgorithm && this.time % 5000 < 20) {
            this.activeAlgorithm = null;
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        // Clear canvas with a gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 10,
            this.canvas.width/2, this.canvas.height/2, this.canvas.height/2
        );
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.drawGridLines();
        
        // Draw cell states
        this.drawCells();
        
        // Draw pulses
        this.drawPulses();
        
        // Draw ruptures
        this.drawRuptures();
        
        // Draw QFH spectral analysis if active
        if (this.activeAlgorithm === 'QFH' && this.spectralData.amplitudes.length > 0) {
            this.drawSpectralAnalysis();
        }
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw grid lines
     */
    drawGridLines() {
        const gridStartX = this.gridCenter.x - (this.stateSize * this.cellSize) / 2;
        const gridStartY = this.gridCenter.y - (this.stateSize * this.cellSize) / 2;
        
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Draw horizontal grid lines
        for (let i = 0; i <= this.stateSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(gridStartX, gridStartY + i * this.cellSize);
            this.ctx.lineTo(gridStartX + this.stateSize * this.cellSize, gridStartY + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw vertical grid lines
        for (let j = 0; j <= this.stateSize; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(gridStartX + j * this.cellSize, gridStartY);
            this.ctx.lineTo(gridStartX + j * this.cellSize, gridStartY + this.stateSize * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw cells in the state grid
     */
    drawCells() {
        for (let i = 0; i < this.stateSize; i++) {
            for (let j = 0; j < this.stateSize; j++) {
                const cell = this.stateGrid[i][j];
                
                // Draw cell background
                this.ctx.fillStyle = cell.state ?
                    `rgba(0, 255, 136, ${0.3 + cell.energy * 0.7})` :
                    `rgba(124, 58, 237, ${0.3 + cell.energy * 0.7})`;
                
                this.ctx.beginPath();
                this.ctx.arc(cell.x, cell.y, this.cellSize * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw phase indicator
                this.ctx.strokeStyle = cell.state ? '#00ff88' : '#7c3aed';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(cell.x, cell.y);
                this.ctx.lineTo(
                    cell.x + Math.cos(cell.phase) * this.cellSize * 0.3,
                    cell.y + Math.sin(cell.phase) * this.cellSize * 0.3
                );
                this.ctx.stroke();
                
                // Draw rupture highlight
                if (cell.rupture) {
                    this.ctx.strokeStyle = '#ffaa00';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(cell.x, cell.y, this.cellSize * 0.45, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    /**
     * Draw expanding pulses
     */
    drawPulses() {
        this.pulses.forEach(pulse => {
            this.ctx.strokeStyle = `hsla(${pulse.hue}, 80%, 60%, ${pulse.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }
    
    /**
     * Draw rupture points
     */
    drawRuptures() {
        this.ruptures.forEach(rupture => {
            const age = (this.time - rupture.time) / 1000; // Age in seconds
            const opacity = Math.max(0, 1 - age * 0.5);
            
            if (opacity <= 0) return;
            
            // Draw rupture glow
            const gradient = this.ctx.createRadialGradient(
                rupture.x, rupture.y, 0,
                rupture.x, rupture.y, this.cellSize
            );
            gradient.addColorStop(0, `rgba(255, 170, 0, ${opacity * 0.8})`);
            gradient.addColorStop(1, 'rgba(255, 170, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(rupture.x, rupture.y, this.cellSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw rupture core
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(rupture.x, rupture.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw directional lightning-like rupture effects
            if (rupture.direction !== undefined && opacity > 0.5) {
                this.ctx.strokeStyle = `rgba(255, 220, 50, ${opacity})`;
                this.ctx.lineWidth = 2;
                
                // Draw lightning branches
                const branches = 3;
                for (let i = 0; i < branches; i++) {
                    const angleOffset = (Math.random() - 0.5) * Math.PI / 4;
                    const angle = rupture.direction + angleOffset;
                    const length = this.cellSize * (0.7 + Math.random() * 0.6);
                    
                    // Draw jagged line
                    this.ctx.beginPath();
                    this.ctx.moveTo(rupture.x, rupture.y);
                    
                    let x = rupture.x;
                    let y = rupture.y;
                    const segments = 3;
                    
                    for (let j = 0; j < segments; j++) {
                        const segLength = length / segments;
                        const jitter = this.cellSize * 0.15;
                        
                        x += Math.cos(angle + (Math.random() - 0.5) * 0.5) * segLength;
                        y += Math.sin(angle + (Math.random() - 0.5) * 0.5) * segLength;
                        
                        this.ctx.lineTo(
                            x + (Math.random() - 0.5) * jitter,
                            y + (Math.random() - 0.5) * jitter
                        );
                    }
                    
                    this.ctx.stroke();
                }
            }
        });
    }
    
    /**
     * Draw QFH spectral analysis bars
     */
    drawSpectralAnalysis() {
        const barWidth = 30;
        const barSpacing = 10;
        const maxHeight = 120;
        const startX = 20;
        const startY = this.canvas.height - 20;
        
        // Draw background panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const panelWidth = this.spectralData.harmonics.length * (barWidth + barSpacing) + barSpacing;
        this.ctx.fillRect(
            startX - 10,
            startY - maxHeight - 40,
            panelWidth + 20,
            maxHeight + 50
        );
        
        // Draw title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(
            'QFH Spectral Analysis',
            startX,
            startY - maxHeight - 15
        );
        
        // Draw harmonics label
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
            'Frequency Harmonics',
            startX,
            startY - maxHeight - 2
        );
        
        // Normalize amplitudes and draw bars
        const maxAmp = Math.max(0.1, this.spectralData.maxAmplitude);
        
        this.spectralData.harmonics.forEach((h, index) => {
            const amplitude = this.spectralData.amplitudes[index] || 0;
            const phase = this.spectralData.phases[index] || 0;
            
            // Calculate normalized height
            const normHeight = (amplitude / maxAmp) * maxHeight;
            
            // Calculate position
            const x = startX + index * (barWidth + barSpacing);
            const y = startY - normHeight;
            
            // Draw bar with gradient based on harmonic
            const gradient = this.ctx.createLinearGradient(x, startY, x, y);
            const hue = 180 + h * 20; // Cyan to blue range
            
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.3)`);
            gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.9)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, normHeight);
            
            // Draw border
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, barWidth, normHeight);
            
            // Add harmonic label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`f${h}`, x + barWidth/2, startY + 15);
            
            // Add amplitude value
            if (amplitude > 0.2) {
                this.ctx.fillText(
                    amplitude.toFixed(2),
                    x + barWidth/2,
                    y - 5
                );
            }
            
            // Draw phase indicator
            if (amplitude > 0.4) {
                const phaseX = x + barWidth/2;
                const phaseY = y + normHeight * 0.3;
                const phaseRadius = barWidth * 0.3;
                
                this.ctx.beginPath();
                this.ctx.arc(phaseX, phaseY, phaseRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fill();
                
                // Draw phase arrow
                this.ctx.beginPath();
                this.ctx.moveTo(phaseX, phaseY);
                this.ctx.lineTo(
                    phaseX + Math.cos(phase) * phaseRadius * 0.8,
                    phaseY + Math.sin(phase) * phaseRadius * 0.8
                );
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        // Main info panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 160);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('SEP Operationalization', 30, 45);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        
        // Build state vector string representation (first 8 bits)
        let stateVector = '|';
        for (let i = 0; i < Math.min(4, this.stateSize); i++) {
            for (let j = 0; j < Math.min(4, this.stateSize); j++) {
                stateVector += this.stateGrid[i][j].state;
            }
        }
        stateVector += '...';
        stateVector += '⟩';
        
        this.ctx.fillText(`State Vector: ${stateVector}`, 30, 70);
        this.ctx.fillText(`Coherence: ${this.coherenceLevel.toFixed(3)}`, 30, 95);
        this.ctx.fillText(`Ruptures Detected: ${this.ruptures.length}`, 30, 120);
        this.ctx.fillText(`Active Pulses: ${this.pulses.length}`, 30, 145);
        
        // Draw spectral information if QFH was run
        if (this.spectralData.amplitudes.length > 0) {
            // Find dominant frequency
            let maxIndex = 0;
            let maxAmp = 0;
            
            this.spectralData.amplitudes.forEach((amp, i) => {
                if (amp > maxAmp) {
                    maxAmp = amp;
                    maxIndex = i;
                }
            });
            
            // Show dominant frequency
            if (maxAmp > 0) {
                const dominantHarmonic = this.spectralData.harmonics[maxIndex];
                this.ctx.fillStyle = '#00d4ff';
                this.ctx.fillText(
                    `Dominant Frequency: f${dominantHarmonic} (${maxAmp.toFixed(3)})`,
                    30,
                    170
                );
            }
        }
        
        // Draw algorithm indicator if active
        if (this.activeAlgorithm) {
            this.ctx.fillStyle = this.activeAlgorithm === 'QBSA' ? '#ffaa00' : '#00ff88';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${this.activeAlgorithm} Running`, this.canvas.width - 30, 40);
            
            // Add algorithm-specific info
            if (this.activeAlgorithm === 'QBSA') {
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.fillText(`Rupture Detection Active`, this.canvas.width - 30, 65);
                
                if (this.ruptures.length > 0) {
                    const latestRupture = this.ruptures[this.ruptures.length - 1];
                    const age = ((this.time - latestRupture.time) / 1000).toFixed(1);
                    this.ctx.fillText(`Last Rupture: ${age}s ago`, this.canvas.width - 30, 90);
                }
            } else if (this.activeAlgorithm === 'QFH') {
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillText(`Harmonic Analysis Active`, this.canvas.width - 30, 65);
                
                // Show number of active harmonics
                const activeHarmonics = this.spectralData.amplitudes.filter(a => a > 0.4).length;
                this.ctx.fillText(`Active Harmonics: ${activeHarmonics}`, this.canvas.width - 30, 90);
            }
            
            this.ctx.textAlign = 'left';
        }
        
        // Draw help text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, this.canvas.height - 150, 340, 130);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Controls:', 30, this.canvas.height - 105);
        
        this.ctx.font = '13px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('• Use +/- to change grid size', 30, this.canvas.height - 100);
        this.ctx.fillText('• Click on a cell to toggle its state', 30, this.canvas.height - 80);
        this.ctx.fillText('• Drag a cell to adjust its phase and energy', 30, this.canvas.height - 60);
        this.ctx.fillText('• Press Q to run QBSA (rupture detection)', 30, this.canvas.height - 40);
        this.ctx.fillText('• Press F to run QFH (harmonic analysis)', 30, this.canvas.height - 20);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        
        // Show coherence level
        this.ctx.fillText(`Coherence: ${this.coherenceLevel.toFixed(3)}`, this.canvas.width - 20, 30);
        
        // Show active algorithm if any
        if (this.activeAlgorithm) {
            this.ctx.fillStyle = this.activeAlgorithm === 'QBSA' ? '#ffaa00' : '#00ff88';
            this.ctx.fillText(`${this.activeAlgorithm}`, this.canvas.width - 20, 60);
            
            // Show algorithm-specific info
            if (this.activeAlgorithm === 'QBSA') {
                this.ctx.fillText(`Ruptures: ${this.ruptures.length}`, this.canvas.width - 20, 90);
            } else if (this.activeAlgorithm === 'QFH' && this.spectralData.amplitudes.length > 0) {
                // Find dominant frequency
                let maxIndex = 0;
                let maxAmp = 0;
                
                this.spectralData.amplitudes.forEach((amp, i) => {
                    if (amp > maxAmp) {
                        maxAmp = amp;
                        maxIndex = i;
                    }
                });
                
                // Show dominant frequency
                if (maxAmp > 0) {
                    const dominantHarmonic = this.spectralData.harmonics[maxIndex];
                    this.ctx.fillText(`f${dominantHarmonic}: ${maxAmp.toFixed(2)}`, this.canvas.width - 20, 90);
                }
            }
        }
        
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        if (typeof newSettings.gridSize !== 'undefined') {
            this.changeGridSize(newSettings.gridSize);
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
        this.canvas.removeEventListener('click', this.handleMouseClick);
        window.removeEventListener('keydown', this.handleKeyDown);
        
        this.stateGrid = [];
        this.pulses = [];
        this.ruptures = [];
    }
}