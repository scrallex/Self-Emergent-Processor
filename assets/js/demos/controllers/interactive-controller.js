/**
 * Interactive Controller
 * Provides standardized interactive controls and behaviors for SEP demo scenes
 */

import InteractiveUtils from '../utils/interactive-utils.js';

class InteractiveController {
    constructor(scene, canvas, ctx, eventManager, stateManager, renderPipeline) {
        // References to core components
        this.scene = scene;
        this.canvas = canvas;
        this.ctx = ctx;
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;
        
        // Initialize interactive utilities
        this.interactiveUtils = new InteractiveUtils(eventManager, stateManager, renderPipeline);
        
        // Standard UI components
        this.components = {
            // Control panel elements
            controlPanel: null,
            controls: [],
            
            // Interactive scene elements
            sceneElements: [],
            
            // Information panel
            infoPanel: null,
            
            // Debugging elements
            debugPanel: null,
            debugElements: []
        };
        
        // User interaction state
        this.interactionState = {
            activeElement: null,
            hoverElement: null,
            mode: 'default', // 'default', 'edit', 'measure', etc.
            selectedItems: new Set(),
            focusPoint: { x: 0, y: 0 }
        };
        
        // Flags for video vs interactive mode
        this.isVideoMode = false;
        
        // Bind methods
        this.updateVideoMode = this.updateVideoMode.bind(this);
    }
    
    /**
     * Initialize the controller
     */
    init() {
        // Create standard UI panels based on scene type
        this.createControlPanel();
        this.createInfoPanel();
        
        // Create scene-specific elements
        this.createSceneElements();
        
        // Create debug panel if enabled
        if (this.scene.settings && this.scene.settings.debugMode) {
            this.createDebugPanel();
        }
        
        // Listen for video mode changes
        if (this.stateManager) {
            this.stateManager.subscribeToGlobal('settings', (settings) => {
                if (settings.videoMode !== undefined) {
                    this.updateVideoMode(settings.videoMode);
                }
            });
        }
        
        return this;
    }
    
    /**
     * Create the standard control panel with scene-specific controls
     */
    createControlPanel() {
        // Skip in video mode
        if (this.isVideoMode) return;
        
        // Create the panel container
        this.components.controlPanel = this.interactiveUtils.createPanel({
            id: 'control_panel',
            x: 20,
            y: 20,
            width: 250,
            height: 'auto', // Will be adjusted based on content
            color: 'rgba(10, 10, 10, 0.7)',
            cornerRadius: 10,
            shadow: true,
            children: []
        });
        
        // Add standard controls based on scene type
        this.addStandardControls();
        
        // Add scene-specific controls
        this.addSceneSpecificControls();
        
        // Adjust panel height based on controls
        this.adjustControlPanelHeight();
    }
    
    /**
     * Add standard controls based on scene type
     */
    addStandardControls() {
        const panel = this.components.controlPanel;
        if (!panel) return;
        
        // Add scene title
        const sceneTitle = this.scene.constructor.name || 'Demo Scene';
        const titleText = this.interactiveUtils.createDraggable({
            id: 'scene_title',
            x: panel.x + 15,
            y: panel.y + 20,
            width: panel.width - 30,
            height: 30,
            text: sceneTitle,
            color: 'transparent',
            draggable: false
        });
        
        panel.addChild(titleText);
        this.components.controls.push(titleText);
        
        // Add speed control slider
        const speedSlider = this.interactiveUtils.createSlider({
            id: 'speed_slider',
            x: panel.x + 15,
            y: panel.y + 60,
            width: panel.width - 30,
            height: 30,
            min: 0.1,
            max: 2.0,
            value: this.scene.settings.speed || 1.0,
            step: 0.1,
            labelText: 'Speed',
            onChange: (value) => {
                if (this.scene.settings) {
                    this.scene.settings.speed = value;
                    
                    // Update global settings if needed
                    if (this.stateManager) {
                        this.stateManager.updateSettings({ speed: value });
                    }
                }
            }
        });
        
        panel.addChild(speedSlider);
        this.components.controls.push(speedSlider);
        
        // Add intensity/amplitude control slider
        const intensitySlider = this.interactiveUtils.createSlider({
            id: 'intensity_slider',
            x: panel.x + 15,
            y: panel.y + 100,
            width: panel.width - 30,
            height: 30,
            min: 10,
            max: 100,
            value: this.scene.settings.intensity || 50,
            step: 1,
            labelText: 'Intensity',
            onChange: (value) => {
                if (this.scene.settings) {
                    this.scene.settings.intensity = value;
                    
                    // Update global settings if needed
                    if (this.stateManager) {
                        this.stateManager.updateSettings({ intensity: value });
                    }
                }
            }
        });
        
        panel.addChild(intensitySlider);
        this.components.controls.push(intensitySlider);
        
        // Add show labels toggle
        const labelsToggle = this.interactiveUtils.createToggle({
            id: 'labels_toggle',
            x: panel.x + 15,
            y: panel.y + 140,
            width: 50,
            height: 24,
            value: this.scene.settings.showLabels !== false,
            labelText: 'Show Labels',
            onChange: (value) => {
                if (this.scene.settings) {
                    this.scene.settings.showLabels = value;
                    
                    // Update global settings if needed
                    if (this.stateManager) {
                        this.stateManager.updateSettings({ showLabels: value });
                    }
                }
            }
        });
        
        panel.addChild(labelsToggle);
        this.components.controls.push(labelsToggle);
        
        // Add reset button
        const resetButton = this.interactiveUtils.createButton({
            id: 'reset_button',
            x: panel.x + 15,
            y: panel.y + 180,
            width: panel.width - 30,
            height: 36,
            text: 'Reset Scene',
            color: '#ff3b30',
            onClick: () => {
                if (this.scene.reset) {
                    this.scene.reset();
                }
            }
        });
        
        panel.addChild(resetButton);
        this.components.controls.push(resetButton);
    }
    
