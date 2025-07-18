# Demo Implementation Tasks

This document tracks outstanding tasks for each interactive demo scene. Tasks focus on aligning the implementation with the narrative and technical requirements in the documentation.

## Scene 1 – The Hidden Code
   [ ] Display interfering sine waves and allow user adjustment of frequency.
   [ ] Include real-time Fourier transform output to reveal sine/cosine decomposition.

## Scene 2 – Identity Through Distinction
   [ ] Provide interactive protractor with drag-able vectors.
   [ ] Color-code angles (acute, right, obtuse) and show live cosine values.

## Scene 3 – Cosine Alignment
   [ ] Simulate billiard ball collisions with cosine-based impact highlighting.
   [ ] Show lattice formation when alignment exceeds threshold.

## Scene 4 – Sine Deviation
   [ ] Visualize sine/cosine curves with tangent blow-up near 90°.
   [ ] Add spring animation to demonstrate restoring force at boundaries.

## Scene 5 – Angle Reality Classification
   [ ] Implement three-body gravity system with angle-based coloring of trajectories.
   [ ] Allow perspective switching between bodies to show relative motion.

## Scene 6 – Boundary Enforcement
   [ ] Calculate π through billiard collisions and display collision count.
   [ ] Visualize frequency domain emergence from the bouncing pattern.

## Scene 7 – Prime Uniqueness
   [ ] Draw prime number spiral with interactive zoom.
   [ ] Animate trajectory paths forming composite patterns.

## Scene 8 – Multi-Perspective Coherence
   [ ] Use boid flocking rules with cosine-based alignment and obtuse dispersion.
   [ ] Show emergent rotational patterns as intensity increases.

## Scene 9 – SEP Operationalization
   [ ] Visualize 64‑bit state grid with QBSA rupture detection flashes.
   [ ] Provide QFH spectral analysis bars linked to state updates.

## Scene 10 – Unified Emergence
   [ ] Particle-based fluid demo highlighting vorticity and lattice formation.
   [ ] Enforce no-plane-hit constraint to keep rotation stable.

## Scene 11 – Derivative Applications
   [ ] Allow dynamic adjustment of price surface block size.
   [ ] Compare traditional PDE results with SEP path-learning overlay.

## Scene 12 – Reality’s Code
   [ ] Merge elements from all scenes into a cohesive meta‑visualization.
   [ ] Display SEP logo with propagating coherence waves.

## New Demo Framing Integration
   [ ] Create a universal demo_runner.html to host the shared canvas and load scenes based on a `scene` query parameter.
   [ ] Update `demos.html` cards to open demo_runner.html with the selected scene id.
   [ ] Ensure every scene module exports a default class compatible with `framework.js` loader.
   [ ] Wire per-scene control panels through `interactive-controller.js` so each demo exposes its own settings.
   [ ] Pass quality, speed, and intensity controls from the landing page to `demoFramework.updateSettings()`.
   [ ] Implement placeholder handling in `framework.js` for scenes still under construction.
   [ ] Preload required assets and show the animated loading overlay before a scene starts.
   [ ] Verify that `framework.js` reads the `scene` parameter on page load and launches the correct module.
   [ ] Rework `loadDemo()` in demos.html to remove old alerts and rely exclusively on the new loader.
   [ ] Test scene initialization order to avoid race conditions when switching quickly between demos.
   [ ] Validate unique control presets for all 12 scenes and document them in `scene-registry.js`.
   [ ] Confirm full-screen, pause, and recording buttons operate consistently across scenes.
