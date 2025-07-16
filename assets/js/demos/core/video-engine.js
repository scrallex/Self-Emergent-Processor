/**
 * Video Engine
 * Handles recording, playback, and automated scene sequencing for demo videos
 */

import { VIDEO_SEQUENCE } from '../config/scene-registry.js';

class VideoEngine {
    constructor(canvas) {
        // Canvas reference
        this.canvas = canvas;
        
        // Recording state
        this.isRecording = false;
        this.recordingStartTime = 0;
        this.frameCount = 0;
        this.frames = [];
        this.captureInterval = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        // Playback state
        this.isPlaying = false;
        this.currentSequence = null;
        this.currentSequenceIndex = 0;
        this.sequenceStartTime = 0;
        this.transitionStartTime = 0;
        this.transitionDuration = 1000; // 1 second default
        
        // Playback options
        this.options = {
            frameRate: 30,
            quality: 0.9,
            mimeType: 'video/webm;codecs=vp9',
            autoDownload: false,
            filenamePrefix: 'sep-demo-',
            includeDateInFilename: true,
            includeSceneInFilename: true,
            captureAudio: false,
            audioTracks: []
        };
        
        // Camera and timing
        this.cameraKeyframes = [];
        this.timelineEvents = [];
        
        // Sequence status callback
        this.onSequenceProgress = null;
        this.onSequenceComplete = null;
        this.onTransition = null;
        
        // Bind methods
        this.handleDataAvailable = this.handleDataAvailable.bind(this);
        this.handleRecordingStop = this.handleRecordingStop.bind(this);
    }
    
    /**
     * Initialize the video engine
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init() {
        console.log('Initializing video engine...');
        
        // Check for MediaRecorder support
        if (typeof MediaRecorder === 'undefined') {
            console.warn('MediaRecorder not supported in this browser.');
            this.mediaRecorderSupported = false;
        } else {
            this.mediaRecorderSupported = true;
            
            // Check for supported mime types
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4'
            ];
            
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    this.options.mimeType = type;
                    console.log(`Using mime type: ${type}`);
                    break;
                }
            }
        }
        
        // Set default sequence from config if available
        if (VIDEO_SEQUENCE && VIDEO_SEQUENCE.length > 0) {
            this.setSequence(VIDEO_SEQUENCE);
        }
        
        return Promise.resolve();
    }
    
    /**
     * Set the recording options
     * @param {Object} options - Recording options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
    
    /**
     * Set the sequence to play
     * @param {Array} sequence - Array of scene objects with durations and transitions
     */
    setSequence(sequence) {
        this.currentSequence = sequence;
        this.currentSequenceIndex = 0;
    }
    
    /**
     * Start recording
     * @param {Object} options - Recording options (optional)
     * @returns {boolean} - Whether recording started successfully
     */
    startRecording(options = {}) {
        if (this.isRecording) {
            console.warn('Already recording');
            return false;
        }
        
        // Apply options if provided
        if (Object.keys(options).length > 0) {
            this.setOptions(options);
        }
        
        // Reset recording state
        this.frameCount = 0;
        this.frames = [];
        this.recordedChunks = [];
        this.recordingStartTime = performance.now();
        this.isRecording = true;
        
        console.log('Recording started');
        
        // Create MediaRecorder if supported
        if (this.mediaRecorderSupported) {
            try {
                const stream = this.canvas.captureStream(this.options.frameRate);
                
                // Add audio tracks if enabled
                if (this.options.captureAudio && this.options.audioTracks.length > 0) {
                    this.options.audioTracks.forEach(track => {
                        stream.addTrack(track);
                    });
                }
                
                this.mediaRecorder = new MediaRecorder(stream, {
                    mimeType: this.options.mimeType,
                    videoBitsPerSecond: 5000000 // 5 Mbps
                });
                
                this.mediaRecorder.ondataavailable = this.handleDataAvailable;
                this.mediaRecorder.onstop = this.handleRecordingStop;
                
                // Start the media recorder with a reasonable timeslice (e.g., 1000ms)
                this.mediaRecorder.start(1000);
                
                console.log('MediaRecorder started');
                return true;
            } catch (error) {
                console.error('Error starting MediaRecorder:', error);
                this.isRecording = false;
                return false;
            }
        } else {
            // Fallback: capture frames at regular intervals
            this.captureInterval = setInterval(() => {
                this.captureFrame();
            }, 1000 / this.options.frameRate);
            
            console.log('Using frame capture fallback');
            return true;
        }
    }
    
