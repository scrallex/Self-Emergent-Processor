/**
 * Mathematics Library for SEP Demos
 * Provides math utilities for trigonometry, waves, primes, and more
 */

class MathLib {
    constructor() {
        // Constants
        this.PI = Math.PI;
        this.TWO_PI = Math.PI * 2;
        this.HALF_PI = Math.PI / 2;
        this.GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
        
        // Cached prime numbers
        this.primeCache = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    }
    
    /**
     * Basic trigonometric functions with enhancements
     */
    
    // Cosine function normalized to range [0, 1]
    normCos(angle) {
        return (Math.cos(angle) + 1) / 2;
    }
    
    // Sine function normalized to range [0, 1]
    normSin(angle) {
        return (Math.sin(angle) + 1) / 2;
    }
    
    // Safe tangent function that avoids division by zero
    safeTan(angle) {
        const cos = Math.cos(angle);
        if (Math.abs(cos) < 1e-10) {
            return Math.sign(Math.sin(angle)) * 1e10;
        }
        return Math.sin(angle) / cos;
    }
    
    // Maps angle to appropriate classification
    classifyAngle(angle) {
        // Normalize angle to [0, PI]
        while (angle < 0) angle += this.TWO_PI;
        angle = angle % this.TWO_PI;
        if (angle > this.PI) angle = this.TWO_PI - angle;
        
        // Classify angle
        if (Math.abs(angle - this.HALF_PI) < 0.01) {
            return 'right';
        } else if (angle < this.HALF_PI) {
            return 'acute';
        } else {
            return 'obtuse';
        }
    }
    
    /**
     * Wave functions
     */
    
    // Generate a sine wave array
    sineWave(length, frequency = 1, amplitude = 1, phase = 0) {
        const result = [];
        for (let i = 0; i < length; i++) {
            const x = i / length * this.TWO_PI * frequency + phase;
            result.push(amplitude * Math.sin(x));
        }
        return result;
    }
    
    // Generate a cosine wave array
    cosineWave(length, frequency = 1, amplitude = 1, phase = 0) {
        const result = [];
        for (let i = 0; i < length; i++) {
            const x = i / length * this.TWO_PI * frequency + phase;
            result.push(amplitude * Math.cos(x));
        }
        return result;
    }
    
    // Combine multiple waves
    combineWaves(waves) {
        const length = waves[0].length;
        const result = new Array(length).fill(0);
        
        for (const wave of waves) {
            for (let i = 0; i < length; i++) {
                result[i] += wave[i];
            }
        }
        
        return result;
    }
    
    // Apply Fourier Transform to decompose a complex wave
    fourierTransform(signal) {
        const N = signal.length;
        const result = {
            real: new Array(N).fill(0),
            imag: new Array(N).fill(0),
            magnitude: new Array(N).fill(0),
            phase: new Array(N).fill(0)
        };
        
        // Compute Discrete Fourier Transform
        // This is a simple implementation for educational purposes
        for (let k = 0; k < N; k++) {
            for (let n = 0; n < N; n++) {
                const phi = (this.TWO_PI * k * n) / N;
                result.real[k] += signal[n] * Math.cos(phi);
                result.imag[k] -= signal[n] * Math.sin(phi);
            }
            
            // Compute magnitude and phase
            result.magnitude[k] = Math.sqrt(result.real[k]**2 + result.imag[k]**2) / N;
            result.phase[k] = Math.atan2(result.imag[k], result.real[k]);
        }
        
        return result;
    }
    
    // Inverse Fourier Transform to reconstruct a signal
    inverseFourierTransform(fourier, numSamples = null) {
        const N = numSamples || fourier.real.length;
        const signal = new Array(N).fill(0);
        
        for (let n = 0; n < N; n++) {
            for (let k = 0; k < fourier.real.length; k++) {
                const phi = (this.TWO_PI * k * n) / N;
                signal[n] += fourier.real[k] * Math.cos(phi) - fourier.imag[k] * Math.sin(phi);
            }
            signal[n] /= N;
        }
        
        return signal;
    }
    
    /**
     * Prime number functions
     */
    
    // Check if a number is prime
    isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        
        // Check cached primes first
        if (this.primeCache.includes(num)) return true;
        
        // If greater than last cached prime, we need to check
        const sqrtNum = Math.sqrt(num);
        for (let i = 5; i <= sqrtNum; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        
        // Add to cache if it's a manageable size
        if (num < 10000) {
            this.primeCache.push(num);
            this.primeCache.sort((a, b) => a - b);
        }
        
        return true;
    }
    
    // Find the nth prime number
    nthPrime(n) {
        if (n <= 0) return null;
        
        // Expand cache if needed
        while (this.primeCache.length < n) {
            let candidate = this.primeCache[this.primeCache.length - 1] + 2;
            while (!this.isPrime(candidate)) {
                candidate += 2;
            }
            this.primeCache.push(candidate);
        }
        
        return this.primeCache[n - 1];
    }
    
