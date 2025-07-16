/**
 * SEP Demo Framework
 * Main application framework that coordinates all subsystems and manages the demo lifecycle
 */

import EventManager from './event-manager.js';
import StateManager from './state-manager.js';
import RenderPipeline from './render-pipeline.js';
import VideoController from './video-controller.js';
import EventEmitter from './event-emitter.js';
import { SCENE_IDS, ALL_SCENES, DEFAULT_SCENE } from '../config/scene-registry.js';

class AppFramework {
    constructor(canvas, options = {}) {
        // Canvas setup
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Default options
        this.options = {
            autoStart: true,
            defaultScene: DEFAULT_SCENE,
            debug: false,
            recordingEnabled: true,
            persistState: true,
            ...options
        };
        
        // Core subsystems
        this.events = null;        // Event system
        this.state = null;         // State management
        this.renderer = null;      // Rendering pipeline
        this.videoController = null; // Video recording and playback
        
        // Scene management
        this.scenes = new Map();
        this.currentScene = null;
        this.previousScene = null;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        
        // Animation loop
        this.animationFrameId = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        
        // Performance metrics
        this.fpsCounter = {
            frames: 0,
            lastUpdate: 0,
            value: 0
        };
        
        // Event emitter for app events
        this.emitter = new EventEmitter();
        
        // Initialize if autoStart is true
        if (this.options.autoStart) {
            this.init();
        }
    }
    
    /**
     * Initialize the application
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init() {
        console.log('Initializing SEP Demo Framework...');
        
        // Initialize core subsystems
        await this.initSubsystems();
        
        // Load scenes
        await this.loadScenes();
        
        // Set up resize handling
        this.handleResize();
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Start animation loop
        if (this.options.autoStart) {
            this.start();
        }
        
        console.log('Framework initialization complete');
        return Promise.resolve();
    }
    
    /**
     * Initialize core subsystems
     * @returns {Promise} - Resolves when all subsystems are initialized
     */
    async initSubsystems() {
        // Create event manager
        this.events = new EventManager(this.canvas);
        await this.events.init();
        
        // Create state manager
        this.state = new StateManager({
            debug: this.options.debug,
            persistState: this.options.persistState
        });
        
        // Create rendering pipeline
        this.renderer = new RenderPipeline(this.canvas, this.ctx);
        
        // Create base layers
        this.renderer.createLayer('background', 0);
        this.renderer.createLayer('main', 10);
        this.renderer.createLayer('effects', 20);
        this.renderer.createLayer('ui', 30);
        this.renderer.createLayer('debug', 100, { visible: this.options.debug });
        
        // Create video controller if recording is enabled
        if (this.options.recordingEnabled) {
            this.videoController = new VideoController(this, this.canvas);
            await this.videoController.init();
        }
        
        return Promise.resolve();
    }
    
    /**
     * Load all scenes
     * @returns {Promise} - Resolves when all scenes are loaded
     */
    async loadScenes() {
        const loadPromises = [];
        
        // Load each scene dynamically
        for (const sceneInfo of ALL_SCENES) {
            const loadPromise = this.loadScene(sceneInfo.id, sceneInfo.module);
            loadPromises.push(loadPromise);
        }
        
        // Wait for all scenes to load
        await Promise.all(loadPromises);
        
        // Set default scene
        if (this.options.defaultScene && this.scenes.has(this.options.defaultScene)) {
            this.changeScene(this.options.defaultScene);
        } else if (this.scenes.size > 0) {
            // Fall back to first scene
            const firstSceneId = this.scenes.keys().next().value;
            this.changeScene(firstSceneId);
        }
        
        return Promise.resolve();
    }
    
