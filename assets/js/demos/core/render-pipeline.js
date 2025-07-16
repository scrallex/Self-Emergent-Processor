/**
 * Rendering Pipeline
 * Handles canvas rendering, WebGL context, post-processing effects, and camera management
 */

class RenderPipeline {
    constructor(canvas, ctx) {
        // Canvas and context
        this.canvas = canvas;
        this.ctx = ctx;
        
        // WebGL context (created on demand)
        this.gl = null;
        this.glPrograms = new Map();
        
        // Render layers (for compositing)
        this.layers = new Map();
        this.layerOrder = [];
        
        // Offscreen canvases for layer rendering
        this.offscreenCanvases = new Map();
        
        // Camera and viewport
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            rotation: 0,
            target: null, // For following objects
            bounds: {
                minX: null,
                minY: null,
                maxX: null,
                maxY: null
            },
            shake: {
                active: false,
                intensity: 0,
                duration: 0,
                startTime: 0
            }
        };
        
        // Post-processing effects
        this.effects = new Map();
        this.activeEffects = [];
        
        // Performance metrics
        this.metrics = {
            drawCalls: 0,
            objectsRendered: 0,
            lastFrameTime: 0,
            renderTime: 0
        };
        
        // Settings
        this.settings = {
            quality: 'medium',
            antialiasing: true,
            shadows: true,
            particles: true,
            postProcessing: true,
            debug: false
        };
        
        // Quality presets
        this.qualityPresets = {
            low: {
                antialiasing: false,
                shadows: false,
                particles: false,
                postProcessing: false
            },
            medium: {
                antialiasing: true,
                shadows: true,
                particles: true,
                postProcessing: true
            },
            high: {
                antialiasing: true,
                shadows: true,
                particles: true,
                postProcessing: true
            }
        };
        