    // Generate primes up to a limit
    generatePrimes(limit) {
        if (limit <= 1) return [];
        
        // Sieve of Eratosthenes for efficient prime generation
        const sieve = Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        
        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) {
                    sieve[j] = false;
                }
            }
        }
        
        const primes = [];
        for (let i = 2; i <= limit; i++) {
            if (sieve[i]) primes.push(i);
        }
        
        // Update cache with new primes
        this.primeCache = [...new Set([...this.primeCache, ...primes])].sort((a, b) => a - b);
        
        return primes;
    }
    
    // Generate a point on the Ulam spiral for a given number
    ulamCoordinates(num) {
        if (num <= 0) return { x: 0, y: 0 };
        
        // Find the ring number and side length
        const ring = Math.ceil((Math.sqrt(num) - 1) / 2);
        const sideLength = 2 * ring;
        
        // Find the starting number of the ring
        const ringStart = Math.pow(2 * ring - 1, 2) + 1;
        
        // Find the offset within the ring
        const offset = num - ringStart;
        
        // Find the side within the ring (0=bottom, 1=left, 2=top, 3=right)
        const side = Math.floor(offset / sideLength);
        
        // Find the position within the side
        const pos = offset % sideLength;
        
        // Calculate coordinates
        let x, y;
        
        switch (side) {
            case 0: // Bottom side
                x = ring - pos;
                y = -ring;
                break;
            case 1: // Left side
                x = -ring;
                y = -ring + pos;
                break;
            case 2: // Top side
                x = -ring + pos;
                y = ring;
                break;
            case 3: // Right side
                x = ring;
                y = ring - pos;
                break;
            default:
                x = 0;
                y = 0;
        }
        
        return { x, y };
    }
    
    /**
     * Vector operations
     */
    
    // Vector addition
    vecAdd(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    }
    
    // Vector subtraction
    vecSub(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }
    
    // Vector scalar multiplication
    vecScale(v, scalar) {
        return { x: v.x * scalar, y: v.y * scalar };
    }
    
    // Vector magnitude (length)
    vecMagnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    
    // Vector normalization
    vecNormalize(v) {
        const mag = this.vecMagnitude(v);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: v.x / mag, y: v.y / mag };
    }
    
    // Vector dot product
    vecDot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    // Vector cross product (2D vectors return scalar)
    vecCross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
    
    // Vector angle
    vecAngle(v) {
        return Math.atan2(v.y, v.x);
    }
    
    // Angle between two vectors
    vecAngleBetween(v1, v2) {
        const dot = this.vecDot(v1, v2);
        const mag1 = this.vecMagnitude(v1);
        const mag2 = this.vecMagnitude(v2);
        
        if (mag1 === 0 || mag2 === 0) return 0;
        
        const cosine = dot / (mag1 * mag2);
        // Clamp to handle floating-point errors
        return Math.acos(Math.max(-1, Math.min(1, cosine)));
    }
    
    // Calculate the cosine similarity between two vectors
    cosineSimilarity(v1, v2) {
        const dot = this.vecDot(v1, v2);
        const mag1 = this.vecMagnitude(v1);
        const mag2 = this.vecMagnitude(v2);
        
        if (mag1 === 0 || mag2 === 0) return 0;
        return dot / (mag1 * mag2);
    }
    
    /**
     * Random number utilities
     */
    
    // Random number in range [min, max]
    random(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // Random integer in range [min, max]
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }
    
    // Random vector with given magnitude
    randomVector(magnitude = 1) {
        const angle = this.random(0, this.TWO_PI);
        return {
            x: magnitude * Math.cos(angle),
            y: magnitude * Math.sin(angle)
        };
    }
    
    /**
     * Interpolation functions
     */
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Bilinear interpolation
    bilinearInterpolation(x, y, q11, q12, q21, q22, x1, x2, y1, y2) {
        const tx = (x - x1) / (x2 - x1);
        const ty = (y - y1) / (y2 - y1);
        
        const r1 = this.lerp(q11, q21, tx);
        const r2 = this.lerp(q12, q22, tx);
        
        return this.lerp(r1, r2, ty);
    }
    
    // Smooth step function
    smoothStep(edge0, edge1, x) {
        // Scale and clamp x to 0..1 range
        x = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        // Evaluate polynomial
        return x * x * (3 - 2 * x);
    }
    
    /**
     * Special mathematical functions
     */
    
    // Calculate π using the Leibniz formula
    calculatePiLeibniz(iterations) {
        let pi = 0;
        let sign = 1;
        
        for (let i = 0; i < iterations; i++) {
            pi += sign / (2 * i + 1);
            sign *= -1;
        }
        
        return pi * 4;
    }
    
    // Calculate π using the Nilakantha series
    calculatePiNilakantha(iterations) {
        let pi = 3;
        let sign = 1;
        
        for (let i = 1; i <= iterations; i++) {
            const term = 4 / (2*i * (2*i+1) * (2*i+2));
            pi += sign * term;
            sign *= -1;
        }
        
        return pi;
    }
    
    // Calculate π using Monte Carlo method
    calculatePiMonteCarlo(iterations) {
        let inside = 0;
        
        for (let i = 0; i < iterations; i++) {
            const x = Math.random();
            const y = Math.random();
            const distance = Math.sqrt(x*x + y*y);
            
            if (distance <= 1) {
                inside++;
            }
        }
        
        return 4 * inside / iterations;
    }
    
    // Calculate the Fibonacci sequence up to n
    fibonacci(n) {
        if (n <= 0) return [];
        if (n === 1) return [1];
        
        const sequence = [1, 1];
        for (let i = 2; i < n; i++) {
            sequence.push(sequence[i-1] + sequence[i-2]);
        }
        
        return sequence;
    }
    
    // Map a value from one range to another
    mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    
    // Clamp a value to a range
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}

export default MathLib;