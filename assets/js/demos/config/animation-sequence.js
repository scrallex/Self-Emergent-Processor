/**
 * Animation Sequence Configuration
 * Defines the sequence, timing, and camera movements for automated demo walkthrough
 */

// Import scene IDs for reference
import { SCENE_IDS } from './scene-registry.js';

/**
 * Timeline event types
 * These events trigger actions during playback
 */
export const EVENT_TYPES = {
    HIGHLIGHT: 'highlight',        // Highlight an element
    SPAWN_PARTICLE: 'particle',    // Spawn a particle
    TRIGGER_ACTION: 'action',      // Trigger a scene-specific action
    CHANGE_PARAMETER: 'param',     // Change a parameter value
    SHOW_TEXT: 'text',             // Show explanatory text
    HIDE_TEXT: 'hide_text',        // Hide text
    SET_SCENE_STATE: 'state',      // Set a specific scene state
    RUN_ALGORITHM: 'algorithm',    // Run an algorithm step
    TRANSITION: 'transition'       // Visual transition effect
};

/**
 * Camera keyframe utility
 * Creates a camera keyframe with easing
 * @param {number} time - Time in milliseconds
 * @param {Object} position - Camera position {x, y, zoom, rotation}
 * @param {string} easing - Easing function
 * @returns {Object} - Keyframe object
 */
export const createCameraKeyframe = (time, position, easing = 'easeInOutQuad') => ({
    time,
    position: { ...position, easing }
});

/**
 * Timeline event utility
 * Creates a timeline event
 * @param {number} time - Time in milliseconds
 * @param {string} type - Event type from EVENT_TYPES
 * @param {Object} params - Event parameters
 * @returns {Object} - Event object
 */
export const createEvent = (time, type, params) => ({
    time,
    type,
    params: { ...params }
});

/**
 * Scene configuration utility
 * Creates a scene configuration for the sequence
 * @param {string} id - Scene ID from SCENE_IDS
 * @param {number} duration - Duration in milliseconds
 * @param {string} transition - Transition type
 * @param {Array} cameraKeyframes - Array of camera keyframes
 * @param {Array} events - Array of timeline events
 * @returns {Object} - Scene configuration
 */
export const createSceneConfig = (id, duration, transition = 'fade', cameraKeyframes = [], events = []) => ({
    id,
    duration,
    transition,
    cameraKeyframes,
    events
});

/**
 * Default camera positions for each scene
 * These are the starting positions when a scene is loaded
 */
export const DEFAULT_CAMERA_POSITIONS = {
    [SCENE_IDS.INTRODUCTION]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.INFORMATION_EMERGENCE]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.CELLULAR_AUTOMATA]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.EMERGENCE_PATTERNS]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.SELF_ORGANIZATION]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.FEEDBACK_LOOPS]: { x: 0, y: 0, zoom: 1.2, rotation: 0 },
    [SCENE_IDS.ATTRACTORS]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.BIFURCATION]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.PHASE_SPACE]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.SELF_ORGANIZED_CRITICALITY]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.EMERGENCE_COMPLEXITY]: { x: 0, y: 0, zoom: 1, rotation: 0 },
    [SCENE_IDS.PRACTICAL_APPLICATIONS]: { x: 0, y: 0, zoom: 1, rotation: 0 }
};

/**
 * Animation sequence for demo video
 * This defines the entire walkthrough sequence
 */