        // Initialize
        this.initEffects();
    }
    
    /**
     * Initialize the post-processing effects
     */
    initEffects() {
        // Blur effect
        this.effects.set('blur', {
            name: 'Blur',
            active: false,
            params: {
                radius: 5,
                quality: 3
            },
            apply: (ctx, canvas, params) => {
                ctx.filter = `blur(${params.radius}px)`;
                ctx.drawImage(canvas, 0, 0);
                ctx.filter = 'none';
            }
        });
        
        // Glow effect
        this.effects.set('glow', {
            name: 'Glow',
            active: false,
            params: {
                color: 'rgba(0, 212, 255, 0.5)',
                blur: 15,
                strength: 0.5
            },
            apply: (ctx, canvas, params) => {
                // Create a temporary canvas for the glow
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Draw the original content
                tempCtx.drawImage(canvas, 0, 0);
                
                // Apply a color overlay
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.fillStyle = params.color;
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Reset composite operation
                tempCtx.globalCompositeOperation = 'source-over';
                
                // Apply blur to the colored version
                tempCtx.filter = `blur(${params.blur}px)`;
                tempCtx.drawImage(tempCanvas, 0, 0);
                tempCtx.filter = 'none';
                
                // Draw the original content
                ctx.drawImage(canvas, 0, 0);
                
                // Overlay the glowing version with reduced opacity
                ctx.globalAlpha = params.strength;
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.globalAlpha = 1.0;
            }
        });
        
        // Chromatic aberration effect
        this.effects.set('chromaticAberration', {
            name: 'Chromatic Aberration',
            active: false,
            params: {
                offset: 2,
                direction: 0 // in radians
            },
            apply: (ctx, canvas, params) => {
                const dx = Math.cos(params.direction) * params.offset;
                const dy = Math.sin(params.direction) * params.offset;
                
                // Create temporary canvases for each color channel
                const redCanvas = document.createElement('canvas');
                redCanvas.width = canvas.width;
                redCanvas.height = canvas.height;
                const redCtx = redCanvas.getContext('2d');
                
                const blueCanvas = document.createElement('canvas');
                blueCanvas.width = canvas.width;
                blueCanvas.height = canvas.height;
                const blueCtx = blueCanvas.getContext('2d');
                
                // Extract red channel
                redCtx.drawImage(canvas, 0, 0);
                redCtx.globalCompositeOperation = 'multiply';
                redCtx.fillStyle = '#00ffff'; // cyan removes red
                redCtx.fillRect(0, 0, redCanvas.width, redCanvas.height);
                
                // Extract blue channel
                blueCtx.drawImage(canvas, 0, 0);
                blueCtx.globalCompositeOperation = 'multiply';
                blueCtx.fillStyle = '#ffff00'; // yellow removes blue
                blueCtx.fillRect(0, 0, blueCanvas.width, blueCanvas.height);
                
                // Draw with offsets
                ctx.drawImage(canvas, 0, 0); // green channel (original)
                
                ctx.globalCompositeOperation = 'screen';
                ctx.drawImage(redCanvas, dx, dy); // red channel
                ctx.drawImage(blueCanvas, -dx, -dy); // blue channel
                
                // Reset composite operation
                ctx.globalCompositeOperation = 'source-over';
            }
        });
        
        // Vignette effect
        this.effects.set('vignette', {
            name: 'Vignette',
            active: false,
            params: {
                color: 'rgba(0, 0, 0, 0.5)',
                size: 0.7,
                smoothness: 0.5
            },
            apply: (ctx, canvas, params) => {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.max(centerX, centerY) * params.size;
                
                // Create a radial gradient
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, radius * (1 - params.smoothness),
                    centerX, centerY, radius
                );
                
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(1, params.color);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        });
        
        // Noise effect
        this.effects.set('noise', {
            name: 'Noise',
            active: false,
            params: {
                intensity: 0.1,
                monochrome: true
            },
            apply: (ctx, canvas, params) => {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    if (params.monochrome) {
                        // Monochrome noise
                        const noise = (Math.random() * 2 - 1) * 255 * params.intensity;
                        data[i] = Math.max(0, Math.min(255, data[i] + noise));
                        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
                    } else {
                        // Color noise
                        data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() * 2 - 1) * 255 * params.intensity));
                        data[i+1] = Math.max(0, Math.min(255, data[i+1] + (Math.random() * 2 - 1) * 255 * params.intensity));
                        data[i+2] = Math.max(0, Math.min(255, data[i+2] + (Math.random() * 2 - 1) * 255 * params.intensity));
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
            }
        });
        
        // Quantum effect (special for SEP demos)
        this.effects.set('quantum', {
            name: 'Quantum Effect',
            active: false,
            params: {
                intensity: 0.5,
                frequency: 0.1,
                color: 'rgba(0, 212, 255, 0.5)'
            },
            apply: (ctx, canvas, params) => {
                const time = performance.now() * 0.001;
                const numParticles = Math.floor(100 * params.intensity);
                
                for (let i = 0; i < numParticles; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = 1 + Math.random() * 3 * params.intensity;
                    
                    // Quantum "uncertainty" effect
                    const wobble = Math.sin(time * params.frequency * 10 + i) * 5 * params.intensity;
                    
                    ctx.fillStyle = params.color;
                    ctx.beginPath();
                    ctx.arc(x + wobble, y + wobble, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }
    
    /**
     * Get the WebGL context (creating it if it doesn't exist)
     * @returns {WebGLRenderingContext} - The WebGL context
     */
    getWebGLContext() {
        if (!this.gl) {
            try {
                // Try to create WebGL context
                this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
                
                if (!this.gl) {
                    console.warn('WebGL not supported, falling back to Canvas 2D');
                    return null;
                }
                
                // Initialize WebGL
                this.initWebGL();
            } catch (error) {
                console.error('Error initializing WebGL:', error);
                this.gl = null;
                return null;
            }
        }
        
        return this.gl;
    }
    
    /**
     * Initialize WebGL
     */
    initWebGL() {
        const gl = this.gl;
        
        // Set clear color
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Create basic shader program
        this.createBasicShaderProgram();
    }
    
    /**
     * Create a basic shader program for WebGL
     */
    createBasicShaderProgram() {
        const gl = this.gl;
        
        // Vertex shader source
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying lowp vec4 vColor;
            
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;
        
        // Fragment shader source
        const fsSource = `
            varying lowp vec4 vColor;
            
            void main(void) {
                gl_FragColor = vColor;
            }
        `;
        
        // Create shader program
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        
        // Check if shader program linked successfully
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        
        // Store program info
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };
        
        this.glPrograms.set('basic', programInfo);
        return programInfo;
    }
    
    /**
     * Load a shader
     * @param {number} type - The shader type
     * @param {string} source - The shader source code
     * @returns {WebGLShader} - The shader
     */
    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compiling shader: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Create a render layer
     * @param {string} name - The layer name
     * @param {number} zIndex - The z-index (for ordering)
     * @param {Object} options - Additional options
     * @returns {Object} - The layer object
     */
    createLayer(name, zIndex = 0, options = {}) {
        // Create offscreen canvas for this layer
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = this.canvas.width;
        offscreenCanvas.height = this.canvas.height;
        
        const layer = {
            name,
            zIndex,
            visible: true,
            opacity: 1.0,
            blendMode: 'source-over',
            clear: true,
            ...options,
            objects: []
        };
        
        this.layers.set(name, layer);
        this.offscreenCanvases.set(name, offscreenCanvas);
        
        // Sort layers by z-index
        this.layerOrder = Array.from(this.layers.keys()).sort((a, b) => {
            return this.layers.get(a).zIndex - this.layers.get(b).zIndex;
        });
        
        return layer;
    }
    
    /**
     * Add an object to a render layer
     * @param {string} layerName - The layer name
     * @param {Object} object - The object to add
     */
    addToLayer(layerName, object) {
        if (!this.layers.has(layerName)) {
            this.createLayer(layerName);
        }
        
        this.layers.get(layerName).objects.push(object);
    }
    
    /**
     * Remove an object from a layer
     * @param {string} layerName - The layer name
     * @param {Object} object - The object to remove
     */
    removeFromLayer(layerName, object) {
        if (!this.layers.has(layerName)) return;
        
        const layer = this.layers.get(layerName);
        const index = layer.objects.indexOf(object);
        
        if (index !== -1) {
            layer.objects.splice(index, 1);
        }
    }
    
    /**
     * Set the camera position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setCameraPosition(x, y) {
        this.camera.x = x;
        this.camera.y = y;
    }
    
    /**
     * Set the camera zoom
     * @param {number} zoom - Zoom level
     */
    setCameraZoom(zoom) {
        this.camera.zoom = Math.max(0.1, zoom);
    }
    
    /**
     * Set the camera rotation
     * @param {number} rotation - Rotation in radians
     */
    setCameraRotation(rotation) {
        this.camera.rotation = rotation;
    }
    
    /**
     * Set the camera to follow an object
     * @param {Object} target - The object to follow (must have x and y properties)
     * @param {Object} options - Follow options
     */
    setCameraTarget(target, options = {}) {
        this.camera.target = target;
        this.camera.followOptions = {
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0,
            lerp: options.lerp || 0.1, // interpolation factor
            zoom: options.zoom || null
        };
    }
    
    /**
     * Apply camera shake effect
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Shake duration in milliseconds
     */
    applyCameraShake(intensity, duration) {
        this.camera.shake.active = true;
        this.camera.shake.intensity = intensity;
        this.camera.shake.duration = duration;
        this.camera.shake.startTime = performance.now();
    }
    
    /**
     * Update camera position when following a target
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateCamera(deltaTime) {
        // Update camera shake
        if (this.camera.shake.active) {
            const elapsed = performance.now() - this.camera.shake.startTime;
            
            if (elapsed >= this.camera.shake.duration) {
                this.camera.shake.active = false;
            } else {
                const progress = elapsed / this.camera.shake.duration;
                const intensity = this.camera.shake.intensity * (1 - progress);
                
                this.camera.shakeOffsetX = (Math.random() * 2 - 1) * intensity;
                this.camera.shakeOffsetY = (Math.random() * 2 - 1) * intensity;
            }
        } else {
            this.camera.shakeOffsetX = 0;
            this.camera.shakeOffsetY = 0;
        }
        
        // Update camera position when following a target
        if (this.camera.target) {
            const target = this.camera.target;
            const options = this.camera.followOptions;
            
            // Calculate target position with offset
            const targetX = target.x + options.offsetX;
            const targetY = target.y + options.offsetY;
            
            // Lerp to target position
            this.camera.x += (targetX - this.camera.x) * options.lerp;
            this.camera.y += (targetY - this.camera.y) * options.lerp;
            
            // Update zoom if specified
            if (options.zoom !== null) {
                this.camera.zoom += (options.zoom - this.camera.zoom) * options.lerp;
            }
        }
    }
    
    /**
     * Apply the camera transformation to the context
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    applyCamera(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Reset transformation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Move to center
        ctx.translate(centerX, centerY);
        
        // Apply zoom
        ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // Apply rotation
        ctx.rotate(this.camera.rotation);
        
        // Apply camera position and shake
        ctx.translate(
            -this.camera.x + this.camera.shakeOffsetX,
            -this.camera.y + this.camera.shakeOffsetY
        );
    }
    
    /**
     * Enable a post-processing effect
     * @param {string} effectName - The effect name
     * @param {Object} params - Effect parameters (optional)
     */
    enableEffect(effectName, params = {}) {
        if (!this.effects.has(effectName)) {
            console.error(`Effect "${effectName}" not found`);
            return;
        }
        
        const effect = this.effects.get(effectName);
        effect.active = true;
        
        // Update parameters if provided
        if (Object.keys(params).length > 0) {
            effect.params = { ...effect.params, ...params };
        }
        
        // Add to active effects if not already present
        if (!this.activeEffects.includes(effectName)) {
            this.activeEffects.push(effectName);
        }
    }
    
    /**
     * Disable a post-processing effect
     * @param {string} effectName - The effect name
     */
    disableEffect(effectName) {
        if (!this.effects.has(effectName)) {
            console.error(`Effect "${effectName}" not found`);
            return;
        }
        
        this.effects.get(effectName).active = false;
        
        // Remove from active effects
        const index = this.activeEffects.indexOf(effectName);
        if (index !== -1) {
            this.activeEffects.splice(index, 1);
        }
    }
    
    /**
     * Apply post-processing effects
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    applyEffects(ctx) {
        if (!this.settings.postProcessing || this.activeEffects.length === 0) {
            return;
        }
        
        // Create a temporary canvas for processing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Copy current canvas content to temp canvas
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Clear the main canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply each active effect
        for (const effectName of this.activeEffects) {
            const effect = this.effects.get(effectName);
            
            if (effect && effect.active) {
                effect.apply(ctx, tempCanvas, effect.params);
            }
        }
    }
    
    /**
     * Update the renderer settings
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Apply quality preset if specified
        if (newSettings.quality && this.qualityPresets[newSettings.quality]) {
            Object.assign(this.settings, this.qualityPresets[newSettings.quality]);
        }
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        const startTime = performance.now();
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset metrics
        this.metrics.drawCalls = 0;
        this.metrics.objectsRendered = 0;
        
        this.metrics.renderTime = performance.now() - startTime;
    }
    
    /**
     * Render a frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    render(deltaTime) {
        const startTime = performance.now();
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Clear the main canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render each layer to its offscreen canvas
        for (const layerName of this.layerOrder) {
            const layer = this.layers.get(layerName);
            
            // Skip invisible layers
            if (!layer.visible) continue;
            
            const offscreenCanvas = this.offscreenCanvases.get(layerName);
            const offscreenCtx = offscreenCanvas.getContext('2d');
            
            // Clear the offscreen canvas if needed
            if (layer.clear) {
                offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            }
            
            // Apply camera transformation to this layer
            this.applyCamera(offscreenCtx);
            
            // Render all objects in this layer
            for (const object of layer.objects) {
                if (object.render) {
                    object.render(offscreenCtx, deltaTime);
                    this.metrics.objectsRendered++;
                    this.metrics.drawCalls++;
                }
            }
            
            // Reset transformation
            offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Composite this layer onto the main canvas
            this.ctx.globalAlpha = layer.opacity;
            this.ctx.globalCompositeOperation = layer.blendMode;
            this.ctx.drawImage(offscreenCanvas, 0, 0);
        }
        
        // Reset composite operation and alpha
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
        
        // Apply post-processing effects
        if (this.settings.postProcessing && this.activeEffects.length > 0) {
            this.applyEffects(this.ctx);
        }
        
        // Draw debug info if enabled
        if (this.settings.debug) {
            this.drawDebugInfo();
        }
        
        // Update metrics
        this.metrics.lastFrameTime = performance.now();
        this.metrics.renderTime = this.metrics.lastFrameTime - startTime;
    }
    
    /**
     * Draw debug information
     */
    drawDebugInfo() {
        const ctx = this.ctx;
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 280, 120);
        
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`Render Time: ${this.metrics.renderTime.toFixed(2)}ms`, 20, 30);
        ctx.fillText(`Objects: ${this.metrics.objectsRendered}`, 20, 50);
        ctx.fillText(`Draw Calls: ${this.metrics.drawCalls}`, 20, 70);
        ctx.fillText(`Camera: (${this.camera.x.toFixed(0)}, ${this.camera.y.toFixed(0)}, ${this.camera.zoom.toFixed(2)})`, 20, 90);
        ctx.fillText(`Active Effects: ${this.activeEffects.length}`, 20, 110);
    }
    
    /**
     * Get a utility for drawing common shapes
     * @returns {Object} - Drawing utilities
     */
    getDrawingUtils() {
        return {
            // Draw a circle
            circle: (ctx, x, y, radius, options = {}) => {
                const fillStyle = options.fillStyle || null;
                const strokeStyle = options.strokeStyle || null;
                const lineWidth = options.lineWidth || 1;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
                
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
            },
            
            // Draw a rectangle
            rect: (ctx, x, y, width, height, options = {}) => {
                const fillStyle = options.fillStyle || null;
                const strokeStyle = options.strokeStyle || null;
                const lineWidth = options.lineWidth || 1;
                
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(x, y, width, height);
                }
                
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = lineWidth;
                    ctx.strokeRect(x, y, width, height);
                }
            },
            
            // Draw a line
            line: (ctx, x1, y1, x2, y2, options = {}) => {
                const strokeStyle = options.strokeStyle || '#ffffff';
                const lineWidth = options.lineWidth || 1;
                const dashed = options.dashed || false;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                
                if (dashed) {
                    ctx.setLineDash([5, 5]);
                }
                
                ctx.stroke();
                
                if (dashed) {
                    ctx.setLineDash([]);
                }
            },
            
            // Draw text
            text: (ctx, text, x, y, options = {}) => {
                const fillStyle = options.fillStyle || '#ffffff';
                const strokeStyle = options.strokeStyle || null;
                const font = options.font || '16px sans-serif';
                const textAlign = options.textAlign || 'left';
                const textBaseline = options.textBaseline || 'top';
                const lineWidth = options.lineWidth || 1;
                
                ctx.font = font;
                ctx.textAlign = textAlign;
                ctx.textBaseline = textBaseline;
                ctx.fillStyle = fillStyle;
                
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = lineWidth;
                    ctx.strokeText(text, x, y);
                }
                
                ctx.fillText(text, x, y);
            },
            
            // Draw a polygon
            polygon: (ctx, points, options = {}) => {
                const fillStyle = options.fillStyle || null;
                const strokeStyle = options.strokeStyle || null;
                const lineWidth = options.lineWidth || 1;
                
                if (points.length < 2) return;
                
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                
                ctx.closePath();
                
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                    ctx.fill();
                }
                
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
            },
            
            // Draw a sine wave
            sineWave: (ctx, x, y, width, amplitude, frequency, phase, options = {}) => {
                const strokeStyle = options.strokeStyle || '#ffffff';
                const lineWidth = options.lineWidth || 1;
                const steps = options.steps || 100;
                
                ctx.beginPath();
                
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const px = x + t * width;
                    const py = y + Math.sin(t * Math.PI * 2 * frequency + phase) * amplitude;
                    
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        };
    }
}

export default RenderPipeline;