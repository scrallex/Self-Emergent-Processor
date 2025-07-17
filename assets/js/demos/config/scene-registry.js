/**
 * Scene Registry
 * Central configuration for all SEP demo scenes
 */

// Scene status constants
export const STATUS = {
    READY: 'ready',
    IN_PROGRESS: 'in-progress',
    PENDING: 'pending'
};

// Color constants for scene types
export const SCENE_COLORS = {
    WAVE: '#00d4ff',       // Cyan - Coherent/Acute
    BOUNDARY: '#ffaa00',   // Orange - Boundary/Right
    DIVERGENT: '#7c3aed',  // Purple - Divergent/Obtuse
    PRIMARY: '#00ff88',    // Green - SEP Framework
    SECONDARY: '#ff00ff'   // Magenta - Meta visualization
};

// Demo names for video generation and organization
export const DEMO_NAMES = {
    WAVE_INTERFERENCE: 'Wave Interference',
    ANGLE_CLASSIFICATION: 'Angle Classification',
    COSINE_ALIGNMENT: 'Cosine Alignment',
    SINE_DEVIATION: 'Sine Deviation',
    THREE_BODY: 'Three-Body Problem',
    PI_CALCULATION: 'Pi Calculation',
    PRIME_SPIRAL: 'Prime Spiral',
    FLOCKING: 'Flocking Behavior',
    SEP_FRAMEWORK: 'SEP Framework',
    FLUID_DYNAMICS: 'Fluid Dynamics',
    DERIVATIVES: 'Derivative Applications',
    META_VISUALIZATION: 'Meta Visualization'
};

