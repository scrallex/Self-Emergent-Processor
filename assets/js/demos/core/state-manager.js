/**
 * State Manager
 * Manages global state, scene-specific state, and provides reactivity
 */

class StateManager {
    constructor(initialSettings = {}) {
        // Global application state
        this.globalState = {
            // App settings
            settings: { ...initialSettings },
            
            // Current scene info
            currentScene: null,
            previousScene: null,
            
            // Performance metrics
            fps: 0,
            lastFrameTime: 0,
            deltaTime: 0,
            
            // UI state
            showControls: true,
            showInfo: true,
            fullscreen: false,
            
            // Video state
            isRecording: false,
            recordingStartTime: 0,
            recordingDuration: 0,
            
            // Debug state
            debugMode: false,
            debugInfo: {}
        };
        
        // Scene-specific state storage (indexed by sceneId)
        this.sceneState = {};
        
        // Event listeners for state changes
        this.listeners = {
            global: new Map(),  // Global state change listeners
            scene: new Map()    // Scene-specific state change listeners
        };
        
        // Persistence
        this.persistenceEnabled = true;
        this.persistenceKey = 'sep_demo_state';
        
        // Try to load persisted state
        this.loadPersistedState();
    }
    
    /**
     * Set the active scene
     * @param {number} sceneId - ID of the active scene
     */
    setActiveScene(sceneId) {
        // Store previous scene
        this.globalState.previousScene = this.globalState.currentScene;
        
        // Set new current scene
        this.globalState.currentScene = sceneId;
        
        // Initialize scene state if it doesn't exist
        if (!this.sceneState[sceneId]) {
            this.sceneState[sceneId] = {
                initialized: false,
                startTime: Date.now(),
                interactions: 0,
                customState: {}
            };
        }
        
        // Notify listeners
        this.notifyListeners('global', 'currentScene', sceneId);
    }
    
    /**
     * Update global settings
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        this.globalState.settings = { ...this.globalState.settings, ...newSettings };
        this.notifyListeners('global', 'settings', this.globalState.settings);
        
        // Persist settings change
        this.persistState();
    }
    
    /**
     * Get the current global state
     * @returns {Object} - The global state
     */
    getGlobalState() {
        return { ...this.globalState };
    }
    
    /**
     * Get a specific global state property
     * @param {string} property - The property to get
     * @returns {*} - The property value
     */
    getGlobal(property) {
        return this.globalState[property];
    }
    
    /**
     * Set a global state property
     * @param {string} property - The property to set
     * @param {*} value - The value to set
     */
    setGlobal(property, value) {
        this.globalState[property] = value;
        this.notifyListeners('global', property, value);
        
        // Persist state for certain properties
        if (['settings', 'showControls', 'showInfo'].includes(property)) {
            this.persistState();
        }
    }
    
    /**
     * Get the current scene state
     * @returns {Object|null} - The current scene state or null if no scene is active
     */
    getCurrentSceneState() {
        const sceneId = this.globalState.currentScene;
        if (sceneId === null) return null;
        
        return this.getSceneState(sceneId);
    }
    
    /**
     * Get state for a specific scene
     * @param {number} sceneId - The scene ID
     * @returns {Object} - The scene state
     */
    getSceneState(sceneId) {
        if (!this.sceneState[sceneId]) {
            this.sceneState[sceneId] = {
                initialized: false,
                startTime: Date.now(),
                interactions: 0,
                customState: {}
            };
        }
        
        return { ...this.sceneState[sceneId] };
    }
    
    /**
     * Update the custom state for the current scene
     * @param {Object} stateChanges - The state changes to apply
     */
    updateSceneState(stateChanges) {
        const sceneId = this.globalState.currentScene;
        if (sceneId === null) return;
        
        // Initialize if needed
        if (!this.sceneState[sceneId]) {
            this.sceneState[sceneId] = {
                initialized: false,
                startTime: Date.now(),
                interactions: 0,
                customState: {}
            };
        }
        
        // Apply changes to custom state
        this.sceneState[sceneId].customState = {
            ...this.sceneState[sceneId].customState,
            ...stateChanges
        };
        
        // Notify listeners
        this.notifyListeners('scene', sceneId, this.sceneState[sceneId]);
        
        // Persist state
        this.persistState();
    }
    
    /**
     * Record a user interaction with the current scene
     */
    recordInteraction() {
        const sceneId = this.globalState.currentScene;
        if (sceneId === null) return;
        
        if (this.sceneState[sceneId]) {
            this.sceneState[sceneId].interactions++;
            this.sceneState[sceneId].lastInteractionTime = Date.now();
        }
    }
    
