/**
 * Video Controller
 * Integrates the video engine with the main application and provides UI controls
 */

import VideoEngine from './video-engine.js';
import { VIDEO_SEQUENCE, EVENT_TYPES } from '../config/animation-sequence.js';
import { SCENE_IDS } from '../config/scene-registry.js';
import EventEmitter from './event-emitter.js';

class VideoController {
    constructor(app, canvas) {
        // References
        this.app = app;
        this.canvas = canvas;
        
        // Create video engine
        this.videoEngine = new VideoEngine(canvas);
        
        // UI elements
        this.controlsContainer = null;
        this.recordButton = null;
        this.sequenceButton = null;
        this.statusText = null;
        this.progressBar = null;
        
        // State
        this.isUIVisible = false;
        this.isRecording = false;
        this.isPlaying = false;
        this.currentProgress = 0;
        
        // Event emitter for video events
        this.events = new EventEmitter();
        
        // Bind methods
        this.toggleUI = this.toggleUI.bind(this);
        this.handleRecordClick = this.handleRecordClick.bind(this);
        this.handleSequenceClick = this.handleSequenceClick.bind(this);
        this.handleSequenceProgress = this.handleSequenceProgress.bind(this);
        this.handleSequenceComplete = this.handleSequenceComplete.bind(this);
        this.handleSceneTransition = this.handleSceneTransition.bind(this);
        this.processTimelineEvents = this.processTimelineEvents.bind(this);
    }
    
    /**
     * Initialize the video controller
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init() {
        console.log('Initializing video controller...');
        
        // Initialize video engine
        await this.videoEngine.init();
        
        // Create UI controls
        this.createUI();
        
        // Set default sequence
        this.videoEngine.setSequence(VIDEO_SEQUENCE);
        
        // Set up animation frame callback for timeline events
        this.lastProcessedTime = 0;
        
        // Register event listeners
        this.app.events.on('frameUpdate', this.processTimelineEvents);
        
        // Set initial UI state
        this.updateUI();
        
        return Promise.resolve();
    }
    
    /**
     * Create UI controls
     */
    createUI() {
        // Create container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'video-controls';
        this.controlsContainer.style.position = 'absolute';
        this.controlsContainer.style.bottom = '20px';
        this.controlsContainer.style.right = '20px';
        this.controlsContainer.style.padding = '10px';
        this.controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.controlsContainer.style.borderRadius = '5px';
        this.controlsContainer.style.color = 'white';
        this.controlsContainer.style.zIndex = '1000';
        this.controlsContainer.style.display = 'flex';
        this.controlsContainer.style.flexDirection = 'column';
        this.controlsContainer.style.gap = '10px';
        this.controlsContainer.style.minWidth = '200px';
        this.controlsContainer.style.transition = 'opacity 0.3s ease';
        this.controlsContainer.style.opacity = '0';
        
        // Create record button
        this.recordButton = document.createElement('button');
        this.recordButton.className = 'video-record-btn';
        this.recordButton.innerHTML = '🔴 Record';
        this.recordButton.style.padding = '8px 12px';
        this.recordButton.style.borderRadius = '4px';
        this.recordButton.style.border = 'none';
        this.recordButton.style.backgroundColor = '#d32f2f';
        this.recordButton.style.color = 'white';
        this.recordButton.style.cursor = 'pointer';
        this.recordButton.style.fontWeight = 'bold';
        this.recordButton.addEventListener('click', this.handleRecordClick);
        
        // Create sequence button
        this.sequenceButton = document.createElement('button');
        this.sequenceButton.className = 'video-sequence-btn';
        this.sequenceButton.innerHTML = '▶️ Play Sequence';
        this.sequenceButton.style.padding = '8px 12px';
        this.sequenceButton.style.borderRadius = '4px';
        this.sequenceButton.style.border = 'none';
        this.sequenceButton.style.backgroundColor = '#2196f3';
        this.sequenceButton.style.color = 'white';
        this.sequenceButton.style.cursor = 'pointer';
        this.sequenceButton.style.fontWeight = 'bold';
        this.sequenceButton.addEventListener('click', this.handleSequenceClick);
        
        // Create status text
        this.statusText = document.createElement('div');
        this.statusText.className = 'video-status';
        this.statusText.innerHTML = 'Ready';
        this.statusText.style.fontSize = '14px';
        this.statusText.style.marginTop = '5px';
        
        // Create progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'video-progress';
        this.progressBar.style.width = '100%';
        this.progressBar.style.height = '4px';
        this.progressBar.style.backgroundColor = '#444';
        this.progressBar.style.position = 'relative';
        this.progressBar.style.borderRadius = '2px';
        this.progressBar.style.overflow = 'hidden';
        
        // Create progress bar fill
        this.progressBarFill = document.createElement('div');
        this.progressBarFill.className = 'video-progress-fill';
        this.progressBarFill.style.position = 'absolute';
        this.progressBarFill.style.top = '0';
        this.progressBarFill.style.left = '0';
        this.progressBarFill.style.height = '100%';
        this.progressBarFill.style.width = '0%';
        this.progressBarFill.style.backgroundColor = '#4caf50';
        this.progressBarFill.style.transition = 'width 0.3s linear';
        
        // Add progress bar fill to progress bar
        this.progressBar.appendChild(this.progressBarFill);
        
        // Toggle button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'video-toggle-btn';
        this.toggleButton.innerHTML = '🎬';
        this.toggleButton.style.position = 'absolute';
        this.toggleButton.style.bottom = '10px';
        this.toggleButton.style.right = '10px';
        this.toggleButton.style.width = '40px';
        this.toggleButton.style.height = '40px';
        this.toggleButton.style.borderRadius = '50%';
        this.toggleButton.style.border = 'none';
        this.toggleButton.style.backgroundColor = '#333';
        this.toggleButton.style.color = 'white';
        this.toggleButton.style.cursor = 'pointer';
        this.toggleButton.style.zIndex = '1001';
        this.toggleButton.style.fontSize = '20px';
        this.toggleButton.style.display = 'flex';
        this.toggleButton.style.alignItems = 'center';
        this.toggleButton.style.justifyContent = 'center';
        this.toggleButton.addEventListener('click', this.toggleUI);
        
        // Add controls to container
        this.controlsContainer.appendChild(this.recordButton);
        this.controlsContainer.appendChild(this.sequenceButton);
        this.controlsContainer.appendChild(this.statusText);
        this.controlsContainer.appendChild(this.progressBar);
        
        // Add container to document
        document.body.appendChild(this.controlsContainer);
        document.body.appendChild(this.toggleButton);
    }
    
