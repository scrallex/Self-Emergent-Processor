/**
 * Scene 5: Angle Reality Classification
 *
 * Interactive planetary system with three masses and adjustable positions.
 * Observe how interactions are color-coded by angle type, with acute angles
 * forming stable orbits and obtuse angles creating escape trajectories.
 */

import InteractiveController from '../controllers/interactive-controller.js';

export default class Scene5 {
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
        
        // Scene-specific state
        this.bodies = [];
        this.time = 0;
        this.lastTime = 0;
        this.G = 0.5; // Gravitational constant
        this.showTrails = true;
        this.trailLength = 200;
        this.systemStability = 'Analyzing...';
        this.systemEnergy = 0;
        
        // Perspective settings
        this.activePerspective = -1; // -1 = global view, 0,1,2 = body index
        this.showRelativeVectors = true;
        
        // Body interaction angles
        this.angles = [
            { bodies: [0, 1, 2], angle: 0, type: 'Unknown', color: '#ffffff' },
            { bodies: [1, 2, 0], angle: 0, type: 'Unknown', color: '#ffffff' },
            { bodies: [2, 0, 1], angle: 0, type: 'Unknown', color: '#ffffff' }
        ];
        
        // Interaction state
        this.selectedBody = null;
        this.lastClickTime = 0;
        
        // Interactive controller (initialized in init)
        this.controller = null;
        
        // Interactive elements (defined in createInteractiveElements)
        this.interactiveElements = [];
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
     * Create interactive elements specific to this scene
     * @param {InteractiveUtils} utils - Interactive utilities instance
     * @returns {Array} - Array of interactive elements
     */
    createInteractiveElements(utils) {
        const elements = [];
        
        // Create draggable bodies
        this.bodies.forEach((body, index) => {
            const draggable = utils.createDraggable({
                id: `body_${index}`,
                x: body.x,
                y: body.y,
                width: body.m * 2,
                height: body.m * 2,
                shape: 'circle',
                color: body.color,
                tooltip: `Body ${index + 1}`,
                
                onDragStart: () => {
                    body.isDragging = true;
                    body.vx = 0;
                    body.vy = 0;
                },
                
                onDrag: (dx, dy, x, y) => {
                    body.x = x;
                    body.y = y;
                    this.updateAngles();
                    this.calculateSystemEnergy();
                    this.analyzeSystemStability();
                },
                
                onDragEnd: () => {
                    body.isDragging = false;
                }
            });
            
            elements.push(draggable);
        });
        
        return elements;
    }

    /**
     * Get custom controls for the control panel
     * @returns {Array} Array of control configurations
     */
    getCustomControls() {
        return [
            {
                id: 'g_constant',
                type: 'slider',
                label: 'Gravitational Constant (G)',
                min: 0,
                max: 2,
                value: this.G,
                step: 0.1,
                onChange: (value) => {
                    this.G = value;
                }
            },
            {
                id: 'show_trails',
                type: 'toggle',
                label: 'Show Trails',
                value: this.showTrails,
                onChange: (value) => {
                    this.showTrails = value;
                    if (!value) {
                        this.bodies.forEach(b => b.trail = []);
                    }
                }
            },
            {
                id: 'perspective_cycle',
                type: 'button',
                label: this.getPerspectiveLabel(),
                onClick: () => {
                    this.cyclePerspective();
                    // Update button label
                    const button = this.controller.getControlById('perspective_cycle');
                    if (button) {
                        button.text = this.getPerspectiveLabel();
                    }
                }
            },
            {
                id: 'show_vectors',
                type: 'toggle',
                label: 'Show Relative Vectors',
                value: this.showRelativeVectors,
                onChange: (value) => {
                    this.showRelativeVectors = value;
                }
            },
            {
                id: 'reset_btn',
                type: 'button',
                label: 'Reset System',
                onClick: () => this.reset()
            }
        ];
    }

