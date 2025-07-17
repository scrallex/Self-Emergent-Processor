/**
 * Scene 12: Reality's Code
 *
 * A meta-visualization that combines elements from all previous scenes.
 * Features angles modulating in the center with boundaries containing emergence,
 * primes as foundation points, and coherence waves propagating throughout.
 */

// Import utilities and elements from other scenes for reuse
import LogoGenerator from '../utils/logo-generator.js';

export default class Scene12 {
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
        
        // SEP logo properties
        this.logo = {
            x: 0,
            y: 0,
            size: 120,
            rotation: 0,
            pulsePhase: 0
        };

        // Create logo generator
        this.logoGenerator = new LogoGenerator({
            size: this.logo.size,
            color: '#00ff88',
            secondaryColor: '#00d4ff',
            accentColor: '#ff00ff',
            waveCount: 5,
            waveSpeed: 1.5,
            waveAmplitude: 0.7
        });
        
        // Scene elements from previous scenes
        this.elements = {
            waves: {
                amplitude: 20,
                frequency: 0.5,
                phase: 0
            },
            angles: {
                value: Math.PI / 4,
                classification: 'acute'
            },
            billiards: {
                particles: [],
                collisionCount: 0
            },
            boundary: {
                tangentValue: 0,
                springForce: 0
            },
            bodies: {
                positions: [],
                trajectories: []
            },
            primes: {
                spiral: [],
                highlightedPrimes: []
            },
            boids: {
                flock: [],
                alignment: 0
            },
            grid: {
                states: [],
                ruptures: []
            },
            fluid: {
                particles: [],
                vorticity: 0
            },
            financial: {
                surface: [],
                comparison: 0
            }
        };
        
        // Coherence waves
        this.coherenceWaves = [];
        
        // View settings
        this.activeZone = null;
        this.zoomLevel = 1;
        this.showConnections = true;
        this.highlightFoundation = false;
        
        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.isDragging = false;
        
        // Bind event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Initialize the scene - called once when the scene is loaded
     * @return {Promise} A promise that resolves when initialization is complete
     */
    init() {
        // Set up event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('keydown', this.handleKeyDown);
        
        // Initialize SEP logo at center
        this.logo.x = this.canvas.width / 2;
        this.logo.y = this.canvas.height / 2;
        
        // Initialize elements from previous scenes
        this.initializeWaves();
        this.initializeAngles();
        this.initializeBilliards();
        this.initializeBoundary();
        this.initializeBodies();
        this.initializePrimes();
        this.initializeBoids();
        this.initializeGrid();
        this.initializeFluid();
        this.initializeFinancial();
        
        // Initialize coherence waves
        this.generateCoherenceWave();
        
        return Promise.resolve();
    }
    
    /**
     * Initialize wave elements (Scene 1)
     */
    initializeWaves() {
        // Simple wave initialization
        this.elements.waves.values = Array(100).fill(0);
    }
    
    /**
     * Initialize angle elements (Scene 2)
     */
    initializeAngles() {
        // Setup angles for protractor visualization
        this.elements.angles.vectors = [
            { x: 40, y: 0 },
            { x: 30, y: 30 }
        ];
    }
    
    /**
     * Initialize billiard elements (Scene 3, 6)
     */
    initializeBilliards() {
        // Create a few billiard particles
        for (let i = 0; i < 3; i++) {
            this.elements.billiards.particles.push({
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                radius: 5 + Math.random() * 5
            });
        }
    }
    
    /**
     * Initialize boundary elements (Scene 4)
     */
    initializeBoundary() {
        // Setup boundary values
        this.elements.boundary.values = Array(100).fill(0);
    }
    
