// Prime Spiral Visualization (Ulam Spiral)
// ========================================

window.initPrimeSpiral = function() {
    const canvas = document.getElementById('spiral-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const maxInput = document.getElementById('spiral-max');
    const maxValueSpan = document.getElementById('spiral-max-value');
    const patternSelect = document.getElementById('spiral-pattern');
    
    let maxNumber = parseInt(maxInput.value);
    let pattern = patternSelect.value;
    let animationId = null;
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 400;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Prime checking functions
    const primeCache = new Map();
    
    function isPrime(n) {
        if (primeCache.has(n)) return primeCache.get(n);
        
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) {
                primeCache.set(n, false);
                return false;
            }
        }
        
        primeCache.set(n, true);
        return true;
    }
    
    function isTwinPrime(n) {
        return isPrime(n) && (isPrime(n - 2) || isPrime(n + 2));
    }
    
    function isMersennePrime(n) {
        if (!isPrime(n)) return false;
        
        // Check if n = 2^p - 1 for some p
        let m = n + 1;
        return (m & (m - 1)) === 0; // Check if m is power of 2
    }
    
    function isGaussianPrime(n) {
        if (!isPrime(n)) return false;
        return n % 4 === 3;
    }
    
    // Ulam spiral generation
    function generateSpiral() {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate cell size based on max number
        const spiralSize = Math.ceil(Math.sqrt(maxNumber));
        const cellSize = Math.min(width, height) / spiralSize;
        
        // Spiral generation variables
        let x = 0, y = 0;
        let dx = 1, dy = 0;
        let segmentLength = 1;
        let segmentPassed = 0;
        
        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 0.5;
        
        // Generate spiral and plot numbers
        for (let n = 1; n <= maxNumber; n++) {
            const screenX = centerX + x * cellSize;
            const screenY = centerY + y * cellSize;
            
            // Determine if this number should be highlighted
            let shouldHighlight = false;
            let color = '#00d4ff';
            
            switch (pattern) {
                case 'all':
                    shouldHighlight = isPrime(n);
                    break;
                case 'twin':
                    shouldHighlight = isTwinPrime(n);
                    color = '#ff00ff';
                    break;
                case 'mersenne':
                    shouldHighlight = isMersennePrime(n);
                    color = '#00ff88';
                    break;
                case 'gaussian':
                    shouldHighlight = isGaussianPrime(n);
                    color = '#ffaa00';
                    break;
            }
            
            if (shouldHighlight) {
                // Draw prime dot
                const radius = cellSize * 0.4;
                
                // Glow effect
                const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius * 2);
                gradient.addColorStop(0, color + '80');
                gradient.addColorStop(0.5, color + '40');
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(screenX - radius * 2, screenY - radius * 2, radius * 4, radius * 4);
                
                // Main dot
                ctx.beginPath();
                ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                
                // Add number text for small spirals
                if (cellSize > 20) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `${cellSize * 0.3}px JetBrains Mono`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(n, screenX, screenY);
                }
            } else if (cellSize > 10) {
                // Draw non-prime dots (smaller)
                ctx.beginPath();
                ctx.arc(screenX, screenY, cellSize * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fill();
            }
            
            // Move to next position in spiral
            if (segmentPassed === segmentLength) {
                segmentPassed = 0;
                
                // Rotate direction
                const temp = dx;
                dx = -dy;
                dy = temp;
                
                // Increase segment length every two turns
                if (dy === 0) {
                    segmentLength++;
                }
            }
            
            x += dx;
            y += dy;
            segmentPassed++;
        }
        
        // Draw pattern info
        drawPatternInfo();
    }
    
    function drawPatternInfo() {
        const patterns = {
            'all': { name: 'All Primes', count: 0 },
            'twin': { name: 'Twin Primes', count: 0 },
            'mersenne': { name: 'Mersenne Primes', count: 0 },
            'gaussian': { name: 'Gaussian Primes', count: 0 }
        };
        
        // Count primes of each type
        for (let n = 2; n <= maxNumber; n++) {
            if (isPrime(n)) patterns.all.count++;
            if (isTwinPrime(n)) patterns.twin.count++;
            if (isMersennePrime(n)) patterns.mersenne.count++;
            if (isGaussianPrime(n)) patterns.gaussian.count++;
        }
        
        // Draw info box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 200, 60);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const currentPattern = patterns[pattern];
        ctx.fillText(`Pattern: ${currentPattern.name}`, 20, 20);
        ctx.fillText(`Count: ${currentPattern.count}`, 20, 40);
    }
    
    // Animate spiral generation
    function animateSpiral() {
        let currentMax = 10;
        
        function animate() {
            if (currentMax <= maxNumber) {
                maxNumber = currentMax;
                generateSpiral();
                currentMax += Math.ceil(currentMax * 0.1);
                animationId = requestAnimationFrame(animate);
            } else {
                maxNumber = parseInt(maxInput.value);
                generateSpiral();
            }
        }
        
        animate();
    }
    
    // Event listeners
    maxInput.addEventListener('input', (e) => {
        maxNumber = parseInt(e.target.value);
        maxValueSpan.textContent = maxNumber;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        generateSpiral();
    });
    
    patternSelect.addEventListener('change', (e) => {
        pattern = e.target.value;
        generateSpiral();
    });
    
    // Initial render with animation
    animateSpiral();
};