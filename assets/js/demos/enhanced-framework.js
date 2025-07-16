/**
 * SEP Enhanced Demo Framework
 * A comprehensive framework for interactive demos and video generation
 */

// Import utilities and sub-systems
import Physics from './utils/physics.js';
import MathLib from './utils/math-lib.js';
import EventManager from './core/event-manager.js';
import StateManager from './core/state-manager.js';
import VideoEngine from './core/video-engine.js';
import RenderPipeline from './core/render-pipeline.js';
import { SCENES, DEMO_NAMES } from './config/scene-registry.js';

class SEPEnhancedFramework {
    constructor() {
        // Core properties
        this.currentScene = null;
        this.currentModule = null;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;
        
        // Sub-systems
        this.physics = null;
        this.math = null;
        this.eventManager = null;
        this.stateManager = null;
        this.videoEngine = null;
        this.renderPipeline = null;
        
        // Settings
        this.settings = {
            quality: 'medium',
            speed: 1.0,
            intensity: 50,
            videoMode: false,
            showFps: true,
            showControls: true,
            showLabels: true,
            audioEnabled: false,
            autoSave: false
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
    
    /**
     * Initialize the framework
     * @param {string} canvasId - The ID of the canvas element
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init(canvasId) {
        console.log('Initializing SEP Enhanced Demo Framework...');
        
        // Set up canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas not found');
        }
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Initialize sub-systems
        this.physics = new Physics();
        this.math = new MathLib();
        this.eventManager = new EventManager(this.canvas);
        this.stateManager = new StateManager(this.settings);
        this.videoEngine = new VideoEngine(this.canvas);
        this.renderPipeline = new RenderPipeline(this.canvas, this.ctx);
        
        // Event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // System initialization
        await Promise.all([
            this.physics.init(),
            this.eventManager.init(),
            this.videoEngine.init()
        ]);
        
        console.log('Framework initialization complete');
        return true;
    }
    
    /**
     * Resize the canvas to fill the window
     */
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Notify current scene of resize
            if (this.currentModule && this.currentModule.onResize) {
                this.currentModule.onResize(this.canvas.width, this.canvas.height);
            }
        }
    }
    
    /**
     * Load a scene by ID
     * @param {number} sceneId - The ID of the scene to load
     * @returns {Promise} - Resolves when scene is loaded
     */
    async loadScene(sceneId) {
        console.log(`Loading scene ${sceneId}...`);
        
        // Clean up current scene
        await this.unloadCurrentScene();
        
        // Load new scene
        const scene = this.scenes[sceneId];
        if (!scene) {
            throw new Error(`Scene ${sceneId} not found`);
        }
        
        this.currentScene = sceneId;
        this.stateManager.setActiveScene(sceneId);
        
        try {
            // Import the scene module
            const module = await scene.module();
            
            // Create scene instance with all dependencies
            this.currentModule = new module.default(
                this.canvas, 
                this.ctx,
                this.settings,
                this.physics,
                this.math,
                this.eventManager,
                this.stateManager,
                this.renderPipeline
            );
            
            // Initialize the scene
            if (this.currentModule.init) {
                await this.currentModule.init();
            }
            
            // Register scene-specific controls
            if (this.currentModule.getControls) {
                const controls = this.currentModule.getControls();
                this.updateControlPanel(controls);
            }
            
            // Start animation
            this.startAnimation();
            
            console.log(`Scene ${sceneId} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to load scene ${sceneId}:`, error);
            // For pending scenes, show placeholder
            this.showPlaceholder(scene.name);
            return false;
        }
    }
    
    /**
     * Unload the current scene and clean up
     * @returns {Promise} - Resolves when scene is unloaded
     */
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
        