    /**
     * Stop recording
     * @returns {Promise} - Resolves with the recorded data when complete
     */
    async stopRecording() {
        if (!this.isRecording) {
            console.warn('Not recording');
            return Promise.resolve(null);
        }
        
        this.isRecording = false;
        
        // Clear capture interval if using fallback
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        // Stop MediaRecorder if using it
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            // Return a promise that resolves when recording is complete
            return new Promise((resolve) => {
                this.recordingCompleteCallback = resolve;
                this.mediaRecorder.stop();
            });
        } else {
            // Fallback: create a video from captured frames
            return this.createVideoFromFrames();
        }
    }
    
    /**
     * Handle data available from MediaRecorder
     * @param {BlobEvent} event - The data available event
     */
    handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
        }
    }
    
    /**
     * Handle recording stop event
     */
    handleRecordingStop() {
        console.log('Recording stopped');
        
        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, {
            type: this.options.mimeType
        });
        
        // Calculate duration
        const duration = (performance.now() - this.recordingStartTime) / 1000;
        
        // Create result object
        const result = {
            blob,
            url: URL.createObjectURL(blob),
            duration,
            frameCount: this.frameCount,
            mimeType: this.options.mimeType
        };
        
        // Auto download if enabled
        if (this.options.autoDownload) {
            this.downloadVideo(result.url);
        }
        
        // Call the completion callback if set
        if (this.recordingCompleteCallback) {
            this.recordingCompleteCallback(result);
            this.recordingCompleteCallback = null;
        }
    }
    
    /**
     * Create video from captured frames (fallback method)
     * @returns {Promise} - Resolves with the video data
     */
    async createVideoFromFrames() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Creating video from frames...');
                
                // Create a virtual canvas to draw frames on
                const videoCanvas = document.createElement('canvas');
                videoCanvas.width = this.canvas.width;
                videoCanvas.height = this.canvas.height;
                const videoCtx = videoCanvas.getContext('2d');
                
                // Create a stream from the canvas
                const stream = videoCanvas.captureStream(this.options.frameRate);
                const recorder = new MediaRecorder(stream, {
                    mimeType: this.options.mimeType,
                    videoBitsPerSecond: 5000000
                });
                
                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };
                
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: this.options.mimeType });
                    const url = URL.createObjectURL(blob);
                    
                    const result = {
                        blob,
                        url,
                        duration: this.frames.length / this.options.frameRate,
                        frameCount: this.frames.length,
                        mimeType: this.options.mimeType
                    };
                    
                    // Auto download if enabled
                    if (this.options.autoDownload) {
                        this.downloadVideo(url);
                    }
                    
                    resolve(result);
                };
                
                // Start recording
                recorder.start();
                
                // Draw frames to the canvas
                let frameIndex = 0;
                const drawNextFrame = () => {
                    if (frameIndex < this.frames.length) {
                        videoCtx.drawImage(this.frames[frameIndex], 0, 0);
                        frameIndex++;
                        setTimeout(drawNextFrame, 1000 / this.options.frameRate);
                    } else {
                        // End recording after all frames
                        recorder.stop();
                    }
                };
                
                // Start drawing frames
                drawNextFrame();
            } catch (error) {
                console.error('Error creating video:', error);
                reject(error);
            }
        });
    }
    
    /**
     * Capture a frame from the canvas
     */
    captureFrame() {
        if (!this.isRecording) return;
        
        // Increment frame count
        this.frameCount++;
        
        // Capture the frame
        if (this.mediaRecorderSupported) {
            // Using MediaRecorder, no need to manually capture frames
            return;
        } else {
            // Fallback: store the frame as an image
            const frameImage = new Image();
            frameImage.src = this.canvas.toDataURL('image/jpeg', this.options.quality);
            this.frames.push(frameImage);
        }
    }
    
    /**
     * Download the recorded video
     * @param {string} url - The URL of the video
     */
    downloadVideo(url) {
        // Create filename
        let filename = this.options.filenamePrefix;
        
        if (this.options.includeSceneInFilename && this.currentSequence && this.currentSequenceIndex >= 0) {
            filename += `scene-${this.currentSequence[this.currentSequenceIndex].id}-`;
        }
        
        if (this.options.includeDateInFilename) {
            const date = new Date();
            filename += date.toISOString().replace(/[:.]/g, '-').substr(0, 19);
        }
        
        // Add extension based on mime type
        if (this.options.mimeType.includes('webm')) {
            filename += '.webm';
        } else if (this.options.mimeType.includes('mp4')) {
            filename += '.mp4';
        } else {
            filename += '.vid';
        }
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    /**
     * Start playing the sequence
     * @param {Function} onProgress - Callback for sequence progress
     * @param {Function} onComplete - Callback for sequence completion
     * @returns {boolean} - Whether playback started successfully
     */
    startSequence(onProgress, onComplete) {
        if (!this.currentSequence || this.currentSequence.length === 0) {
            console.error('No sequence set');
            return false;
        }
        
        if (this.isPlaying) {
            console.warn('Already playing a sequence');
            return false;
        }
        
        // Set callbacks
        this.onSequenceProgress = onProgress;
        this.onSequenceComplete = onComplete;
        
        // Start playback
        this.isPlaying = true;
        this.currentSequenceIndex = 0;
        this.sequenceStartTime = performance.now();
        this.startCurrentScene();
        
        return true;
    }
    
    /**
     * Start the current scene in the sequence
     */
    startCurrentScene() {
        if (!this.isPlaying || !this.currentSequence) return;
        
        const scene = this.currentSequence[this.currentSequenceIndex];
        
        // Call progress callback if set
        if (this.onSequenceProgress) {
            this.onSequenceProgress(scene, this.currentSequenceIndex, this.currentSequence.length);
        }
        
        // Set up transition to next scene
        const duration = scene.duration || 5000; // Default 5 seconds
        setTimeout(() => {
            this.transitionToNextScene();
        }, duration);
    }
    
    /**
     * Transition to the next scene in the sequence
     */
    transitionToNextScene() {
        if (!this.isPlaying || !this.currentSequence) return;
        
        // Get current scene for transition type
        const currentScene = this.currentSequence[this.currentSequenceIndex];
        const transitionType = currentScene.transition || 'fade';
        this.transitionStartTime = performance.now();
        
        // Call transition callback if set
        if (this.onTransition) {
            this.onTransition(transitionType, this.currentSequenceIndex, this.currentSequenceIndex + 1);
        }
        
        // Move to next scene
        this.currentSequenceIndex++;
        
        // Check if we've reached the end
        if (this.currentSequenceIndex >= this.currentSequence.length) {
            this.completeSequence();
        } else {
            // Start next scene after transition
            setTimeout(() => {
                this.startCurrentScene();
            }, this.transitionDuration);
        }
    }
    
    /**
     * Complete the sequence
     */
    completeSequence() {
        this.isPlaying = false;
        
        // Call complete callback if set
        if (this.onSequenceComplete) {
            const totalDuration = (performance.now() - this.sequenceStartTime) / 1000;
            this.onSequenceComplete(totalDuration, this.currentSequence);
        }
    }
    
    /**
     * Add a camera keyframe
     * @param {number} time - Time in milliseconds
     * @param {Object} position - Camera position (x, y, zoom, rotation)
     */
    addCameraKeyframe(time, position) {
        this.cameraKeyframes.push({
            time,
            position: { ...position },
            easing: position.easing || 'easeInOutQuad'
        });
        
        // Sort keyframes by time
        this.cameraKeyframes.sort((a, b) => a.time - b.time);
    }
    
    /**
     * Get camera position at a specific time
     * @param {number} time - Time in milliseconds
     * @returns {Object} - Camera position
     */
    getCameraAtTime(time) {
        // If no keyframes, return default position
        if (this.cameraKeyframes.length === 0) {
            return { x: 0, y: 0, zoom: 1, rotation: 0 };
        }
        
        // If before first keyframe, return first keyframe position
        if (time < this.cameraKeyframes[0].time) {
            return { ...this.cameraKeyframes[0].position };
        }
        
        // If after last keyframe, return last keyframe position
        if (time >= this.cameraKeyframes[this.cameraKeyframes.length - 1].time) {
            return { ...this.cameraKeyframes[this.cameraKeyframes.length - 1].position };
        }
        
        // Find surrounding keyframes
        let prevKeyframe = this.cameraKeyframes[0];
        let nextKeyframe = this.cameraKeyframes[1];
        
        for (let i = 1; i < this.cameraKeyframes.length; i++) {
            if (time < this.cameraKeyframes[i].time) {
                prevKeyframe = this.cameraKeyframes[i - 1];
                nextKeyframe = this.cameraKeyframes[i];
                break;
            }
        }
        
        // Interpolate between keyframes
        const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
        const easedT = this.applyEasing(t, nextKeyframe.easing);
        
        return {
            x: this.lerp(prevKeyframe.position.x, nextKeyframe.position.x, easedT),
            y: this.lerp(prevKeyframe.position.y, nextKeyframe.position.y, easedT),
            zoom: this.lerp(prevKeyframe.position.zoom, nextKeyframe.position.zoom, easedT),
            rotation: this.lerpAngle(prevKeyframe.position.rotation, nextKeyframe.position.rotation, easedT)
        };
    }
    
    /**
     * Add a timeline event
     * @param {number} time - Time in milliseconds
     * @param {string} eventType - Event type
     * @param {Object} params - Event parameters
     */
    addTimelineEvent(time, eventType, params) {
        this.timelineEvents.push({
            time,
            type: eventType,
            params: { ...params }
        });
        
        // Sort events by time
        this.timelineEvents.sort((a, b) => a.time - b.time);
    }
    
    /**
     * Get timeline events for a specific time range
     * @param {number} startTime - Start time in milliseconds
     * @param {number} endTime - End time in milliseconds
     * @returns {Array} - Array of events
     */
    getEventsInRange(startTime, endTime) {
        return this.timelineEvents.filter(event => 
            event.time >= startTime && event.time < endTime
        );
    }
    
    /**
     * Linear interpolation
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} - Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Angle interpolation (handles wrapping)
     * @param {number} a - Start angle in radians
     * @param {number} b - End angle in radians
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} - Interpolated angle
     */
    lerpAngle(a, b, t) {
        // Ensure angles are in range [0, 2π)
        a = a % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        
        b = b % (Math.PI * 2);
        if (b < 0) b += Math.PI * 2;
        
        // Find shortest path
        let delta = b - a;
        if (Math.abs(delta) > Math.PI) {
            if (delta > 0) {
                delta = delta - Math.PI * 2;
            } else {
                delta = delta + Math.PI * 2;
            }
        }
        
        return a + delta * t;
    }
    
    /**
     * Apply easing function
     * @param {number} t - Input value (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} - Eased value
     */
    applyEasing(t, easing) {
        switch (easing) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return t * (2 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'easeInCubic':
                return t * t * t;
            case 'easeOutCubic':
                return (--t) * t * t + 1;
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            default:
                return t;
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording().catch(console.error);
        }
        
        // Stop playback if active
        this.isPlaying = false;
        
        // Clear intervals
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        // Clear arrays
        this.frames = [];
        this.recordedChunks = [];
        this.cameraKeyframes = [];
        this.timelineEvents = [];
    }
}

export default VideoEngine;