// Recursion Tree Visualization
// Prime-indexed recursive pattern evolution
// =========================================

window.initRecursionTree = function() {
    const canvas = document.getElementById('tree-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stepBtn = document.getElementById('tree-step');
    const autoBtn = document.getElementById('tree-auto');
    const resetBtn = document.getElementById('tree-reset');
    const primeDisplay = document.getElementById('tree-prime');
    const infoDisplay = document.getElementById('tree-info');
    
    let currentStep = 0;
    let primes = [];
    let nodes = [];
    let autoPlay = false;
    let animationId = null;
    
    // Tree parameters
    const treeConfig = {
        startX: 0,
        startY: 0,
        angle: -Math.PI / 2,
        length: 80,
        decay: 0.8,
        angleSpread: Math.PI / 6,
        minLength: 5
    };
    
    // Node class for tree structure
    class TreeNode {
        constructor(x, y, angle, length, depth, prime) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.length = length;
            this.depth = depth;
            this.prime = prime;
            this.children = [];
            this.opacity = 0;
            this.targetOpacity = 1;
            this.color = this.calculateColor();
        }
        
        calculateColor() {
            // Color based on prime properties
            const hue = (this.prime * 137.5) % 360; // Golden angle
            return `hsl(${hue}, 70%, 50%)`;
        }
        
        grow() {
            if (this.length < treeConfig.minLength) return;
            
            const branches = this.calculateBranches();
            
            branches.forEach((branch, i) => {
                const newX = this.x + Math.cos(branch.angle) * this.length;
                const newY = this.y + Math.sin(branch.angle) * this.length;
                const newLength = this.length * treeConfig.decay * branch.lengthMod;
                
                const child = new TreeNode(
                    newX, 
                    newY, 
                    branch.angle, 
                    newLength, 
                    this.depth + 1,
                    branch.prime
                );
                
                this.children.push(child);
            });
        }
        
        calculateBranches() {
            // Branch pattern based on prime factorization
            const factors = getPrimeFactors(this.prime);
            const branches = [];
            
            if (factors.length === 1) {
                // Prime number - symmetric branching
                branches.push({
                    angle: this.angle - treeConfig.angleSpread,
                    lengthMod: 1,
                    prime: getNextPrime(this.prime)
                });
                branches.push({
                    angle: this.angle + treeConfig.angleSpread,
                    lengthMod: 1,
                    prime: getNextPrime(this.prime + 1)
                });
            } else {
                // Composite - asymmetric branching based on factors
                factors.forEach((factor, i) => {
                    const angleOffset = (i - factors.length / 2 + 0.5) * treeConfig.angleSpread;
                    branches.push({
                        angle: this.angle + angleOffset,
                        lengthMod: 0.9 + (factor / this.prime) * 0.2,
                        prime: getNextPrime(this.prime + factor)
                    });
                });
            }
            
            return branches;
        }
        
        update() {
            // Smooth opacity transition
            this.opacity += (this.targetOpacity - this.opacity) * 0.1;
            
            // Update children
            this.children.forEach(child => child.update());
        }
        
        draw(ctx) {
            if (this.opacity < 0.01) return;
            
            // Draw branch
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(1, this.length / 10);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw node circle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(endX, endY, Math.max(2, this.length / 20), 0, Math.PI * 2);
            ctx.fill();
            
            // Draw prime number label
            if (this.length > 20) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.prime, endX, endY);
            }
            
            ctx.restore();
            
            // Draw children
            this.children.forEach(child => child.draw(ctx));
        }
    }
    
    // Prime number utilities
    function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        
        return true;
    }
    
    function generatePrimes(count) {
        const result = [];
        let n = 2;
        
        while (result.length < count) {
            if (isPrime(n)) {
                result.push(n);
            }
            n++;
        }
        
        return result;
    }
    
    function getNextPrime(n) {
        while (!isPrime(n)) {
            n++;
        }
        return n;
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
    
    // Calculate information content
    function calculateInformation(step) {
        // Information grows combinatorially with prime steps
        let info = 0;
        for (let i = 0; i <= step && i < primes.length; i++) {
            info += Math.log2(primes[i]);
        }
        return info.toFixed(2);
    }
    
    // Initialize tree
    function initTree() {
        const canvas = document.getElementById('tree-canvas');
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 50;
        
        currentStep = 0;
        primes = generatePrimes(50);
        nodes = [];
        
        // Create root node
        const root = new TreeNode(
            centerX,
            centerY,
            treeConfig.angle,
            treeConfig.length,
            0,
            primes[0]
        );
        
        nodes.push(root);
        updateDisplay();
    }
    
    // Step forward in recursion
    function step() {
        if (currentStep >= primes.length - 1) return;
        
        currentStep++;
        const currentPrime = primes[currentStep];
        
        // Find nodes at the current depth and grow them
        const maxDepth = Math.floor(currentStep / 2);
        nodes.forEach(node => {
            growNodeAtDepth(node, 0, maxDepth);
        });
        
        updateDisplay();
    }
    
    function growNodeAtDepth(node, currentDepth, targetDepth) {
        if (currentDepth === targetDepth && node.children.length === 0) {
            node.grow();
        }
        
        node.children.forEach(child => {
            growNodeAtDepth(child, currentDepth + 1, targetDepth);
        });
    }
    
    // Update display information
    function updateDisplay() {
        primeDisplay.textContent = primes[currentStep];
        infoDisplay.textContent = `${calculateInformation(currentStep)} bits`;
    }
    
    // Animation loop
    function animate() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // Update and draw all nodes
        nodes.forEach(node => {
            node.update();
            node.draw(ctx);
        });
        
        // Auto play
        if (autoPlay && Date.now() % 60 === 0) { // Step every second
            step();
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 400;
        
        // Reinitialize tree on resize
        initTree();
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Event listeners
    stepBtn.addEventListener('click', () => {
        step();
    });
    
    autoBtn.addEventListener('click', () => {
        autoPlay = !autoPlay;
        autoBtn.textContent = autoPlay ? 'Pause' : 'Auto Play';
    });
    
    resetBtn.addEventListener('click', () => {
        autoPlay = false;
        autoBtn.textContent = 'Auto Play';
        initTree();
    });
    
    // Initialize and start animation
    initTree();
    animate();
};