    /**
     * Toggle UI visibility
     */
    toggleUI() {
        this.isUIVisible = !this.isUIVisible;
        this.controlsContainer.style.opacity = this.isUIVisible ? '1' : '0';
        this.controlsContainer.style.pointerEvents = this.isUIVisible ? 'auto' : 'none';
        this.toggleButton.innerHTML = this.isUIVisible ? '🎬' : '🎥';
    }
    
    /**
     * Update UI state based on current status
     */
    updateUI() {
        // Update record button
        if (this.isRecording) {
            this.recordButton.innerHTML = '⏹️ Stop Recording';
            this.recordButton.style.backgroundColor = '#f44336';
        } else {
            this.recordButton.innerHTML = '🔴 Record';
            this.recordButton.style.backgroundColor = '#d32f2f';
        }
        
        // Update sequence button
        if (this.isPlaying) {
            this.sequenceButton.innerHTML = '⏹️ Stop Sequence';
            this.sequenceButton.style.backgroundColor = '#f44336';
        } else {
            this.sequenceButton.innerHTML = '▶️ Play Sequence';
            this.sequenceButton.style.backgroundColor = '#2196f3';
        }
        
        // Update progress bar
        this.progressBarFill.style.width = `${this.currentProgress * 100}%`;
    }
    