    /**
     * Reset the scene to its initial state
     */
    reset() {
        this.time = 0;
        this.lastTime = 0;
        
        // Reset bodies with colors based on angle types
        this.bodies = [
            {
                x: this.canvas.width * 0.4,
                y: this.canvas.height / 2,
                vx: 0,
                vy: -50 * (this.settings.intensity / 50),
                m: 20,
                color: '#00d4ff', // Acute - cyan
                baseColor: '#00d4ff',
                trail: [],
                isDragging: false,
                isEscaping: false,
                energy: 0
            },
            {
                x: this.canvas.width * 0.6,
                y: this.canvas.height / 2,
                vx: 0,
                vy: 50 * (this.settings.intensity / 50),
                m: 20,
                color: '#ffaa00', // Right - orange
                baseColor: '#ffaa00',
                trail: [],
                isDragging: false,
                isEscaping: false,
                energy: 0
            },
            {
                x: this.canvas.width / 2,
                y: this.canvas.height * 0.4,
                vx: 50 * (this.settings.intensity / 50),
                vy: 0,
                m: 20,
                color: '#7c3aed', // Obtuse - purple
                baseColor: '#7c3aed',
                trail: [],
                isDragging: false,
                isEscaping: false,
                energy: 0
            }
        ];
        
        // Calculate initial angles and update stability
        this.updateAngles();
        this.calculateSystemEnergy();
        this.analyzeSystemStability();
    }

    /**
     * Calculate the angle between three bodies (central body and two others)
     * @param {number} centerIdx - Index of the central body
     * @param {number} body1Idx - Index of the first outer body
     * @param {number} body2Idx - Index of the second outer body
     * @returns {number} Angle in degrees
     */
    calculateAngle(centerIdx, body1Idx, body2Idx) {
        const center = this.bodies[centerIdx];
        const body1 = this.bodies[body1Idx];
        const body2 = this.bodies[body2Idx];
        
        // Vector from center to body1
        const v1x = body1.x - center.x;
        const v1y = body1.y - center.y;
        
        // Vector from center to body2
        const v2x = body2.x - center.x;
        const v2y = body2.y - center.y;
        
        // Calculate angle using dot product
        const dot = v1x * v2x + v1y * v2y;
        const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
        
        // Avoid division by zero
        if (mag1 === 0 || mag2 === 0) return 0;
        
        // Calculate angle in degrees, clamping to avoid floating point errors
        const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.acos(cosTheta) * 180 / Math.PI;
    }
    
    /**
     * Update the angles between all three bodies
     */
    updateAngles() {
        // Calculate angles for each body as the center
        for (let i = 0; i < 3; i++) {
            const angle = this.calculateAngle(
                i,
                (i + 1) % 3,
                (i + 2) % 3
            );
            
            // Determine angle type and color
            let type, color;
            if (Math.abs(angle - 90) < 1) {
                type = 'Right';
                color = '#ffaa00';
            } else if (angle < 90) {
                type = 'Acute';
                color = '#00d4ff';
            } else {
                type = 'Obtuse';
                color = '#7c3aed';
            }
            
            this.angles[i] = { bodies: [i, (i + 1) % 3, (i + 2) % 3], angle, type, color };
            
            // Update body color based on the angle it forms
            this.bodies[i].color = color;
        }
    }
    
    /**
     * Calculate total energy of the system (kinetic + potential)
     */
    calculateSystemEnergy() {
        this.updateBodyEnergies();
        let energy = 0;
        for (const body of this.bodies) {
            energy += body.energy;
        }
        this.systemEnergy = energy;
    }