    /**
     * Initialize three-body elements (Scene 5)
     */
    initializeBodies() {
        // Setup three bodies
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            this.elements.bodies.positions.push({
                x: Math.cos(angle) * 50,
                y: Math.sin(angle) * 50,
                mass: 5 + i * 3
            });
            this.elements.bodies.trajectories.push([]);
        }
    }
    
    /**
     * Initialize prime elements (Scene 7)
     */
    initializePrimes() {
        // Generate some prime points
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        for (const prime of primes) {
            const angle = prime * 0.1;
            const radius = Math.sqrt(prime) * 5;
            this.elements.primes.spiral.push({
                value: prime,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
    }
    
    /**
     * Initialize boid elements (Scene 8)
     */
    initializeBoids() {
        // Create a small flock of boids
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.elements.boids.flock.push({
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2
            });
        }
    }
    
    /**
     * Initialize grid elements (Scene 9)
     */
    initializeGrid() {
        // Create a 4x4 state grid
        this.elements.grid.states = [];
        for (let i = 0; i < 4; i++) {
            const row = [];
            for (let j = 0; j < 4; j++) {
                row.push(Math.random() > 0.5 ? 1 : 0);
            }
            this.elements.grid.states.push(row);
        }
    }
    
    /**
     * Initialize fluid elements (Scene 10)
     */
    initializeFluid() {
        // Create some fluid particles
        for (let i = 0; i < 20; i++) {
            this.elements.fluid.particles.push({
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                vorticity: Math.random()
            });
        }
    }
    
    /**
     * Initialize financial elements (Scene 11)
     */
    initializeFinancial() {
        // Create a simple price surface
        this.elements.financial.surface = [];
        for (let i = 0; i < 5; i++) {
            const row = [];
            for (let j = 0; j < 5; j++) {
                row.push(Math.sin(i/2) * Math.cos(j/2) * 10 + 20);
            }
            this.elements.financial.surface.push(row);
        }
    }
    
    /**
     * Generate a new coherence wave from the center
     */
    generateCoherenceWave() {
        this.coherenceWaves.push({
            x: this.logo.x,
            y: this.logo.y,
            radius: 10,
            maxRadius: Math.max(this.canvas.width, this.canvas.height),
            strength: 0.8 + Math.random() * 0.2,
            color: `hsla(${Math.random() * 60 + 170}, 100%, 50%, 0.4)`
        });
    }
    
    /**
     * Handle mouse movement for interactive highlighting
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if hovering over any zone
        this.checkActiveZone();
    }
    
    /**
     * Handle mouse down for interaction
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseDown(e) {
        this.isDragging = true;
        
        // Get mouse position
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if we clicked on any particular zone
        const zonePositions = this.calculateZonePositions();
        let clickedZone = null;
        let minDist = Infinity;

        // Find the closest zone
        for (const zone in zonePositions) {
            const pos = zonePositions[zone];
            const dist = Math.hypot(pos.x - mouseX, pos.y - mouseY);

            if (dist < 80 && dist < minDist) { // Within 80px radius
                minDist = dist;
                clickedZone = zone;
            }
        }

        if (clickedZone) {
            // Generate a special coherence wave from the clicked zone
            const pos = zonePositions[clickedZone];
            this.coherenceWaves.push({
                x: pos.x,
                y: pos.y,
                radius: 10,
                maxRadius: Math.max(this.canvas.width, this.canvas.height),
                strength: 0.9 + Math.random() * 0.1,
                color: this.getZoneColor(clickedZone)
            });

            // Special interactions based on which zone was clicked
            this.triggerZoneInteraction(clickedZone);
        } else {
            // Generate a standard coherence wave from the center
            this.generateCoherenceWave();
        }
    }

    /**
     * Get color for a specific zone
     * @param {string} zone - Zone name
     * @returns {string} - HSLA color string
     */
    getZoneColor(zone) {
        const colors = {
            'waves': 'hsla(200, 100%, 50%, 0.4)',
            'angles': 'hsla(40, 100%, 50%, 0.4)',
            'billiards': 'hsla(220, 100%, 50%, 0.4)',
            'boundary': 'hsla(270, 100%, 50%, 0.4)',
            'bodies': 'hsla(30, 100%, 50%, 0.4)',
            'primes': 'hsla(140, 100%, 50%, 0.4)',
            'boids': 'hsla(210, 100%, 50%, 0.4)',
            'grid': 'hsla(150, 100%, 50%, 0.4)',
            'fluid': 'hsla(260, 100%, 50%, 0.4)',
            'financial': 'hsla(40, 100%, 50%, 0.4)',
            'logo': 'hsla(300, 100%, 50%, 0.4)'
        };

        return colors[zone] || 'hsla(170, 100%, 50%, 0.4)';
    }

    /**
     * Trigger special interactions based on clicked zone
     * @param {string} zone - Zone name
     */
    triggerZoneInteraction(zone) {
        // Apply special effects to create a cohesive meta-visualization
        switch (zone) {
            case 'waves':
                // Increase amplitude of all waves temporarily
                this.elements.waves.amplitude *= 1.5;
                setTimeout(() => { this.elements.waves.amplitude /= 1.5; }, 1000);
                break;

            case 'angles':
                // Trigger angle changes in various elements
                for (let i = 0; i < this.elements.bodies.positions.length; i++) {
                    const body = this.elements.bodies.positions[i];
                    // Add a small impulse to change trajectory
                    body.x += (Math.random() - 0.5) * 10;
                    body.y += (Math.random() - 0.5) * 10;
                }
                break;

            case 'billiards':
                // Add energy to billiard particles
                for (const particle of this.elements.billiards.particles) {
                    particle.vx *= 1.5;
                    particle.vy *= 1.5;
                }
                break;

            case 'boundary':
                // Increase spring force and affect grid
                this.elements.boundary.springForce *= 1.5;
                setTimeout(() => { this.elements.boundary.springForce /= 1.5; }, 1000);

                // Random grid ruptures
                for (let i = 0; i < 2; i++) {
                    const gridI = Math.floor(Math.random() * 4);
                    const gridJ = Math.floor(Math.random() * 4);
                    this.elements.grid.states[gridI][gridJ] = 1 - this.elements.grid.states[gridI][gridJ];
                    this.elements.grid.ruptures.push({
                        i: gridI,
                        j: gridJ,
                        time: 0
                    });
                }
                break;

            case 'bodies':
                // Affect fluid dynamics
                for (const particle of this.elements.fluid.particles) {
                    particle.vorticity *= -1; // Reverse vorticity
                }
                break;

            case 'primes':
                // Highlight random primes
                for (let i = 0; i < 3; i++) {
                    const randomIndex = Math.floor(Math.random() * this.elements.primes.spiral.length);
                    this.elements.primes.highlightedPrimes.push({
                        index: randomIndex,
                        time: 0
                    });
                }
                break;

            case 'boids':
                // Increase alignment temporarily
                this.elements.boids.alignment = Math.min(1, this.elements.boids.alignment + 0.3);
                setTimeout(() => {
                    this.elements.boids.alignment = Math.max(0, this.elements.boids.alignment - 0.3);
                }, 1000);
                break;

            case 'grid':
                // Create rupture pattern
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if ((i + j) % 2 === 0) {
                            this.elements.grid.states[i][j] = 1 - this.elements.grid.states[i][j];
                            this.elements.grid.ruptures.push({
                                i: i,
                                j: j,
                                time: 0
                            });
                        }
                    }
                }
                break;

            case 'fluid':
                // Affect particles and create vortex
                for (const particle of this.elements.billiards.particles) {
                    // Add vortex movement
                    const dx = particle.x;
                    const dy = particle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    const force = 5 / (dist + 10);

                    particle.vx -= Math.sin(angle) * force;
                    particle.vy += Math.cos(angle) * force;
                }
                break;

            case 'financial':
                // Create wave pattern in financial surface
                for (let i = 0; i < this.elements.financial.surface.length; i++) {
                    for (let j = 0; j < this.elements.financial.surface[i].length; j++) {
                        this.elements.financial.surface[i][j] += Math.sin(i + j + this.time * 5) * 5;
                    }
                }
                break;

            case 'logo':
                // Generate multiple waves from center
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.generateCoherenceWave();
                    }, i * 200);
                }
                break;
        }
    }
    
    /**
     * Handle mouse up
     * @param {MouseEvent} e - The mouse event
     */
    handleMouseUp(e) {
        this.isDragging = false;
    }
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'c':
                // Toggle connections
                this.showConnections = !this.showConnections;
                break;
            case 'f':
                // Toggle foundation highlighting
                this.highlightFoundation = !this.highlightFoundation;
                break;
            case 'r':
                // Reset view
                this.zoomLevel = 1;
                this.activeZone = null;
                break;
            case 'w':
                // Generate wave
                this.generateCoherenceWave();
                break;
        }
    }
    
    /**
     * Check if mouse is over an interactive zone
     */
    checkActiveZone() {
        // Check distance to center (logo)
        const distToLogo = Math.hypot(this.mouseX - this.logo.x, this.mouseY - this.logo.y);
        if (distToLogo < this.logo.size / 2) {
            this.activeZone = 'logo';
            return;
        }
        
        // Otherwise, calculate which zone we're in based on position
        const angle = Math.atan2(this.mouseY - this.logo.y, this.mouseX - this.logo.x);
        const sector = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 10);
        
        // Map sector to scene
        const zones = ['waves', 'angles', 'billiards', 'boundary', 'bodies', 
                      'primes', 'boids', 'grid', 'fluid', 'financial'];
        this.activeZone = zones[sector];
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
     * Update scene state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        // Update SEP logo
        this.logo.rotation += dt * 0.1;
        this.logo.pulsePhase += dt * 0.5;
        
        // Update logo generator
        this.logoGenerator.update(dt);
        
        // Generate new coherence waves occasionally
        if (Math.random() < dt * 0.2) {
            this.generateCoherenceWave();
        }
        
        // Update existing coherence waves
        for (let i = this.coherenceWaves.length - 1; i >= 0; i--) {
            const wave = this.coherenceWaves[i];
            wave.radius += dt * 100;
            
            // Remove waves that have expanded beyond the screen
            if (wave.radius > wave.maxRadius) {
                this.coherenceWaves.splice(i, 1);
            }
        }
        
        // Update elements from previous scenes
        this.updateWaves(dt);
        this.updateAngles(dt);
        this.updateBilliards(dt);
        this.updateBoundary(dt);
        this.updateBodies(dt);
        this.updatePrimes(dt);
        this.updateBoids(dt);
        this.updateGrid(dt);
        this.updateFluid(dt);
        this.updateFinancial(dt);
    }
    
    /**
     * Update wave elements
     * @param {number} dt - Delta time
     */
    updateWaves(dt) {
        // Update wave pattern
        this.elements.waves.phase += dt;
        for (let i = 0; i < this.elements.waves.values.length; i++) {
            const x = i / this.elements.waves.values.length;
            this.elements.waves.values[i] = 
                Math.sin(x * this.elements.waves.frequency * 20 + this.elements.waves.phase) * 
                this.elements.waves.amplitude;
        }
    }
    
    /**
     * Update angle elements
     * @param {number} dt - Delta time
     */
    updateAngles(dt) {
        // Rotate angle slowly
        const angle = this.time * 0.1;
        this.elements.angles.vectors[1].x = Math.cos(angle) * 40;
        this.elements.angles.vectors[1].y = Math.sin(angle) * 40;
        
        // Calculate angle classification
        const v1 = this.elements.angles.vectors[0];
        const v2 = this.elements.angles.vectors[1];
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        const cosAngle = dot / (mag1 * mag2);
        const angle_rad = Math.acos(cosAngle);
        
        this.elements.angles.value = angle_rad;
        
        if (angle_rad < Math.PI / 4) {
            this.elements.angles.classification = 'acute';
        } else if (angle_rad < Math.PI / 2) {
            this.elements.angles.classification = 'acute';
        } else if (angle_rad === Math.PI / 2) {
            this.elements.angles.classification = 'right';
        } else {
            this.elements.angles.classification = 'obtuse';
        }
    }
    
    /**
     * Update billiard elements
     * @param {number} dt - Delta time
     */
    updateBilliards(dt) {
        // Move billiard particles
        for (const particle of this.elements.billiards.particles) {
            particle.x += particle.vx * dt * 20;
            particle.y += particle.vy * dt * 20;
            
            // Simple bounds checking
            if (Math.abs(particle.x) > 50) {
                particle.vx *= -1;
                this.elements.billiards.collisionCount++;
            }
            if (Math.abs(particle.y) > 50) {
                particle.vy *= -1;
                this.elements.billiards.collisionCount++;
            }
        }
    }
    
    /**
     * Update boundary elements
     * @param {number} dt - Delta time
     */
    updateBoundary(dt) {
        // Update boundary values (tangent curve)
        for (let i = 0; i < this.elements.boundary.values.length; i++) {
            const x = (i / this.elements.boundary.values.length) * Math.PI - Math.PI/2;
            this.elements.boundary.values[i] = Math.tan(x + Math.sin(this.time * 0.2) * 0.2);
        }
        
        // Calculate spring force
        const angle = Math.PI/2 - Math.abs(Math.sin(this.time * 0.2) * 0.2);
        this.elements.boundary.tangentValue = Math.tan(angle);
        this.elements.boundary.springForce = 1 / Math.cos(angle);
    }
    
    /**
     * Update three-body elements
     * @param {number} dt - Delta time
     */
    updateBodies(dt) {
        // Simplified orbital motion
        for (let i = 0; i < this.elements.bodies.positions.length; i++) {
            const body = this.elements.bodies.positions[i];
            const angle = this.time * 0.2 + (i * Math.PI * 2) / 3;
            body.x = Math.cos(angle) * (30 + i * 10);
            body.y = Math.sin(angle) * (30 + i * 10);
            
            // Record trajectory
            if (this.time % 0.1 < dt) {
                this.elements.bodies.trajectories[i].push({x: body.x, y: body.y});
                if (this.elements.bodies.trajectories[i].length > 50) {
                    this.elements.bodies.trajectories[i].shift();
                }
            }
        }
    }
    
    /**
     * Update prime elements
     * @param {number} dt - Delta time
     */
    updatePrimes(dt) {
        // Rotate the entire spiral
        const rotation = this.time * 0.05;
        for (const point of this.elements.primes.spiral) {
            const radius = Math.sqrt(point.value) * 5;
            const angle = point.value * 0.1 + rotation;
            point.x = Math.cos(angle) * radius;
            point.y = Math.sin(angle) * radius;
        }
        
        // Highlight random primes occasionally
        if (Math.random() < dt * 0.5) {
            const randomIndex = Math.floor(Math.random() * this.elements.primes.spiral.length);
            this.elements.primes.highlightedPrimes.push({
                index: randomIndex,
                time: 0
            });
        }
        
        // Update highlights
        for (let i = this.elements.primes.highlightedPrimes.length - 1; i >= 0; i--) {
            const highlight = this.elements.primes.highlightedPrimes[i];
            highlight.time += dt;
            if (highlight.time > 1) {
                this.elements.primes.highlightedPrimes.splice(i, 1);
            }
        }
    }
    
    /**
     * Update boid elements
     * @param {number} dt - Delta time
     */
    updateBoids(dt) {
        // Update boid positions
        for (const boid of this.elements.boids.flock) {
            boid.x += boid.vx * dt * 10;
            boid.y += boid.vy * dt * 10;
            
            // Wrap around boundaries
            if (boid.x > 50) boid.x -= 100;
            if (boid.x < -50) boid.x += 100;
            if (boid.y > 50) boid.y -= 100;
            if (boid.y < -50) boid.y += 100;
        }
        
        // Calculate alignment
        let avgDir = {x: 0, y: 0};
        for (const boid of this.elements.boids.flock) {
            const mag = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
            avgDir.x += boid.vx / mag;
            avgDir.y += boid.vy / mag;
        }
        
        avgDir.x /= this.elements.boids.flock.length;
        avgDir.y /= this.elements.boids.flock.length;
        
        this.elements.boids.alignment = Math.sqrt(avgDir.x * avgDir.x + avgDir.y * avgDir.y);
    }
    
    /**
     * Update grid elements
     * @param {number} dt - Delta time
     */
    updateGrid(dt) {
        // Occasionally flip random cells
        if (Math.random() < dt * 0.5) {
            const i = Math.floor(Math.random() * 4);
            const j = Math.floor(Math.random() * 4);
            this.elements.grid.states[i][j] = 1 - this.elements.grid.states[i][j];
            
            // Add rupture effect
            this.elements.grid.ruptures.push({
                i: i,
                j: j,
                time: 0
            });
        }
        
        // Update ruptures
        for (let i = this.elements.grid.ruptures.length - 1; i >= 0; i--) {
            const rupture = this.elements.grid.ruptures[i];
            rupture.time += dt;
            if (rupture.time > 1) {
                this.elements.grid.ruptures.splice(i, 1);
            }
        }
    }
    
    /**
     * Update fluid elements
     * @param {number} dt - Delta time
     */
    updateFluid(dt) {
        // Update fluid particles
        for (const particle of this.elements.fluid.particles) {
            // Apply a swirling force
            const distToCenter = Math.hypot(particle.x, particle.y);
            const angle = Math.atan2(particle.y, particle.x);
            const swirl = Math.sin(distToCenter * 0.1 + this.time * 0.5) * 2;
            
            particle.vx += -Math.sin(angle) * swirl * dt;
            particle.vy += Math.cos(angle) * swirl * dt;
            
            // Apply friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Update position
            particle.x += particle.vx * dt * 10;
            particle.y += particle.vy * dt * 10;
            
            // Calculate vorticity
            particle.vorticity = Math.hypot(particle.vx, particle.vy) * Math.sign(swirl);
        }
        
        // Update overall vorticity
        let totalVorticity = 0;
        for (const particle of this.elements.fluid.particles) {
            totalVorticity += particle.vorticity;
        }
        this.elements.fluid.vorticity = totalVorticity / this.elements.fluid.particles.length;
    }
    
    /**
     * Update financial elements
     * @param {number} dt - Delta time
     */
    updateFinancial(dt) {
        // Update price surface with wave pattern
        for (let i = 0; i < this.elements.financial.surface.length; i++) {
            for (let j = 0; j < this.elements.financial.surface[i].length; j++) {
                const baseValue = Math.sin(i/2) * Math.cos(j/2) * 10 + 20;
                const timeOffset = Math.sin(this.time + i * 0.2 + j * 0.3) * 5;
                this.elements.financial.surface[i][j] = baseValue + timeOffset;
            }
        }
    }
    
    /**
     * Draw the scene
     */
    draw() {
        const { ctx, canvas } = this;
        
        // Clear canvas
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections if enabled
        if (this.showConnections) {
            this.drawConnections();
        }
        
        // Draw coherence waves
        this.drawCoherenceWaves();
        
        // Draw prime foundation if enabled
        if (this.highlightFoundation) {
            this.drawPrimeFoundation();
        }
        
        // Draw elements from each scene
        this.drawSceneElements();
        
        // Draw SEP logo in center
        this.drawSEPLogo();
        
        // Draw info panel
        this.drawInfoPanel();
    }
    
    /**
     * Draw connections between elements
     */
    drawConnections() {
        const { ctx } = this;
        
        // Draw connection lines between related concepts
        ctx.strokeStyle = 'rgba(80, 180, 255, 0.15)';
        ctx.lineWidth = 1;
        
        // Connect all elements to the center logo
        const zonePositions = this.calculateZonePositions();
        
        ctx.beginPath();
        for (const zone in zonePositions) {
            const pos = zonePositions[zone];
            ctx.moveTo(this.logo.x, this.logo.y);
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.stroke();
        
        // Draw concept relationship arcs
        ctx.strokeStyle = 'rgba(100, 255, 200, 0.1)';
        ctx.lineWidth = 2;
        
        // Connect related concepts
        const relatedConcepts = [
            ['waves', 'angles'],
            ['angles', 'billiards'],
            ['billiards', 'boundary'],
            ['boundary', 'bodies'],
            ['bodies', 'primes'],
            ['primes', 'boids'],
            ['boids', 'grid'],
            ['grid', 'fluid'],
            ['fluid', 'financial'],
            ['financial', 'waves']
        ];
        
        for (const [concept1, concept2] of relatedConcepts) {
            const pos1 = zonePositions[concept1];
            const pos2 = zonePositions[concept2];
            
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.stroke();
        }
    }
    
    /**
     * Draw coherence waves emanating from center
     */
    drawCoherenceWaves() {
        const { ctx } = this;
        
        // First draw the existing coherence waves
        for (const wave of this.coherenceWaves) {
            // Create gradient for wave effect
            const gradient = ctx.createRadialGradient(
                wave.x, wave.y, wave.radius * 0.8,
                wave.x, wave.y, wave.radius
            );
            
            // Parse the color to get hue
            const hueMatch = wave.color.match(/hsla\((\d+)/);
            const hue = hueMatch ? parseInt(hueMatch[1]) : 170;
            
            // Create pulsing wave effect with gradient
            gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
            gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, ${wave.strength * 0.3})`);
            gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
            
            // Draw wave ring
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw additional thin line for wave boundary
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Create interaction effect when wave passes through element zones
            this.applyWaveEffectsToZones(wave);
        }
    }

    /**
     * Apply coherence wave effects to scene elements
     * @param {Object} wave - The coherence wave
     */
    applyWaveEffectsToZones(wave) {
        // Get all zone positions
        const zonePositions = this.calculateZonePositions();
        
        // Check for each zone if the wave is passing through it
        for (const zone in zonePositions) {
            const pos = zonePositions[zone];
            const distToWave = Math.hypot(pos.x - wave.x, pos.y - wave.y);
            const waveThickness = 30; // Thickness of the wave effect
            
            // If wave is passing through this zone
            if (Math.abs(distToWave - wave.radius) < waveThickness) {
                // Calculate effect intensity based on how close the wave center is to the zone
                const effectIntensity = 1 - Math.abs(distToWave - wave.radius) / waveThickness;
                
                // Draw highlight effect
                this.ctx.save();
                this.ctx.globalAlpha = effectIntensity * 0.6;
                this.ctx.fillStyle = wave.color;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 20 * effectIntensity, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                // Here we could also modify the behavior of elements based on wave effects
                // For example, temporarily increasing amplitude of waves, adding energy to particles, etc.
            }
        }
    }
    
    /**
     * Draw prime number foundation pattern
     */
    drawPrimeFoundation() {
        const { ctx } = this;
        
        // Draw a subtle prime spiral pattern across the entire canvas
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // Draw larger prime spiral
        for (let i = 1; i < 100; i++) {
            if (isPrime(i)) {
                const angle = i * 0.1;
                const radius = Math.sqrt(i) * 15;
                const x = Math.cos(angle + this.time * 0.05) * radius;
                const y = Math.sin(angle + this.time * 0.05) * radius;
                
                ctx.fillStyle = '#ff00ff';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // Helper function to check if number is prime
        function isPrime(num) {
            if (num <= 1) return false;
            if (num <= 3) return true;
            if (num % 2 === 0 || num % 3 === 0) return false;
            for (let i = 5; i * i <= num; i += 6) {
                if (num % i === 0 || num % (i + 2) === 0) return false;
            }
            return true;
        }
    }
    
    /**
     * Draw scene elements in their respective zones
     */
    drawSceneElements() {
        const { ctx } = this;
        const zonePositions = this.calculateZonePositions();
        
        // Draw each element in its zone
        this.drawWaveElement(zonePositions.waves);
        this.drawAngleElement(zonePositions.angles);
        this.drawBilliardElement(zonePositions.billiards);
        this.drawBoundaryElement(zonePositions.boundary);
        this.drawBodiesElement(zonePositions.bodies);
        this.drawPrimeElement(zonePositions.primes);
        this.drawBoidElement(zonePositions.boids);
        this.drawGridElement(zonePositions.grid);
        this.drawFluidElement(zonePositions.fluid);
        this.drawFinancialElement(zonePositions.financial);
    }
    
    /**
     * Draw wave element (Scene 1)
     */
    drawWaveElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'waves';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(0, 100, 255, 0.2)' : 'rgba(0, 80, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wave
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.elements.waves.values.length; i++) {
            const x = (i / this.elements.waves.values.length) * size * 2 - size;
            const y = this.elements.waves.values[i];
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Wave Interference', 0, size + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw angle element (Scene 2)
     */
    drawAngleElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'angles';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(255, 170, 0, 0.2)' : 'rgba(200, 150, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw protractor
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw angle vectors
        const v1 = this.elements.angles.vectors[0];
        const v2 = this.elements.angles.vectors[1];
        const scale = size * 0.8 / 40; // Scale to fit in the circle
        
        // First vector (fixed)
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(v1.x * scale, v1.y * scale);
        ctx.stroke();
        
        // Second vector (moving)
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(v2.x * scale, v2.y * scale);
        ctx.stroke();
        
        // Draw angle arc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, this.elements.angles.value);
        ctx.stroke();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Angle Classification', 0, size + 15);
            ctx.fillText(this.elements.angles.classification, 0, size + 30);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw billiard element (Scene 3, 6)
     */
    drawBilliardElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'billiards';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(0, 150, 255, 0.2)' : 'rgba(0, 100, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw boundary
        ctx.strokeStyle = '#00a0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
        
        // Draw particles
        const scale = size / 50;
        for (const particle of this.elements.billiards.particles) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(particle.x * scale, particle.y * scale, particle.radius * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Billiard Collisions', 0, size + 15);
            ctx.fillText(`Collisions: ${this.elements.billiards.collisionCount}`, 0, size + 30);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw boundary element (Scene 4)
     */
    drawBoundaryElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'boundary';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(120, 60, 240, 0.2)' : 'rgba(100, 50, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw tangent curve
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.elements.boundary.values.length; i++) {
            // Clamp values to prevent drawing outside the circle
            const value = Math.max(-size, Math.min(size, this.elements.boundary.values[i] * 10));
            const x = (i / this.elements.boundary.values.length) * size * 2 - size;
            const y = value;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw vertical line at 90°
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Tangent Boundary', 0, size + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw three-body element (Scene 5)
     */
    drawBodiesElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'bodies';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(255, 170, 0, 0.2)' : 'rgba(200, 150, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw trajectories
        const scale = size / 50;
        for (let i = 0; i < this.elements.bodies.trajectories.length; i++) {
            const traj = this.elements.bodies.trajectories[i];
            const colors = ['#ff0000', '#00ff00', '#0088ff'];
            
            if (traj.length > 1) {
                ctx.strokeStyle = colors[i];
                ctx.lineWidth = 1;
                ctx.beginPath();
                
                for (let j = 0; j < traj.length; j++) {
                    const point = traj[j];
                    if (j === 0) {
                        ctx.moveTo(point.x * scale, point.y * scale);
                    } else {
                        ctx.lineTo(point.x * scale, point.y * scale);
                    }
                }
                
                ctx.stroke();
            }
        }
        
        // Draw bodies
        for (let i = 0; i < this.elements.bodies.positions.length; i++) {
            const body = this.elements.bodies.positions[i];
            const colors = ['#ff5555', '#55ff55', '#5555ff'];
            
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(body.x * scale, body.y * scale, body.mass * scale * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Three-Body System', 0, size + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw prime element (Scene 7)
     */
    drawPrimeElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'primes';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(0, 255, 140, 0.2)' : 'rgba(0, 200, 100, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw prime spiral
        const scale = size / 50;
        
        // Draw connecting lines
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < this.elements.primes.spiral.length; i++) {
            const point = this.elements.primes.spiral[i];
            if (i === 0) {
                ctx.moveTo(point.x * scale, point.y * scale);
            } else {
                ctx.lineTo(point.x * scale, point.y * scale);
            }
        }
        
        ctx.stroke();
        
        // Draw prime points
        for (let i = 0; i < this.elements.primes.spiral.length; i++) {
            const point = this.elements.primes.spiral[i];
            
            // Check if this prime is highlighted
            const highlight = this.elements.primes.highlightedPrimes.find(h => h.index === i);
            
            if (highlight) {
                const alpha = 1 - highlight.time;
                ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x * scale, point.y * scale, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(point.x * scale, point.y * scale, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Prime Spiral', 0, size + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw boid element (Scene 8)
     */
    drawBoidElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'boids';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(0, 100, 255, 0.2)' : 'rgba(0, 80, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bounding box
        ctx.strokeStyle = '#00a0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-size * 0.8, -size * 0.8, size * 1.6, size * 1.6);
        
        // Draw boids
        const scale = size / 50;
        for (const boid of this.elements.boids.flock) {
            // Calculate heading angle
            const angle = Math.atan2(boid.vy, boid.vx);
            
            ctx.save();
            ctx.translate(boid.x * scale, boid.y * scale);
            ctx.rotate(angle);
            
            // Draw triangle for boid
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(5, 0);
            ctx.lineTo(-3, -2);
            ctx.lineTo(-3, 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        // Draw alignment indicator
        const alignmentColor = this.elements.boids.alignment > 0.7 ? '#00ff00' : '#ff0000';
        ctx.strokeStyle = alignmentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2 * this.elements.boids.alignment);
        ctx.stroke();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Flocking System', 0, size + 15);
            ctx.fillText(`Alignment: ${(this.elements.boids.alignment * 100).toFixed(0)}%`, 0, size + 30);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw grid element (Scene 9)
     */
    drawGridElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'grid';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(0, 255, 140, 0.2)' : 'rgba(0, 200, 100, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw state grid
        const grid = this.elements.grid.states;
        const cellSize = size * 1.4 / grid.length;
        const offset = -cellSize * grid.length / 2;
        
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const x = offset + i * cellSize;
                const y = offset + j * cellSize;
                
                // Check if this cell has a rupture
                const rupture = this.elements.grid.ruptures.find(r => r.i === i && r.j === j);
                
                if (rupture) {
                    // Draw rupture effect
                    const alpha = 1 - rupture.time;
                    ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, cellSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw cell
                ctx.fillStyle = grid[i][j] ? '#00ff88' : '#004022';
                ctx.fillRect(x, y, cellSize, cellSize);
                
                // Draw border
                ctx.strokeStyle = '#001a0d';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SEP Framework', 0, size + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw fluid element (Scene 10)
     */
    drawFluidElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'fluid';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(120, 60, 240, 0.2)' : 'rgba(100, 50, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw circular boundary
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw fluid particles
        const scale = size / 50;
        for (const particle of this.elements.fluid.particles) {
            // Color based on vorticity
            const hue = (particle.vorticity > 0) ? 240 : 0;
            const saturation = Math.min(100, Math.abs(particle.vorticity) * 100);
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, 70%)`;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x * scale, particle.y * scale, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw velocity vector
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 70%, 0.5)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x * scale, particle.y * scale);
            ctx.lineTo(
                particle.x * scale + particle.vx * scale * 2,
                particle.y * scale + particle.vy * scale * 2
            );
            ctx.stroke();
        }
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Fluid Dynamics', 0, size + 15);
            const vorticityLabel = this.elements.fluid.vorticity > 0 ? 'Clockwise' : 'Counter-Clockwise';
            ctx.fillText(`Vorticity: ${vorticityLabel}`, 0, size + 30);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw financial element (Scene 11)
     */
    drawFinancialElement(position) {
        const { ctx } = this;
        const isActive = this.activeZone === 'financial';
        const size = isActive ? 100 : 70;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        
        // Background
        ctx.fillStyle = isActive ? 'rgba(255, 170, 0, 0.2)' : 'rgba(200, 150, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw price surface as a grid of colored cells
        const surface = this.elements.financial.surface;
        const cellSize = size * 1.4 / surface.length;
        const offset = -cellSize * surface.length / 2;
        
        for (let i = 0; i < surface.length; i++) {
            for (let j = 0; j < surface[i].length; j++) {
                const x = offset + i * cellSize;
                const y = offset + j * cellSize;
                const value = surface[i][j];
                
                // Normalize value
                const normalizedValue = (value - 10) / 30; // Assuming range 10-40
                
                // Calculate color
                const r = Math.floor(normalizedValue * 100);
                const g = Math.floor(normalizedValue * 255);
                const b = Math.floor(255 * (1 - normalizedValue) + 100);
                
                // Draw cell
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
        
        // Add SEP overlay
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Financial Intelligence', 0, size + 15);
            ctx.fillText('with SEP Overlay', 0, size + 30);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw SEP logo in the center
     */
    drawSEPLogo() {
        const { ctx } = this;
        const isActive = this.activeZone === 'logo';
        
        // Save context for rotation
        ctx.save();
        ctx.translate(this.logo.x, this.logo.y);
        ctx.rotate(this.logo.rotation);
        
        // Pulsing effect
        const pulse = 1 + Math.sin(this.logo.pulsePhase) * 0.1;
        const size = this.logo.size * pulse;
        
        // Draw the logo using the generator
        // We need to translate back to origin since the logo generator will draw at the specified x,y
        ctx.translate(-this.logo.x, -this.logo.y);
        this.logoGenerator.draw(ctx, this.logo.x, this.logo.y, size, {
            color: isActive ? '#00ff88' : '#00cc66',
            secondaryColor: isActive ? '#00d4ff' : '#0099cc',
            accentColor: isActive ? '#ff00ff' : '#cc00cc'
        });
        
        ctx.restore();
        
        // Label
        if (isActive) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Self-Emergent Processor', this.logo.x, this.logo.y + size + 20);
            ctx.fillText('Reality\'s Code', this.logo.x, this.logo.y + size + 40);
        }
    }
    
    /**
     * Draw information panel
     */
    drawInfoPanel() {
        const { ctx } = this;
        
        // Draw info panel in top left
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 20, 300, 140);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Scene 12: Reality\'s Code', 30, 45);
        
        ctx.font = '14px Arial';
        ctx.fillText('Unified Meta-Visualization', 30, 70);
        ctx.fillText('Active Zone: ' + (this.activeZone || 'None'), 30, 95);
        
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px Arial';
        ctx.fillText('Keys: [C] Toggle Connections, [F] Toggle Foundation', 30, 120);
        ctx.fillText('[R] Reset View, [W] Generate Wave', 30, 140);
    }
    
    /**
     * Calculate positions for each element zone
     * @returns {Object} Map of zone positions
     */
    calculateZonePositions() {
        const positions = {};
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
        
        // Position elements in a circle around the logo
        const zones = ['waves', 'angles', 'billiards', 'boundary', 'bodies', 
                      'primes', 'boids', 'grid', 'fluid', 'financial'];
        
        for (let i = 0; i < zones.length; i++) {
            const angle = (i / zones.length) * Math.PI * 2;
            positions[zones[i]] = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        }
        
        return positions;
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
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}