    /**
     * Handle record button click
     */
    async handleRecordClick() {
        if (this.isRecording) {
            // Stop recording
            this.isRecording = false;
            this.statusText.innerHTML = 'Processing...';
            
            // Stop the recording and get the result
            const result = await this.videoEngine.stopRecording();
            
            // Update UI
            this.statusText.innerHTML = `Recording saved (${Math.round(result.duration)}s)`;
            this.updateUI();
            
            // Emit event
            this.events.emit('recordingComplete', result);
        } else {
            // Start recording
            this.isRecording = true;
            this.statusText.innerHTML = 'Recording...';
            
            // Start the recording
            const success = this.videoEngine.startRecording();
            
            if (!success) {
                this.isRecording = false;
                this.statusText.innerHTML = 'Failed to start recording';
            }
            
            // Update UI
            this.updateUI();
            
            // Emit event
            this.events.emit('recordingStart');
        }
    }
    
    /**
     * Handle sequence button click
     */
    handleSequenceClick() {
        if (this.isPlaying) {
            // Stop sequence
            this.isPlaying = false;
            this.statusText.innerHTML = 'Sequence stopped';
            
            // Complete current sequence (will trigger cleanup)
            this.videoEngine.completeSequence();
            
            // Update UI
            this.updateUI();
            
            // Emit event
            this.events.emit('sequenceStop');
        } else {
            // Start sequence
            this.isPlaying = true;
            this.currentProgress = 0;
            this.statusText.innerHTML = 'Starting sequence...';
            
            // Start the sequence
            const success = this.videoEngine.startSequence(
                this.handleSequenceProgress,
                this.handleSequenceComplete
            );
            
            if (!success) {
                this.isPlaying = false;
                this.statusText.innerHTML = 'Failed to start sequence';
            }
            
            // Update UI
            this.updateUI();
            
            // Emit event
            this.events.emit('sequenceStart');
        }
    }
    
    /**
     * Handle sequence progress update
     * @param {Object} scene - Current scene
     * @param {number} index - Current scene index
     * @param {number} total - Total number of scenes
     */
    handleSequenceProgress(scene, index, total) {
        // Update progress
        this.currentProgress = index / (total - 1);
        
        // Update status text
        this.statusText.innerHTML = `Scene ${index + 1}/${total}: ${scene.id}`;
        
        // Update UI
        this.updateUI();
        
        // Change to the scene if it's not already active
        if (this.app.currentScene.id !== scene.id) {
            this.app.changeScene(scene.id);
        }
        
        // Reset camera position to default for this scene
        this.app.camera.resetToDefault();
        
        // Add camera keyframes to the video engine
        if (scene.cameraKeyframes && scene.cameraKeyframes.length > 0) {
            this.videoEngine.cameraKeyframes = scene.cameraKeyframes;
        }
        
        // Add timeline events to the video engine
        if (scene.events && scene.events.length > 0) {
            this.videoEngine.timelineEvents = scene.events;
        }
        
        // Set the sequence start time
        this.sequenceStartTime = performance.now();
        this.lastProcessedTime = 0;
        
        // Emit event
        this.events.emit('sceneStart', scene, index, total);
    }
    
    /**
     * Handle sequence completion
     * @param {number} duration - Total duration in seconds
     * @param {Array} sequence - The sequence that was played
     */
    handleSequenceComplete(duration, sequence) {
        // Update status
        this.isPlaying = false;
        this.statusText.innerHTML = `Sequence complete (${Math.round(duration)}s)`;
        
        // Reset progress
        this.currentProgress = 0;
        
        // Update UI
        this.updateUI();
        
        // Reset camera and events
        this.videoEngine.cameraKeyframes = [];
        this.videoEngine.timelineEvents = [];
        
        // Emit event
        this.events.emit('sequenceComplete', duration, sequence);
    }
    
    /**
     * Handle scene transition
     * @param {string} type - Transition type
     * @param {number} fromIndex - From scene index
     * @param {number} toIndex - To scene index
     */
    handleSceneTransition(type, fromIndex, toIndex) {
        // Emit event
        this.events.emit('sceneTransition', type, fromIndex, toIndex);
    }
    
