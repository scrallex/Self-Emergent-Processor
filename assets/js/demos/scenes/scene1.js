/**
 * Scene 1: The Hidden Code
 *
 * This scene demonstrates basic wave interference patterns, showing how
 * complex signals emerge from sine/cosine components with real-time
 * Fourier Transform visualization.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene1 {
    /**
     * Constructor for the scene
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
     * @param {Object} settings - Settings object from the framework
     * @param {Object} physics - Physics engine instance
     * @param {Object} math - Math library instance
     * @param {Object} eventManager - Event manager instance
     * @param {Object} stateManager - State manager instance
     * @param {Object} renderPipeline - Render pipeline instance
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
        
        // Scene-specific state
        this.time = 0;
        this.lastTime = 0;
        this.frequency = 3; // Default frequency value
        this.interference = 'Constructive';
        this.waveValues = [];
        this.waveAmplitude = this.settings.intensity || 50;
        this.spectrum = null; // Fourier Transform results
        
        // Interactive controller (initialized in init)
        this.controller = null;
        
        // Interactive elements (defined in createInteractiveElements)
        this.interactiveElements = [];
        
        // Waveform dragging state
        this.isDraggingWave = false;
        this.draggedWaveIndex = -1;
        this.wavePhaseOffsets = [0, Math.PI / 3, 2 * Math.PI / 3];
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
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
        
        this.reset();
        return Promise.resolve();
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        this.waveValues = new Array(this.canvas.width).fill(0);
        this.frequency = 3;
        this.wavePhaseOffsets = [0, Math.PI / 3, 2 * Math.PI / 3];
        this.waveAmplitude = this.settings.intensity || 50;
        this.spectrum = null;
    }
    
    /**
     * Create interactive elements specific to this scene
     * @param {InteractiveUtils} utils - Interactive utilities instance
     * @returns {Array} - Array of interactive elements
     */
    createInteractiveElements(utils) {
        const elements = [];
        
        // Create draggable wave control points
        const centerY = this.canvas.height / 2;
        const spacing = 80;
        
        for (let i = 0; i < 3; i++) {
            const waveControl = utils.createDraggable({
                id: `wave_control_${i}`,
                x: 100 + i * spacing,
                y: centerY,
                width: 30,
                height: 30,
                shape: 'circle',
                color: `hsl(${240 + i * 30}, 70%, 60%)`,
                tooltip: `Wave ${i+1} Control Point`,
                constrainToCanvas: true,
                
                onDragStart: (x, y) => {
                    this.isDraggingWave = true;
                    this.draggedWaveIndex = i;
                },
                
                onDrag: (dx, dy, x, y) => {
                    // Adjust wave phase based on horizontal movement
                    const phaseFactor = dx * 0.01;
                    this.wavePhaseOffsets[i] += phaseFactor;
                    
                    // Adjust wave amplitude based on vertical position relative to center
                    const relativeY = (centerY - y) / 100;
                    this.individualAmplitudes = this.individualAmplitudes || [1, 1, 1];
                    this.individualAmplitudes[i] = Math.max(0.1, Math.min(2, 1 + relativeY));
                    
                    // Reset position X to starting point (control point doesn't actually move horizontally)
                    waveControl.x = 100 + i * spacing;
                },
                
                onDragEnd: () => {
                    this.isDraggingWave = false;
                    this.draggedWaveIndex = -1;
                }
            });
            
            elements.push(waveControl);
        }
        
        // Create an interactive frequency zone at the bottom
        const freqControl = utils.createDraggable({
            id: 'frequency_control',
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height - 100,
            width: 200,
            height: 50,
            color: 'rgba(255, 0, 255, 0.2)',
            text: 'Drag to change frequency',
            tooltip: 'Drag horizontally to adjust frequency',
            
            onDrag: (dx, dy, x, y) => {
                // Adjust frequency based on horizontal position
                const normalizedX = x / this.canvas.width;
                this.frequency = 1 + normalizedX * 9; // Range 1-10 Hz
            }
        });
        
        elements.push(freqControl);
        
        return elements;
    }
    
    /**
     * Provide custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'frequency_slider',
                type: 'slider',
                label: 'Frequency',
                min: 1,
                max: 10,
                value: this.frequency,
                step: 0.1,
                onChange: (value) => {
                    this.frequency = value;
                }
            },
            {
                id: 'wave_toggle',
                type: 'toggle',
                label: 'Show Waves & Fourier Transform',
                value: true,
                onChange: (value) => {
                    this.showIndividualWaves = value;
                }
            },
            {
                id: 'randomize_btn',
                type: 'button',
                label: 'Randomize Waves',
                onClick: () => {
                    // Randomize phase offsets
                    for (let i = 0; i < 3; i++) {
                        this.wavePhaseOffsets[i] = Math.random() * Math.PI * 2;
                    }
                    
                    // Randomize frequency
                    this.frequency = 2 + Math.random() * 4;
                }
            }
        ];
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
        
        // Use generic settings from the framework's control panel
        this.waveAmplitude = this.settings.intensity || 50;
        const speed = this.settings.speed || 1.0;
        
        // Update scene state
        this.update(deltaTime * speed, this.waveAmplitude);
        
        // Render the scene
        this.draw(this.waveAmplitude);
        
        // Update information panel
        if (this.controller) {
            this.controller.updateInfoPanel({
                'Phase': (this.time * 0.1).toFixed(2) + ' rad',
                'Frequency': this.frequency.toFixed(1) + ' Hz',
                'Interference': this.interference
            });
            
            // Render UI components
            this.controller.render(timestamp);
        }
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     * @param {number} amplitude - Wave amplitude from settings
     */
    update(dt, amplitude) {
        // Increment time
        this.time += dt;
        
        // Calculate interference type
        let sumAtCenter = 0;
        for (let wave = 0; wave < 3; wave++) {
            const waveAmplitude = this.individualAmplitudes ? amplitude * this.individualAmplitudes[wave] / 3 : amplitude / 3;
            sumAtCenter += waveAmplitude * Math.sin(this.time * 2 * this.frequency * 0.01 + this.wavePhaseOffsets[wave]);
        }
        
        // Determine if interference is constructive or destructive
        const normalizedSum = sumAtCenter / amplitude;
        if (Math.abs(normalizedSum) > 1.5) {
            this.interference = 'Constructive';
        } else if (Math.abs(normalizedSum) < 0.5) {
            this.interference = 'Destructive';
        } else {
            this.interference = 'Mixed';
        }
        
        // Store wave values for Fourier analysis
        for (let x = 0; x < this.canvas.width; x++) {
            let ySum = 0;
            for (let wave = 0; wave < 3; wave++) {
                const waveAmplitude = this.individualAmplitudes ? amplitude * this.individualAmplitudes[wave] / 3 : amplitude / 3;
                ySum += waveAmplitude * Math.sin((x + this.time * 2) * this.frequency * 0.01 + this.wavePhaseOffsets[wave]);
            }
            this.waveValues[x] = ySum;
        }

        // Compute a discrete Fourier transform on a small sample
        const sampleCount = 64;
        const step = Math.max(1, Math.floor(this.waveValues.length / sampleCount));
        const samples = [];
        for (let i = 0; i < this.waveValues.length; i += step) {
            samples.push(this.waveValues[i]);
            if (samples.length >= sampleCount) break;
        }
        this.spectrum = this.math.fourierTransform(samples);
    }

    /**
     * Draw the scene - handles both normal and video modes
     * @param {number} amplitude - Wave amplitude from settings
     */
    draw(amplitude) {
        const { ctx, canvas } = this;
        
        // Clear canvas with a dark background
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a subtle grid for reference
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Draw three individual waves with custom phase offsets
        if (this.showIndividualWaves !== false) {
            for (let wave = 0; wave < 3; wave++) {
                ctx.strokeStyle = `hsl(${240 + wave * 30}, 70%, 60%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                const waveAmplitude = this.individualAmplitudes ? amplitude * this.individualAmplitudes[wave] : amplitude;
                
                for (let x = 0; x < canvas.width; x++) {
                    const y = canvas.height / 2 + (waveAmplitude / 3) *
                        Math.sin((x + this.time * 2) * this.frequency * 0.01 + this.wavePhaseOffsets[wave]);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }

        // Draw the resulting interference pattern (sum of the waves)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4; // Make it stand out
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            let ySum = canvas.height / 2;
            for (let wave = 0; wave < 3; wave++) {
                const waveAmplitude = this.individualAmplitudes ? amplitude * this.individualAmplitudes[wave] / 3 : amplitude / 3;
                ySum += waveAmplitude * Math.sin((x + this.time * 2) * this.frequency * 0.01 + this.wavePhaseOffsets[wave]);
            }
            if (x === 0) ctx.moveTo(x, ySum);
            else ctx.lineTo(x, ySum);
        }
        ctx.stroke();
        
        // Draw Fourier Transform frequency domain at the bottom
        this.drawFrequencyDomain(amplitude);
        
        // Draw minimal video info if in video mode and no controller
        if (this.settings.videoMode && !this.controller) {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw the Fourier Transform frequency domain representation
     * @param {number} amplitude - Wave amplitude
     */
    drawFrequencyDomain(amplitude) {
        const { ctx, canvas } = this;
        const height = canvas.height * 0.15;
        const y = canvas.height - height - 20;
        
        // Draw frequency domain background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, y, canvas.width, height);
        
        // Draw frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, y, canvas.width, height);
        
        if (!this.spectrum) return;

        const mags = this.spectrum.magnitude;
        const half = Math.floor(mags.length / 2);
        const barWidth = canvas.width / half;
        for (let k = 0; k < half; k++) {
            const m = mags[k];
            const norm = m / amplitude;
            const barHeight = norm * height;

            ctx.fillStyle = `rgba(255, 0, 255, ${Math.min(1, norm)})`;
            ctx.fillRect(k * barWidth, y + height - barHeight, barWidth - 2, barHeight);
        }
    }

    /**
     * Draw the information panel for normal mode
     * @deprecated - Replaced by the interactive controller's info panel
     */
    drawInfo() {
        // This is now handled by the interactive controller
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        // Set color based on interference type
        if (this.interference === 'Constructive') {
            ctx.fillStyle = '#00ff88';
        } else if (this.interference === 'Destructive') {
            ctx.fillStyle = '#ff5500';
        } else {
            ctx.fillStyle = '#ffaa00';
        }
        
        ctx.fillText(`${this.interference} Interference`, canvas.width - 20, 30);
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update internal parameters based on settings
        if (newSettings.intensity !== undefined) {
            this.waveAmplitude = newSettings.intensity;
        }
    }

    /**
     * Clean up resources when scene is unloaded
     */
    cleanup() {
        // Clean up the interactive controller
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }
        
        // Clear interactive elements
        this.interactiveElements = [];
    }
}