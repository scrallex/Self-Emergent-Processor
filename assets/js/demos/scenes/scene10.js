/**
 * Scene 10: Particle Fluid Simulation
 *
 * Particle-based fluid demonstration showing vorticity colouring
 * and boundary induced rotation.
 */
import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene10 {
    constructor(canvas, ctx, settings, physics, math, eventManager, stateManager, renderPipeline) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;

        this.particles = [];
        this.numParticles = 300;
        this.radius = this.settings.size || 3;
        this.boundaryPadding = 10;
        this.mouse = { x: 0, y: 0, down: false };
        this.animation = true;

        // Fluid parameters
        this.viscosity = 0.99;
        this.swirlIntensity = 50;

        // Interaction helpers
        this.activePlaneIndex = null;

        // Interactive controller (initialized in init)
        this.controller = null;

        // Timing values for update loop
        this.time = 0;
        this.lastTime = 0;
        
        // Vorticity tracking
        this.vorticityStats = {
            max: 0,
            avg: 0,
            centers: []
        };
        
        // Lattice formation tracking
        this.latticeFormations = {
            detected: false,
            strength: 0,
            locations: [],
            size: 0
        };
        
        // No-plane-hit constraint
        this.noPlaneConstraint = {
            enabled: true,
            planes: [
                { // Horizontal center plane
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0, // Will be set in init
                    strength: 10,
                    active: false
                },
                { // Vertical center plane
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0, // Will be set in init
                    strength: 10,
                    active: false
                }
            ],
            repulsionStrength: 0.8,
            visualize: true
        };
        
        // Visualization options
        this.visualOptions = {
            showVorticityColors: true,
            showParticleTrails: true,
            showLatticeConnections: true,
            trailLength: 10
        };
    }

    init() {
        this.initParticles();

        // Initialize interactive controller
        this.controller = new InteractiveController(
            this,
            this.canvas,
            this.ctx,
            this.eventManager,
            this.stateManager,
            this.renderPipeline
        ).init();

        // Register input handlers via the event manager
        this.unregisterHandlers = [
            this.eventManager.on('mouse', 'down', ({ x, y }) => {
                this.mouse.down = true;
                this.mouse.x = x;
                this.mouse.y = y;
            }),
            this.eventManager.on('mouse', 'up', () => {
                this.mouse.down = false;
                if (this.activePlaneIndex !== null) {
                    this.noPlaneConstraint.planes[this.activePlaneIndex].active = false;
                }
                this.activePlaneIndex = null;
            }),
            this.eventManager.on('mouse', 'move', ({ x, y }) => {
                this.mouse.x = x;
                this.mouse.y = y;

                if (this.mouse.down && this.noPlaneConstraint.enabled) {
                    for (let i = 0; i < this.noPlaneConstraint.planes.length; i++) {
                        const plane = this.noPlaneConstraint.planes[i];
                        const distToPlane = this.distanceToLine(
                            x, y,
                            plane.x1, plane.y1, plane.x2, plane.y2
                        );

                        if (distToPlane < 20) {
                            plane.active = true;
                            this.activePlaneIndex = i;

                            const midX = (plane.x1 + plane.x2) / 2;
                            const midY = (plane.y1 + plane.y2) / 2;
                            const dx = x - midX;
                            const dy = y - midY;

                            plane.x1 += dx * 0.05;
                            plane.y1 += dy * 0.05;
                            plane.x2 += dx * 0.05;
                            plane.y2 += dy * 0.05;

                            break;
                        } else {
                            plane.active = false;
                            this.activePlaneIndex = null;
                        }
                    }
                }
            })
        ];

        return Promise.resolve();
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0,
                vort: 0,
                history: [], // For particle trails
                latticeNode: false, // For lattice formation
                inVortex: false,    // For vortex tracking
                density: 0          // For density calculation
            });
        }
        
        // Setup no-plane constraint boundaries
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Horizontal center plane
        this.noPlaneConstraint.planes[0].x1 = centerX - this.canvas.width * 0.4;
        this.noPlaneConstraint.planes[0].y1 = centerY;
        this.noPlaneConstraint.planes[0].x2 = centerX + this.canvas.width * 0.4;
        this.noPlaneConstraint.planes[0].y2 = centerY;
        
        // Vertical center plane
        this.noPlaneConstraint.planes[1].x1 = centerX;
        this.noPlaneConstraint.planes[1].y1 = centerY - this.canvas.height * 0.4;
        this.noPlaneConstraint.planes[1].x2 = centerX;
        this.noPlaneConstraint.planes[1].y2 = centerY + this.canvas.height * 0.4;
    }


    
    /**
     * Calculate distance from point to line segment
     */
    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.time = timestamp;
        this.update(delta * (this.settings.speed || 1));
        this.draw();
    }

    update(delta) {
        if (!this.animation) return;
        const dt = delta * 0.001;
        
        // Reset tracking values
        this.vorticityStats.max = 0;
        this.vorticityStats.avg = 0;
        this.vorticityStats.centers = [];
        this.latticeFormations.detected = false;
        this.latticeFormations.locations = [];
        
        // Update particle trails first
        for (const p of this.particles) {
            // Add current position to history
            if (this.visualOptions.showParticleTrails) {
                p.history.unshift({ x: p.x, y: p.y });
                // Limit trail length
                if (p.history.length > this.visualOptions.trailLength) {
                    p.history.pop();
                }
            } else {
                p.history = [];
            }
            
            // Reset particle state
            p.latticeNode = false;
            p.inVortex = false;
            p.density = 0;
        }
        
        // Mouse interaction and boundary forces
        for (const p of this.particles) {
            // Interaction with mouse drag - swirl particles
            if (this.mouse.down && !this.noPlaneConstraint.planes.some(plane => plane.active)) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist2 = dx * dx + dy * dy;
                const r2 = 80 * 80;
                if (dist2 < r2 && dist2 > 0) {
                    const dist = Math.sqrt(dist2);
                    const force = (1 - dist / 80) * this.swirlIntensity;
                    p.vx += (-dy / dist) * force * dt;
                    p.vy += (dx / dist) * force * dt;
                }
            }

            // Boundary rotation - enhanced to create more consistent vorticity
            if (p.x < this.boundaryPadding) {
                p.vx = Math.abs(p.vx) + 0.5;
                p.vy += 0.5;
                p.vx *= 1.02; // Add extra energy at boundaries
            } else if (p.x > this.canvas.width - this.boundaryPadding) {
                p.vx = -Math.abs(p.vx) - 0.5;
                p.vy -= 0.5;
                p.vx *= 1.02;
            }
            if (p.y < this.boundaryPadding) {
                p.vy = Math.abs(p.vy) + 0.5;
                p.vx -= 0.5;
                p.vy *= 1.02;
            } else if (p.y > this.canvas.height - this.boundaryPadding) {
                p.vy = -Math.abs(p.vy) - 0.5;
                p.vx += 0.5;
                p.vy *= 1.02;
            }
            
            // Apply no-plane-hit constraint
            if (this.noPlaneConstraint.enabled) {
                for (const plane of this.noPlaneConstraint.planes) {
                    const dist = this.distanceToLine(
                        p.x, p.y,
                        plane.x1, plane.y1,
                        plane.x2, plane.y2
                    );
                    
                    // Apply repulsion force if close to the plane
                    const threshold = 40;
                    if (dist < threshold) {
                        const force = (1 - dist / threshold) * this.noPlaneConstraint.repulsionStrength;
                        
                        // Calculate normal vector to the plane
                        const dx = plane.x2 - plane.x1;
                        const dy = plane.y2 - plane.y1;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        
                        // Normal direction (perpendicular to the plane)
                        const nx = -dy / length;
                        const ny = dx / length;
                        
                        // Determine which side of the plane the particle is on
                        const side = Math.sign((p.x - plane.x1) * nx + (p.y - plane.y1) * ny);
                        
                        // Apply repulsion force
                        p.vx += nx * force * side * dt * 80;
                        p.vy += ny * force * side * dt * 80;
                    }
                }
            }
        }

        // Particle interactions and vorticity calculation
        let totalVort = 0;
        const densityThreshold = 4; // For lattice detection
        let maxVort = 0;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            let vort = 0;
            let count = 0;
            let nearbyCount = 0;
            
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                const q = this.particles[j];
                const dx = q.x - p.x;
                const dy = q.y - p.y;
                const dist2 = dx * dx + dy * dy;
                
                // Count nearby particles for density calculation
                if (dist2 < 400) {
                    nearbyCount++;
                }
                
                if (dist2 < 900 && dist2 > 0) {
                    // Calculate cross product of position difference and velocity difference
                    const dvx = q.vx - p.vx;
                    const dvy = q.vy - p.vy;
                    const crossProduct = dx * dvy - dy * dvx;
                    
                    // Vorticity is the curl of the velocity field
                    vort += crossProduct;
                    
                    // Apply attractive/repulsive forces based on distance
                    const dist = Math.sqrt(dist2);
                    const optimalDist = 15;
                    
                    if (dist < optimalDist) {
                        // Repulsion at close range
                        p.vx -= dx * 0.001;
                        p.vy -= dy * 0.001;
                    } else {
                        // Attraction at medium range
                        p.vx += dx * 0.0003;
                        p.vy += dy * 0.0003;
                    }
                    
                    count++;
                }
            }
            
            // Update particle properties
            p.vort = count ? vort / count : 0;
            p.density = nearbyCount;
            
            // Track maximum vorticity
            const absVort = Math.abs(p.vort);
            maxVort = Math.max(maxVort, absVort);
            totalVort += absVort;
            
            // Mark as part of a vortex if vorticity is high
            if (absVort > 50) {
                p.inVortex = true;
            }
            
            // Detect lattice formation - particles that have consistent spacing
            if (p.density >= densityThreshold && p.density <= densityThreshold + 2) {
                p.latticeNode = true;
                this.latticeFormations.detected = true;
                this.latticeFormations.locations.push({ x: p.x, y: p.y });
            }
            
            // Apply drag and update position
            p.vx *= this.viscosity;
            p.vy *= this.viscosity;
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
        }
        
        // Update vorticity statistics
        this.vorticityStats.max = maxVort;
        this.vorticityStats.avg = totalVort / this.particles.length;
        
        // Detect vortex centers by finding local maxima of vorticity
        const potentialCenters = [];
        for (const p of this.particles) {
            if (Math.abs(p.vort) > this.vorticityStats.max * 0.7) {
                potentialCenters.push({
                    x: p.x,
                    y: p.y,
                    strength: Math.abs(p.vort),
                    clockwise: p.vort > 0
                });
            }
        }
        
        // Cluster nearby centers
        this.vorticityStats.centers = [];
        for (const center of potentialCenters) {
            let found = false;
            for (const existingCenter of this.vorticityStats.centers) {
                const dx = center.x - existingCenter.x;
                const dy = center.y - existingCenter.y;
                if (dx * dx + dy * dy < 50 * 50) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                this.vorticityStats.centers.push(center);
            }
        }
        
        // Update lattice formation strength based on number of nodes
        const latticeNodeCount = this.particles.filter(p => p.latticeNode).length;
        this.latticeFormations.strength = latticeNodeCount / this.particles.length;
        this.latticeFormations.size = Math.sqrt(this.latticeFormations.locations.length);
    }

    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lattice connections
        if (this.visualOptions.showLatticeConnections && this.latticeFormations.detected) {
            this.ctx.strokeStyle = 'rgba(124, 58, 237, 0.3)';  // Purple
            this.ctx.lineWidth = 1;
            
            for (let i = 0; i < this.latticeFormations.locations.length; i++) {
                const node1 = this.latticeFormations.locations[i];
                
                for (let j = i + 1; j < this.latticeFormations.locations.length; j++) {
                    const node2 = this.latticeFormations.locations[j];
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Draw connections between nearby lattice nodes
                    if (dist < 40) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(node1.x, node1.y);
                        this.ctx.lineTo(node2.x, node2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw particle trails
        if (this.visualOptions.showParticleTrails) {
            for (const p of this.particles) {
                if (p.history.length > 1) {
                    const alpha = this.visualOptions.showVorticityColors ?
                        Math.min(0.8, Math.abs(p.vort) / 50) : 0.3;
                    
                    const hue = this.visualOptions.showVorticityColors ?
                        (p.vort > 0 ? 180 : 0) : 200; // Blue for clockwise, red for counterclockwise
                    
                    this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.history[0].x, p.history[0].y);
                    
                    for (let i = 1; i < p.history.length; i++) {
                        this.ctx.lineTo(p.history[i].x, p.history[i].y);
                    }
                    
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw vortex centers
        for (const center of this.vorticityStats.centers) {
            const radius = 20 + (center.strength / this.vorticityStats.max) * 20;
            
            // Draw vortex boundary
            this.ctx.strokeStyle = center.clockwise ?
                'rgba(0, 212, 255, 0.5)' : 'rgba(255, 50, 50, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw rotation arrows
            const arrowCount = 8;
            for (let i = 0; i < arrowCount; i++) {
                const angle = (i / arrowCount) * Math.PI * 2;
                const arrowAngle = center.clockwise ? angle - Math.PI/8 : angle + Math.PI/8;
                
                const x1 = center.x + Math.cos(angle) * radius * 0.7;
                const y1 = center.y + Math.sin(angle) * radius * 0.7;
                
                const x2 = center.x + Math.cos(arrowAngle) * radius;
                const y2 = center.y + Math.sin(arrowAngle) * radius;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        }
        
        // Draw particles
        for (const p of this.particles) {
            // Color based on vorticity if enabled, otherwise use neutral color
            const hue = this.visualOptions.showVorticityColors ?
                200 + Math.max(-50, Math.min(50, p.vort)) * 2 : 200;
            
            // Adjust brightness based on whether particle is in vortex or lattice
            let lightness = 60;
            if (p.inVortex) lightness = 80;
            if (p.latticeNode) lightness = 75;
            
            this.ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add velocity vector
            if (Math.hypot(p.vx, p.vy) > 2) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx, p.y + p.vy);
                this.ctx.stroke();
            }
        }
        
        // Draw no-plane constraint boundaries
        if (this.noPlaneConstraint.enabled && this.noPlaneConstraint.visualize) {
            for (const plane of this.noPlaneConstraint.planes) {
                // Draw constraint boundary
                this.ctx.strokeStyle = plane.active ?
                    'rgba(255, 170, 0, 0.8)' : 'rgba(255, 170, 0, 0.3)';
                this.ctx.lineWidth = plane.active ? 3 : 2;
                this.ctx.setLineDash([5, 5]);
                
                this.ctx.beginPath();
                this.ctx.moveTo(plane.x1, plane.y1);
                this.ctx.lineTo(plane.x2, plane.y2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Draw drag handles
                if (plane.active) {
                    this.ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(plane.x1, plane.y1, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(plane.x2, plane.y2, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        
        // Draw vorticity and lattice information panel
        this.drawInfoPanel();
    }

    /**
     * Draw information panel with vorticity and lattice metrics
     */
    drawInfoPanel() {
        if (this.settings.videoMode) {
            this.drawVideoInfo();
            return;
        }
        
        // Draw main info panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 220);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Particle Fluid Simulation', 20, 35);
        
        // Particle information
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Particles: ${this.particles.length}`, 20, 60);
        
        // Vorticity information
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText(`Vorticity Centers: ${this.vorticityStats.centers.length}`, 20, 85);
        this.ctx.fillText(`Max Vorticity: ${this.vorticityStats.max.toFixed(1)}`, 20, 110);
        this.ctx.fillText(`Avg Vorticity: ${this.vorticityStats.avg.toFixed(1)}`, 20, 135);
        
        // Lattice formation information
        this.ctx.fillStyle = '#7c3aed';
        const latticePercentage = (this.latticeFormations.strength * 100).toFixed(1);
        this.ctx.fillText(`Lattice Formation: ${latticePercentage}%`, 20, 160);
        
        if (this.latticeFormations.detected) {
            this.ctx.fillText(`Lattice Size: ${this.latticeFormations.size.toFixed(1)} units`, 20, 185);
        }
        
        // No-plane constraint status
        this.ctx.fillStyle = this.noPlaneConstraint.enabled ? '#ffaa00' : '#aaaaaa';
        this.ctx.fillText(
            `No-Plane Constraint: ${this.noPlaneConstraint.enabled ? 'Active' : 'Inactive'}`,
            20,
            210
        );
        
        // Draw controls panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 100, 320, 90);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Controls:', 20, this.canvas.height - 75);
        
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('• Click and drag to create swirls', 20, this.canvas.height - 55);
        this.ctx.fillText('• Drag constraint planes to maintain rotation', 20, this.canvas.height - 35);
        this.ctx.fillText('• Vorticity is color-coded (blue=clockwise, red=counter)', 20, this.canvas.height - 15);
        
        // Draw vorticity color scale legend
        const legendWidth = 150;
        const legendHeight = 15;
        const legendX = this.canvas.width - legendWidth - 20;
        const legendY = 20;
        
        // Draw legend background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(legendX - 10, legendY - 5, legendWidth + 20, legendHeight + 30);
        
        // Draw title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Vorticity Scale', legendX, legendY + 10);
        
        // Draw color gradient
        const gradient = this.ctx.createLinearGradient(legendX, legendY + 15, legendX + legendWidth, legendY + 15);
        gradient.addColorStop(0, 'hsl(0, 80%, 60%)');   // Red (counter-clockwise)
        gradient.addColorStop(0.5, 'hsl(200, 80%, 60%)'); // Blue (neutral)
        gradient.addColorStop(1, 'hsl(300, 80%, 60%)');   // Purple (clockwise)
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(legendX, legendY + 15, legendWidth, legendHeight);
        
        // Draw labels
        this.ctx.fillStyle = '#cccccc';
        this.ctx.font = '10px Arial';
        this.ctx.fillText('Counter-clockwise', legendX, legendY + 45);
        this.ctx.fillText('Clockwise', legendX + legendWidth - 50, legendY + 45);
    }
    
    /**
     * Draw minimal information for video mode
     */
    drawVideoInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        
        // Show title
        this.ctx.fillText('Particle Fluid Dynamics', this.canvas.width - 20, 30);
        
        // Show vorticity info
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fillText(
            `Vortices: ${this.vorticityStats.centers.length}`,
            this.canvas.width - 20,
            60
        );
        
        // Show lattice formation if present
        if (this.latticeFormations.detected) {
            this.ctx.fillStyle = '#7c3aed';
            this.ctx.fillText(
                `Lattice Formation: ${(this.latticeFormations.strength * 100).toFixed(0)}%`,
                this.canvas.width - 20,
                90
            );
        }
        
        this.ctx.textAlign = 'left';
    }

    getCustomControls() {
        return [
            {
                id: 'particle_count',
                type: 'slider',
                label: 'Particles',
                min: 50,
                max: 1000,
                value: this.numParticles,
                step: 10,
                onChange: (value) => {
                    this.numParticles = Math.round(value);
                    this.initParticles();
                }
            },
            {
                id: 'viscosity',
                type: 'slider',
                label: 'Viscosity',
                min: 0.9,
                max: 1.0,
                value: this.viscosity,
                step: 0.005,
                onChange: (value) => {
                    this.viscosity = value;
                }
            },
            {
                id: 'swirl_intensity',
                type: 'slider',
                label: 'Swirl Intensity',
                min: 10,
                max: 100,
                value: this.swirlIntensity,
                step: 1,
                onChange: (value) => {
                    this.swirlIntensity = value;
                }
            }
        ];
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (newSettings.size !== undefined) {
            this.radius = newSettings.size;
        }
        
        // Update behavior based on intensity
        if (newSettings.intensity !== undefined) {
            // Higher intensity = stronger vortices and more visible lattice formations
            const intensity = newSettings.intensity / 100;
            
            // Scale particle count
            const newParticleCount = Math.floor(200 + intensity * 200);
            if (newParticleCount !== this.numParticles) {
                this.numParticles = newParticleCount;
                this.initParticles();
            }
            
            // Adjust constraint behavior
            this.noPlaneConstraint.repulsionStrength = 0.5 + intensity * 0.8;
            
            // Adjust visualization
            this.visualOptions.trailLength = Math.floor(5 + intensity * 15);
        }
    }

    cleanup() {
        if (this.controller) {
            this.controller.cleanup();
            this.controller = null;
        }

        if (this.unregisterHandlers) {
            this.unregisterHandlers.forEach(off => off());
            this.unregisterHandlers = [];
        }

        this.particles = [];
    }
}
