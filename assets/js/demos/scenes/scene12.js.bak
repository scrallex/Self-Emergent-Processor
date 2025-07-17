/**
 * Scene 12: SEP Unified System
 *
 * This finale scene brings together elements from all previous demonstrations
 * to show how the self-emergent processor creates a harmonious system
 * where all components interact and strengthen each other.
 *
 * Keyboard Controls:
 *   - `1-6` select between All Systems, SEP Core, Neural Connections,
 *     Vector Dynamics, Emergent Patterns and Quantum Harmonics.
 *   - `Space` triggers an energy pulse from the core.
 *
 * Module Structure:
 *   Scene12 exports a class which orchestrates particle, neural network,
 *   vector field and wave subsystems.  It receives framework utilities
 *   such as Physics, MathLib, EventManager, StateManager and RenderPipeline
 *   during construction.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene12 {
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
        
        // Animation state
        this.time = 0;
        this.lastTime = 0;
        this.animationPhase = 0;
        
        // System components
        this.particleSystem = this.createParticleSystem();
        this.neuralNetwork = this.createNeuralNetwork();
        this.vectorField = this.createVectorField();
        this.waveSystem = this.createWaveSystem();
        this.fractals = this.createFractals();
        
        // Central SEP system
        this.sepCore = {
            x: 0,
            y: 0,
            radius: 100,
            rotation: 0,
            connections: [],
            pulses: [],
            energy: 0
        };
        
        // Interface components
        this.activeVisualization = 0;
        this.visualizationNames = [
            "All Systems",
            "SEP Core",
            "Neural Connections",
            "Vector Dynamics",
            "Emergent Patterns",
            "Quantum Harmonics"
        ];
        
        // System stats
        this.systemStats = {
            efficiency: 0.8,
            coherence: 0.7,
            emergence: 0.5,
            stability: 0.9
        };
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastClickTime = 0;
        
        // Interactive controller (initialized in init)
        this.controller = null;
        this.paused = false;
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
        
        // Register the addSceneSpecificControls method
        this.controller.addSceneSpecificControls = this.addSceneSpecificControls.bind(this);
        
        // Register event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        
        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.handleMouseClick);
        
        // Create particle systems
        this.initializeParticles();
        
        // Initialize SEP core
        this.initializeSepCore();
        
        return Promise.resolve();
    }
    
    /**
     * Initialize the particle systems
     */
    initializeParticles() {
        // Reset particles
        this.particleSystem.particles = [];
        
        // Create various particle types
        for (let i = 0; i < this.particleSystem.count; i++) {
            // Create base particle
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                type: Math.floor(Math.random() * 5), // 0-4 for different behaviors
                age: 0,
                lifespan: 100 + Math.random() * 200,
                phase: Math.random() * Math.PI * 2
            };
            
            // Additional properties based on type
            switch (particle.type) {
                case 0: // Bouncing particles
                    particle.elasticity = 0.8 + Math.random() * 0.2;
                    break;
                case 1: // Orbiting particles
                    particle.orbitRadius = 50 + Math.random() * 150;
                    particle.orbitSpeed = (Math.random() - 0.5) * 0.02;
                    particle.centerX = this.canvas.width / 2;
                    particle.centerY = this.canvas.height / 2;
                    break;
                case 2: // Flocking particles
                    particle.alignment = Math.random() * 0.2;
                    particle.cohesion = Math.random() * 0.2;
                    particle.separation = Math.random() * 0.2;
                    break;
                case 3: // Wave particles
                    particle.amplitude = 5 + Math.random() * 20;
                    particle.frequency = 0.01 + Math.random() * 0.03;
                    break;
                case 4: // Quantum particles
                    particle.entangled = i % 2 === 0 ? i + 1 : i - 1;
                    particle.spin = Math.random() > 0.5 ? 1 : -1;
                    particle.superposition = true;
                    break;
            }
            
            this.particleSystem.particles.push(particle);
        }
    }
    
    /**
     * Initialize the SEP core
     */
    initializeSepCore() {
        // Set core position
        this.sepCore.x = this.canvas.width / 2;
        this.sepCore.y = this.canvas.height / 2;
        
        // Initialize core properties
        this.sepCore.rotation = 0;
        this.sepCore.energy = 0.5; // Start with medium energy
        this.sepCore.pulses = []; // Empty array for energy pulses
        
        // Create initial energy pulse to show interactivity
        this.createEnergyPulse();
        
        // Create connections to each system
        const systems = [
            this.particleSystem,
            this.neuralNetwork,
            this.vectorField,
            this.waveSystem,
            this.fractals
        ];
        
        this.sepCore.connections = systems.map((system, index) => {
            const angle = (index / systems.length) * Math.PI * 2;
            return {
                system: index,
                angle: angle,
                strength: 0.5 + Math.random() * 0.5,
                pulsePhase: Math.random() * Math.PI * 2,
                x: this.sepCore.x + Math.cos(angle) * this.sepCore.radius * 2,
                y: this.sepCore.y + Math.sin(angle) * this.sepCore.radius * 2
            };
        });
        
        // Set initial system stats based on active systems and energy level
        this.updateSystemStats(0.1);
    }
    
    /**
     * Create particle system configuration
     * @returns {Object} Particle system configuration
     */
    createParticleSystem() {
        return {
            count: 150,
            particles: [],
            active: true,
            vizMode: 0
        };
    }
    
    /**
     * Create neural network configuration
     * @returns {Object} Neural network configuration
     */
    createNeuralNetwork() {
        // Create a simple neural network representation
        const layerCount = 4;
        const nodesPerLayer = [6, 12, 8, 4];
        const layers = [];
        
        for (let i = 0; i < layerCount; i++) {
            const layer = [];
            for (let j = 0; j < nodesPerLayer[i]; j++) {
                layer.push({
                    x: 0, // Will be positioned during rendering
                    y: 0,
                    activation: Math.random(),
                    connections: []
                });
            }
            layers.push(layer);
        }
        
        // Create connections between layers
        for (let i = 0; i < layerCount - 1; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                for (let k = 0; k < layers[i + 1].length; k++) {
                    if (Math.random() < 0.6) { // 60% connection probability
                        layers[i][j].connections.push({
                            target: k,
                            weight: Math.random() * 2 - 1, // -1 to 1
                            active: true
                        });
                    }
                }
            }
        }
        
        return {
            layers: layers,
            active: true,
            learningRate: 0.1,
            activation: 0
        };
    }
    
    /**
     * Create vector field configuration
     * @returns {Object} Vector field configuration
     */
    createVectorField() {
        const resolution = 20;
        const cols = Math.floor(this.canvas.width / resolution);
        const rows = Math.floor(this.canvas.height / resolution);
        const vectors = [];
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                vectors.push({
                    x: i * resolution + resolution / 2,
                    y: j * resolution + resolution / 2,
                    dx: Math.random() * 2 - 1,
                    dy: Math.random() * 2 - 1,
                    magnitude: Math.random() * 0.5 + 0.5
                });
            }
        }
        
        return {
            vectors: vectors,
            resolution: resolution,
            active: true,
            mode: 'flow' // 'flow', 'curl', 'divergence'
        };
    }
    
    /**
     * Create wave system configuration
     * @returns {Object} Wave system configuration
     */
    createWaveSystem() {
        const waves = [];
        const waveCount = 3;
        
        for (let i = 0; i < waveCount; i++) {
            waves.push({
                amplitude: 20 + Math.random() * 30,
                frequency: 0.005 + Math.random() * 0.01,
                phase: Math.random() * Math.PI * 2,
                color: `hsl(${i * 120}, 70%, 50%)`
            });
        }
        
        return {
            waves: waves,
            active: true,
            interference: true
        };
    }
    
    /**
     * Create fractals configuration
     * @returns {Object} Fractals configuration
     */
    createFractals() {
        return {
            depth: 5,
            angle: Math.PI / 5,
            scaleFactor: 0.7,
            active: true,
            type: 'tree' // 'tree', 'sierpinski', 'koch'
        };
    }
    
    /**
     * Create interactive elements specific to this scene
     * @param {InteractiveUtils} utils - Interactive utilities instance
     * @returns {Array} - Array of interactive elements
     */
    createInteractiveElements(utils) {
        const elements = [];
        
        // Create core control element
        const coreControl = utils.createDraggable({
            id: 'sep_core_control',
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height / 2 - 50,
            width: 100,
            height: 100,
            shape: 'circle',
            color: 'rgba(0, 255, 136, 0.3)',
            tooltip: 'SEP Core - Click to interact or drag to move',
            draggable: true,
            
            onDrag: (dx, dy, x, y) => {
                // Update core position
                this.sepCore.x = x + 50; // Adjust for center point
                this.sepCore.y = y + 50;
            },
            
            onClick: () => {
                // Generate a pulse from the core
                this.sepCore.pulses.push({
                    x: this.sepCore.x,
                    y: this.sepCore.y,
                    radius: 10,
                    maxRadius: 500,
                    alpha: 1,
                    color: '#00ff88'
                });
                
                // Increase core energy
                this.sepCore.energy = Math.min(1, this.sepCore.energy + 0.2);
                
                // Toggle visualization mode
                this.activeVisualization = (this.activeVisualization + 1) % this.visualizationNames.length;
            }
        });
        
        elements.push(coreControl);
        
        // Create connection control points
        const systemTypes = [
            { name: 'Particles', color: '#00d4ff' },
            { name: 'Neural', color: '#ffaa00' },
            { name: 'Vector', color: '#7c3aed' },
            { name: 'Wave', color: '#ff00ff' },
            { name: 'Fractal', color: '#00ff88' }
        ];
        
        for (let i = 0; i < systemTypes.length; i++) {
            const angle = (i / systemTypes.length) * Math.PI * 2;
            const x = this.canvas.width / 2 + Math.cos(angle) * 200;
            const y = this.canvas.height / 2 + Math.sin(angle) * 200;
            
            const connectionControl = utils.createDraggable({
                id: `connection_${i}`,
                x: x - 15,
                y: y - 15,
                width: 30,
                height: 30,
                shape: 'circle',
                color: systemTypes[i].color,
                tooltip: `${systemTypes[i].name} Connection - Drag to adjust`,
                draggable: true,
                
                onDrag: (dx, dy, x, y) => {
                    // Update connection point
                    const connectionX = x + 15; // Adjust for center point
                    const connectionY = y + 15;
                    
                    // Update connection in sepCore
                    if (this.sepCore.connections[i]) {
                        this.sepCore.connections[i].x = connectionX;
                        this.sepCore.connections[i].y = connectionY;
                        
                        // Calculate new angle from core
                        const dx = connectionX - this.sepCore.x;
                        const dy = connectionY - this.sepCore.y;
                        this.sepCore.connections[i].angle = Math.atan2(dy, dx);
                        
                        // Update strength based on distance
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const normalizedDist = Math.min(1, Math.max(0.1, distance / 300));
                        this.sepCore.connections[i].strength = 1 - normalizedDist;
                    }
                }
            });
            
            elements.push(connectionControl);
        }
        
        return elements;
    }
    
    /**
     * Provide custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'visualization_mode',
                type: 'slider',
                label: 'Visualization Mode',
                min: 0,
                max: this.visualizationNames.length - 1,
                value: this.activeVisualization,
                step: 1,
                onChange: (value) => {
                    this.activeVisualization = Math.round(value);
                }
            },
            {
                id: 'particles_toggle',
                type: 'toggle',
                label: 'Particle System',
                value: this.particleSystem.active,
                onChange: (value) => {
                    this.particleSystem.active = value;
                }
            },
            {
                id: 'neural_toggle',
                type: 'toggle',
                label: 'Neural Network',
                value: this.neuralNetwork.active,
                onChange: (value) => {
                    this.neuralNetwork.active = value;
                }
            },
            {
                id: 'vector_toggle',
                type: 'toggle',
                label: 'Vector Field',
                value: this.vectorField.active,
                onChange: (value) => {
                    this.vectorField.active = value;
                }
            },
            {
                id: 'wave_toggle',
                type: 'toggle',
                label: 'Wave System',
                value: this.waveSystem.active,
                onChange: (value) => {
                    this.waveSystem.active = value;
                }
            },
            {
                id: 'fractal_toggle',
                type: 'toggle',
                label: 'Fractals',
                value: this.fractals.active,
                onChange: (value) => {
                    this.fractals.active = value;
                }
            },
            {
                id: 'reset_btn',
                type: 'button',
                label: 'Reset All Systems',
                onClick: () => {
                    this.initializeParticles();
                    this.initializeSepCore();
                    
                    // Update interactive elements positions
                    if (this.controller && this.controller.components.sceneElements) {
                        const coreControl = this.controller.components.sceneElements.find(el => el.id === 'sep_core_control');
                        if (coreControl) {
                            coreControl.x = this.sepCore.x - 50;
                            coreControl.y = this.sepCore.y - 50;
                        }
                        
                        // Update connection controls
                        for (let i = 0; i < this.sepCore.connections.length; i++) {
                            const connection = this.sepCore.connections[i];
                            const connectionControl = this.controller.components.sceneElements.find(el => el.id === `connection_${i}`);
                            
                            if (connectionControl && connection) {
                                connectionControl.x = connection.x - 15;
                                connectionControl.y = connection.y - 15;
                            }
                        }
                    }
                }
            }
        ];
    }

    /**
     * Main animation loop - called by the framework on each frame
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    animate(timestamp) {
        if (this.paused) return;
        // Calculate delta time
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
        this.lastTime = timestamp;
        this.time += deltaTime;
        
        // Update scene state
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw();
        
        // Track mouse position if we need it
        if (this.eventManager) {
            this.mouseX = this.eventManager.mouse.x;
            this.mouseY = this.eventManager.mouse.y;
        }
        
        // Update information panel
        if (this.controller) {
            // Update info with current system stats and visualization mode
            this.controller.updateInfoPanel({
                'Visualization': this.visualizationNames[this.activeVisualization],
                'Efficiency': (this.systemStats.efficiency * 100).toFixed(1) + '%',
                'Coherence': (this.systemStats.coherence * 100).toFixed(1) + '%',
                'Emergence': (this.systemStats.emergence * 100).toFixed(1) + '%',
                'Stability': (this.systemStats.stability * 100).toFixed(1) + '%',
                'Core Energy': (this.sepCore.energy * 100).toFixed(1) + '%'
            });
            
            // Render UI components
            this.controller.render(timestamp);
        }
    }
    
    /**
     * Update scene state - separated from animation for clarity
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Update animation phase
        this.animationPhase += dt;
        
        // Update SEP core
        this.updateSepCore(dt);
        
        // Update particles
        if (this.particleSystem.active) {
            this.updateParticles(dt);
        }
        
        // Update neural network
        if (this.neuralNetwork.active) {
            this.updateNeuralNetwork(dt);
        }
        
        // Update vector field
        if (this.vectorField.active) {
            this.updateVectorField(dt);
        }
        
        // Update system stats based on component interactions
        this.updateSystemStats(dt);
    }
    
    /**
     * Update the SEP core
     * @param {number} dt - Delta time in seconds
     */
    updateSepCore(dt) {
        // Update core rotation - speed based on energy level
        this.sepCore.rotation += dt * (0.1 + this.sepCore.energy * 0.3);
        
        // Update connections
        this.sepCore.connections.forEach(conn => {
            conn.pulsePhase += dt * (0.3 + this.sepCore.energy * 0.5);
            
            // Calculate position based on angle and distance from core
            conn.angle += dt * (0.02 + this.sepCore.energy * 0.08);
            conn.x = this.sepCore.x + Math.cos(conn.angle) * this.sepCore.radius * 2;
            conn.y = this.sepCore.y + Math.sin(conn.angle) * this.sepCore.radius * 2;
        });
        
        // Update pulses
        for (let i = this.sepCore.pulses.length - 1; i >= 0; i--) {
            const pulse = this.sepCore.pulses[i];
            pulse.radius += dt * 200;
            pulse.alpha -= dt * 0.5;
            
            if (pulse.alpha <= 0 || pulse.radius >= pulse.maxRadius) {
                this.sepCore.pulses.splice(i, 1);
            }
        }
        
        // Slowly decrease energy over time
        this.sepCore.energy = Math.max(0, this.sepCore.energy - dt * 0.05);
    }
    
    /**
     * Update particle system
     * @param {number} dt - Delta time in seconds
     */
    updateParticles(dt) {
        for (let i = this.particleSystem.particles.length - 1; i >= 0; i--) {
            const p = this.particleSystem.particles[i];
            
            // Age the particle
            p.age += dt;
            if (p.age >= p.lifespan) {
                // Respawn particle
                p.age = 0;
                p.x = Math.random() * this.canvas.width;
                p.y = Math.random() * this.canvas.height;
                p.phase = Math.random() * Math.PI * 2;
            }
            
            // Update based on type
            switch (p.type) {
                case 0: // Bouncing particles
                    p.x += p.vx * dt * 60;
                    p.y += p.vy * dt * 60;
                    
                    // Bounce off edges
                    if (p.x < 0 || p.x > this.canvas.width) {
                        p.vx *= -p.elasticity;
                        p.x = Math.max(0, Math.min(this.canvas.width, p.x));
                    }
                    if (p.y < 0 || p.y > this.canvas.height) {
                        p.vy *= -p.elasticity;
                        p.y = Math.max(0, Math.min(this.canvas.height, p.y));
                    }
                    break;
                    
                case 1: // Orbiting particles
                    // Orbit around center
                    const angle = p.phase + this.time * p.orbitSpeed;
                    p.x = p.centerX + Math.cos(angle) * p.orbitRadius;
                    p.y = p.centerY + Math.sin(angle) * p.orbitRadius;
                    break;
                    
                case 2: // Flocking particles
                    // Simplified flocking behavior
                    let avgDx = 0, avgDy = 0, sepX = 0, sepY = 0, count = 0;
                    
                    // Check against other particles
                    for (const other of this.particleSystem.particles) {
                        if (other === p) continue;
                        
                        const dx = other.x - p.x;
                        const dy = other.y - p.y;
                        const distSq = dx * dx + dy * dy;
                        
                        if (distSq < 5000) {
                            // Alignment - match velocity
                            avgDx += other.vx;
                            avgDy += other.vy;
                            
                            // Separation - avoid crowding
                            if (distSq < 1000) {
                                sepX -= dx;
                                sepY -= dy;
                            }
                            
                            count++;
                        }
                    }
                    
                    if (count > 0) {
                        // Apply flocking forces
                        avgDx /= count;
                        avgDy /= count;
                        
                        p.vx += avgDx * p.alignment + sepX * p.separation;
                        p.vy += avgDy * p.alignment + sepY * p.separation;
                        
                        // Limit speed
                        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                        if (speed > 3) {
                            p.vx = (p.vx / speed) * 3;
                            p.vy = (p.vy / speed) * 3;
                        }
                    }
                    
                    // Cohesion - move toward center
                    p.vx += (this.sepCore.x - p.x) * p.cohesion * 0.01;
                    p.vy += (this.sepCore.y - p.y) * p.cohesion * 0.01;
                    
                    // Update position
                    p.x += p.vx * dt * 60;
                    p.y += p.vy * dt * 60;
                    
                    // Wrap around edges
                    if (p.x < 0) p.x += this.canvas.width;
                    if (p.x > this.canvas.width) p.x -= this.canvas.width;
                    if (p.y < 0) p.y += this.canvas.height;
                    if (p.y > this.canvas.height) p.y -= this.canvas.height;
                    break;
                    
                case 3: // Wave particles
                    // Move in a wave pattern
                    p.x += p.vx * dt * 60;
                    p.y = p.y + p.vy * dt * 60 + Math.sin(this.time * p.frequency + p.phase) * p.amplitude;
                    
                    // Wrap around edges
                    if (p.x < 0) p.x += this.canvas.width;
                    if (p.x > this.canvas.width) p.x -= this.canvas.width;
                    if (p.y < 0) p.y += this.canvas.height;
                    if (p.y > this.canvas.height) p.y -= this.canvas.height;
                    break;
                    
                case 4: // Quantum particles
                    if (p.superposition) {
                        // Probabilistic movement in superposition
                        if (Math.random() < 0.1) {
                            p.vx = (Math.random() - 0.5) * 4;
                            p.vy = (Math.random() - 0.5) * 4;
                        }
                    }
                    
                    // Update position
                    p.x += p.vx * dt * 60;
                    p.y += p.vy * dt * 60;
                    
                    // Handle entanglement
                    if (p.entangled < this.particleSystem.particles.length) {
                        const entangled = this.particleSystem.particles[p.entangled];
                        
                        // If particles get too far apart, pull them back
                        const dx = entangled.x - p.x;
                        const dy = entangled.y - p.y;
                        const distSq = dx * dx + dy * dy;
                        
                        if (distSq > 40000) { // 200^2
                            p.vx += dx * 0.001;
                            p.vy += dy * 0.001;
                            
                            // Collapse superposition randomly
                            if (Math.random() < 0.02) {
                                p.superposition = false;
                                entangled.superposition = false;
                                
                                // Ensure opposite spin
                                entangled.spin = -p.spin;
                            }
                        }
                    }
                    
                    // Bounce off edges
                    if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                    break;
            }
        }
    }
    
    /**
     * Update neural network
     * @param {number} dt - Delta time in seconds
     */
    updateNeuralNetwork(dt) {
        // Activate input layer based on particle positions
        const inputLayer = this.neuralNetwork.layers[0];
        
        // Simple activation propagation
        for (let i = 0; i < this.neuralNetwork.layers.length - 1; i++) {
            const currentLayer = this.neuralNetwork.layers[i];
            const nextLayer = this.neuralNetwork.layers[i + 1];
            
            // Propagate activations forward
            for (let j = 0; j < nextLayer.length; j++) {
                let sum = 0;
                let connectionCount = 0;
                
                // Sum weighted inputs
                for (let k = 0; k < currentLayer.length; k++) {
                    for (const conn of currentLayer[k].connections) {
                        if (conn.target === j && conn.active) {
                            sum += currentLayer[k].activation * conn.weight;
                            connectionCount++;
                        }
                    }
                }
                
                if (connectionCount > 0) {
                    // Apply sigmoid activation function
                    nextLayer[j].activation = 1 / (1 + Math.exp(-sum / connectionCount));
                }
            }
        }
    }
    
    /**
     * Update vector field
     * @param {number} dt - Delta time in seconds
     */
    updateVectorField(dt) {
        const t = this.time * 0.5;
        
        // Update vector directions based on noise-like function
        for (const vector of this.vectorField.vectors) {
            const noiseX = Math.sin(vector.x * 0.01 + t) * Math.cos(vector.y * 0.01 + t);
            const noiseY = Math.sin(vector.y * 0.01 - t) * Math.cos(vector.x * 0.01 - t);
            
            vector.dx = noiseX;
            vector.dy = noiseY;
            
            const len = Math.sqrt(vector.dx * vector.dx + vector.dy * vector.dy);
            if (len > 0) {
                vector.dx /= len;
                vector.dy /= len;
            }
            
            // Vary magnitude
            vector.magnitude = 0.5 + 0.5 * Math.sin(t * 0.5 + vector.x * 0.01 + vector.y * 0.01);
        }
    }
    
    /**
     * Update system stats based on component interactions
     * @param {number} dt - Delta time in seconds
     */
    updateSystemStats(dt) {
        // Count active systems and calculate their contribution
        let activeCount = 0;
        if (this.particleSystem.active) activeCount++;
        if (this.neuralNetwork.active) activeCount++;
        if (this.vectorField.active) activeCount++;
        if (this.waveSystem.active) activeCount++;
        if (this.fractals.active) activeCount++;
        
        // Calculate system synergy based on active components
        const systemSynergy = activeCount / 5;
        
        // System energy affects all stats
        const energyFactor = this.sepCore.energy * 0.7;
        
        // Base stats calculations with component contributions
        let baseEfficiency = 0.2 + (energyFactor * 0.4) + (systemSynergy * 0.4);
        let baseCoherence = 0.3 + (energyFactor * 0.3) + (systemSynergy * 0.4);
        let baseEmergence = 0.1 + (energyFactor * 0.3) + (systemSynergy * 0.6);
        let baseStability = 0.4 + (energyFactor * 0.2) + (systemSynergy * 0.4);
        
        // Apply specific component contributions
        if (this.particleSystem.active) {
            baseEfficiency += 0.05;
            baseStability += 0.03;
        }
        
        if (this.neuralNetwork.active) {
            baseCoherence += 0.07;
            baseEmergence += 0.05;
        }
        
        if (this.vectorField.active) {
            baseEfficiency += 0.04;
            baseCoherence += 0.04;
        }
        
        if (this.waveSystem.active) {
            baseEmergence += 0.06;
            baseCoherence += 0.03;
        }
        
        if (this.fractals.active) {
            baseEmergence += 0.08;
            baseStability += 0.05;
        }
        
        // Add small random fluctuations for natural behavior
        const randomFactor = (stat) => (Math.random() - 0.5) * 0.02 * stat;
        
        // Update the stats with smooth interpolation
        this.systemStats.efficiency = this.math.lerp(
            this.systemStats.efficiency,
            this.math.clamp(baseEfficiency + randomFactor(baseEfficiency), 0, 1),
            dt * 2
        );
        
        this.systemStats.coherence = this.math.lerp(
            this.systemStats.coherence,
            this.math.clamp(baseCoherence + randomFactor(baseCoherence), 0, 1),
            dt * 2
        );
        
        this.systemStats.emergence = this.math.lerp(
            this.systemStats.emergence,
            this.math.clamp(baseEmergence + randomFactor(baseEmergence), 0, 1),
            dt * 2
        );
        
        this.systemStats.stability = this.math.lerp(
            this.systemStats.stability,
            this.math.clamp(baseStability + randomFactor(baseStability), 0, 1),
            dt * 2
        );
        
        // Update SEP core visual effects based on system stats
        this.updateCorePulses(dt);
    }
    
    /**
     * Update energy pulses emanating from the SEP core
     * @param {number} dt - Delta time in seconds
     */
    updateCorePulses(dt) {
        // Update existing pulses
        for (let i = this.sepCore.pulses.length - 1; i >= 0; i--) {
            const pulse = this.sepCore.pulses[i];
            
            // Expand the pulse
            pulse.radius += dt * pulse.speed * 60;
            
            // Fade out as it expands
            pulse.alpha = 1 - (pulse.radius / pulse.maxRadius);
            
            // Remove pulses that have expanded fully
            if (pulse.radius >= pulse.maxRadius) {
                this.sepCore.pulses.splice(i, 1);
            }
        }
        
        // Spontaneously create new pulses based on energy level and emergence
        if (Math.random() < 0.01 * this.sepCore.energy * this.systemStats.emergence) {
            this.createEnergyPulse();
        }
    }

    /**
     * Draw the scene - handles both normal and video modes
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw according to selected visualization
        switch (this.activeVisualization) {
            case 0:
                // All systems
                this.drawAllSystems();
                break;
            case 1:
                // SEP Core focus
                this.drawSepCoreDetailed();
                break;
            case 2:
                // Neural Network focus
                this.drawNeuralNetworkDetailed();
                break;
            case 3:
                // Vector Field focus
                this.drawVectorFieldDetailed();
                break;
            case 4:
                // Emergent Patterns focus
                this.drawEmergentPatterns();
                break;
            case 5:
                // Quantum Harmonics focus
                this.drawQuantumHarmonics();
                break;
        }
        
        // Always draw SEP core and connections
        this.drawSepCore();
        
        // Draw pulses
        this.drawPulses();
        
        // Draw info panel or video info
        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw all systems together
     */
    drawAllSystems() {
        if (this.vectorField.active) {
            this.drawVectorField();
        }
        
        if (this.waveSystem.active) {
            this.drawWaveSystem();
        }
        
        if (this.particleSystem.active) {
            this.drawParticles();
        }
        
        if (this.neuralNetwork.active) {
            this.drawNeuralNetwork();
        }
        
        if (this.fractals.active) {
            this.drawFractal(this.canvas.width / 2, this.canvas.height * 0.8, -Math.PI/2, 100, 0);
        }
    }
    
    /**
     * Draw particles
     */
    drawParticles() {
        for (const p of this.particleSystem.particles) {
            // Set color based on particle type
            let color;
            switch (p.type) {
                case 0: // Bouncing
                    color = p.color;
                    break;
                case 1: // Orbiting
                    color = `hsl(180, 70%, 50%)`;
                    break;
                case 2: // Flocking
                    color = `hsl(280, 70%, 50%)`;
                    break;
                case 3: // Wave
                    color = `hsl(120, 70%, 50%)`;
                    break;
                case 4: // Quantum
                    color = p.superposition ?
                        `rgba(0, 212, 255, 0.7)` :
                        p.spin > 0 ? `rgba(255, 0, 128, 0.9)` : `rgba(0, 255, 128, 0.9)`;
                    break;
            }
            
            // Draw based on particle type
            this.ctx.fillStyle = color;
            
            if (p.type === 4 && !p.superposition) {
                // Quantum particle (collapsed)
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw spin indicator
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(p.spin > 0 ? '↑' : '↓', p.x, p.y);
            } else if (p.type === 4) {
                // Quantum particle (superposition)
                this.ctx.globalAlpha = 0.7;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
            } else {
                // Regular particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw trail for some particle types
            if (p.type === 1 || p.type === 3) {
                this.ctx.strokeStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba');
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                
                const trailLength = 10;
                for (let i = 0; i < trailLength; i++) {
                    const t = this.time - i * 0.05;
                    let trailX, trailY;
                    
                    if (p.type === 1) {
                        // Orbit trail
                        const angle = p.phase + t * p.orbitSpeed;
                        trailX = p.centerX + Math.cos(angle) * p.orbitRadius;
                        trailY = p.centerY + Math.sin(angle) * p.orbitRadius;
                    } else {
                        // Wave trail
                        trailX = p.x - i * p.vx * 3;
                        trailY = p.y - i * p.vy * 3 + Math.sin(t * p.frequency + p.phase) * p.amplitude;
                    }
                    
                    if (i === 0) {
                        this.ctx.moveTo(trailX, trailY);
                    } else {
                        this.ctx.lineTo(trailX, trailY);
                    }
                }
                
                this.ctx.stroke();
            }
        }
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }
    
    /**
     * Draw neural network
     */
    drawNeuralNetwork() {
        const ctx = this.ctx;
        const layers = this.neuralNetwork.layers;
        const layerSpacing = this.canvas.width / (layers.length + 1);
        
        // Position neurons
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const x = (i + 1) * layerSpacing;
            const neuronSpacing = this.canvas.height / (layer.length + 1);
            
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                neuron.x = x;
                neuron.y = (j + 1) * neuronSpacing;
            }
        }
        
        // Draw connections
        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i];
            const nextLayer = layers[i + 1];
            
            for (let j = 0; j < currentLayer.length; j++) {
                const neuron = currentLayer[j];
                
                for (const conn of neuron.connections) {
                    if (conn.target < nextLayer.length) {
                        const targetNeuron = nextLayer[conn.target];
                        
                        // Determine connection color based on weight
                        let connColor;
                        if (conn.weight > 0) {
                            const intensity = Math.min(1, conn.weight);
                            connColor = `rgba(0, ${Math.floor(255 * intensity)}, 255, 0.3)`;
                        } else {
                            const intensity = Math.min(1, -conn.weight);
                            connColor = `rgba(255, 0, ${Math.floor(255 * intensity)}, 0.3)`;
                        }
                        
                        // Draw connection
                        ctx.strokeStyle = connColor;
                        ctx.lineWidth = Math.abs(conn.weight) * 3;
                        ctx.beginPath();
                        ctx.moveTo(neuron.x, neuron.y);
                        ctx.lineTo(targetNeuron.x, targetNeuron.y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Draw neurons
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                
                // Determine neuron color based on activation
                const activation = neuron.activation;
                const color = `rgb(${Math.floor(255 * (1 - activation))}, ${Math.floor(255 * activation)}, 255)`;
                
                // Draw neuron
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    /**
     * Draw vector field
     */
    drawVectorField() {
        const ctx = this.ctx;
        
        for (const vector of this.vectorField.vectors) {
            // Calculate vector endpoints
            const length = vector.magnitude * 10;
            const endX = vector.x + vector.dx * length;
            const endY = vector.y + vector.dy * length;
            
            // Determine color based on direction
            const angle = Math.atan2(vector.dy, vector.dx);
            const hue = ((angle + Math.PI) / (Math.PI * 2)) * 360;
            const color = `hsla(${hue}, 70%, 50%, 0.6)`;
            
            // Draw vector line
            ctx.strokeStyle = color;
            ctx.lineWidth = vector.magnitude * 2;
            ctx.beginPath();
            ctx.moveTo(vector.x, vector.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw arrowhead
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(endX, endY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Draw wave system
     */
    drawWaveSystem() {
        const ctx = this.ctx;
        const centerY = this.canvas.height / 2;
        
        // Draw each wave
        this.waveSystem.waves.forEach((wave, index) => {
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < this.canvas.width; x++) {
                const y = centerY + Math.sin(x * wave.frequency + this.time + wave.phase) * wave.amplitude;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        });
        
        // Draw interference pattern if enabled
        if (this.waveSystem.interference) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < this.canvas.width; x++) {
                let y = centerY;
                
                // Sum all waves
                this.waveSystem.waves.forEach(wave => {
                    y += Math.sin(x * wave.frequency + this.time + wave.phase) * wave.amplitude / this.waveSystem.waves.length;
                });
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    }
    
    /**
     * Draw fractal recursively
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} angle - Branch angle
     * @param {number} length - Branch length
     * @param {number} depth - Current recursion depth
     */
    drawFractal(x, y, angle, length, depth) {
        if (depth >= this.fractals.depth) return;
        
        const ctx = this.ctx;
        
        // Calculate endpoint
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // Draw branch
        ctx.strokeStyle = `hsl(${120 + depth * 30}, 70%, 50%)`;
        ctx.lineWidth = this.fractals.depth - depth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Recursive calls for branches
        const newLength = length * this.fractals.scaleFactor;
        const angleChange = this.fractals.angle;
        
        this.drawFractal(endX, endY, angle - angleChange, newLength, depth + 1);
        this.drawFractal(endX, endY, angle + angleChange, newLength, depth + 1);
    }
    
    /**
     * Draw SEP core and connections
     */
    drawSepCore() {
        const ctx = this.ctx;
        const core = this.sepCore;
        
        // Draw connections to systems
        core.connections.forEach(conn => {
            const pulse = Math.sin(conn.pulsePhase) * 0.5 + 0.5;
            
            // Determine color based on system type
            let color;
            switch (conn.system) {
                case 0: color = 'rgba(255, 170, 0, 0.6)'; break; // Particles
                case 1: color = 'rgba(0, 212, 255, 0.6)'; break; // Neural
                case 2: color = 'rgba(255, 0, 136, 0.6)'; break; // Vector
                case 3: color = 'rgba(0, 255, 136, 0.6)'; break; // Wave
                case 4: color = 'rgba(170, 0, 255, 0.6)'; break; // Fractal
            }
            
            // Draw connection line
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 + pulse * 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(core.x, core.y);
            ctx.lineTo(conn.x, conn.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw system node
            ctx.fillStyle = color.replace('0.6', '0.8');
            ctx.beginPath();
            ctx.arc(conn.x, conn.y, 10 + pulse * 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw system icon
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const icons = ['P', 'N', 'V', 'W', 'F'];
            ctx.fillText(icons[conn.system], conn.x, conn.y);
        });
        
        // Draw core glow
        const glow = ctx.createRadialGradient(
            core.x, core.y, 0,
            core.x, core.y, core.radius * 1.5
        );
        glow.addColorStop(0, `rgba(0, 255, 136, ${0.2 + core.energy * 0.5})`);
        glow.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = `rgb(0, ${Math.floor(128 + core.energy * 127)}, 136)`;
        ctx.beginPath();
        ctx.arc(core.x, core.y, core.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw energy pulses emanating from the core
        if (core.pulses && core.pulses.length > 0) {
            core.pulses.forEach(pulse => {
                // Create pulsing gradient
                const pulseGradient = ctx.createRadialGradient(
                    core.x, core.y, pulse.radius * 0.7,
                    core.x, core.y, pulse.radius
                );
                
                // Color based on system stats
                const r = Math.floor(255 * (1 - this.systemStats.stability));
                const g = Math.floor(255 * this.systemStats.efficiency);
                const b = Math.floor(255 * this.systemStats.coherence);
                
                pulseGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
                pulseGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${pulse.alpha * 0.3})`);
                pulseGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                // Draw pulse ring
                ctx.fillStyle = pulseGradient;
                ctx.beginPath();
                ctx.arc(core.x, core.y, pulse.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Draw core texture
        for (let i = 0; i < 3; i++) {
            const ringRadius = core.radius * (0.5 + i * 0.2);
            const ringRotation = core.rotation * (i % 2 === 0 ? 1 : -1);
            
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 + i * 0.2 + this.sepCore.energy * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let j = 0; j < 6; j++) {
                const angle = (j / 6) * Math.PI * 2 + ringRotation;
                const x = core.x + Math.cos(angle) * ringRadius;
                const y = core.y + Math.sin(angle) * ringRadius;
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    /**
     * Draw expanding pulses
     */
    drawPulses() {
        const ctx = this.ctx;
        
        for (const pulse of this.sepCore.pulses) {
            ctx.strokeStyle = `${pulse.color}${Math.floor(pulse.alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    /**
     * Draw detailed SEP core visualization
     */
    drawSepCoreDetailed() {
        const ctx = this.ctx;
        const core = this.sepCore;
        
        // Draw core components in detail
        // This would show the internal structure of the SEP core
        
        // Draw energy flows
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + this.time;
            const innerRadius = core.radius * 0.3;
            const outerRadius = core.radius * 0.9;
            
            const innerX = core.x + Math.cos(angle) * innerRadius;
            const innerY = core.y + Math.sin(angle) * innerRadius;
            const outerX = core.x + Math.cos(angle) * outerRadius;
            const outerY = core.y + Math.sin(angle) * outerRadius;
            
            // Draw energy line
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 + Math.sin(angle + this.time * 3) * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(innerX, innerY);
            ctx.lineTo(outerX, outerY);
            ctx.stroke();
            
            // Draw energy particle
            const particlePos = (Math.sin(this.time * 2 + i) + 1) / 2;
            const particleX = innerX + (outerX - innerX) * particlePos;
            const particleY = innerY + (outerY - innerY) * particlePos;
            
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw core layers
        for (let i = 0; i < 5; i++) {
            const radius = core.radius * (0.2 + i * 0.15);
            const rotation = this.time * (i % 2 === 0 ? 0.2 : -0.2);
            
            ctx.strokeStyle = `rgba(0, ${150 + i * 20}, 136, ${0.5 + i * 0.1})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // Draw geometric pattern
            const sides = 6 + i;
            for (let j = 0; j < sides; j++) {
                const angle = (j / sides) * Math.PI * 2 + rotation;
                const x = core.x + Math.cos(angle) * radius;
                const y = core.y + Math.sin(angle) * radius;
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
        }
        
        // Draw energy stats around core
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        const stats = [
            { name: 'Efficiency', value: this.systemStats.efficiency },
            { name: 'Coherence', value: this.systemStats.coherence },
            { name: 'Emergence', value: this.systemStats.emergence },
            { name: 'Stability', value: this.systemStats.stability }
        ];
        
        stats.forEach((stat, index) => {
            const angle = (index / stats.length) * Math.PI * 2;
            const x = core.x + Math.cos(angle) * (core.radius * 2);
            const y = core.y + Math.sin(angle) * (core.radius * 2);
            
            // Draw stat node
            ctx.fillStyle = `rgba(0, 255, 136, ${stat.value.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw stat text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(stat.name, x, y - 7);
            ctx.fillText(`${Math.floor(stat.value * 100)}%`, x, y + 12);
        });
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }
    
    /**
     * Draw detailed neural network visualization
     */
    drawNeuralNetworkDetailed() {
        // First draw the normal neural network
        this.drawNeuralNetwork();
        
        const ctx = this.ctx;
        const layers = this.neuralNetwork.layers;
        
        // Draw activation patterns
        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.beginPath();
        
        // Connect output layer activations with a spline
        const outputLayer = layers[layers.length - 1];
        ctx.moveTo(outputLayer[0].x, outputLayer[0].y);
        
        for (let i = 0; i < outputLayer.length; i++) {
            const current = outputLayer[i];
            const next = outputLayer[(i + 1) % outputLayer.length];
            
            const cp1x = current.x + (next.x - current.x) / 3;
            const cp1y = current.y + (next.y - current.y) / 6 + Math.sin(this.time + i) * 50;
            const cp2x = current.x + 2 * (next.x - current.x) / 3;
            const cp2y = next.y - (next.y - current.y) / 6 + Math.sin(this.time + i + 1) * 50;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        }
        
        ctx.fill();
        
        // Draw activation heat map
        const width = 200;
        const height = 100;
        const x = 50;
        const y = 50;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Draw activation bars for each layer
        const barWidth = width / layers.length;
        
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const layerX = x + i * barWidth;
            
            for (let j = 0; j < layer.length; j++) {
                const neuron = layer[j];
                const barHeight = (height / layer.length) * 0.8;
                const barY = y + (j / layer.length) * height + barHeight * 0.5;
                
                // Draw activation bar
                ctx.fillStyle = `rgb(${Math.floor(255 * (1 - neuron.activation))}, ${Math.floor(255 * neuron.activation)}, 255)`;
                ctx.fillRect(layerX, barY, barWidth * neuron.activation, barHeight);
                
                // Draw bar outline
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.strokeRect(layerX, barY, barWidth, barHeight);
            }
        }
        
        // Draw layer labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        ctx.fillText('Input', x + barWidth / 2, y + height + 15);
        ctx.fillText('Hidden', x + width / 2, y + height + 15);
        ctx.fillText('Output', x + width - barWidth / 2, y + height + 15);
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }
    
    /**
     * Draw detailed vector field visualization
     */
    drawVectorFieldDetailed() {
        // First draw the normal vector field
        this.drawVectorField();
        
        const ctx = this.ctx;
        
        // Draw flow streamlines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        // Start streamlines from random points
        for (let i = 0; i < 20; i++) {
            let x = Math.random() * this.canvas.width;
            let y = Math.random() * this.canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // Follow vector field for streamline
            for (let j = 0; j < 100; j++) {
                // Find closest vector
                let closestDist = Infinity;
                let closestVector = null;
                
                for (const vector of this.vectorField.vectors) {
                    const dist = Math.hypot(vector.x - x, vector.y - y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestVector = vector;
                    }
                }
                
                if (closestVector) {
                    // Move along vector direction
                    x += closestVector.dx * 5;
                    y += closestVector.dy * 5;
                    
                    // Stop if out of bounds
                    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
                        break;
                    }
                    
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Draw curl map
        const width = 200;
        const height = 200;
        const x = this.canvas.width - width - 50;
        const y = this.canvas.height - height - 50;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('Vector Field Analysis', x + 10, y + 20);
        
        // Draw curl visualization
        const cellSize = 10;
        for (let i = 0; i < width / cellSize; i++) {
            for (let j = 0; j < height / cellSize; j++) {
                const fieldX = (i / (width / cellSize)) * this.canvas.width;
                const fieldY = (j / (height / cellSize)) * this.canvas.height;
                
                // Find closest vector
                let closestDist = Infinity;
                let closestVector = null;
                
                for (const vector of this.vectorField.vectors) {
                    const dist = Math.hypot(vector.x - fieldX, vector.y - fieldY);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestVector = vector;
                    }
                }
                
                if (closestVector) {
                    // Fake curl calculation (just for visualization)
                    const curl = closestVector.dx * closestVector.dy * Math.sin(this.time + i + j);
                    
                    // Map curl to color
                    let color;
                    if (curl > 0) {
                        color = `rgba(255, 0, 0, ${Math.min(1, Math.abs(curl))})`;
                    } else {
                        color = `rgba(0, 0, 255, ${Math.min(1, Math.abs(curl))})`;
                    }
                    
                    ctx.fillStyle = color;
                    ctx.fillRect(x + i * cellSize, y + 30 + j * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Draw legend
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(x + 10, y + height - 40, 20, 10);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
        ctx.fillRect(x + 10, y + height - 20, 20, 10);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Clockwise', x + 40, y + height - 32);
        ctx.fillText('Counter-clockwise', x + 40, y + height - 12);
    }
    
    /**
     * Draw emergent patterns visualization
     */
    drawEmergentPatterns() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw cellular automaton-like patterns
        const cellSize = 20;
        const cols = Math.ceil(width / cellSize);
        const rows = Math.ceil(height / cellSize);
        
        // Generate pattern based on wave functions
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * cellSize;
                const y = j * cellSize;
                
                // Create pattern based on multiple wave interference
                const wx = x / width;
                const wy = y / height;
                
                const v1 = Math.sin(wx * 20 + this.time * 0.5) * Math.cos(wy * 20 + this.time * 0.3);
                const v2 = Math.sin((wx + wy) * 15 + this.time * 0.2);
                const v3 = Math.sin(Math.sqrt(wx*wx + wy*wy) * 30 - this.time * 0.4);
                
                const value = (v1 + v2 + v3) / 3;
                
                // Map value to color
                let r, g, b;
                if (value > 0.2) {
                    r = 0;
                    g = Math.floor(255 * Math.min(1, value));
                    b = 136;
                } else if (value < -0.2) {
                    r = 255;
                    g = 0;
                    b = Math.floor(136 * Math.min(1, -value));
                } else {
                    r = 0;
                    g = 0;
                    b = 0;
                }
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, cellSize, cellSize);
                
                // Draw cell border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
        
        // Draw particles on top
        this.drawParticles();
    }
    
    /**
     * Draw quantum harmonics visualization
     */
    drawQuantumHarmonics() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw quantum probability waves
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            const yOffset = height / 2 + (i - 2) * 50;
            const amplitude = 40 * Math.exp(-Math.abs(i - 2));
            const frequency = 0.02 + i * 0.005;
            
            ctx.beginPath();
            
            for (let x = 0; x < width; x++) {
                const y = yOffset + Math.sin(x * frequency + this.time) * amplitude *
                         Math.exp(-Math.pow((x - width/2) / (width/4), 2));
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Draw interference pattern
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        
        for (let x = 0; x < width; x += 5) {
            for (let y = 0; y < height; y += 5) {
                const dx = x - width/2;
                const dy = y - height/2;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                const v1 = Math.sin(dist * 0.05 + this.time);
                const v2 = Math.sin(dist * 0.03 - this.time * 0.7);
                const interference = (v1 * v2) * 0.5 + 0.5;
                
                if (interference > 0.7) {
                    ctx.fillRect(x, y, 4, 4);
                }
            }
        }
        
        // Draw quantum particles
        for (const p of this.particleSystem.particles) {
            if (p.type === 4) {
                // Only draw quantum particles
                if (p.superposition) {
                    // Superposition state
                    ctx.globalAlpha = 0.7;
                    ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw probability cloud
                    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4 + Math.sin(this.time + p.phase) * 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                } else {
                    // Collapsed state
                    ctx.fillStyle = p.spin > 0 ? 'rgba(255, 0, 128, 0.9)' : 'rgba(0, 255, 128, 0.9)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw spin indicator
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(p.spin > 0 ? '↑' : '↓', p.x, p.y);
                }
                
                // Draw entanglement lines
                if (p.entangled < this.particleSystem.particles.length) {
                    const entangled = this.particleSystem.particles[p.entangled];
                    
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(entangled.x, entangled.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    
                    // Draw entanglement indicator
                    const midX = (p.x + entangled.x) / 2;
                    const midY = (p.y + entangled.y) / 2;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.beginPath();
                    ctx.arc(midX, midY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
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
        ctx.fillText('SEP Unified System', 30, 45);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaaaaa';
        
        // Show current visualization mode
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Mode: ${this.visualizationNames[this.activeVisualization]}`, 30, 70);
        
        // Show system stats
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Efficiency: ${Math.floor(this.systemStats.efficiency * 100)}%`, 30, 95);
        ctx.fillText(`Coherence: ${Math.floor(this.systemStats.coherence * 100)}%`, 30, 115);
        ctx.fillText(`Emergence: ${Math.floor(this.systemStats.emergence * 100)}%`, 30, 135);
        ctx.fillText(`Stability: ${Math.floor(this.systemStats.stability * 100)}%`, 30, 155);
        
        // Show controls
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Keys 1-6: Change visualization, Double-click: Pulse', 30, 180);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        
        // Show current visualization mode
        ctx.fillText(this.visualizationNames[this.activeVisualization], canvas.width - 20, 30);
        
        // Show active systems count
        let activeCount = 0;
        if (this.particleSystem.active) activeCount++;
        if (this.neuralNetwork.active) activeCount++;
        if (this.vectorField.active) activeCount++;
        if (this.waveSystem.active) activeCount++;
        if (this.fractals.active) activeCount++;
        
        ctx.fillText(`Active Systems: ${activeCount}/5`, canvas.width - 20, 60);
        
        // Show system emergence
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Emergence: ${Math.floor(this.systemStats.emergence * 100)}%`, canvas.width - 20, 90);
        
        ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    /**
     * Clean up resources when scene is unloaded
     */
   /**
    * Add scene-specific controls to the interactive controller
    */
   addSceneSpecificControls() {
       if (!this.controller || !this.controller.components.controlPanel) return;
       
       const panel = this.controller.components.controlPanel;
       const utils = this.controller.interactiveUtils;
       
       // Add visualization mode selector
       const visualizationSelector = utils.createDropdown({
           id: 'visualization_selector',
           x: panel.x + 15,
           y: panel.y + 140,
           width: panel.width - 30,
           height: 30,
           labelText: 'Visualization Mode',
           options: this.visualizationNames,
           selectedIndex: this.activeVisualization,
           onChange: (index) => {
               this.activeVisualization = index;
           },
           tooltip: 'Select different visualization modes to focus on specific aspects of the SEP system'
       });
       
       panel.addChild(visualizationSelector);
       this.controller.components.controls.push(visualizationSelector);
       
       // Add system component toggles
       const componentLabels = ['Particles', 'Neural Network', 'Vector Field', 'Wave System', 'Fractals'];
       const componentKeys = ['particleSystem', 'neuralNetwork', 'vectorField', 'waveSystem', 'fractals'];
       
       // Create toggle group header
       const toggleHeader = utils.createLabel({
           id: 'toggle_header',
           x: panel.x + 15,
           y: panel.y + 180,
           width: panel.width - 30,
           height: 20,
           text: 'System Components',
           color: utils.styles.secondary
       });
       
       panel.addChild(toggleHeader);
       this.controller.components.controls.push(toggleHeader);
       
       // Create toggles for each component
       componentLabels.forEach((label, index) => {
           const toggle = utils.createToggle({
               id: `toggle_${componentKeys[index]}`,
               x: panel.x + 15,
               y: panel.y + 210 + (index * 35),
               width: panel.width - 30,
               height: 30,
               labelText: label,
               value: this[componentKeys[index]].active,
               onChange: (value) => {
                   this[componentKeys[index]].active = value;
                   this.updateSystemStats(0.1); // Update stats with the new configuration
               },
               tooltip: `Toggle the ${label} subsystem on/off`
           });
           
           panel.addChild(toggle);
           this.controller.components.controls.push(toggle);
       });
       
       // Add SEP core energy slider
       const energySlider = utils.createSlider({
           id: 'core_energy_slider',
           x: panel.x + 15,
           y: panel.y + 390,
           width: panel.width - 30,
           height: 30,
           min: 0,
           max: 1,
           value: this.sepCore.energy,
           step: 0.01,
           labelText: 'Core Energy',
           onChange: (value) => {
               this.sepCore.energy = value;
               this.updateSystemStats(0.1); // Update stats with the new energy level
           },
           tooltip: 'Adjust the energy level of the SEP core'
       });
       
       panel.addChild(energySlider);
       this.controller.components.controls.push(energySlider);
       
       // Add Pulse button
       const pulseButton = utils.createButton({
           id: 'pulse_button',
           x: panel.x + 15,
           y: panel.y + 430,
           width: panel.width - 30,
           height: 40,
           text: 'Send Energy Pulse',
           onClick: () => {
               this.createEnergyPulse();
           },
           tooltip: 'Send an energy pulse through the system'
       });
       
       panel.addChild(pulseButton);
       this.controller.components.controls.push(pulseButton);
       
       // Add interactive elements to the scene
       this.addInteractiveSceneElements();
   }
   
   /**
    * Add interactive elements directly to the scene (not in the control panel)
    */
   addInteractiveSceneElements() {
       if (!this.controller) return;
       
       const utils = this.controller.interactiveUtils;
       
       // Create a draggable SEP core
       const sepCoreDraggable = utils.createDraggable({
           id: 'sep_core',
           x: this.canvas.width / 2,
           y: this.canvas.height / 2,
           width: this.sepCore.radius * 2,
           height: this.sepCore.radius * 2,
           color: 'transparent',
           draggable: true,
           onDrag: (dx, dy, x, y) => {
               this.sepCore.x = x;
               this.sepCore.y = y;
           },
           tooltip: 'Drag to move the SEP core'
       });
       
       this.controller.components.sceneElements.push(sepCoreDraggable);
       
       // Create interactive system stat nodes
       const stats = [
           { name: 'Efficiency', value: this.systemStats.efficiency, key: 'efficiency' },
           { name: 'Coherence', value: this.systemStats.coherence, key: 'coherence' },
           { name: 'Emergence', value: this.systemStats.emergence, key: 'emergence' },
           { name: 'Stability', value: this.systemStats.stability, key: 'stability' }
       ];
       
       stats.forEach((stat, index) => {
           const angle = (index / stats.length) * Math.PI * 2;
           const x = this.canvas.width / 2 + Math.cos(angle) * (this.sepCore.radius * 2);
           const y = this.canvas.height / 2 + Math.sin(angle) * (this.sepCore.radius * 2);
           
           const statNode = utils.createDraggable({
               id: `stat_node_${stat.key}`,
               x: x,
               y: y,
               width: 60,
               height: 60,
               color: 'transparent',
               draggable: true,
               onDrag: (dx, dy, x, y) => {
                   // Calculate new angle from SEP core to dragged position
                   const newAngle = Math.atan2(y - this.sepCore.y, x - this.sepCore.x);
                   // Calculate new distance from SEP core (clamped to reasonable range)
                   const distance = Math.min(Math.max(
                       this.math.distance(x, y, this.sepCore.x, this.sepCore.y),
                       this.sepCore.radius * 1.5
                   ), this.sepCore.radius * 3);
                   
                   // Update node position
                   statNode.x = this.sepCore.x + Math.cos(newAngle) * distance;
                   statNode.y = this.sepCore.y + Math.sin(newAngle) * distance;
                   
                   // Update system stats based on distance from center
                   // Closer to the core = higher value
                   const normalizedDistance = 1 - ((distance - this.sepCore.radius * 1.5) / (this.sepCore.radius * 1.5));
                   this.systemStats[stat.key] = Math.max(0, Math.min(1, normalizedDistance));
               },
               tooltip: `Drag to adjust ${stat.name}`
           });
           
           this.controller.components.sceneElements.push(statNode);
       });
   }
   
   /**
    * Create an energy pulse from the SEP core
    */
   createEnergyPulse() {
       const pulse = {
           x: this.sepCore.x,
           y: this.sepCore.y,
           radius: this.sepCore.radius * 0.2,
           maxRadius: this.sepCore.radius * 5,
           alpha: 1,
           speed: 2 + Math.random() * 2
       };
       
       this.sepCore.pulses.push(pulse);
       
       // Boost system stats temporarily
       Object.keys(this.systemStats).forEach(key => {
           this.systemStats[key] = Math.min(1, this.systemStats[key] + 0.1);
       });
   }
   
   /**
    * Handle keyboard input
    * @param {KeyboardEvent} event - The keyboard event
    */
   handleKeyDown(event) {
       // Number keys 1-6 to change visualization mode
       if (event.key >= '1' && event.key <= '6') {
           const mode = parseInt(event.key) - 1;
           if (mode >= 0 && mode < this.visualizationNames.length) {
               this.activeVisualization = mode;
           }
       }
       
       // Space bar to send an energy pulse
       if (event.key === ' ' || event.key === 'Space') {
           this.createEnergyPulse();
       }
   }
   
   /**
    * Handle mouse movement
    * @param {MouseEvent} event - The mouse event
    */
   handleMouseMove(event) {
       // This handler is mostly for tracking mouse position
       // The interactive controller handles component interactions
       const rect = this.canvas.getBoundingClientRect();
       this.mouseX = event.clientX - rect.left;
       this.mouseY = event.clientY - rect.top;
   }
   
   /**
    * Handle mouse clicks
    * @param {MouseEvent} event - The mouse event
    */
   handleMouseClick(event) {
       const rect = this.canvas.getBoundingClientRect();
       const x = event.clientX - rect.left;
       const y = event.clientY - rect.top;
       
       // Double click detection
       const now = Date.now();
       const isDoubleClick = now - this.lastClickTime < 300;
       this.lastClickTime = now;
       
       // Double click on the SEP core creates an energy pulse
       if (isDoubleClick) {
           const distance = this.math.distance(x, y, this.sepCore.x, this.sepCore.y);
           if (distance <= this.sepCore.radius) {
               this.createEnergyPulse();
           }
       }
   }
   
   /**
    * Clean up resources when scene is unloaded
    */
   cleanup() {
       window.removeEventListener('keydown', this.handleKeyDown);
       this.canvas.removeEventListener('mousemove', this.handleMouseMove);
       this.canvas.removeEventListener('click', this.handleMouseClick);
       
       // Clean up the interactive controller
       if (this.controller) {
           this.controller.cleanup();
           this.controller = null;
       }
       
       // Clear arrays to free memory
       this.particleSystem.particles = [];
       this.sepCore.connections = [];
       this.sepCore.pulses = [];
   }
}