        // Reset event handlers for the scene
        this.eventManager.clearSceneHandlers();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.currentScene = null;
        return true;
    }
    
    /**
     * Start the animation loop
     */
    startAnimation() {
        this.lastFrameTime = performance.now();
        this.framesThisSecond = 0;
        this.lastFpsUpdate = this.lastFrameTime;
        
        const animate = (timestamp) => {
            // Calculate delta time and FPS
            this.deltaTime = (timestamp - this.lastFrameTime) / 1000; // in seconds
            this.lastFrameTime = timestamp;
            
            // FPS counter
            this.framesThisSecond++;
            if (timestamp - this.lastFpsUpdate >= 1000) {
                this.fps = this.framesThisSecond;
                this.framesThisSecond = 0;
                this.lastFpsUpdate = timestamp;
                
                // Update FPS display if enabled
                if (this.settings.showFps) {
                    document.getElementById('fpsCounter').textContent = this.fps;
                }
            }
            
            // Clear canvas with renderer
            this.renderPipeline.clear();
            
            // Update physics
            this.physics.update(this.deltaTime * this.settings.speed);
            
            // Animate current scene
            if (this.currentModule && this.currentModule.animate) {
                this.currentModule.animate(timestamp, this.deltaTime * this.settings.speed);
            }
            
            // Capture frame if in video mode
            if (this.settings.videoMode && this.videoEngine.isRecording) {
                this.videoEngine.captureFrame();
            }
            
            // Continue animation loop
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    /**
     * Show a placeholder for scenes that are not yet implemented
     * @param {string} sceneName - The name of the scene
     */
    showPlaceholder(sceneName) {
        let time = 0;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const animate = (timestamp) => {
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw scene name
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sceneName, this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            // Draw status
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Coming Soon', this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            // Draw animated circles
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            for (let i = 0; i < 5; i++) {
                const radius = 50 + i * 30 + Math.sin(time * 0.001 + i) * 10;
                this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 - i * 0.1})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            time += 16 * this.settings.speed;
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    /**
     * Update framework settings
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Notify systems of settings change
        this.stateManager.updateSettings(this.settings);
        this.renderPipeline.updateSettings(this.settings);
        
        // Notify current module of settings change
        if (this.currentModule && this.currentModule.updateSettings) {
            this.currentModule.updateSettings(this.settings);
        }
    }
    
    /**
     * Apply a predefined preset
     * @param {string} presetName - Name of the preset to apply
     * @returns {boolean} - Whether the preset was successfully applied
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.updateSettings(preset);
            return true;
        }
        return false;
    }
    
    /**
     * Export the current frame as a data URL
     * @returns {string|null} - Data URL of the canvas or null if canvas not available
     */
    exportFrame() {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    }
    
    /**
     * Start or stop video recording
     * @returns {boolean} - Whether video mode is now active
     */
    toggleVideoMode() {
        this.settings.videoMode = !this.settings.videoMode;
        document.body.classList.toggle('video-mode', this.settings.videoMode);
        
        if (this.settings.videoMode) {
            this.videoEngine.startRecording();
        } else {
            this.videoEngine.stopRecording();
        }
        
        return this.settings.videoMode;
    }
    
    /**
     * Update the control panel with scene-specific controls
     * @param {Array} controls - Array of control configurations
     */
    updateControlPanel(controls) {
        // Implementation will depend on HTML structure
        console.log('Updating control panel with custom controls', controls);
    }
    
    /**
     * Get information about a specific scene
     * @param {number} sceneId - The ID of the scene
     * @returns {Object|null} - Scene information or null if not found
     */
    getSceneInfo(sceneId) {
        return this.scenes[sceneId] || null;
    }
    
    /**
     * Get all available scenes
     * @returns {Array} - Array of scene objects
     */
    getAllScenes() {
        return Object.entries(this.scenes).map(([id, scene]) => ({
            id: parseInt(id),
            ...scene
        }));
    }
    
    /**
     * Run all scenes in sequence for video creation
     * @param {Array} sceneIds - Array of scene IDs to run in sequence
     * @param {Object} options - Options for the sequence
     * @returns {Promise} - Resolves when sequence is complete
     */
    async runSceneSequence(sceneIds, options = {}) {
        const defaultOptions = {
            durationPerScene: 10000, // 10 seconds per scene
            transition: 'fade',
            record: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        if (settings.record) {
            this.videoEngine.startRecording();
        }
        
        for (const sceneId of sceneIds) {
            await this.loadScene(sceneId);
            
            // Wait for specified duration
            await new Promise(resolve => setTimeout(resolve, settings.durationPerScene));
        }
        
        if (settings.record) {
            return this.videoEngine.stopRecording();
        }
        
        return true;
    }
}

// Export as singleton
const sepEnhancedFramework = new SEPEnhancedFramework();
export default sepEnhancedFramework;