/**
 * Scene 8: Multi-Perspective Coherence - Flocking Simulation
 *
 * Implements a boids-style flocking system with cosine-based alignment and
 * obtuse-angle dispersion. Birds attempt to align with neighbors when the
 * angle between their headings is acute (cosine positive) and disperse when
 * the angle becomes obtuse (cosine negative).
 */
export default class Scene8 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.boids = [];
        this.time = 0;
        this.lastTime = 0;

        // parameters
        this.neighborRadius = 50;
        this.separationDist = 20;
        this.maxSpeed = 2;
        
        // Visual settings
        this.showConnections = true;
        this.showVelocities = true;
        
        // Metrics for analyzing emergent patterns
        this.rotationMetrics = {
            globalRotation: 0,       // Measures overall rotation direction
            localRotations: [],      // Tracks local vortices
            coherenceIndex: 0,       // How aligned the flock is overall
            rotationalMomentum: 0    // Accumulated rotational energy
        };
        
        // For tracking emergent patterns
        this.patternDetection = {
            centerX: 0,
            centerY: 0,
            radius: 0,
            detected: false,
            type: 'none', // 'clockwise', 'counterclockwise', 'chaotic'
            intensity: 0
        };
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createFlock(50);
        
        // Add mouse interaction
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
        return Promise.resolve();
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    createFlock(count) {
        this.boids = [];
        
        // Create boids with enhanced properties
        for (let i = 0; i < count; i++) {
            this.boids.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.maxSpeed,
                vy: (Math.random() - 0.5) * this.maxSpeed,
                // Additional properties for visualization and analysis
                heading: 0,
                neighbors: [],
                alignment: 0,
                color: '#00ff88',
                size: 4,
                // For tracking history to detect rotations
                history: [],
                historyMax: 20,
                rotationSense: 0, // +1 for clockwise, -1 for counterclockwise
                // For pattern visualization
                inPattern: false
            });
        }
        
        // Initialize local rotation tracking
        this.rotationMetrics.localRotations = Array(Math.min(5, Math.floor(count / 10))).fill().map(() => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: 50 + Math.random() * 100,
            rotation: 0,
            strength: 0,
            boids: []
        }));
    }
    
    /**
     * Handle mouse movement to interact with boids
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update pattern detection center for visualization
        this.patternDetection.centerX = x;
        this.patternDetection.centerY = y;
    }
    
    /**
     * Handle mouse click to create disturbance
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create a "burst" that affects nearby boids
        for (const boid of this.boids) {
            const dx = boid.x - x;
            const dy = boid.y - y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 100) {
                // Push boids away from click
                const force = 1 - (dist / 100);
                const angle = Math.atan2(dy, dx);
                boid.vx += Math.cos(angle) * force * this.maxSpeed * 2;
                boid.vy += Math.sin(angle) * force * this.maxSpeed * 2;
            }
        }
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.time = timestamp;

        this.update(dt * (this.settings.speed || 1));
        this.draw();
    }

    update(dt) {
        const boids = this.boids;
        
        // Clear boid neighbor lists
        for (let b of boids) {
            b.neighbors = [];
            b.alignment = 0;
        }
        
        // Calculate collective center of mass for rotation analysis
        let centerX = 0, centerY = 0;
        for (let b of boids) {
            centerX += b.x;
            centerY += b.y;
        }
        centerX /= boids.length;
        centerY /= boids.length;
        
        // Clear rotation tracking
        this.rotationMetrics.globalRotation = 0;
        this.rotationMetrics.coherenceIndex = 0;
        this.rotationMetrics.rotationalMomentum = 0;
        
        // Reset local rotation trackers
        for (const rotation of this.rotationMetrics.localRotations) {
            rotation.boids = [];
            rotation.rotation = 0;
            rotation.strength = 0;
        }
        
        // Process boid movement and interactions
        for (let b of boids) {
            let ax = 0, ay = 0;
            let count = 0;
            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;
            let sepX = 0, sepY = 0;
            let totalCos = 0;

            for (let other of boids) {
                if (other === b) continue;
                const dx = other.x - b.x;
                const dy = other.y - b.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < this.neighborRadius) {
                    count++;
                    const ovMag = Math.hypot(other.vx, other.vy) || 1;
                    const bvMag = Math.hypot(b.vx, b.vy) || 1;
                    
                    // Calculate cosine between velocity vectors
                    const cos = (b.vx * other.vx + b.vy * other.vy) / (bvMag * ovMag);
                    totalCos += cos;
                    
                    // Save neighbor relationship with cosine value
                    b.neighbors.push({
                        boid: other,
                        dist: dist,
                        cos: cos
                    });
                    
                    // Apply cosine-based alignment force
                    alignX += (other.vx / ovMag) * cos;
                    alignY += (other.vy / ovMag) * cos;
                    
                    // Apply cohesion force
                    cohX += other.x;
                    cohY += other.y;
                    
                    // Apply separation force based on obtuse angles
                    if (cos < 0 || dist < this.separationDist) {
                        const repulse = Math.max(-cos, 0.1) || 1;
                        sepX -= dx * repulse / dist;
                        sepY -= dy * repulse / dist;
                    }
                    
                    // Track rotational movement
                    const crossProduct = b.vx * other.vy - b.vy * other.vx;
                    if (Math.abs(crossProduct) > 0.1) {
                        b.rotationSense = Math.sign(crossProduct);
                    }
                }
            }

            // Calculate alignment index (between -1 and 1)
            b.alignment = count > 0 ? totalCos / count : 0;
            
            // Set color based on alignment - red for negative (obtuse), green for positive (acute)
            const alignmentColor = b.alignment >= 0 ?
                `hsl(${120 * b.alignment}, 100%, 60%)` : // Green for positive alignment
                `hsl(${360 + 60 * b.alignment}, 100%, 60%)`; // Red for negative alignment
            b.color = alignmentColor;
            
            // Apply forces
            if (count > 0) {
                alignX /= count;
                alignY /= count;
                cohX = cohX / count - b.x;
                cohY = cohY / count - b.y;

                // Scale forces based on settings intensity
                const alignWeight = 0.05 * (1 + this.settings.intensity / 100);
                const cohWeight = 0.001 * (1 + this.settings.intensity / 50);
                const sepWeight = 0.05 * (1 - this.settings.intensity / 200); // Less separation at high intensity
                
                ax += alignX * alignWeight;
                ay += alignY * alignWeight;
                ax += cohX * cohWeight;
                ay += cohY * cohWeight;
                ax += sepX * sepWeight;
                ay += sepY * sepWeight;
            }

            b.vx += ax;
            b.vy += ay;

            const speed = Math.hypot(b.vx, b.vy);
            if (speed > this.maxSpeed) {
                b.vx = (b.vx / speed) * this.maxSpeed;
                b.vy = (b.vy / speed) * this.maxSpeed;
            }
            
            // Update heading
            b.heading = Math.atan2(b.vy, b.vx);

            // Move boid
            b.x += b.vx * dt * 60;
            b.y += b.vy * dt * 60;

            // Wrap around screen edges
            if (b.x < 0) b.x += this.width;
            if (b.x > this.width) b.x -= this.width;
            if (b.y < 0) b.y += this.height;
            if (b.y > this.height) b.y -= this.height;
            
            // Track position history for rotation detection
            b.history.unshift({x: b.x, y: b.y});
            if (b.history.length > b.historyMax) {
                b.history.pop();
            }
            
            // Calculate rotation relative to flock center
            if (b.history.length > 5) {
                const dx1 = b.history[0].x - centerX;
                const dy1 = b.history[0].y - centerY;
                const dx2 = b.history[5].x - centerX;
                const dy2 = b.history[5].y - centerY;
                
                // Cross product to determine rotation direction
                const cross = dx1 * dy2 - dy1 * dx2;
                this.rotationMetrics.globalRotation += Math.sign(cross);
                
                // Calculate rotational momentum (angular velocity * distance from center)
                const r = Math.hypot(dx1, dy1);
                const angularVel = cross / (r * r + 0.1);
                this.rotationMetrics.rotationalMomentum += Math.abs(angularVel) * r;
            }
            
            // Assign boid to local rotation trackers
            for (const rotation of this.rotationMetrics.localRotations) {
                const dx = b.x - rotation.x;
                const dy = b.y - rotation.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < rotation.radius) {
                    rotation.boids.push(b);
                    
                    // Track rotation within this local area
                    if (b.history.length > 3) {
                        const prev = b.history[3];
                        const prevDx = prev.x - rotation.x;
                        const prevDy = prev.y - rotation.y;
                        
                        // Calculate angle change (cross product for direction)
                        const cross = dx * prevDy - dy * prevDx;
                        rotation.rotation += Math.sign(cross);
                        rotation.strength += Math.abs(cross) / (dist + 0.1);
                    }
                }
            }
        }
        
        // Update coherence index (how aligned the flock is)
        let totalAlignment = 0;
        for (const b of boids) {
            totalAlignment += Math.abs(b.alignment);
        }
        this.rotationMetrics.coherenceIndex = totalAlignment / boids.length;
        
        // Detect emergent rotational patterns
        this.detectRotationalPatterns();
    }

    /**
     * Detect emergent rotational patterns in the flock
     */
    detectRotationalPatterns() {
        // Reset pattern detection
        this.patternDetection.detected = false;
        this.patternDetection.type = 'none';
        this.patternDetection.intensity = 0;
        
        // Check for global rotation
        const globalRotationStrength = Math.abs(this.rotationMetrics.globalRotation) / this.boids.length;
        
        // Check for local rotations (vortices)
        let strongestVortex = null;
        let maxStrength = 0;
        
        for (const rotation of this.rotationMetrics.localRotations) {
            if (rotation.boids.length > 5 && Math.abs(rotation.rotation) > maxStrength) {
                strongestVortex = rotation;
                maxStrength = Math.abs(rotation.rotation);
            }
        }
        
        // Determine pattern type
        if (globalRotationStrength > 0.3) {
            this.patternDetection.detected = true;
            this.patternDetection.type = this.rotationMetrics.globalRotation > 0 ?
                'clockwise' : 'counterclockwise';
            this.patternDetection.intensity = globalRotationStrength;
            this.patternDetection.radius = Math.min(this.width, this.height) * 0.4;
            
            // Use center of mass
            let centerX = 0, centerY = 0;
            for (const b of this.boids) {
                centerX += b.x;
                centerY += b.y;
            }
            this.patternDetection.centerX = centerX / this.boids.length;
            this.patternDetection.centerY = centerY / this.boids.length;
        }
        else if (strongestVortex && maxStrength > 5) {
            this.patternDetection.detected = true;
            this.patternDetection.type = strongestVortex.rotation > 0 ?
                'clockwise' : 'counterclockwise';
            this.patternDetection.intensity = maxStrength / 10;
            this.patternDetection.centerX = strongestVortex.x;
            this.patternDetection.centerY = strongestVortex.y;
            this.patternDetection.radius = strongestVortex.radius;
            
            // Mark boids in this pattern
            for (const b of this.boids) {
                const dx = b.x - strongestVortex.x;
                const dy = b.y - strongestVortex.y;
                b.inPattern = Math.hypot(dx, dy) < strongestVortex.radius;
            }
        }
        else if (this.rotationMetrics.coherenceIndex < 0.2) {
            this.patternDetection.type = 'chaotic';
            this.patternDetection.intensity = 1 - this.rotationMetrics.coherenceIndex;
        }
    }

    draw() {
        const { ctx, width, height } = this;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw detected pattern if present
        if (this.patternDetection.detected) {
            ctx.strokeStyle = this.patternDetection.type === 'clockwise' ?
                'rgba(0, 255, 136, 0.2)' : 'rgba(255, 136, 0, 0.2)';
            ctx.lineWidth = 2;
            
            // Draw circle representing the pattern
            ctx.beginPath();
            ctx.arc(
                this.patternDetection.centerX,
                this.patternDetection.centerY,
                this.patternDetection.radius,
                0, Math.PI * 2
            );
            ctx.stroke();
            
            // Draw directional arrows to show rotation
            const arrowCount = 8;
            for (let i = 0; i < arrowCount; i++) {
                const angle = (i / arrowCount) * Math.PI * 2;
                const direction = this.patternDetection.type === 'clockwise' ? 1 : -1;
                const arrowAngle = angle + direction * Math.PI / 8;
                
                const x = this.patternDetection.centerX + Math.cos(angle) * this.patternDetection.radius;
                const y = this.patternDetection.centerY + Math.sin(angle) * this.patternDetection.radius;
                
                const arrowSize = 10 * this.patternDetection.intensity;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(arrowAngle) * arrowSize,
                    y + Math.sin(arrowAngle) * arrowSize
                );
                ctx.stroke();
            }
        }

        // Draw connections between aligned boids
        if (this.showConnections) {
            for (const b of this.boids) {
                for (const neighbor of b.neighbors) {
                    if (neighbor.cos > 0.5) { // Only show strong alignments
                        // Color gradient based on cosine (green for aligned, yellow for partial)
                        const gradient = ctx.createLinearGradient(b.x, b.y, neighbor.boid.x, neighbor.boid.y);
                        gradient.addColorStop(0, b.color);
                        gradient.addColorStop(1, neighbor.boid.color);
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = neighbor.cos * 2;
                        ctx.globalAlpha = Math.min(1, neighbor.cos);
                        
                        ctx.beginPath();
                        ctx.moveTo(b.x, b.y);
                        ctx.lineTo(neighbor.boid.x, neighbor.boid.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }
        
        // Draw boids with heading and alignment indicators
        for (const b of this.boids) {
            // Draw history trail for boids in pattern
            if (b.inPattern && b.history.length > 1) {
                ctx.strokeStyle = `rgba(${b.rotationSense > 0 ? '0,255,136' : '255,170,0'}, 0.3)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(b.history[0].x, b.history[0].y);
                
                for (let i = 1; i < b.history.length; i++) {
                    ctx.lineTo(b.history[i].x, b.history[i].y);
                }
                ctx.stroke();
            }
            
            // Draw boid body as triangle showing heading
            const size = b.size;
            const angle = b.heading;
            
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(
                b.x + Math.cos(angle) * size * 2,
                b.y + Math.sin(angle) * size * 2
            );
            ctx.lineTo(
                b.x + Math.cos(angle + 2.5) * size,
                b.y + Math.sin(angle + 2.5) * size
            );
            ctx.lineTo(
                b.x + Math.cos(angle - 2.5) * size,
                b.y + Math.sin(angle - 2.5) * size
            );
            ctx.closePath();
            ctx.fill();
            
            // Draw velocity vector if enabled
            if (this.showVelocities) {
                const speed = Math.hypot(b.vx, b.vy);
                const normalizedSpeed = speed / this.maxSpeed;
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${normalizedSpeed})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(
                    b.x + b.vx * 3,
                    b.y + b.vy * 3
                );
                ctx.stroke();
            }
        }
        
        // Draw local rotation centers
        for (const rotation of this.rotationMetrics.localRotations) {
            if (rotation.boids.length > 5 && Math.abs(rotation.rotation) > 3) {
                ctx.strokeStyle = rotation.rotation > 0 ?
                    'rgba(0, 255, 136, 0.3)' : 'rgba(255, 170, 0, 0.3)';
                ctx.lineWidth = 1;
                
                ctx.beginPath();
                ctx.arc(rotation.x, rotation.y, rotation.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw rotation indicator
                const strength = Math.min(1, Math.abs(rotation.rotation) / 20);
                ctx.font = '12px Arial';
                ctx.fillStyle = rotation.rotation > 0 ? '#00ff88' : '#ffaa00';
                ctx.fillText(
                    `${rotation.rotation > 0 ? '↻' : '↺'} ${rotation.boids.length}`,
                    rotation.x - 10,
                    rotation.y
                );
            }
        }

        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
            this.drawVideoInfo();
        }
    }

    drawInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 180);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Flocking Coherence', 20, 35);
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#cccccc';
        
        // Basic stats
        this.ctx.fillText(`Boids: ${this.boids.length}`, 20, 60);
        this.ctx.fillText(`Intensity: ${this.settings.intensity.toFixed(0)}`, 20, 80);
        
        // Coherence metrics
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillText(`Coherence: ${(this.rotationMetrics.coherenceIndex * 100).toFixed(1)}%`, 20, 100);
        
        // Rotation info
        const rotationDirection = this.rotationMetrics.globalRotation > 0 ? 'Clockwise' : 'Counter-clockwise';
        const rotationStrength = Math.abs(this.rotationMetrics.globalRotation) / this.boids.length;
        
        this.ctx.fillText(
            `Rotation: ${rotationDirection} (${(rotationStrength * 100).toFixed(1)}%)`,
            20, 120
        );
        
        // Pattern detection
        if (this.patternDetection.detected) {
            this.ctx.fillStyle = this.patternDetection.type === 'clockwise' ? '#00ff88' : '#ffaa00';
            this.ctx.fillText(
                `Pattern: ${this.patternDetection.type} rotation`,
                20, 140
            );
            this.ctx.fillText(
                `Strength: ${(this.patternDetection.intensity * 100).toFixed(1)}%`,
                20, 160
            );
        } else if (this.patternDetection.type === 'chaotic') {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillText(`Pattern: Chaotic movement`, 20, 140);
            this.ctx.fillText(
                `Disorder: ${(this.patternDetection.intensity * 100).toFixed(1)}%`,
                20, 160
            );
        } else {
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillText(`Pattern: None detected`, 20, 140);
        }
        
        // Legend for alignment colors
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - 120, 10, 110, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('Alignment', this.width - 110, 30);
        
        // Draw color gradient for alignment
        const gradientY = 45;
        const gradientWidth = 90;
        const gradient = this.ctx.createLinearGradient(
            this.width - 110, gradientY,
            this.width - 110 + gradientWidth, gradientY
        );
        gradient.addColorStop(0, 'hsl(0, 100%, 60%)');   // Red (negative cosine)
        gradient.addColorStop(0.5, 'hsl(60, 100%, 60%)'); // Yellow (neutral)
        gradient.addColorStop(1, 'hsl(120, 100%, 60%)');  // Green (positive cosine)
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.width - 110, 40, gradientWidth, 15);
        
        // Labels
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '10px Arial';
        this.ctx.fillText('Obtuse', this.width - 110, 70);
        this.ctx.fillText('Acute', this.width - 40, 70);
    }

    drawVideoInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Flocking Coherence', this.canvas.width - 20, 30);
        
        if (this.patternDetection.detected) {
            const patternType = this.patternDetection.type.charAt(0).toUpperCase() +
                               this.patternDetection.type.slice(1);
            this.ctx.fillStyle = this.patternDetection.type === 'clockwise' ? '#00ff88' : '#ffaa00';
            this.ctx.fillText(
                `${patternType} Rotation`,
                this.canvas.width - 20, 60
            );
        }
        
        this.ctx.textAlign = 'left';
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Adjust flock size based on intensity
        if (newSettings.intensity !== undefined) {
            const count = Math.floor(10 + newSettings.intensity);
            if (count !== this.boids.length) {
                this.createFlock(count);
            }
            
            // Adjust parameters based on intensity
            // Higher intensity promotes more alignment and reduces separation
            this.neighborRadius = 50 + newSettings.intensity * 0.5;
            this.maxSpeed = 2 + newSettings.intensity * 0.03;
            
            // At higher intensities, reduce separation to encourage pattern formation
            if (newSettings.intensity > 50) {
                this.separationDist = Math.max(5, 20 - (newSettings.intensity - 50) * 0.2);
            } else {
                this.separationDist = 20;
            }
        }
    }

    cleanup() {
        window.removeEventListener('resize', this.resize);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('click', this.handleMouseClick);
        this.boids = [];
    }
}