    /**
     * Update performance metrics
     * @param {number} fps - Current frames per second
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updatePerformanceMetrics(fps, deltaTime) {
        this.globalState.fps = fps;
        this.globalState.deltaTime = deltaTime;
        this.globalState.lastFrameTime = Date.now();
    }
    
    /**
     * Subscribe to changes in global state
     * @param {string} property - The property to watch, or '*' for all
     * @param {Function} callback - The callback function
     * @returns {Function} - Unsubscribe function
     */
    subscribeToGlobal(property, callback) {
        if (!this.listeners.global.has(property)) {
            this.listeners.global.set(property, new Set());
        }
        
        this.listeners.global.get(property).add(callback);
        
        // Return unsubscribe function
        return () => {
            if (this.listeners.global.has(property)) {
                this.listeners.global.get(property).delete(callback);
            }
        };
    }
    
    /**
     * Subscribe to changes in a specific scene's state
     * @param {number} sceneId - The scene ID to watch, or '*' for all
     * @param {Function} callback - The callback function
     * @returns {Function} - Unsubscribe function
     */
    subscribeToScene(sceneId, callback) {
        if (!this.listeners.scene.has(sceneId)) {
            this.listeners.scene.set(sceneId, new Set());
        }
        
        this.listeners.scene.get(sceneId).add(callback);
        
        // Return unsubscribe function
        return () => {
            if (this.listeners.scene.has(sceneId)) {
                this.listeners.scene.get(sceneId).delete(callback);
            }
        };
    }
    
    /**
     * Notify listeners of a state change
     * @param {string} type - The type of state ('global' or 'scene')
     * @param {string|number} key - The property or scene ID
     * @param {*} value - The new value
     */
    notifyListeners(type, key, value) {
        // Notify specific listeners
        if (this.listeners[type].has(key)) {
            this.listeners[type].get(key).forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`Error in state listener for ${type}.${key}:`, error);
                }
            });
        }
        
        // Notify wildcard listeners
        if (this.listeners[type].has('*')) {
            this.listeners[type].get('*').forEach(callback => {
                try {
                    callback(key, value);
                } catch (error) {
                    console.error(`Error in wildcard state listener for ${type}:`, error);
                }
            });
        }
    }
    
    /**
     * Persist the current state to localStorage
     */
    persistState() {
        if (!this.persistenceEnabled) return;
        
        try {
            // Only persist what we need to restore
            const stateToSave = {
                settings: this.globalState.settings,
                showControls: this.globalState.showControls,
                showInfo: this.globalState.showInfo,
                sceneProgress: {}
            };
            
            // Save scene progress for each scene
            Object.keys(this.sceneState).forEach(sceneId => {
                stateToSave.sceneProgress[sceneId] = {
                    initialized: this.sceneState[sceneId].initialized,
                    interactions: this.sceneState[sceneId].interactions,
                    customState: this.sceneState[sceneId].customState
                };
            });
            
            localStorage.setItem(this.persistenceKey, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error persisting state:', error);
        }
    }
    
    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        if (!this.persistenceEnabled) return;
        
        try {
            const savedState = localStorage.getItem(this.persistenceKey);
            if (!savedState) return;
            
            const parsedState = JSON.parse(savedState);
            
            // Restore settings
            if (parsedState.settings) {
                this.globalState.settings = { 
                    ...this.globalState.settings, 
                    ...parsedState.settings 
                };
            }
            
            // Restore UI state
            if (parsedState.showControls !== undefined) {
                this.globalState.showControls = parsedState.showControls;
            }
            
            if (parsedState.showInfo !== undefined) {
                this.globalState.showInfo = parsedState.showInfo;
            }
            
            // Restore scene progress
            if (parsedState.sceneProgress) {
                Object.keys(parsedState.sceneProgress).forEach(sceneId => {
                    this.sceneState[sceneId] = {
                        initialized: parsedState.sceneProgress[sceneId].initialized,
                        startTime: Date.now(),
                        interactions: parsedState.sceneProgress[sceneId].interactions,
                        customState: parsedState.sceneProgress[sceneId].customState || {}
                    };
                });
            }
        } catch (error) {
            console.error('Error loading persisted state:', error);
        }
    }
    
    /**
     * Clear all persisted state
     */
    clearPersistedState() {
        try {
            localStorage.removeItem(this.persistenceKey);
        } catch (error) {
            console.error('Error clearing persisted state:', error);
        }
    }
    
    /**
     * Reset all state
     */
    resetState() {
        // Reset global state
        this.globalState = {
            settings: { ...this.globalState.settings }, // Preserve settings
            currentScene: this.globalState.currentScene,
            previousScene: null,
            fps: 0,
            lastFrameTime: 0,
            deltaTime: 0,
            showControls: true,
            showInfo: true,
            fullscreen: false,
            isRecording: false,
            recordingStartTime: 0,
            recordingDuration: 0,
            debugMode: false,
            debugInfo: {}
        };
        
        // Reset scene state
        this.sceneState = {};
        
        // Clear persisted state
        this.clearPersistedState();
    }
}

export default StateManager;