    /**
     * Update per-body energies and escape status
     */
    updateBodyEnergies() {
        // Reset energies with kinetic term
        for (const body of this.bodies) {
            const v2 = body.vx * body.vx + body.vy * body.vy;
            body.energy = 0.5 * body.m * v2;
        }

        // Add potential terms
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b1 = this.bodies[i];
                const b2 = this.bodies[j];
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const r = Math.sqrt(dx * dx + dy * dy);
                if (r > 0) {
                    const pe = this.G * b1.m * b2.m / r;
                    b1.energy -= pe;
                    b2.energy -= pe;
                }
            }
        }

        // Determine escaping status
        for (const body of this.bodies) {
            body.isEscaping = body.energy > 0;
        }
    }
    
    /**
     * Analyze system stability based on angles and energy
     */
    analyzeSystemStability() {
        // Count angle types
        let acuteCount = 0;
        let rightCount = 0;
        let obtuseCount = 0;
        
        this.angles.forEach(angle => {
            if (angle.type === 'Acute') acuteCount++;
            else if (angle.type === 'Right') rightCount++;
            else obtuseCount++;
        });
        
        // Determine stability
        if (acuteCount >= 2) {
            this.systemStability = 'Stable Orbit';
        } else if (rightCount >= 2) {
            this.systemStability = 'Boundary Condition';
        } else if (obtuseCount >= 2) {
            this.systemStability = 'Chaotic';
        } else if (acuteCount === 1 && rightCount === 1 && obtuseCount === 1) {
            this.systemStability = 'Meta-stable';
        } else {
            this.systemStability = 'Analyzing...';
        }
    }

    // Mouse handlers removed as they're replaced by InteractiveController

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
        
        // Update physics based on deltaTime * speed
        this.update(deltaTime * this.settings.speed);
        
        // Render the scene
        this.draw(timestamp);
    }

    /**
     * Update scene physics and state
     * @param {number} dt - Delta time in seconds, adjusted by speed
     */
    update(dt) {
        if (dt <= 0) return;

        // Skip physics update for bodies being dragged
        if (this.bodies.every(b => b.isDragging)) return;

        // Calculate gravitational forces
        for (const body of this.bodies) {
            if (body.isDragging) {
                body.ax = 0;
                body.ay = 0;
                continue;
            }
            
            let fx = 0, fy = 0;
            for (const other of this.bodies) {
                if (body === other) continue;
                
                const dx = other.x - body.x;
                const dy = other.y - body.y;
                const r2 = dx * dx + dy * dy;
                
                // Avoid singularity (bodies too close)
                if (r2 < Math.max(body.m, other.m) * 4) continue;
                
                const r = Math.sqrt(r2);
                const force = this.G * body.m * other.m / r2;
                
                fx += force * dx / r;
                fy += force * dy / r;
            }
            
            body.ax = fx / body.m;
            body.ay = fy / body.m;
        }

        // Update velocities and positions
        for (const body of this.bodies) {
            if (body.isDragging) continue;
            
            body.vx += body.ax * dt;
            body.vy += body.ay * dt;
            body.x += body.vx * dt;
            body.y += body.vy * dt;

            // Add to trail
            if (this.showTrails) {
                body.trail.push({ x: body.x, y: body.y });
                if (body.trail.length > this.trailLength / this.settings.speed) {
                    body.trail.shift();
                }
            }

            // Boundary handling (wrap around)
            if (body.x < -body.m) body.x = this.canvas.width + body.m;
            if (body.x > this.canvas.width + body.m) body.x = -body.m;
            if (body.y < -body.m) body.y = this.canvas.height + body.m;
            if (body.y > this.canvas.height + body.m) body.y = -body.m;
        }
        
        // Update angles and system analysis
        this.updateAngles();
        this.calculateSystemEnergy();
        this.analyzeSystemStability();
    }

    /**
     * Draw the scene - handles both normal and video modes
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    /**
     * Get the label for the perspective button
     * @returns {string} Button label
     */
    getPerspectiveLabel() {
        if (this.activePerspective === -1) {
            return 'Global View';
        } else {
            return `Body ${this.activePerspective + 1} Perspective`;
        }
    }
    
    /**
     * Cycle through different perspectives
     */
    cyclePerspective() {
        this.activePerspective = (this.activePerspective + 1) % 4 - (this.activePerspective === 2 ? 0 : 0);
        // Clear trails when switching perspective
        if (this.showTrails) {
            this.bodies.forEach(b => b.trail = []);
        }
    }
    
    /**
     * Convert global coordinates to perspective-relative coordinates
     * @param {number} x - Global x coordinate
     * @param {number} y - Global y coordinate
     * @returns {Object} Transformed coordinates {x, y}
     */
    transformToPerspective(x, y) {
        if (this.activePerspective === -1) {
            // Global perspective - no transformation
            return { x, y };
        }
        
        // Get the reference body
        const refBody = this.bodies[this.activePerspective];
        
        // Transform to be relative to the reference body
        return {
            x: x - refBody.x + this.canvas.width / 2,
            y: y - refBody.y + this.canvas.height / 2
        };
    }
    
    draw(timestamp) {
        // Clear canvas with semi-transparent background for trail effect
        this.ctx.fillStyle = `rgba(10, 10, 10, ${this.showTrails ? 0.15 : 1.0})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw reference grid from current perspective
        this.drawGrid();
        
        // Draw perspective indicator
        if (this.activePerspective !== -1) {
            this.drawPerspectiveIndicator();
        }
        
        // Draw connection lines between bodies
        this.drawConnectionLines();
        
        // Draw trails
        if (this.showTrails) {
            this.drawTrails();
        }
        
        // Draw bodies
        this.drawBodies();
        
        // Draw angles
        this.drawAngles();
        
        // Draw relative velocity vectors if enabled
        if (this.showRelativeVectors && this.activePerspective !== -1) {
            this.drawRelativeVectors();
        }
        
        // Draw info panel if not in video mode
        if (!this.settings.videoMode) {
            if (this.controller) {
                // Update info panel with real-time metrics
                const escaping = this.bodies
                    .map((b, i) => b.isEscaping ? i + 1 : null)
                    .filter(v => v !== null)
                    .join(', ') || 'None';

                this.controller.updateInfoPanel({
                    'System Stability': this.systemStability,
                    'System Energy': this.systemEnergy.toFixed(1),
                    'Escaping Bodies': escaping,
                    'G Constant': this.G.toFixed(2),
                    'Perspective': this.getPerspectiveLabel(),
                    'Angles': this.angles.map(a =>
                        `Body ${a.bodies[0] + 1}: ${a.type} (${a.angle.toFixed(1)}°)`
                    ).join('\n'),
                    'Trails': this.showTrails ? 'Enabled' : 'Disabled'
                });
                this.controller.render(timestamp);
            }
        } else {
            this.drawVideoInfo();
        }
    }
    
    /**
     * Draw reference grid
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Adjust grid offset based on perspective
        let offsetX = 0, offsetY = 0;
        
        if (this.activePerspective !== -1) {
            const refBody = this.bodies[this.activePerspective];
            offsetX = (refBody.x % 50);
            offsetY = (refBody.y % 50);
        }
        
        // Draw vertical grid lines
        const gridSize = 50;
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw origin crosshair when in perspective view
        if (this.activePerspective !== -1) {
            const center = this.transformToPerspective(0, 0);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(center.x - 20, center.y);
            this.ctx.lineTo(center.x + 20, center.y);
            this.ctx.moveTo(center.x, center.y - 20);
            this.ctx.lineTo(center.x, center.y + 20);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw connection lines between bodies
     */
    /**
     * Draw indicator showing which body's perspective is active
     */
    drawPerspectiveIndicator() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 100;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = this.bodies[this.activePerspective].color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Add perspective label
        this.ctx.fillStyle = this.bodies[this.activePerspective].color;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Body ${this.activePerspective + 1} Perspective`, centerX, centerY - radius - 10);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Draw relative velocity vectors for each body
     */
    drawRelativeVectors() {
        const refBody = this.bodies[this.activePerspective];
        
        for (let i = 0; i < this.bodies.length; i++) {
            if (i === this.activePerspective) continue;
            
            const body = this.bodies[i];
            const transformed = this.transformToPerspective(body.x, body.y);
            
            // Calculate relative velocity
            const relVx = body.vx - refBody.vx;
            const relVy = body.vy - refBody.vy;
            const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);
            const scaleFactor = body.m * 0.05;
            
            // Draw relative velocity vector
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(transformed.x, transformed.y);
            this.ctx.lineTo(
                transformed.x + relVx * scaleFactor,
                transformed.y + relVy * scaleFactor
            );
            this.ctx.stroke();
            
            // Add arrowhead
            const angle = Math.atan2(relVy, relVx);
            this.ctx.beginPath();
            this.ctx.moveTo(transformed.x + relVx * scaleFactor, transformed.y + relVy * scaleFactor);
            this.ctx.lineTo(
                transformed.x + relVx * scaleFactor - 10 * Math.cos(angle - Math.PI / 6),
                transformed.y + relVy * scaleFactor - 10 * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.lineTo(
                transformed.x + relVx * scaleFactor - 10 * Math.cos(angle + Math.PI / 6),
                transformed.y + relVy * scaleFactor - 10 * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fill();
            
            // Add relative speed label
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${relSpeed.toFixed(1)} u/s`,
                transformed.x + relVx * scaleFactor / 2,
                transformed.y + relVy * scaleFactor / 2 - 5
            );
            this.ctx.textAlign = 'left';
        }
    }
    
    drawConnectionLines() {
        // Draw lines connecting the bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body1 = this.bodies[i];
            const body2 = this.bodies[(i + 1) % this.bodies.length];
            
            // Transform coordinates based on perspective
            const pos1 = this.transformToPerspective(body1.x, body1.y);
            const pos2 = this.transformToPerspective(body2.x, body2.y);
            
            // Get angle information for this pair
            const angleInfo = this.angles.find(a =>
                a.bodies[0] === i && a.bodies[1] === (i + 1) % 3
            );
            
            // Draw line with angle type color
            this.ctx.strokeStyle = angleInfo ? angleInfo.color : '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(pos1.x, pos1.y);
            this.ctx.lineTo(pos2.x, pos2.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    /**
     * Draw body trails
     */
    drawTrails() {
        this.bodies.forEach(body => {
            if (body.trail.length <= 1) return;

            this.ctx.strokeStyle = body.isEscaping ? '#ff4444' : body.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            // Transform the first point
            const firstPoint = this.transformToPerspective(body.trail[0].x, body.trail[0].y);
            this.ctx.moveTo(firstPoint.x, firstPoint.y);
            
            // Transform and draw the rest of the trail
            for (let i = 1; i < body.trail.length; i++) {
                const point = this.transformToPerspective(body.trail[i].x, body.trail[i].y);
                this.ctx.lineTo(point.x, point.y);
            }
            
            this.ctx.stroke();
        });
    }
    
    /**
     * Draw celestial bodies
     */
    drawBodies() {
        this.bodies.forEach((body, index) => {
            // Transform coordinates based on perspective
            const pos = this.transformToPerspective(body.x, body.y);
            
            // Draw glow effect
            const gradient = this.ctx.createRadialGradient(
                pos.x, pos.y, 0,
                pos.x, pos.y, body.m * 1.5
            );
            const bodyColor = body.isEscaping ? '#ff4444' : body.color;
            
            // Make the active perspective body brighter
            const alpha = (index === this.activePerspective) ? '95' : '';
            
            gradient.addColorStop(0, bodyColor + alpha);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, body.m * 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw body
            this.ctx.fillStyle = bodyColor + alpha;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, body.m * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add indicator for perspective body
            if (index === this.activePerspective) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, body.m * 1.0, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Draw velocity vector (only in global view or for other bodies in perspective view)
            if (!body.isDragging && (this.activePerspective === -1 || index !== this.activePerspective)) {
                const speed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
                const scaleFactor = body.m * 0.05;
                
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
                
                // In global view, show absolute velocity. In perspective view, show relative to reference frame
                if (this.activePerspective === -1) {
                    this.ctx.lineTo(
                        pos.x + body.vx * scaleFactor,
                        pos.y + body.vy * scaleFactor
                    );
                } else {
                    // Show velocity relative to reference body
                    const refBody = this.bodies[this.activePerspective];
                    this.ctx.lineTo(
                        pos.x + (body.vx - refBody.vx) * scaleFactor,
                        pos.y + (body.vy - refBody.vy) * scaleFactor
                    );
                }
                this.ctx.stroke();
            }

            if (body.isEscaping) {
                this.ctx.fillStyle = '#ff4444';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Escaping', pos.x, pos.y - body.m * 2);
                this.ctx.textAlign = 'left';
            }
            
            // Label bodies with numbers
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${index + 1}`, pos.x, pos.y + 5);
        });
    }
    
    /**
     * Draw angle arcs
     */
    drawAngles() {
        this.angles.forEach(angleInfo => {
            const centerBody = this.bodies[angleInfo.bodies[0]];
            const body1 = this.bodies[angleInfo.bodies[1]];
            const body2 = this.bodies[angleInfo.bodies[2]];
            
            // Transform coordinates based on perspective
            const centerPos = this.transformToPerspective(centerBody.x, centerBody.y);
            const pos1 = this.transformToPerspective(body1.x, body1.y);
            const pos2 = this.transformToPerspective(body2.x, body2.y);
            
            // Vectors from center to each body in transformed coordinates
            const v1x = pos1.x - centerPos.x;
            const v1y = pos1.y - centerPos.y;
            const v2x = pos2.x - centerPos.x;
            const v2y = pos2.y - centerPos.y;
            
            // Calculate angles for arc drawing
            const angle1 = Math.atan2(v1y, v1x);
            const angle2 = Math.atan2(v2y, v2x);
            
            // Draw arc
            this.ctx.strokeStyle = angleInfo.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            // Arc radius based on body mass
            const arcRadius = centerBody.m * 1.5;
            this.ctx.arc(centerPos.x, centerPos.y, arcRadius, angle1, angle2);
            this.ctx.stroke();
            
            // Add angle label
            const midAngle = (angle1 + angle2) / 2;
            const labelX = centerPos.x + arcRadius * 1.5 * Math.cos(midAngle);
            const labelY = centerPos.y + arcRadius * 1.5 * Math.sin(midAngle);
            
            this.ctx.fillStyle = angleInfo.color;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${angleInfo.angle.toFixed(0)}°`, labelX, labelY);
            this.ctx.textAlign = 'left';
        });
    }

    /**
     * Draw the information panel for normal mode
     */
    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 320, 160);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Angle Reality Classification', 20, 35);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(`Gravitational Constant (G): ${this.G.toFixed(2)}`, 20, 60);
        
        // Show angle classifications
        for (let i = 0; i < this.angles.length; i++) {
            const angle = this.angles[i];
            this.ctx.fillStyle = angle.color;
            this.ctx.fillText(`Body ${angle.bodies[0] + 1}: ${angle.type} (${angle.angle.toFixed(1)}°)`, 20, 85 + i * 20);
        }
        
        // System stability status
        let statusColor;
        switch (this.systemStability) {
            case 'Stable Orbit':
                statusColor = '#00ff88';
                break;
            case 'Boundary Condition':
                statusColor = '#ffaa00';
                break;
            case 'Chaotic':
                statusColor = '#ff4444';
                break;
            case 'Meta-stable':
                statusColor = '#00d4ff';
                break;
            default:
                statusColor = '#ffffff';
        }
        
        this.ctx.fillStyle = statusColor;
        this.ctx.fillText(`Stability: ${this.systemStability}`, 20, 145);
        
        // Instructions
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText('Drag bodies to reposition, click to toggle trails', 20, 165);
    }

    /**
     * Draw minimal information for video recording mode
     */
    drawVideoInfo() {
        // Stability status for video mode
        let statusColor;
        switch (this.systemStability) {
            case 'Stable Orbit':
                statusColor = '#00ff88';
                break;
            case 'Boundary Condition':
                statusColor = '#ffaa00';
                break;
            case 'Chaotic':
                statusColor = '#ff4444';
                break;
            case 'Meta-stable':
                statusColor = '#00d4ff';
                break;
            default:
                statusColor = '#ffffff';
        }
        
        this.ctx.fillStyle = statusColor;
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`${this.systemStability}`, this.canvas.width - 20, 30);
        
        // Show total system energy
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Energy: ${this.systemEnergy.toFixed(1)}`, this.canvas.width - 20, 60);
        
        this.ctx.textAlign = 'left'; // Reset alignment
    }

    /**
     * Update scene settings when changed from the framework
     * @param {Object} newSettings - The new settings object
     */
    updateSettings(newSettings) {
        // Update G based on intensity
        if (newSettings.intensity !== undefined) {
            // Map intensity 0-100 to G 0-2.0
            this.G = (newSettings.intensity / 50.0);
        }
        
        Object.assign(this.settings, newSettings);
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
        
        // Clear bodies
        this.bodies = [];
    }
}