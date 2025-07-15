// SEP Marketing Page - Main JavaScript
// ====================================

// DOM Elements
const navContainer = document.querySelector('.nav-container');
const navLinks = document.querySelectorAll('.nav-link');
const vizTabs = document.querySelectorAll('.viz-tab');
const vizPanels = document.querySelectorAll('.viz-panel');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initVisualizationTabs();
    initSmoothScroll();
    initHeroCanvas();
});

// Navigation scroll effect
function initNavigation() {
    let lastScrollY = 0;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Add scrolled class for styling
        if (scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
        
        lastScrollY = scrollY;
    });
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offset = 80; // Navigation height
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Visualization tabs functionality
function initVisualizationTabs() {
    vizTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const vizType = tab.dataset.viz;
            
            // Update active tab
            vizTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            vizPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `viz-${vizType}`) {
                    panel.classList.add('active');
                    
                    // Initialize visualization if needed
                    initializeVisualization(vizType);
                }
            });
        });
    });
    
    // Initialize first visualization
    initializeVisualization('prime-spiral');
}

// Initialize specific visualization
function initializeVisualization(type) {
    switch(type) {
        case 'prime-spiral':
            if (window.initPrimeSpiral) {
                window.initPrimeSpiral();
            }
            break;
        case 'recursion-tree':
            if (window.initRecursionTree) {
                window.initRecursionTree();
            }
            break;
        case 'coherence-map':
            if (window.initCoherenceMap) {
                window.initCoherenceMap();
            }
            break;
        case 'factor-network':
            if (window.initFactorNetwork) {
                window.initFactorNetwork();
            }
            break;
    }
}

// Hero canvas animation with prime numbers
function initHeroCanvas() {
    const canvas = document.getElementById('prime-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let primes = generatePrimes(1000);
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Generate prime numbers up to n
    function generatePrimes(n) {
        const sieve = new Array(n + 1).fill(true);
        sieve[0] = sieve[1] = false;
        
        for (let i = 2; i * i <= n; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= n; j += i) {
                    sieve[j] = false;
                }
            }
        }
        
        return sieve.map((isPrime, num) => isPrime ? num : null).filter(Boolean);
    }
    
    // Particle class
    class Particle {
        constructor(x, y, prime) {
            this.x = x;
            this.y = y;
            this.prime = prime;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.log(prime) * 2;
            this.opacity = 0.6;
            this.connections = [];
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off edges
            if (this.x < this.radius || this.x > canvas.width - this.radius) {
                this.vx = -this.vx;
            }
            if (this.y < this.radius || this.y > canvas.height - this.radius) {
                this.vy = -this.vy;
            }
            
            // Keep in bounds
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
        
        draw() {
            // Draw particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.fill();
            
            // Draw prime number
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.font = '12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.prime, this.x, this.y);
        }
        
        connectTo(other) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const opacity = (1 - distance / 150) * 0.3;
                
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                ctx.stroke();
            }
        }
    }
    
    // Initialize particles
    function initParticles() {
        particles = [];
        const numParticles = Math.min(20, primes.length);
        
        for (let i = 0; i < numParticles; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const prime = primes[i];
            particles.push(new Particle(x, y, prime));
        }
    }
    
    // Animation loop
    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                particles[i].connectTo(particles[j]);
            }
        }
        
        // Draw particles on top
        particles.forEach(particle => {
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    initParticles();
    animate();
}

// Utility functions
const utils = {
    // Check if a number is prime
    isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        
        return true;
    },
    
    // Generate prime numbers up to n
    generatePrimes(n) {
        const primes = [];
        for (let i = 2; i <= n; i++) {
            if (this.isPrime(i)) {
                primes.push(i);
            }
        }
        return primes;
    },
    
    // Get prime factors of a number
    getPrimeFactors(n) {
        const factors = [];
        let divisor = 2;
        
        while (n > 1) {
            if (n % divisor === 0) {
                factors.push(divisor);
                n /= divisor;
            } else {
                divisor++;
            }
        }
        
        return factors;
    },
    
    // Map value to color
    valueToColor(value, min, max) {
        const normalized = (value - min) / (max - min);
        const hue = (1 - normalized) * 240; // Blue to red
        return `hsl(${hue}, 70%, 50%)`;
    }
};

// Export utilities
window.SEPUtils = utils;