export const VIDEO_SEQUENCE = [
    // Scene 1: Introduction
    createSceneConfig(
        SCENE_IDS.INTRODUCTION,
        10000, // 10 seconds
        'fade',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(5000, { x: 0, y: 0, zoom: 1.2, rotation: 0 }),
            createCameraKeyframe(9000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'intro-title', 
                text: 'Self-Emergent Processor', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'intro-desc', 
                text: 'Exploring emergence and complexity through interactive demos', 
                position: { x: 'center', y: 'center' },
                style: 'subtitle'
            }),
            createEvent(8000, EVENT_TYPES.HIDE_TEXT, { id: 'intro-title' }),
            createEvent(8500, EVENT_TYPES.HIDE_TEXT, { id: 'intro-desc' })
        ]
    ),
    
    // Scene 2: Information Emergence
    createSceneConfig(
        SCENE_IDS.INFORMATION_EMERGENCE,
        15000, // 15 seconds
        'crossfade',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(7000, { x: 50, y: 20, zoom: 1.3, rotation: 0 }),
            createCameraKeyframe(14000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'info-title', 
                text: 'Information Emergence', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(3000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'info-desc', 
                text: 'Information can emerge from simple rules and interactions', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(5000, EVENT_TYPES.TRIGGER_ACTION, { action: 'startSimulation' }),
            createEvent(8000, EVENT_TYPES.HIGHLIGHT, { 
                elementId: 'pattern-area',
                duration: 3000,
                style: 'pulse'
            }),
            createEvent(11000, EVENT_TYPES.CHANGE_PARAMETER, { 
                param: 'complexity',
                value: 0.8,
                duration: 2000
            }),
            createEvent(14000, EVENT_TYPES.HIDE_TEXT, { id: 'info-desc' }),
            createEvent(14500, EVENT_TYPES.HIDE_TEXT, { id: 'info-title' })
        ]
    ),
    
    // Scene 3: Cellular Automata
    createSceneConfig(
        SCENE_IDS.CELLULAR_AUTOMATA,
        20000, // 20 seconds
        'slide-left',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(5000, { x: 0, y: 0, zoom: 1.5, rotation: 0 }),
            createCameraKeyframe(12000, { x: -50, y: 0, zoom: 1.3, rotation: 0 }),
            createCameraKeyframe(18000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'ca-title', 
                text: 'Cellular Automata', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'ca-desc', 
                text: 'Simple rules lead to complex patterns', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(4000, EVENT_TYPES.TRIGGER_ACTION, { action: 'resetGrid' }),
            createEvent(4500, EVENT_TYPES.TRIGGER_ACTION, { action: 'setRule', params: { rule: 30 } }),
            createEvent(5000, EVENT_TYPES.TRIGGER_ACTION, { action: 'startAutomaton' }),
            createEvent(10000, EVENT_TYPES.PAUSE, { duration: 1000 }),
            createEvent(11000, EVENT_TYPES.TRIGGER_ACTION, { action: 'setRule', params: { rule: 110 } }),
            createEvent(11500, EVENT_TYPES.TRIGGER_ACTION, { action: 'startAutomaton' }),
            createEvent(16000, EVENT_TYPES.PAUSE, { duration: 1000 }),
            createEvent(17000, EVENT_TYPES.TRIGGER_ACTION, { action: 'setRule', params: { rule: 90 } }),
            createEvent(17500, EVENT_TYPES.TRIGGER_ACTION, { action: 'startAutomaton' }),
            createEvent(19000, EVENT_TYPES.HIDE_TEXT, { id: 'ca-desc' }),
            createEvent(19500, EVENT_TYPES.HIDE_TEXT, { id: 'ca-title' })
        ]
    ),
    
    // Scene 4: Emergence Patterns
    createSceneConfig(
        SCENE_IDS.EMERGENCE_PATTERNS,
        18000, // 18 seconds
        'fade',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(9000, { x: 0, y: 0, zoom: 1.2, rotation: Math.PI / 12 }),
            createCameraKeyframe(17000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'pattern-title', 
                text: 'Emergence Patterns', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'pattern-desc', 
                text: 'Patterns emerge from local interactions', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(4000, EVENT_TYPES.TRIGGER_ACTION, { action: 'generatePatterns' }),
            createEvent(8000, EVENT_TYPES.CHANGE_PARAMETER, { 
                param: 'interactionStrength',
                value: 0.7,
                duration: 2000
            }),
            createEvent(12000, EVENT_TYPES.TRIGGER_ACTION, { action: 'highlightPatterns' }),
            createEvent(16000, EVENT_TYPES.HIDE_TEXT, { id: 'pattern-desc' }),
            createEvent(16500, EVENT_TYPES.HIDE_TEXT, { id: 'pattern-title' })
        ]
    ),
    
    // Scene 5: Self-Organization
    createSceneConfig(
        SCENE_IDS.SELF_ORGANIZATION,
        22000, // 22 seconds
        'slide-up',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(8000, { x: 30, y: -20, zoom: 1.4, rotation: 0 }),
            createCameraKeyframe(15000, { x: -30, y: 20, zoom: 1.3, rotation: 0 }),
            createCameraKeyframe(21000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'so-title', 
                text: 'Self-Organization', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'so-desc', 
                text: 'Systems can organize without external control', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(4000, EVENT_TYPES.TRIGGER_ACTION, { action: 'initParticles', params: { count: 100 } }),
            createEvent(5000, EVENT_TYPES.TRIGGER_ACTION, { action: 'startSimulation' }),
            createEvent(10000, EVENT_TYPES.CHANGE_PARAMETER, { 
                param: 'cohesion',
                value: 0.8,
                duration: 2000
            }),
            createEvent(13000, EVENT_TYPES.CHANGE_PARAMETER, { 
                param: 'separation',
                value: 0.4,
                duration: 2000
            }),
            createEvent(16000, EVENT_TYPES.TRIGGER_ACTION, { action: 'addAttractor', params: { x: 0, y: 0 } }),
            createEvent(20000, EVENT_TYPES.HIDE_TEXT, { id: 'so-desc' }),
            createEvent(20500, EVENT_TYPES.HIDE_TEXT, { id: 'so-title' })
        ]
    ),
    
    // The rest of the scenes follow the same pattern...
    // Adding a few more and then we can expand as needed
    
    // Scene 6: Feedback Loops
    createSceneConfig(
        SCENE_IDS.FEEDBACK_LOOPS,
        20000, // 20 seconds
        'zoom-out',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(10000, { x: 0, y: 0, zoom: 1.5, rotation: -Math.PI / 24 }),
            createCameraKeyframe(19000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'feedback-title', 
                text: 'Feedback Loops', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'feedback-desc', 
                text: 'Systems can amplify or dampen their own behavior', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(4000, EVENT_TYPES.TRIGGER_ACTION, { action: 'initFeedbackSystem' }),
            createEvent(6000, EVENT_TYPES.TRIGGER_ACTION, { action: 'addPositiveFeedback' }),
            createEvent(12000, EVENT_TYPES.TRIGGER_ACTION, { action: 'addNegativeFeedback' }),
            createEvent(18000, EVENT_TYPES.HIDE_TEXT, { id: 'feedback-desc' }),
            createEvent(18500, EVENT_TYPES.HIDE_TEXT, { id: 'feedback-title' })
        ]
    ),
    
    // Scene 7: Attractors
    createSceneConfig(
        SCENE_IDS.ATTRACTORS,
        25000, // 25 seconds
        'crossfade',
        [
            createCameraKeyframe(0, { x: 0, y: 0, zoom: 1, rotation: 0 }),
            createCameraKeyframe(12500, { x: 0, y: 0, zoom: 1.3, rotation: Math.PI / 20 }),
            createCameraKeyframe(24000, { x: 0, y: 0, zoom: 1, rotation: 0 })
        ],
        [
            createEvent(1000, EVENT_TYPES.SHOW_TEXT, { 
                id: 'attractor-title', 
                text: 'Strange Attractors', 
                position: { x: 'center', y: 'top' },
                style: 'title'
            }),
            createEvent(2500, EVENT_TYPES.SHOW_TEXT, { 
                id: 'attractor-desc', 
                text: 'Complex systems often evolve toward specific states', 
                position: { x: 'center', y: 'bottom' },
                style: 'description'
            }),
            createEvent(4000, EVENT_TYPES.TRIGGER_ACTION, { action: 'initAttractor', params: { type: 'lorenz' } }),
            createEvent(5000, EVENT_TYPES.TRIGGER_ACTION, { action: 'startSimulation' }),
            createEvent(10000, EVENT_TYPES.TRIGGER_ACTION, { action: 'highlightAttractorWing', params: { wing: 'left' } }),
            createEvent(15000, EVENT_TYPES.TRIGGER_ACTION, { action: 'highlightAttractorWing', params: { wing: 'right' } }),
            createEvent(20000, EVENT_TYPES.TRIGGER_ACTION, { action: 'changeAttractor', params: { type: 'rossler' } }),
            createEvent(23000, EVENT_TYPES.HIDE_TEXT, { id: 'attractor-desc' }),
            createEvent(23500, EVENT_TYPES.HIDE_TEXT, { id: 'attractor-title' })
        ]
    )
    
    // More scenes would be defined here following the same pattern
];

/**
 * Export the full sequence for use in the video engine
 */
export default VIDEO_SEQUENCE;