    /**
     * Add scene-specific controls based on the current scene
     */
    addSceneSpecificControls() {
        // This is a template method to be overridden by scenes
        // Scenes can implement a getCustomControls() method to provide specific controls
        
        if (this.scene.getCustomControls) {
            const customControls = this.scene.getCustomControls();
            if (customControls && customControls.length > 0) {
                const panel = this.components.controlPanel;
                let yOffset = panel.y + 230; // Start after standard controls
                
                for (const control of customControls) {
                    // Handle different control types
                    let component;
                    
                    switch (control.type) {
                        case 'slider':
                            component = this.interactiveUtils.createSlider({
                                id: `custom_${control.id}`,
                                x: panel.x + 15,
                                y: yOffset,
                                width: panel.width - 30,
                                height: 30,
                                min: control.min || 0,
                                max: control.max || 100,
                                value: control.value || 50,
                                step: control.step || 1,
                                labelText: control.label || '',
                                onChange: control.onChange || null
                            });
                            yOffset += 40;
                            break;
                            
                        case 'toggle':
                            component = this.interactiveUtils.createToggle({
                                id: `custom_${control.id}`,
                                x: panel.x + 15,
                                y: yOffset,
                                width: 50,
                                height: 24,
                                value: control.value || false,
                                labelText: control.label || '',
                                onChange: control.onChange || null
                            });
                            yOffset += 34;
                            break;
                            
                        case 'button':
                            component = this.interactiveUtils.createButton({
                                id: `custom_${control.id}`,
                                x: panel.x + 15,
                                y: yOffset,
                                width: panel.width - 30,
                                height: 36,
                                text: control.label || 'Button',
                                color: control.color || this.interactiveUtils.styles.primary,
                                onClick: control.onClick || null
                            });
                            yOffset += 46;
                            break;
                            
                        default:
                            // Unknown control type
                            continue;
                    }
                    
                    if (component) {
                        panel.addChild(component);
                        this.components.controls.push(component);
                    }
                }
            }
        }
    }
    
    /**
     * Adjust control panel height based on its content
     */
    adjustControlPanelHeight() {
        const panel = this.components.controlPanel;
        if (!panel || !panel.children || panel.children.length === 0) return;
        
        // Find the bottom-most control
        let maxY = 0;
        for (const child of panel.children) {
            const childBottom = child.y + child.height;
            if (childBottom > maxY) {
                maxY = childBottom;
            }
        }
        
        // Update panel height with padding
        panel.height = maxY - panel.y + 20;
        
        // Update panel bounds
        panel.bounds.height = panel.height;
    }
    
    /**
     * Create the information panel
     */
    createInfoPanel() {
        // Skip in video mode
        if (this.isVideoMode) return;
        
        // Create the panel container
        this.components.infoPanel = this.interactiveUtils.createPanel({
            id: 'info_panel',
            x: this.canvas.width - 270,
            y: 20,
            width: 250,
            height: 150,
            color: 'rgba(10, 10, 10, 0.7)',
            cornerRadius: 10,
            shadow: true,
            children: []
        });
        
        // Add info content - this will be updated dynamically
        const infoTitle = this.interactiveUtils.createDraggable({
            id: 'info_title',
            x: this.components.infoPanel.x + 15,
            y: this.components.infoPanel.y + 20,
            width: 220,
            height: 30,
            text: 'Information',
            color: 'transparent',
            draggable: false
        });
        
        this.components.infoPanel.addChild(infoTitle);
        
        // Info content will be updated dynamically in the updateInfoPanel method
    }
    