    /**
     * Process timeline events on each frame
     * @param {Object} frameInfo - Frame information
     */
    processTimelineEvents(frameInfo) {
        if (!this.isPlaying || !this.videoEngine.timelineEvents) return;
        
        // Get current time relative to sequence start
        const currentTime = performance.now() - this.sequenceStartTime;
        
        // Process events that occurred since the last frame
        const events = this.videoEngine.getEventsInRange(this.lastProcessedTime, currentTime);
        
        // Process each event
        for (const event of events) {
            this.processEvent(event, currentTime);
        }
        
        // Update camera position if there are keyframes
        if (this.videoEngine.cameraKeyframes && this.videoEngine.cameraKeyframes.length > 0) {
            const cameraPosition = this.videoEngine.getCameraAtTime(currentTime);
            this.app.camera.setPosition(cameraPosition.x, cameraPosition.y);
            this.app.camera.setZoom(cameraPosition.zoom);
            this.app.camera.setRotation(cameraPosition.rotation);
        }
        
        // Update last processed time
        this.lastProcessedTime = currentTime;
    }
    
    /**
     * Process a single timeline event
     * @param {Object} event - The event to process
     * @param {number} currentTime - Current time in milliseconds
     */
    processEvent(event, currentTime) {
        // Get the current scene
        const scene = this.app.currentScene;
        
        // Process event based on type
        switch (event.type) {
            case EVENT_TYPES.SHOW_TEXT:
                this.app.ui.showText(
                    event.params.id,
                    event.params.text,
                    event.params.position,
                    event.params.style
                );
                break;
                
            case EVENT_TYPES.HIDE_TEXT:
                this.app.ui.hideText(event.params.id);
                break;
                
            case EVENT_TYPES.HIGHLIGHT:
                this.app.ui.highlightElement(
                    event.params.elementId,
                    event.params.duration,
                    event.params.style
                );
                break;
                
            case EVENT_TYPES.TRIGGER_ACTION:
                // Forward to the current scene
                if (scene && typeof scene[event.params.action] === 'function') {
                    if (event.params.params) {
                        scene[event.params.action](event.params.params);
                    } else {
                        scene[event.params.action]();
                    }
                }
                break;
                
            case EVENT_TYPES.CHANGE_PARAMETER:
                // Forward to the current scene
                if (scene && typeof scene.setParameter === 'function') {
                    scene.setParameter(
                        event.params.param,
                        event.params.value,
                        event.params.duration
                    );
                }
                break;
                
            case EVENT_TYPES.TRANSITION:
                // Handled by the video engine
                break;
                
            case EVENT_TYPES.PAUSE:
                // Pause for a duration
                this.app.pause(event.params.duration);
                break;
                
            case EVENT_TYPES.SPAWN_PARTICLE:
                // Forward to the physics engine
                this.app.physics.spawnParticle(
                    event.params.x,
                    event.params.y,
                    event.params.options
                );
                break;
                
            case EVENT_TYPES.SET_SCENE_STATE:
                // Forward to the current scene
                if (scene && typeof scene.setState === 'function') {
                    scene.setState(event.params.state);
                }
                break;
                
            case EVENT_TYPES.RUN_ALGORITHM:
                // Forward to the current scene
                if (scene && typeof scene.runAlgorithm === 'function') {
                    scene.runAlgorithm(event.params.algorithm, event.params.options);
                }
                break;
                
            default:
                console.warn(`Unknown event type: ${event.type}`);
        }
        
        // Emit event
        this.events.emit('timelineEvent', event, currentTime);
    }
    
    /**
     * Set recording options
     * @param {Object} options - Recording options
     */
    setRecordingOptions(options) {
        this.videoEngine.setOptions(options);
    }
    
    /**
     * Set a custom sequence
     * @param {Array} sequence - Sequence array
     */
    setSequence(sequence) {
        this.videoEngine.setSequence(sequence);
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Clean up video engine
        this.videoEngine.cleanup();
        
        // Remove event listeners
        this.app.events.off('frameUpdate', this.processTimelineEvents);
        
        // Remove UI elements
        if (this.controlsContainer && this.controlsContainer.parentNode) {
            this.controlsContainer.parentNode.removeChild(this.controlsContainer);
        }
        
        if (this.toggleButton && this.toggleButton.parentNode) {
            this.toggleButton.parentNode.removeChild(this.toggleButton);
        }
        
        // Clear event emitter
        this.events.clear();
    }
}

export default VideoController;