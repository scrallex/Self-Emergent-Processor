import { SCENES } from './config/scene-registry.js';

// SEP Demo Framework - Modular Loading System
class SEPDemoFramework {
    constructor() {
        this.currentScene = null;
        this.currentModule = null;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        // Settings
        this.settings = {
            quality: 'medium',
            speed: 1.0,
            intensity: 50,
            videoMode: false
        };
        
        // Presets for video recording
        this.presets = {
            default: { speed: 1.0, intensity: 50 },
            intro: { speed: 0.5, intensity: 30 },
            demo: { speed: 1.0, intensity: 60 },
            climax: { speed: 1.5, intensity: 100 },
            outro: { speed: 0.3, intensity: 20 }
        };
        
        // Scene registry
        this.scenes = SCENES;
    }
    
    async init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas not found');
        }
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    
    // Initialize required dependencies
    _initDependencies() {
        // These would typically be loaded from separate modules
        if (!this._dependencies) {
            this._dependencies = {
                physics: {
                    // Basic physics engine functionality
                    applyGravity: (obj, dt) => { obj.vy += 9.8 * dt; },
                    applyForce: (obj, fx, fy) => { obj.vx += fx; obj.vy += fy; },
                    detectCollision: (obj1, obj2) => {
                        const dx = obj1.x - obj2.x;
                        const dy = obj1.y - obj2.y;
                        return Math.sqrt(dx*dx + dy*dy) < (obj1.radius + obj2.radius);
                    }
                },
                math: {
                    // Math utility functions
                    lerp: (a, b, t) => a + (b - a) * t,
                    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
                    randomRange: (min, max) => min + Math.random() * (max - min),
                    distance: (x1, y1, x2, y2) => Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)),
                    degToRad: (deg) => deg * Math.PI / 180,
                    radToDeg: (rad) => rad * 180 / Math.PI
                },
                eventManager: {
                    // Basic event management
                    listeners: {},
                    on: function(event, callback) {
                        if (!this.listeners[event]) this.listeners[event] = [];
                        this.listeners[event].push(callback);
                    },
                    emit: function(event, data) {
                        if (this.listeners[event]) {
                            this.listeners[event].forEach(callback => callback(data));
                        }
                    },
                    mouse: { x: 0, y: 0, down: false }
                },
                stateManager: {
                    // Simple state management
                    state: {},
                    get: function(key) { return this.state[key]; },
                    set: function(key, value) { this.state[key] = value; }
                },
                renderPipeline: {
                    // Basic render effects
                    effects: [],
                    addEffect: function(effect) { this.effects.push(effect); },
                    applyEffects: function(ctx) {
                        this.effects.forEach(effect => effect(ctx));
                    }
                }
            };
            
            // Set up mouse tracking
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this._dependencies.eventManager.mouse.x = e.clientX - rect.left;
                this._dependencies.eventManager.mouse.y = e.clientY - rect.top;
            });
            
            this.canvas.addEventListener('mousedown', () => {
                this._dependencies.eventManager.mouse.down = true;
            });
            
            this.canvas.addEventListener('mouseup', () => {
                this._dependencies.eventManager.mouse.down = false;
            });
        }
        
        return this._dependencies;
    }
    
    async loadScene(sceneId) {
        // Clean up current scene
        await this.unloadCurrentScene();
        
        // Load new scene
        const scene = this.scenes[sceneId];
        if (!scene) {
            throw new Error(`Scene ${sceneId} not found`);
        }
        
        this.currentScene = sceneId;
        
        try {
            // Initialize dependencies if not already initialized
            const dependencies = this._initDependencies();
            
            const module = await scene.module();
            
            // Handle different constructor parameter patterns for backwards compatibility
            const sceneConstructor = module.default;
            const paramCount = sceneConstructor.length;
            
            if (paramCount > 3) {
                // Full parameter set (for scenes 1, 12 and future scenes)
                const { physics, math, eventManager, stateManager, renderPipeline } = dependencies;
                this.currentModule = new sceneConstructor(
                    this.canvas,
                    this.ctx,
                    this.settings,
                    physics,
                    math,
                    eventManager,
                    stateManager,
                    renderPipeline
                );
            } else {
                // Basic parameter set (for simpler scenes)
                this.currentModule = new sceneConstructor(this.canvas, this.ctx, this.settings);
            }
            
            // Initialize the scene
            if (this.currentModule.init) {
                await this.currentModule.init();
            }
            
            // Start animation
            this.startAnimation();
            
            return true;
        } catch (error) {
            console.error(`Failed to load scene ${sceneId}:`, error);
            console.error(error.stack);  // Log the stack trace for better debugging
            // For pending scenes, show placeholder
            this.showPlaceholder(scene.name);
            return false;
        }
    }
    
    async unloadCurrentScene() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clean up current module
        if (this.currentModule) {
            if (this.currentModule.cleanup) {
                await this.currentModule.cleanup();
            }
            this.currentModule = null;
        }
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.currentScene = null;
  }    
    
    startAnimation() {
        const animate = (timestamp) => {
            if (this.currentModule && this.currentModule.animate) {
                this.currentModule.animate(timestamp);
            }
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    showPlaceholder(sceneName) {
        // Placeholder for scenes not yet implemented or in "coming soon" state
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    
        // Find the scene object from the registry using sceneName or scene ID
        const sceneId = parseInt(sceneName) || null;
        const sceneObj = sceneId && this.scenes[sceneId] ? this.scenes[sceneId] : null;
        
        const animate = (timestamp) => {
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw scene name
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sceneName, this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            // Draw status based on scene status if available
            if (sceneObj && sceneObj.status && sceneObj.status !== 'ready') {
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.font = '24px Arial';
                this.ctx.fillText(sceneObj.status, this.canvas.width / 2, this.canvas.height / 2 + 20);
            } else if (sceneObj && sceneObj.status === 'ready') {
                // For 'ready' status, do not draw anything or draw a different message if needed
                // Currently, no action for 'ready'
            } else {
                // If no scene object or status, show "Coming Soon"
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.font = '24px Arial';
                this.ctx.fillText("Coming Soon", this.canvas.width / 2, this.canvas.height / 2 + 20);
            }
            
            // Draw animated circles for visual effect
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            for (let i = 0; i < 5; i++) {
                const radius = 50 + i * 30 + Math.sin(timestamp * 0.001 + i) * 10; // Use timestamp for animation
                this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 - i * 0.1})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Notify current module of settings change
        if (this.currentModule && this.currentModule.updateSettings) {
            this.currentModule.updateSettings(this.settings);
        }
    }
    
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.updateSettings(preset);
            return true;
        }
        return false;
    }
    
    exportFrame() {
        if (!this.canvas) return null;
        
        return this.canvas.toDataURL('image/png');
    }
    
    toggleVideoMode() {
        this.settings.videoMode = !this.settings.videoMode;
        document.body.classList.toggle('video-mode', this.settings.videoMode);
        return this.settings.videoMode;
    }
    
    getSceneInfo(sceneId) {
        return this.scenes[sceneId] || null;
    }
    
    getAllScenes() {
        return Object.entries(this.scenes).map(([id, scene]) => ({
            id: parseInt(id),
            ...scene
        }));
    }
}

// Export as singleton
const demoFramework = new SEPDemoFramework();
export default demoFramework;