    /**
     * Create scene-specific interactive elements
     */
    createSceneElements() {
        // Template method to be overridden by scenes
        // Scenes can implement a createInteractiveElements() method
        
        if (this.scene.createInteractiveElements) {
            const elements = this.scene.createInteractiveElements(this.interactiveUtils);
            if (elements && elements.length > 0) {
                this.components.sceneElements = elements;
            }
        }
    }
    
    /**
     * Create debug panel for development
     */
    createDebugPanel() {
        // Skip in video mode
        if (this.isVideoMode) return;
        
        // Create the panel container
        this.components.debugPanel = this.interactiveUtils.createPanel({
            id: 'debug_panel',
            x: 20,
            y: this.canvas.height - 170,
            width: 250,
            height: 150,
            color: 'rgba(80, 0, 0, 0.7)',
            cornerRadius: 10,
            shadow: true,
            children: []
        });
        
        // Add debug title
        const debugTitle = this.interactiveUtils.createDraggable({
            id: 'debug_title',
            x: this.components.debugPanel.x + 15,
            y: this.components.debugPanel.y + 20,
            width: 220,
            height: 30,
            text: 'Debug Information',
            color: 'transparent',
            draggable: false
        });
        
        this.components.debugPanel.addChild(debugTitle);
        
        // FPS Counter
        const fpsCounter = this.interactiveUtils.createDraggable({
            id: 'fps_counter',
            x: this.components.debugPanel.x + 15,
            y: this.components.debugPanel.y + 60,
            width: 220,
            height: 20,
            text: 'FPS: 60',
            color: 'transparent',
            draggable: false
        });
        
        this.components.debugPanel.addChild(fpsCounter);
        this.components.debugElements.push(fpsCounter);
        
        // Other debug elements will be updated dynamically
    }
    
    /**
     * Update video mode state
     * @param {boolean} isVideoMode - Whether video mode is active
     */
    updateVideoMode(isVideoMode) {
        this.isVideoMode = isVideoMode;
        
        // Hide all UI elements in video mode
        if (this.components.controlPanel) {
            this.components.controlPanel.visible = !isVideoMode;
        }
        
        if (this.components.infoPanel) {
            this.components.infoPanel.visible = !isVideoMode;
        }
        
        if (this.components.debugPanel) {
            this.components.debugPanel.visible = !isVideoMode;
        }
    }
    
    /**
     * Update information panel with current scene state
     * @param {Object} info - Information to display
     */
    updateInfoPanel(info = {}) {
        if (!this.components.infoPanel || this.isVideoMode) return;
        
        // Clear existing info content except the title
        const infoTitle = this.components.infoPanel.children[0];
        this.components.infoPanel.children = [infoTitle];
        
        // Add new info content
        let yOffset = this.components.infoPanel.y + 60;
        
        for (const [key, value] of Object.entries(info)) {
            const infoItem = this.interactiveUtils.createDraggable({
                id: `info_${key}`,
                x: this.components.infoPanel.x + 15,
                y: yOffset,
                width: 220,
                height: 20,
                text: `${key}: ${value}`,
                color: 'transparent',
                draggable: false
            });
            
            this.components.infoPanel.addChild(infoItem);
            yOffset += 25;
        }
        
        // Adjust panel height
        this.components.infoPanel.height = yOffset - this.components.infoPanel.y + 15;
        this.components.infoPanel.bounds.height = this.components.infoPanel.height;
    }
    
    /**
     * Update debug panel with current performance metrics
     * @param {Object} metrics - Performance metrics
     */
    updateDebugPanel(metrics = {}) {
        if (!this.components.debugPanel || this.isVideoMode) return;
        
        // Update FPS counter
        if (metrics.fps && this.components.debugElements[0]) {
            this.components.debugElements[0].text = `FPS: ${metrics.fps.toFixed(1)}`;
        }
        
        // Update other debug elements
        // ...
    }
    
    /**
     * Render all UI components
     * @param {number} timestamp - Current timestamp
     */
    render(timestamp) {
        // Skip rendering if in video mode and no scene-specific elements
        if (this.isVideoMode && (!this.components.sceneElements || this.components.sceneElements.length === 0)) {
            return;
        }
        
        // Render scene elements first (behind UI)
        for (const element of this.components.sceneElements) {
            if (element.render && element.visible) {
                element.render(this.ctx);
            }
        }
        
        // Skip UI elements in video mode
        if (this.isVideoMode) return;
        
        // Render UI components
        this.interactiveUtils.render(this.ctx, timestamp);
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Clean up interactive utilities
        if (this.interactiveUtils) {
            this.interactiveUtils.cleanup();
        }
        
        // Clear components
        this.components.controls = [];
        this.components.sceneElements = [];
        this.components.debugElements = [];
        this.components.controlPanel = null;
        this.components.infoPanel = null;
        this.components.debugPanel = null;
    }
}

export default InteractiveController;