// Scene 7: Quantum Effects - Entanglement and Superposition Visualization
export default class Scene7 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;
        
        // Quantum particles
        this.particles = [];
        this.entanglements = [];
        
        // Wave function visualization
        this.waveFunction = {
            amplitude: 50,
            frequency: 0.02,
            phase: 0,
            collapse: false,
            collapsePoint: null,
            collapseTime: 0
        };
        
        // Quantum field
        this.fieldPoints = [];
        this.fieldResolution = 30;
        
        // Animation state
        this.time = 0;
        this.observing = false;
        
        // Mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    init() {
        // Initialize quantum particles
        this.initializeParticles();
        
        // Initialize quantum field
        this.initializeField();
        
        // Add event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        return Promise.resolve();
    }
    
    initializeParticles() {
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 150;
            
            this.particles.push({
                id: i,
                x: this.canvas.width / 2 + Math.cos(angle) * radius,
                y: this.canvas.height / 2 + Math.sin(angle) * radius,
                baseX: this.canvas.width / 2 + Math.cos(angle) * radius,
                baseY: this.canvas.height / 2 + Math.sin(angle) * radius,
                spin: Math.random() > 0.5 ? 1 : -1,
                phase: Math.random() * Math.PI * 2,
                superposition: true,
                collapsed: false,
                entangledWith: null,
                probability: [],
                color: `hsl(${i * 60}, 70%, 50%)`
            });
        }
        
        // Create entanglements
        for (let i = 0; i < particleCount / 2; i++) {
            const p1 = this.particles[i * 2];
            const p2 = this.particles[i * 2 + 1];
            
            p1.entangledWith = p2.id;
            p2.entangledWith = p1.id;
            
            this.entanglements.push({
                p1: p1,
                p2: p2,
                strength: 1.0
            });
        }
    }
    
    initializeField() {
        this.fieldPoints = [];
        
        for (let x = 0; x < this.canvas.width; x += this.fieldResolution) {
            for (let y = 0; y < this.canvas.height; y += this.fieldResolution) {
                this.fieldPoints.push({
                    x: x,
                    y: y,
                    potential: 0,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    handleMouseDown(e) {
        this.observing = true;
        
        // Check if clicking near a particle
        for (const particle of this.particles) {
            const dist = Math.sqrt(
                Math.pow(this.mouseX - particle.x, 2) + 
                Math.pow(this.mouseY - particle.y, 2)
            );
            
            if (dist < 50 && particle.superposition) {
                // Collapse wave function
                this.collapseParticle(particle);
                
                // Affect entangled particle
                if (particle.entangledWith !== null) {
                    const entangled = this.particles.find(p => p.id === particle.entangledWith);
                    if (entangled && entangled.superposition) {
                        entangled.spin = -particle.spin; // Opposite spin
                        this.collapseParticle(entangled);
                    }
                }
                
                // Create collapse wave
                this.waveFunction.collapse = true;
                this.waveFunction.collapsePoint = { x: particle.x, y: particle.y };
                this.waveFunction.collapseTime = 0;
            }
        }
    }
    
    handleMouseUp() {
        this.observing = false;
    }
    
    collapseParticle(particle) {
        particle.superposition = false;
        particle.collapsed = true;
        particle.collapseTime = this.time;
    }
    
    animate(timestamp) {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update time
        this.time += 0.016 * this.settings.speed;
        
        // Update quantum field
        this.updateQuantumField();
        
        // Draw components
        this.drawQuantumField();
        this.drawEntanglements();
        this.drawParticles();
        this.drawWaveFunction();
        this.drawObservationEffect();
        
        if (!this.settings.videoMode) {
            this.drawInfo();
        }
        
        // Update wave function collapse
        if (this.waveFunction.collapse) {
            this.waveFunction.collapseTime += 0.016;
            if (this.waveFunction.collapseTime > 2) {
                this.waveFunction.collapse = false;
            }
        }
    }
    
    updateQuantumField() {
        const intensity = this.settings.intensity / 100;
        
        for (const point of this.fieldPoints) {
            point.potential = 0;
            
            // Influence from particles
            for (const particle of this.particles) {
                const dist = Math.sqrt(
                    Math.pow(point.x - particle.x, 2) + 
                    Math.pow(point.y - particle.y, 2)
                );
                
                if (particle.superposition) {
                    // Superposition creates wave interference
                    point.potential += Math.sin(dist * 0.05 - this.time * 2 + particle.phase) 
                                     / (1 + dist * 0.01) * intensity;
                } else {
                    // Collapsed particle creates localized field
                    point.potential += Math.exp(-dist * dist / 5000) * particle.spin * intensity;
                }
            }
            
            // Add quantum fluctuations
            point.phase += (Math.random() - 0.5) * 0.1;
        }
    }
    
    drawQuantumField() {
        for (const point of this.fieldPoints) {
            if (Math.abs(point.potential) > 0.01) {
                const intensity = Math.abs(point.potential);
                const color = point.potential > 0 ? 
                    `rgba(0, 212, 255, ${intensity * 0.3})` : 
                    `rgba(255, 0, 136, ${intensity * 0.3})`;
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    point.x - this.fieldResolution / 2,
                    point.y - this.fieldResolution / 2,
                    this.fieldResolution,
                    this.fieldResolution
                );
            }
        }
    }
    
    drawEntanglements() {
        for (const entanglement of this.entanglements) {
            const p1 = entanglement.p1;
            const p2 = entanglement.p2;
            
            if (p1.superposition || p2.superposition) {
                // Draw quantum correlation
                const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                gradient.addColorStop(0, p1.color + '40');
                gradient.addColorStop(0.5, '#ffffff20');
                gradient.addColorStop(1, p2.color + '40');
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Draw correlation pulses
                const pulsePos = (Math.sin(this.time * 3) + 1) / 2;
                const pulseX = p1.x + (p2.x - p1.x) * pulsePos;
                const pulseY = p1.y + (p2.y - p1.y) * pulsePos;
                
                this.ctx.fillStyle = '#ffffff40';
                this.ctx.beginPath();
                this.ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            if (particle.superposition) {
                // Draw probability cloud
                this.drawProbabilityCloud(particle);
            } else {
                // Draw collapsed particle
                this.drawCollapsedParticle(particle);
            }
            
            // Update position for animation
            if (!particle.collapsed) {
                particle.x = particle.baseX + Math.sin(this.time + particle.phase) * 20;
                particle.y = particle.baseY + Math.cos(this.time + particle.phase) * 20;
            }
        }
    }
    
    drawProbabilityCloud(particle) {
        const cloudRadius = 40;
        const layers = 5;
        
        for (let i = layers; i > 0; i--) {
            const layerRadius = (cloudRadius * i) / layers;
            const opacity = (0.2 / layers) * (layers - i + 1);
            
            // Create radial gradient
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, layerRadius
            );
            gradient.addColorStop(0, particle.color + Math.floor(opacity * 255).toString(16));
            gradient.addColorStop(1, particle.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, layerRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw spinning indicator
        const spinAngle = this.time * particle.spin * 2;
        this.ctx.strokeStyle = '#ffffff60';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 15, spinAngle, spinAngle + Math.PI);
        this.ctx.stroke();
        
        // Uncertainty visualization
        const uncertaintyRadius = 30 + Math.sin(this.time * 2 + particle.phase) * 10;
        this.ctx.strokeStyle = particle.color + '40';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, uncertaintyRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawCollapsedParticle(particle) {
        const timeSinceCollapse = this.time - particle.collapseTime;
        
        // Collapse animation
        if (timeSinceCollapse < 1) {
            const scale = 1 - timeSinceCollapse;
            const rippleRadius = 50 * timeSinceCollapse;
            
            this.ctx.strokeStyle = particle.color + Math.floor((1 - timeSinceCollapse) * 255).toString(16);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, rippleRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw solid particle
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw spin indicator
        const spinIndicator = particle.spin > 0 ? '↑' : '↓';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(spinIndicator, particle.x, particle.y);
    }
    
    drawWaveFunction() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height - 100;
        const width = 400;
        const height = 60;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(centerX - width/2 - 10, centerY - height/2 - 10, width + 20, height + 20);
        
        // Draw wave
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let x = -width/2; x < width/2; x++) {
            let y;
            
            if (this.waveFunction.collapse && this.waveFunction.collapsePoint) {
                // Collapsing wave
                const distance = Math.abs(x - (this.waveFunction.collapsePoint.x - centerX));
                const envelope = Math.exp(-distance * distance / (10000 * (1 - this.waveFunction.collapseTime)));
                y = Math.sin(x * 0.05 + this.time * 2) * height/2 * envelope;
            } else {
                // Normal wave
                y = Math.sin(x * 0.05 + this.time * 2) * height/2;
            }
            
            if (x === -width/2) {
                this.ctx.moveTo(centerX + x, centerY - y);
            } else {
                this.ctx.lineTo(centerX + x, centerY - y);
            }
        }
        
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Ψ(x,t) - Quantum Wave Function', centerX, centerY + height/2 + 20);
    }
    
    drawObservationEffect() {
        if (this.observing) {
            // Draw observation indicator
            const gradient = this.ctx.createRadialGradient(
                this.mouseX, this.mouseY, 0,
                this.mouseX, this.mouseY, 100
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 100, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye symbol
            this.ctx.strokeStyle = '#ffffff40';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 20, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawInfo() {
        const infoX = 20;
        const infoY = 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(infoX, infoY, 350, 150);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Quantum Effects Demonstration', infoX + 10, infoY + 25);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        
        const lines = [
            'Click on particles to collapse their wave function',
            'Entangled particles show correlated behavior',
            'Superposition states appear as probability clouds',
            'Collapsed states show definite spin (↑ or ↓)'
        ];
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line, infoX + 10, infoY + 50 + i * 20);
        });
        
        // Statistics
        const superpositionCount = this.particles.filter(p => p.superposition).length;
        const collapsedCount = this.particles.filter(p => p.collapsed).length;
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.fillText(`Superposition: ${superpositionCount} | Collapsed: ${collapsedCount}`, 
                          infoX + 10, infoY + 130);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        // Remove event listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        
        // Clear arrays
        this.particles = [];
        this.entanglements = [];
        this.fieldPoints = [];
    }
}