// Complete scene registry
export const SCENES = {
    1: { 
        id: 1,
        name: "The Hidden Code",
        description: "Wave Interference & Sine/Cosine Emergence",
        longDescription: "Interactive wave superposition showing sine/cosine emergence. Observe how complex signals decompose into sine/cosine components with real-time Fourier Transform visualization.",
        status: STATUS.READY,
        type: 'wave',
        color: SCENE_COLORS.WAVE,
        demoName: DEMO_NAMES.WAVE_INTERFERENCE,
        module: () => import('../scenes/scene1.js'),
        presets: {
            intro: { speed: 0.5, intensity: 30 },
            demo: { speed: 1.0, intensity: 60 },
            climax: { speed: 1.2, intensity: 80 }
        },
        videoSequence: {
            duration: 45,
            transition: 'fade',
            focusPoints: ['wave_peaks', 'interference_pattern', 'fourier_transform']
        }
    },
    2: { 
        id: 2,
        name: "Identity Through Distinction",
        description: "Euclid's Angle Classification System",
        longDescription: "Interactive protractor with dynamic angle measurement. Drag vectors to create angles and observe real-time classification as acute, right, or obtuse with corresponding cosine values.",
        status: STATUS.READY,
        type: 'boundary',
        color: SCENE_COLORS.BOUNDARY,
        demoName: DEMO_NAMES.ANGLE_CLASSIFICATION,
        module: () => import('../scenes/scene2.js'),
        presets: {
            intro: { speed: 0.5, intensity: 45 },
            demo: { speed: 1.0, intensity: 50 },
            climax: { speed: 1.2, intensity: 90 }
        },
        videoSequence: {
            duration: 40,
            transition: 'morph',
            focusPoints: ['angle_arc', 'cosine_value', 'classification']
        }
    },
    3: { 
        id: 3,
        name: "Cosine Alignment",
        description: "Billiard Ball Collision Dynamics",
        longDescription: "Physics simulation with cosine overlay showing the relationship between impact angle and energy transfer. See how acute impacts result in contained bounces while right angles create separation.",
        status: STATUS.IN_PROGRESS,
        type: 'wave',
        color: SCENE_COLORS.WAVE,
        demoName: DEMO_NAMES.COSINE_ALIGNMENT,
        module: () => import('../scenes/scene3.js'),
        presets: {
            intro: { speed: 0.7, intensity: 30 },
            demo: { speed: 1.0, intensity: 45 },
            climax: { speed: 1.3, intensity: 70 }
        },
        videoSequence: {
            duration: 50,
            transition: 'zoom',
            focusPoints: ['collision_point', 'energy_transfer', 'trajectory']
        }
    },
    4: { 
        id: 4,
        name: "Sine Deviation",
        description: "Tangent Explosion at Boundaries",
        longDescription: "Interactive angle slider with sine/tangent plot showing how tangent explodes as angle approaches 90°. Spring animation demonstrating restoring force with real-time boundary limits.",
        status: STATUS.IN_PROGRESS,
        type: 'divergent',
        color: SCENE_COLORS.DIVERGENT,
        demoName: DEMO_NAMES.SINE_DEVIATION,
        module: () => import('../scenes/scene4.js'),
        presets: {
            intro: { speed: 0.6, intensity: 45 },
            demo: { speed: 1.0, intensity: 60 },
            climax: { speed: 1.4, intensity: 89 }
        },
        videoSequence: {
            duration: 35,
            transition: 'rotate',
            focusPoints: ['tangent_explosion', 'sine_curve', 'boundary_limits']
        }
    },
    5: { 
        id: 5,
        name: "Angle Reality Classification",
        description: "Three-Body Gravitational System",
        longDescription: "Interactive planetary system with three masses and adjustable positions. Observe how interactions are color-coded by angle type, with acute angles forming stable orbits and obtuse angles creating escape trajectories.",
        status: STATUS.IN_PROGRESS,
        type: 'boundary',
        color: SCENE_COLORS.BOUNDARY,
        demoName: DEMO_NAMES.THREE_BODY,
        module: () => import('../scenes/scene5.js'),
        presets: {
            intro: { speed: 0.5, intensity: 40 },
            demo: { speed: 1.0, intensity: 55 },
            climax: { speed: 1.5, intensity: 75 }
        },
        videoSequence: {
            duration: 60,
            transition: 'pan',
            focusPoints: ['orbital_paths', 'stability_zones', 'perspective_shift']
        }
    },
    6: { 
        id: 6,
        name: "Boundary Enforcement",
        description: "Computing π Through Collisions",
        longDescription: "Classic billiard algorithm for computing π through particle collisions. Watch as the system counts collisions to approximate π with frequency domain emergence and threshold visualization.",
        status: STATUS.READY,  
        type: 'wave',
        color: SCENE_COLORS.WAVE,
        demoName: DEMO_NAMES.PI_CALCULATION,
        module: () => import('../scenes/scene6.js'),
        presets: {
            intro: { speed: 0.4, intensity: 50 },
            demo: { speed: 1.0, intensity: 70 },
            climax: { speed: 2.0, intensity: 100 }
        },
        videoSequence: {
            duration: 45,
            transition: 'dissolve',
            focusPoints: ['collision_count', 'pi_digits', 'mass_ratio']
        }
    },
    7: { 
        id: 7,
        name: "Prime Uniqueness",
        description: "Ulam Spiral & Trajectory Mapping",
        longDescription: "Visualize prime numbers on a coordinate grid with y=x boundary lines. Animate non-trivial trajectory solutions and observe how composite numbers form multi-path configurations.",
        status: STATUS.READY,  
        type: 'primary',
        color: SCENE_COLORS.PRIMARY,
        demoName: DEMO_NAMES.PRIME_SPIRAL,
        module: () => import('../scenes/scene7.js'),
        presets: {
            intro: { speed: 0.5, intensity: 30 },
            demo: { speed: 1.0, intensity: 50 },
            climax: { speed: 1.3, intensity: 80 }
        },
        videoSequence: {
            duration: 40,
            transition: 'spiral',
            focusPoints: ['prime_pattern', 'trajectory_paths', 'sphere_formation']
        }
    },
    8: { 
        id: 8,
        name: "Multi-Perspective Coherence",
        description: "Cosine-Based Flocking System",
        longDescription: "Boids simulation using cosine-weighted alignment and obtuse-angle dispersion. Birds form coherent groups when headings agree and split apart on opposing angles, creating dynamic rotational patterns.",
        status: STATUS.READY,  
        type: 'wave',
        color: SCENE_COLORS.WAVE,
        demoName: DEMO_NAMES.FLOCKING,
        module: () => import('../scenes/scene8.js'),
        presets: {
            intro: { speed: 0.6, intensity: 20 },
            demo: { speed: 1.0, intensity: 50 },
            climax: { speed: 1.3, intensity: 90 }
        },
        videoSequence: {
            duration: 50,
            transition: 'flock',
            focusPoints: ['emergent_behavior', 'alignment_forces', 'rotational_patterns']
        }
    },
    9: { 
        id: 9,
        name: "SEP Operationalization",
        description: "64-bit Quantum State Detection",
        longDescription: "Implementation of actual SEP algorithms with 64-bit state pins as an interactive grid. Watch QBSA rupture detection and QFH spectral analysis with real-time angle modulation effects.",
        status: STATUS.READY,  
        type: 'primary',
        color: SCENE_COLORS.PRIMARY,
        demoName: DEMO_NAMES.SEP_FRAMEWORK,
        module: () => import('../scenes/scene9.js'),
        presets: {
            intro: { speed: 0.7, intensity: 40 },
            demo: { speed: 1.0, intensity: 60 },
            climax: { speed: 1.5, intensity: 100 }
        },
        videoSequence: {
            duration: 55,
            transition: 'quantum',
            focusPoints: ['state_grid', 'rupture_detection', 'coherence_visualization']
        }
    },
    10: {
        id: 10,
        name: "Particle Fluid",
        description: "Particle-based Fluid Simulation",
        longDescription: "Fluid simulation with vorticity coloring and boundary rotation using interacting particles.",
        status: STATUS.READY,
        type: 'divergent',
        color: SCENE_COLORS.DIVERGENT,
        demoName: DEMO_NAMES.FLUID_DYNAMICS,
        module: () => import('../scenes/scene10.js'),
        presets: {
            intro: { speed: 0.4, intensity: 30 },
            demo: { speed: 1.0, intensity: 50 },
            climax: { speed: 1.2, intensity: 80 }
        },
        videoSequence: {
            duration: 45,
            transition: 'flow',
            focusPoints: ['vorticity_field', 'boundary_swirl', 'particle_motion']
        }
    },
    11: { 
        id: 11,
        name: "Derivative Applications",
        description: "Black-Scholes with SEP Enhancement",
        longDescription: "Financial derivative surface plot with volatility as boundary thickness. Compare traditional PDE solutions with SEP path learning overlay and observe real-time efficiency metrics.",
        status: STATUS.READY,  
        type: 'boundary',
        color: SCENE_COLORS.BOUNDARY,
        demoName: DEMO_NAMES.DERIVATIVES,
        module: () => import('../scenes/scene11.js'),
        presets: {
            intro: { speed: 0.5, intensity: 30 },
            demo: { speed: 1.0, intensity: 50 },
            climax: { speed: 1.5, intensity: 80 }
        },
        videoSequence: {
            duration: 40,
            transition: 'chart',
            focusPoints: ['volatility_surface', 'efficiency_comparison', 'boundary_resampling']
        }
    },
    12: { 
        id: 12,
        name: "Reality's Code",
        description: "Unified Meta-Visualization",
        longDescription: "Combine elements from all previous scenes into a comprehensive meta-visualization. See angles modulating in the center with boundaries containing emergence, primes as foundation points, and coherence waves propagating throughout.",
        status: STATUS.READY,
        type: 'secondary',
        color: SCENE_COLORS.SECONDARY,
        demoName: DEMO_NAMES.META_VISUALIZATION,
        module: () => import('../scenes/scene12.js'),
        presets: {
            intro: { speed: 0.3, intensity: 20 },
            demo: { speed: 1.0, intensity: 60 },
            climax: { speed: 1.5, intensity: 100 }
        },
        videoSequence: {
            duration: 70,
            transition: 'unify',
            focusPoints: ['central_modulation', 'emergent_connections', 'framework_overlay']
        }
    }
};

// Scene sequence for the standalone video
export const VIDEO_SEQUENCE = Object.values(SCENES).map(scene => ({
    id: scene.id,
    duration: scene.videoSequence.duration * 1000, // Convert to milliseconds
    transition: scene.videoSequence.transition,
    focusPoints: scene.videoSequence.focusPoints,
    preset: 'demo'
}));