    /**
     * Load a single scene
     * @param {string} sceneId - The scene ID
     * @param {string} modulePath - Path to the scene module
     * @returns {Promise} - Resolves when the scene is loaded
     */
    async loadScene(sceneId, modulePath) {
        try {
            // Import the scene module dynamically
            const module = await import(modulePath);
            const SceneClass = module.default;
            
            // Instantiate the scene
            const scene = new SceneClass(this);
            scene.id = sceneId;
            
            // Initialize the scene
            await scene.init();
            
            // Store the scene
            this.scenes.set(sceneId, scene);
            
            console.log(`Loaded scene: ${sceneId}`);
            return Promise.resolve();
        } catch (error) {
            console.error(`Failed to load scene ${sceneId}:`, error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Start the application
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        this.emitter.emit('start');
    }
    
    /**
     * Stop the application
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.emitter.emit('stop');
    }
    
    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp
     */
    animate(timestamp) {
        // Calculate delta time
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000; // convert to seconds
        this.lastFrameTime = timestamp;
        
        // Cap delta time to prevent large jumps after tab switch, etc.
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        // Update FPS counter
        this.updateFPS(timestamp);
        
        // Update state with performance metrics
        this.state.updatePerformanceMetrics(this.fpsCounter.value, this.deltaTime);
        
        // Update camera
        this.renderer.updateCamera(this.deltaTime);
        
        // Clear the canvas
        this.renderer.clear();
        
        // Update current scene
        if (this.currentScene) {
            this.currentScene.update(this.deltaTime);
        }
        
        // Handle scene transition if active
        if (this.isTransitioning) {
            this.updateTransition(this.deltaTime);
        }
        
        // Render current scene
        this.renderer.render(this.deltaTime);
        
        // Emit frame update event
        this.emitter.emit('frameUpdate', {
            deltaTime: this.deltaTime,
            timestamp,
            frameCount: this.frameCount
        });
        
        // Increment frame counter
        this.frameCount++;
        
        // Request next frame if still running
        if (this.isRunning) {
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    /**
     * Update FPS counter
     * @param {number} timestamp - Current timestamp
     */
    updateFPS(timestamp) {
        this.fpsCounter.frames++;
        
        // Update FPS every second
        if (timestamp - this.fpsCounter.lastUpdate >= 1000) {
            this.fpsCounter.value = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastUpdate = timestamp;
        }
    }
    
    /**
     * Change to a different scene
     * @param {string} sceneId - The ID of the scene to change to
     * @param {Object} options - Transition options
     * @returns {boolean} - Whether the scene change was successful
     */
    changeScene(sceneId, options = {}) {
        if (!this.scenes.has(sceneId)) {
            console.error(`Scene ${sceneId} not found`);
            return false;
        }
        
        // Set transition options
        const transitionOptions = {
            duration: 1000, // ms
            type: 'fade',   // transition type
            ...options
        };
        
        // Store previous scene
        this.previousScene = this.currentScene;
        
        // Set new current scene
        this.currentScene = this.scenes.get(sceneId);
        
        // Update state
        this.state.setActiveScene(sceneId);
        
        // Start transition if previous scene exists
        if (this.previousScene) {
            this.startTransition(transitionOptions);
        }
        
        // Emit scene change event
        this.emitter.emit('sceneChange', {
            previous: this.previousScene ? this.previousScene.id : null,
            current: sceneId,
            transition: transitionOptions
        });
        
        // Reset the camera
        this.camera.resetToDefault();
        
        return true;
    }
    
    /**
     * Start a scene transition
     * @param {Object} options - Transition options
     */
    startTransition(options) {
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.transitionOptions = options;
        this.transitionStartTime = performance.now();
        
        // Create transition canvases
        this.createTransitionCanvases();
        
        // Emit transition start event
        this.emitter.emit('transitionStart', {
            from: this.previousScene.id,
            to: this.currentScene.id,
            options
        });
    }
    
    /**
     * Create canvases for the transition effect
     */
    createTransitionCanvases() {
        // Create canvas for the outgoing scene
        this.outgoingCanvas = document.createElement('canvas');
        this.outgoingCanvas.width = this.canvas.width;
        this.outgoingCanvas.height = this.canvas.height;
        this.outgoingCtx = this.outgoingCanvas.getContext('2d');
        
        // Create canvas for the incoming scene
        this.incomingCanvas = document.createElement('canvas');
        this.incomingCanvas.width = this.canvas.width;
        this.incomingCanvas.height = this.canvas.height;
        this.incomingCtx = this.incomingCanvas.getContext('2d');
        
        // Render the previous scene to the outgoing canvas
        if (this.previousScene) {
            this.previousScene.render(this.outgoingCtx, this.outgoingCanvas);
        }
    }
    
    /**
     * Update the scene transition
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateTransition(deltaTime) {
        // Calculate progress
        const elapsed = performance.now() - this.transitionStartTime;
        const duration = this.transitionOptions.duration;
        this.transitionProgress = Math.min(elapsed / duration, 1);
        
        // Render the current scene to the incoming canvas
        this.currentScene.render(this.incomingCtx, this.incomingCanvas);
        
        // Apply transition effect
        switch (this.transitionOptions.type) {
            case 'fade':
                this.applyFadeTransition();
                break;
            case 'slide-left':
                this.applySlideTransition('left');
                break;
            case 'slide-right':
                this.applySlideTransition('right');
                break;
            case 'slide-up':
                this.applySlideTransition('up');
                break;
            case 'slide-down':
                this.applySlideTransition('down');
                break;
            case 'zoom-in':
                this.applyZoomTransition(true);
                break;
            case 'zoom-out':
                this.applyZoomTransition(false);
                break;
            case 'crossfade':
                this.applyCrossfadeTransition();
                break;
            default:
                this.applyFadeTransition();
        }
        
        // Check if transition is complete
        if (this.transitionProgress >= 1) {
            this.completeTransition();
        }
    }
    
    /**
     * Apply fade transition effect
     */
    applyFadeTransition() {
        // Draw outgoing scene
        this.ctx.globalAlpha = 1 - this.transitionProgress;
        this.ctx.drawImage(this.outgoingCanvas, 0, 0);
        
        // Draw incoming scene
        this.ctx.globalAlpha = this.transitionProgress;
        this.ctx.drawImage(this.incomingCanvas, 0, 0);
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Apply slide transition effect
     * @param {string} direction - The slide direction
     */
    applySlideTransition(direction) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Calculate offset based on direction
        let dx = 0, dy = 0;
        switch (direction) {
            case 'left':
                dx = -w * this.transitionProgress;
                break;
            case 'right':
                dx = w * this.transitionProgress;
                break;
            case 'up':
                dy = -h * this.transitionProgress;
                break;
            case 'down':
                dy = h * this.transitionProgress;
                break;
        }
        
        // Draw outgoing scene
        this.ctx.drawImage(this.outgoingCanvas, dx, dy);
        
        // Draw incoming scene based on direction
        switch (direction) {
            case 'left':
                this.ctx.drawImage(this.incomingCanvas, w + dx, 0);
                break;
            case 'right':
                this.ctx.drawImage(this.incomingCanvas, -w + dx, 0);
                break;
            case 'up':
                this.ctx.drawImage(this.incomingCanvas, 0, h + dy);
                break;
            case 'down':
                this.ctx.drawImage(this.incomingCanvas, 0, -h + dy);
                break;
        }
    }
    
    /**
     * Apply zoom transition effect
     * @param {boolean} zoomIn - Whether to zoom in or out
     */
    applyZoomTransition(zoomIn) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        if (zoomIn) {
            // Zoom in: outgoing scene zooms in and fades out, incoming scene appears
            const scale = 1 + this.transitionProgress;
            const offsetX = (w - w * scale) / 2;
            const offsetY = (h - h * scale) / 2;
            
            // Draw incoming scene (underneath)
            this.ctx.globalAlpha = this.transitionProgress;
            this.ctx.drawImage(this.incomingCanvas, 0, 0);
            
            // Draw outgoing scene (zooming in)
            this.ctx.globalAlpha = 1 - this.transitionProgress;
            this.ctx.drawImage(this.outgoingCanvas, offsetX, offsetY, w * scale, h * scale);
        } else {
            // Zoom out: incoming scene zooms out from center
            const scale = 1 - this.transitionProgress;
            const offsetX = (w - w * scale) / 2;
            const offsetY = (h - h * scale) / 2;
            
            // Draw outgoing scene (underneath)
            this.ctx.globalAlpha = 1 - this.transitionProgress;
            this.ctx.drawImage(this.outgoingCanvas, 0, 0);
            
            // Draw incoming scene (zooming out)
            this.ctx.globalAlpha = this.transitionProgress;
            this.ctx.drawImage(this.incomingCanvas, offsetX, offsetY, w * scale, h * scale);
        }
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Apply crossfade transition with blend modes
     */
    applyCrossfadeTransition() {
        // Draw outgoing scene
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.outgoingCanvas, 0, 0);
        
        // Draw incoming scene with blend mode
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.globalAlpha = this.transitionProgress;
        this.ctx.drawImage(this.incomingCanvas, 0, 0);
        
        // Reset composite operation and alpha
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Complete the scene transition
     */
    completeTransition() {
        this.isTransitioning = false;
        this.transitionProgress = 1;
        
        // Clean up transition resources
        this.outgoingCanvas = null;
        this.outgoingCtx = null;
        this.incomingCanvas = null;
        this.incomingCtx = null;
        
        // Emit transition complete event
        this.emitter.emit('transitionComplete', {
            scene: this.currentScene.id
        });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update renderer
        if (this.renderer) {
            // Resize layers
            for (const layerName of this.renderer.layerOrder) {
                const offscreenCanvas = this.renderer.offscreenCanvases.get(layerName);
                if (offscreenCanvas) {
                    offscreenCanvas.width = width;
                    offscreenCanvas.height = height;
                }
            }
        }
        
        // Notify current scene
        if (this.currentScene && typeof this.currentScene.onResize === 'function') {
            this.currentScene.onResize(width, height);
        }
        
        // Emit resize event
        this.emitter.emit('resize', { width, height });
    }
    
    /**
     * Pause the application temporarily
     * @param {number} duration - Duration in milliseconds (optional)
     */
    pause(duration = null) {
        this.stop();
        
        // Resume after duration if specified
        if (duration !== null) {
            setTimeout(() => {
                this.start();
            }, duration);
        }
        
        this.emitter.emit('pause');
    }
    
    /**
     * Resume the application
     */
    resume() {
        this.start();
        this.emitter.emit('resume');
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.options.debug = !this.options.debug;
        
        // Update renderer
        if (this.renderer && this.renderer.layers.has('debug')) {
            this.renderer.layers.get('debug').visible = this.options.debug;
        }
        
        // Update state
        this.state.setGlobal('debugMode', this.options.debug);
        
        // Emit debug event
        this.emitter.emit('debugToggle', { active: this.options.debug });
    }
    
    /**
     * Get the camera object
     * @returns {Object} - The camera object
     */
    get camera() {
        return this.renderer ? this.renderer.camera : null;
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Stop animation loop
        this.stop();
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        // Clean up scenes
        for (const scene of this.scenes.values()) {
            if (typeof scene.cleanup === 'function') {
                scene.cleanup();
            }
        }
        
        // Clean up subsystems
        if (this.events) this.events.cleanup();
        if (this.videoController) this.videoController.cleanup();
        
        // Clear event emitter
        this.emitter.clear();
        
        console.log('Framework cleanup complete');
    }
}

export default AppFramework;