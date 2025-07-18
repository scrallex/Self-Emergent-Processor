class NumberPathVisualization {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 15;

        this.viewMode = 'grid'; // 'grid', 'spiral', 'sphere'
        this.currentFrame = 0;

        this.initControls();
        this.handleResize();
        window.addEventListener('resize', this.handleResize.bind(this));

        this.animate();
    }

    initControls() {
        document.getElementById('visualizeBtn').addEventListener('click', () => this.visualize());
        document.getElementById('viewMode').addEventListener('change', (e) => {
            this.viewMode = e.target.value;
            this.visualize();
        });
    }

    visualize() {
        const number = parseInt(document.getElementById('numberInput').value);
        if (isNaN(number) || number < 1) {
            alert("Please enter a valid number greater than 0.");
            return;
        }
        console.log(`Visualizing number: ${number} in ${this.viewMode} mode.`);
        this.primes = this.getPrimes(number * 2); // Ensure we have enough primes
        this.primeToIndex = new Map(this.primes.map((p, i) => [p, i + 1]));
        
        this.path = this.generatePath(number);
        this.currentFrame = 0;
        console.log('Generated Path:', this.path);
    }

    generatePath(limit) {
        const fullPath = [{ x: 0, y: 0, z: 0, spiralX: 0, spiralY: 0 }];
        const coordinates = { 1: { x: 0, y: 0, z: 0, spiralX: 0, spiralY: 0 } };
        let x = 0, y = 0, dx = 0, dy = -1;

        for (let n = 2; n <= limit; n++) {
            if ((x === y) || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
                [dx, dy] = [-dy, dx];
            }
            x += dx;
            y += dy;

            const lastPoint = coordinates[n - 1];
            const factors = this.getPrimeFactors(n, this.primes);
            let coord;

            if (factors.length === 1) {
                coord = { x: this.primeToIndex.get(n), y: 0, z: 0 };
            } else if (factors.length === 2) {
                coord = { x: this.primeToIndex.get(factors[0]), y: this.primeToIndex.get(factors[1]), z: 0 };
            } else if (factors.length === 3) {
                coord = { x: this.primeToIndex.get(factors[0]), y: this.primeToIndex.get(factors[1]), z: this.primeToIndex.get(factors[2]) };
            } else {
                let x_coord = this.primeToIndex.get(factors[0]) || 0;
                let y_coord = this.primeToIndex.get(factors[1]) || 0;
                let z_coord = this.primeToIndex.get(factors[2]) || 0;
                for (let i = 3; i < factors.length; i++) {
                    const p_idx = this.primeToIndex.get(factors[i]) || 1;
                    if (i % 3 === 0) x_coord += p_idx;
                    if (i % 3 === 1) y_coord += p_idx;
                    if (i % 3 === 2) z_coord += p_idx;
                }
                coord = { x: x_coord, y: y_coord, z: z_coord };
            }
            coordinates[n] = { ...coord, spiralX: x, spiralY: y };

            // Interpolate for a smooth path
            const numSteps = 10;
            for (let i = 1; i <= numSteps; i++) {
                const t = i / numSteps;
                const interpolatedPoint = {
                    x: lastPoint.x * (1 - t) + coordinates[n].x * t,
                    y: lastPoint.y * (1 - t) + coordinates[n].y * t,
                    z: lastPoint.z * (1 - t) + coordinates[n].z * t,
                    spiralX: lastPoint.spiralX * (1 - t) + coordinates[n].spiralX * t,
                    spiralY: lastPoint.spiralY * (1 - t) + coordinates[n].spiralY * t,
                };
                fullPath.push(interpolatedPoint);
            }
        }
        return fullPath;
    }

    getPrimes(n) {
        const primes = [];
        const isPrime = new Array(n + 1).fill(true);
        isPrime[0] = isPrime[1] = false;
        for (let i = 2; i <= n; i++) {
            if (isPrime[i]) {
                primes.push(i);
                for (let j = i * i; j <= n; j += i) {
                    isPrime[j] = false;
                }
            }
        }
        return primes;
    }

    getPrimeFactors(n, primesList) {
        const factors = [];
        let d = n;
        for (const p of primesList) {
            if (p * p > d) break;
            while (d % p === 0) {
                factors.push(p);
                d /= p;
            }
        }
        if (d > 1) {
            factors.push(d);
        }
        return factors.sort((a, b) => b - a);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.path) {
            this.currentFrame = (this.currentFrame || 0) + 1;
            if (this.currentFrame >= this.path.length) {
                this.currentFrame = this.path.length -1;
            }
        }

        if (this.viewMode === 'sphere') {
            this.drawSphere();
            this.renderer.render(this.scene, this.camera);
        } else if (this.viewMode === 'grid') {
            this.drawGrid();
        } else if (this.viewMode === 'spiral') {
            this.drawSpiral();
        }
        
        this.drawLabels();
    }

    drawGrid() {
        if (!this.path) return;
        this.ctx.lineWidth = 2;
        
        for (let i = 1; i <= this.currentFrame; i++) {
            const startPoint = this.path[i-1];
            const endPoint = this.path[i];
            const number = Math.floor((i - 1) / 10) + 1;
            
            this.ctx.strokeStyle = this.getColor(number);
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.x * 10 + this.canvas.width / 2, startPoint.y * 10 + this.canvas.height / 2);
            this.ctx.lineTo(endPoint.x * 10 + this.canvas.width / 2, endPoint.y * 10 + this.canvas.height / 2);
            this.ctx.stroke();
        }
    }

    drawSpiral() {
        if (!this.path) return;
        this.ctx.lineWidth = 2;
        
        for (let i = 1; i <= this.currentFrame; i++) {
            const startPoint = this.path[i-1];
            const endPoint = this.path[i];
            const number = Math.floor((i - 1) / 10) + 1;
            
            this.ctx.strokeStyle = this.getColor(number);
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.spiralX * 10 + this.canvas.width / 2, startPoint.spiralY * 10 + this.canvas.height / 2);
            this.ctx.lineTo(endPoint.spiralX * 10 + this.canvas.width / 2, endPoint.spiralY * 10 + this.canvas.height / 2);
            this.ctx.stroke();
        }
    }

    drawSphere() {
        if (!this.path) return;

        if (this.pathLine) {
            this.scene.remove(this.pathLine);
        }

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();

        for (let i = 1; i <= this.currentFrame; i++) {
            const startPoint = this.getSphereCoordinates(i - 1);
            const endPoint = this.getSphereCoordinates(i);
            const number = Math.floor((i - 1) / 10) + 1;
            const pathColor = this.getColor(number);
            color.set(pathColor);

            positions.push(startPoint.x, startPoint.y, startPoint.z);
            positions.push(endPoint.x, endPoint.y, endPoint.z);
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        this.pathLine = new THREE.LineSegments(geometry, material);
        this.scene.add(this.pathLine);
    }

    getSphereCoordinates(pathIndex) {
        const point = this.path[pathIndex];
        const number = Math.floor((pathIndex) / 10) + 1;
        if (number === 0) return {x:0, y:0, z:0};
        const factors = this.getPrimeFactors(number, this.primes);

        if (factors.length === 1) { // Prime
            return { x: 0, y: this.primeToIndex.get(number), z: 0 };
        } else { // Composite
            const radius = this.primeToIndex.get(factors[0]) || 1;
            const angle = (this.primeToIndex.get(factors[1]) || 1) * Math.PI * 2;
            return {
                x: radius * Math.cos(angle),
                y: this.primeToIndex.get(factors[0]) || 0, // Y-axis represents the prime axis
                z: radius * Math.sin(angle)
            };
        }
    }

    getColor(n) {
        if (n === 0) return '#ffffff';
        const factors = this.getPrimeFactors(n, this.primes);
        if (factors.length === 1) return '#0000ff'; // Blue for primes
        if (factors.length === 2 && factors[0] === factors[1]) return '#ff0000'; // Red for squares
        if (factors.length === 3 && factors[0] === factors[1] && factors[1] === factors[2]) return '#00ff00'; // Green for cubics
        
        // Placeholder for twin prime composites
        return '#ffff00'; // Yellow
    }

    drawLabels() {
        if (!this.path || !this.currentFrame) return;
        const number = Math.floor((this.currentFrame) / 10) + 1;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Number: ${number}`, 20, 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mainCanvas');
    new NumberPathVisualization(canvas);
});