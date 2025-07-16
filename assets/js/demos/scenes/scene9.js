// Scene 9: Self-Reference Loops - A visualization of recursive and cyclical references.
export default class Scene9 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

        this.nodes = [];
        this.links = [];
        this.pulses = [];

        this.numNodes = 25;
        this.time = 0;
        
        // Interaction
        this.draggedNode = null;
        this.mouseX = 0;
        this.mouseY = 0;

        // Event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    init() {
        this.initializeGraph();
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        return Promise.resolve();
    }

    initializeGraph() {
        this.nodes = [];
        this.links = [];
        
        // Create nodes
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes.push({
                id: i,
                x: Math.random() * (this.canvas.width - 200) + 100,
                y: Math.random() * (this.canvas.height - 200) + 100,
                vx: 0,
                vy: 0,
                value: Math.random(),
                radius: 10 + Math.random() * 10,
                isFixed: false
            });
        }

        // Create links (references)
        this.nodes.forEach(sourceNode => {
            const numLinks = 1 + Math.floor(Math.random() * 2); // Each node references 1 or 2 others
            for (let i = 0; i < numLinks; i++) {
                let targetNode = this.nodes[Math.floor(Math.random() * this.numNodes)];
                
                // Avoid linking to self too often, but allow it for "self-reference"
                if (targetNode === sourceNode && Math.random() > 0.1) {
                    targetNode = this.nodes[(i + 1) % this.numNodes];
                }
                
                this.links.push({
                    source: sourceNode,
                    target: targetNode
                });
            }
        });

        // Detect cycles
        this.detectCycles();
    }
    
    detectCycles() {
        // A simple DFS-based cycle detection for highlighting
        this.nodes.forEach(node => node.inCycle = false);
        this.links.forEach(link => link.inCycle = false);

        for (const node of this.nodes) {
            const path = new Set();
            const recursionStack = new Set();
            
            const findCycles = (currentNode) => {
                path.add(currentNode);
                recursionStack.add(currentNode);

                const outgoingLinks = this.links.filter(link => link.source === currentNode);
                for (const link of outgoingLinks) {
                    const neighbor = link.target;
                    if (recursionStack.has(neighbor)) {
                        // Cycle detected
                        link.inCycle = true;
                        neighbor.inCycle = true;
                        // Mark all nodes in the current path as part of a cycle
                        path.forEach(n => n.inCycle = true);
                    } else if (!path.has(neighbor)) {
                        findCycles(neighbor);
                    }
                }
                recursionStack.delete(currentNode);
            };

            findCycles(node);
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        for (const node of this.nodes) {
            const dist = Math.hypot(this.mouseX - node.x, this.mouseY - node.y);
            if (dist < node.radius) {
                this.draggedNode = node;
                node.isFixed = true;
                break;
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (this.draggedNode) {
            this.draggedNode.x = this.mouseX;
            this.draggedNode.y = this.mouseY;
        }
    }

    handleMouseUp(e) {
        if (this.draggedNode) {
            this.draggedNode.isFixed = false;
            this.draggedNode = null;
        }
    }

    updatePhysics() {
        const speed = this.settings.speed;
        
        // Physics forces (repulsion, attraction)
        const repulsion = 1000;
        const attraction = 0.01;

        // Apply forces
        for (const node of this.nodes) {
            if (node.isFixed) {
                node.vx = node.vy = 0;
                continue;
            }

            // Repulsion from other nodes
            for (const other of this.nodes) {
                if (node === other) continue;
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > 1) {
                    const force = repulsion / distSq;
                    node.vx += (dx / Math.sqrt(distSq)) * force;
                    node.vy += (dy / Math.sqrt(distSq)) * force;
                }
            }

            // Attraction to center
            node.vx += (this.canvas.width / 2 - node.x) * attraction;
            node.vy += (this.canvas.height / 2 - node.y) * attraction;
            
            // Damping
            node.vx *= 0.95;
            node.vy *= 0.95;

            // Update position
            node.x += node.vx * speed;
            node.y += node.vy * speed;

            // Boundary
            node.x = Math.max(node.radius, Math.min(this.canvas.width - node.radius, node.x));
            node.y = Math.max(node.radius, Math.min(this.canvas.height - node.radius, node.y));
        }
    }

    updateNodeValues() {
        const nextValues = new Map();

        this.nodes.forEach(node => {
            const referencingLinks = this.links.filter(link => link.target === node);
            if (referencingLinks.length > 0) {
                let sum = 0;
                referencingLinks.forEach(link => {
                    sum += link.source.value;
                });
                const avg = sum / referencingLinks.length;
                nextValues.set(node, node.value + (avg - node.value) * 0.1); // Smooth transition
            } else {
                // Nodes with no references slowly decay
                nextValues.set(node, node.value * 0.99);
            }
        });
        
        this.nodes.forEach(node => node.value = nextValues.get(node));
    }
    
    animate(timestamp) {
        this.time = timestamp;
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePhysics();
        if (Math.floor(this.time / 16) % (Math.floor(10 / this.settings.speed)) === 0) {
            this.updateNodeValues();
        }

        this.drawLinks();
        this.drawNodes();
        this.drawPulses();
        this.updatePulses();

        if (!this.settings.videoMode) {
            this.drawInfo();
        } else {
          this.drawVideoInfo();
        }
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            const hue = 200 + node.value * 160; // Blue (0) to Pink (1)
            this.ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            this.ctx.strokeStyle = node.inCycle ? '#ffaa00' : '#ffffff';
            this.ctx.lineWidth = node.inCycle ? 3 : 1;

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Self-reference loop
            if (this.links.some(l => l.source === node && l.target === node)) {
                this.ctx.strokeStyle = '#ffaa00';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y - node.radius, node.radius * 0.8, Math.PI * 0.25, Math.PI * 1.75);
                this.ctx.stroke();
            }
        });
    }

    drawLinks() {
        this.links.forEach(link => {
            if (link.source === link.target) return; // Skip self-loops here
            
            const { source, target } = link;
            this.ctx.strokeStyle = link.inCycle ? 'rgba(255, 170, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;

            this.ctx.beginPath();
            this.ctx.moveTo(source.x, source.y);
            this.ctx.lineTo(target.x, target.y);
            this.ctx.stroke();

            // Spawn pulses
            if (Math.random() < 0.005 * this.settings.speed) {
                this.pulses.push({
                    x: source.x,
                    y: source.y,
                    targetX: target.x,
                    targetY: target.y,
                    progress: 0,
                    value: source.value
                });
            }
        });
    }

    drawPulses() {
        this.pulses.forEach(pulse => {
            const hue = 200 + pulse.value * 160;
            this.ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
            this.ctx.beginPath();
            this.ctx.arc(pulse.x, pulse.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    updatePulses() {
        this.pulses = this.pulses.filter(pulse => {
            const dx = pulse.targetX - pulse.x;
            const dy = pulse.targetY - pulse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 5) return false;

            pulse.x += dx / dist * 3 * this.settings.speed;
            pulse.y += dy / dist * 3 * this.settings.speed;
            
            return true;
        });
    }

    drawInfo() {
        const cycleCount = this.nodes.filter(n => n.inCycle).length;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(20, 20, 300, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Self-Reference Loops', 30, 45);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('Drag nodes to interact with the system.', 30, 70);
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillText(`Nodes in cycles: ${cycleCount}`, 30, 95);
    }

  drawVideoInfo() {
    // Minimal info for video recording
    const cycleCount = this.nodes.filter(n => n.inCycle).length;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Nodes in cycles: ${cycleCount}`, this.canvas.width - 20, 30);
  }


    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
    
    cleanup() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.nodes = [];
        this.links = [];
        this.pulses = [];
    }
}