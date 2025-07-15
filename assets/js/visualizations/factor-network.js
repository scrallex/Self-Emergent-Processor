// Factor Network Visualization
// 3D network of prime factorization relationships
// ===============================================

window.initFactorNetwork = function() {
    const container = document.getElementById('network-container');
    if (!container) return;
    
    const rangeInput = document.getElementById('network-range');
    const rangeValue = document.getElementById('network-range-value');
    const toggle3DBtn = document.getElementById('network-3d');
    
    let maxNumber = parseInt(rangeInput.value);
    let is3D = true;
    let scene, camera, renderer, controls;
    let nodes = new Map();
    let edges = [];
    let animationId = null;
    
    // Three.js setup
    function initThreeJS() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        
        // Camera
        const width = container.clientWidth;
        const height = 400;
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 50);
        
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        
        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(50, 50, 50);
        scene.add(pointLight);
        
        // Resize handler
        window.addEventListener('resize', onWindowResize);
    }
    
    function onWindowResize() {
        const width = container.clientWidth;
        const height = 400;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // Node class
    class NetworkNode {
        constructor(number, position) {
            this.number = number;
            this.position = position;
            this.factors = getPrimeFactors(number);
            this.isPrime = this.factors.length === 1 && this.factors[0] === number;
            this.connections = [];
            
            // Create mesh
            const geometry = new THREE.SphereGeometry(this.getRadius(), 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: this.getColor(),
                emissive: this.getColor(),
                emissiveIntensity: 0.3,
                shininess: 100
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.copy(position);
            
            // Add text label
            this.createLabel();
        }
        
        getRadius() {
            if (this.isPrime) return 1.5;
            return Math.min(3, 1 + Math.log(this.number) / 4);
        }
        
        getColor() {
            if (this.isPrime) {
                // Prime numbers - blue gradient
                const hue = 200 + (this.number % 60);
                return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
            } else if (this.factors.length === 2 && this.factors[0] === this.factors[1]) {
                // Perfect squares - purple
                return new THREE.Color(0x7c3aed);
            } else if (this.factors.every(f => f <= 7)) {
                // Smooth numbers - green
                return new THREE.Color(0x00ff88);
            } else {
                // Other composites - orange gradient
                const hue = 30 + (this.number % 30);
                return new THREE.Color(`hsl(${hue}, 70%, 50%)`);
            }
        }
        
        createLabel() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            
            context.font = 'Bold 32px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(this.number.toString(), 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(4, 4, 1);
            sprite.position.copy(this.mesh.position);
            sprite.position.y += this.getRadius() + 2;
            
            this.label = sprite;
        }
        
        update() {
            // Gentle floating animation
            this.mesh.position.y = this.position.y + Math.sin(Date.now() * 0.001 + this.number) * 0.5;
            this.label.position.y = this.mesh.position.y + this.getRadius() + 2;
            
            // Rotate prime numbers
            if (this.isPrime) {
                this.mesh.rotation.y += 0.01;
            }
        }
    }
    
    // Edge class
    class NetworkEdge {
        constructor(node1, node2, type) {
            this.node1 = node1;
            this.node2 = node2;
            this.type = type; // 'factor', 'twin', 'sequence'
            
            const material = new THREE.LineBasicMaterial({
                color: this.getColor(),
                opacity: this.getOpacity(),
                transparent: true
            });
            
            const points = [
                node1.mesh.position.clone(),
                node2.mesh.position.clone()
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.line = new THREE.Line(geometry, material);
        }
        
        getColor() {
            switch(this.type) {
                case 'factor': return 0x00d4ff;
                case 'twin': return 0xff00ff;
                case 'sequence': return 0x00ff88;
                default: return 0xffffff;
            }
        }
        
        getOpacity() {
            switch(this.type) {
                case 'factor': return 0.6;
                case 'twin': return 0.8;
                case 'sequence': return 0.4;
                default: return 0.5;
            }
        }
        
        update() {
            // Update line positions
            const positions = this.line.geometry.attributes.position.array;
            positions[0] = this.node1.mesh.position.x;
            positions[1] = this.node1.mesh.position.y;
            positions[2] = this.node1.mesh.position.z;
            positions[3] = this.node2.mesh.position.x;
            positions[4] = this.node2.mesh.position.y;
            positions[5] = this.node2.mesh.position.z;
            this.line.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    // Prime utilities
    function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        
        return true;
    }
    
    function getPrimeFactors(n) {
        const factors = [];
        let divisor = 2;
        let temp = n;
        
        while (temp > 1) {
            if (temp % divisor === 0) {
                factors.push(divisor);
                temp /= divisor;
            } else {
                divisor++;
            }
        }
        
        return factors;
    }
    
    // Generate network
    function generateNetwork() {
        // Clear existing
        nodes.clear();
        edges = [];
        while(scene.children.length > 2) {
            scene.remove(scene.children[2]);
        }
        
        // Position nodes using force-directed layout simulation
        const positions = calculatePositions(maxNumber);
        
        // Create nodes
        for (let i = 2; i <= maxNumber; i++) {
            const pos = positions.get(i) || new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                is3D ? (Math.random() - 0.5) * 40 : 0
            );
            
            const node = new NetworkNode(i, pos);
            nodes.set(i, node);
            scene.add(node.mesh);
            scene.add(node.label);
        }
        
        // Create edges
        createFactorEdges();
        createTwinPrimeEdges();
        createSequenceEdges();
        
        edges.forEach(edge => scene.add(edge.line));
    }
    
    function calculatePositions(max) {
        const positions = new Map();
        const primes = [];
        
        // Collect primes
        for (let i = 2; i <= max; i++) {
            if (isPrime(i)) primes.push(i);
        }
        
        // Position primes in a spiral
        primes.forEach((prime, index) => {
            const angle = index * 0.5;
            const radius = 10 + index * 0.5;
            const height = is3D ? (index - primes.length / 2) * 0.5 : 0;
            
            positions.set(prime, new THREE.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            ));
        });
        
        // Position composites based on their factors
        for (let i = 4; i <= max; i++) {
            if (!isPrime(i)) {
                const factors = getPrimeFactors(i);
                let x = 0, y = 0, z = 0;
                
                factors.forEach(factor => {
                    const factorPos = positions.get(factor);
                    if (factorPos) {
                        x += factorPos.x;
                        y += factorPos.y;
                        z += factorPos.z;
                    }
                });
                
                positions.set(i, new THREE.Vector3(
                    x / factors.length,
                    y / factors.length,
                    z / factors.length
                ));
            }
        }
        
        return positions;
    }
    
    function createFactorEdges() {
        // Connect numbers to their prime factors
        nodes.forEach((node, number) => {
            if (!node.isPrime) {
                const uniqueFactors = [...new Set(node.factors)];
                uniqueFactors.forEach(factor => {
                    const factorNode = nodes.get(factor);
                    if (factorNode) {
                        const edge = new NetworkEdge(node, factorNode, 'factor');
                        edges.push(edge);
                    }
                });
            }
        });
    }
    
    function createTwinPrimeEdges() {
        // Connect twin primes
        nodes.forEach((node, number) => {
            if (node.isPrime) {
                if (nodes.has(number + 2) && nodes.get(number + 2).isPrime) {
                    const edge = new NetworkEdge(node, nodes.get(number + 2), 'twin');
                    edges.push(edge);
                }
            }
        });
    }
    
    function createSequenceEdges() {
        // Connect arithmetic sequences
        const sequences = [
            [2, 3, 5], // Start of primes
            [4, 6, 8], // Powers of 2 sequence
            [9, 12, 15], // Multiples of 3
        ];
        
        sequences.forEach(seq => {
            for (let i = 0; i < seq.length - 1; i++) {
                if (nodes.has(seq[i]) && nodes.has(seq[i + 1])) {
                    const edge = new NetworkEdge(
                        nodes.get(seq[i]), 
                        nodes.get(seq[i + 1]), 
                        'sequence'
                    );
                    edges.push(edge);
                }
            }
        });
    }
    
    // Animation loop
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // Update nodes and edges
        nodes.forEach(node => node.update());
        edges.forEach(edge => edge.update());
        
        // Update controls
        controls.update();
        
        // Render
        renderer.render(scene, camera);
    }
    
    // Event listeners
    rangeInput.addEventListener('input', (e) => {
        maxNumber = parseInt(e.target.value);
        rangeValue.textContent = maxNumber;
        generateNetwork();
    });
    
    toggle3DBtn.addEventListener('click', () => {
        is3D = !is3D;
        toggle3DBtn.textContent = is3D ? 'Toggle 2D' : 'Toggle 3D';
        generateNetwork();
    });
    
    // Initialize
    initThreeJS();
    generateNetwork();
    animate();
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        renderer.dispose();
    });
};