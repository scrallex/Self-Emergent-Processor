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
        this.scenes = {
            1: { 
                name: "SEP Introduction - Wave Interference", 
                status: "ready",
                module: () => import('./scenes/scene1.js')
            },
            2: { 
                name: "Identity Through Distinction", 
                status: "ready",
                module: () => import('./scenes/scene2.js')
            },
            3: { 
                name: "Cosine Alignment", 
                status: "ready",
                module: () => import('./scenes/scene3.js')
            },
            4: { 
                name: "Sine Deviation", 
                status: "ready",
                module: () => import('./scenes/scene4.js')
            },
            5: { 
                name: "Information Pressure Dynamics", 
                status: "pending",
                module: () => import('./scenes/scene5.js')
            },
            6: { 
                name: "System Learning Evolution", 
                status: "pending",
                module: () => import('./scenes/scene6.js')
            },
            7: { 
                name: "Quantum Effects", 
                status: "ready",
                module: () => import('./scenes/scene7.js')
            },
            8: { 
                name: "Pattern Recognition", 
                status: "pending",
                module: () => import('./scenes/scene8.js')
            },
            9: { 
                name: "Self-Reference Loops", 
              status: "ready",
                module: () => import('./scenes/scene9.js')
            },
            10: { 
                name: "Memory Formation", 
              status: "ready",
                module: () => import('./scenes/scene10.js')
            },
            11: { 
                name: "Meta-System Interface", 
                status: "pending",
              module: () => import('./scenes/scene11.js') // This file won't exist, will show placeholder
            },
            12: { 
                name: "Full System Visualization", 
                status: "pending",
              module: () => import('./scenes/scene12.js') // This file won't exist, will show placeholder
            }
        };
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
            const module = await scene.module();
            this.currentModule = new module.default(this.canvas, this.ctx, this.settings);
            
            // Initialize the scene
            if (this.currentModule.init) {
                await this.currentModule.init();
            }
            
            // Start animation
            this.startAnimation();
            
            return true;
        } catch (error) {
            console.error(`Failed to load scene ${sceneId}:`, error);
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
        let time = 0;
        
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