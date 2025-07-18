/**
 * SEP Demo Application Loader
 * Initializes the framework and sets up the demo application
 */

import AppFramework from './core/app-framework.js';
import { SCENE_IDS, DEFAULT_SCENE } from './config/scene-registry.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('Initializing SEP Demo Application...');
    
    try {
        // Find the main canvas
        const canvas = document.getElementById('demo-canvas') || 
                      document.querySelector('canvas');
        
        if (!canvas) {
            throw new Error('No canvas element found');
        }
        
        // Create app container if it doesn't exist
        let appContainer = document.getElementById('app-container');
        if (!appContainer) {
            appContainer = document.createElement('div');
            appContainer.id = 'app-container';
            document.body.appendChild(appContainer);
            
            // Style the container
            appContainer.style.position = 'relative';
            appContainer.style.width = '100%';
            appContainer.style.height = '100vh';
            appContainer.style.overflow = 'hidden';
            
            // Move canvas into container
            canvas.parentNode.removeChild(canvas);
            appContainer.appendChild(canvas);
            
            // Style the canvas
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = appContainer.clientWidth;
            canvas.height = appContainer.clientHeight;
        }
        
        // Determine start scene from URL parameter if provided
        const params = new URLSearchParams(window.location.search);
        const startScene = params.get('scene');

        // Initialize the framework
        const app = new AppFramework(canvas, {
            autoStart: true,
            defaultScene: startScene ? parseInt(startScene) : DEFAULT_SCENE,
            debug: false,
            recordingEnabled: true,
            persistState: true
        });
        
        // Store app reference globally for debugging
        window.sepApp = app;
        
        // Add UI elements
        createUIElements(app, appContainer);
        
        // Log successful initialization
        console.log('SEP Demo Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage(error);
    }
}

/**
 * Create UI elements for the application
 * @param {AppFramework} app - The app instance
 * @param {HTMLElement} container - The container element
 */
function createUIElements(app, container) {
    // Create scene selector
    const sceneSelector = document.createElement('div');
    sceneSelector.className = 'scene-selector';
    sceneSelector.innerHTML = `
        <div class="scene-selector-inner">
            <div class="scene-selector-title">Scenes</div>
            <div class="scene-list"></div>
        </div>
    `;
    
    // Style the scene selector
    sceneSelector.style.position = 'absolute';
    sceneSelector.style.top = '20px';
    sceneSelector.style.left = '20px';
    sceneSelector.style.background = 'rgba(0, 0, 0, 0.7)';
    sceneSelector.style.borderRadius = '10px';
    sceneSelector.style.padding = '15px';
    sceneSelector.style.color = 'white';
    sceneSelector.style.zIndex = '100';
    sceneSelector.style.maxHeight = 'calc(100vh - 40px)';
    sceneSelector.style.overflowY = 'auto';
    sceneSelector.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
    sceneSelector.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    sceneSelector.style.opacity = '0';
    sceneSelector.style.transform = 'translateX(-20px)';
    
    // Style inner elements
    const style = document.createElement('style');
    style.textContent = `
        .scene-selector-inner {
            min-width: 200px;
        }
        .scene-selector-title {
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .scene-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .scene-item {
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
        }
        .scene-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        .scene-item.active {
            background: rgba(102, 126, 234, 0.3);
        }
        .scene-number {
            font-size: 12px;
            background: rgba(255, 255, 255, 0.1);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
        }
        .scene-name {
            flex: 1;
        }
        .control-bar {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50px;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 100;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }
        .control-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: background 0.2s ease;
        }
        .control-button:hover {
            background: rgba(102, 126, 234, 0.5);
        }
        .control-button.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .fps-counter {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.5);
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            color: white;
            z-index: 100;
        }
    `;
    document.head.appendChild(style);
    
    // Populate scene list
    const sceneList = sceneSelector.querySelector('.scene-list');
    
    // Get scenes from SCENE_IDS (object with scene ID keys and names)
    Object.entries(SCENE_IDS).forEach(([key, id], index) => {
        const sceneItem = document.createElement('div');
        sceneItem.className = 'scene-item';
        sceneItem.dataset.sceneId = id;
        sceneItem.innerHTML = `
            <div class="scene-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="scene-name">${key.replace(/_/g, ' ')}</div>
        `;
        
        // Add click handler
        sceneItem.addEventListener('click', () => {
            app.changeScene(id);
            
            // Update active class
            document.querySelectorAll('.scene-item').forEach(item => {
                item.classList.remove('active');
            });
            sceneItem.classList.add('active');
        });
        
        sceneList.appendChild(sceneItem);
    });
    
    // Create control bar
    const controlBar = document.createElement('div');
    controlBar.className = 'control-bar';
    controlBar.innerHTML = `
        <button class="control-button" id="btn-menu" title="Toggle Menu"><i>≡</i></button>
        <button class="control-button" id="btn-pause" title="Pause/Resume"><i>⏸</i></button>
        <button class="control-button" id="btn-reset" title="Reset Scene"><i>↺</i></button>
        <button class="control-button" id="btn-record" title="Record Video"><i>⚫</i></button>
        <button class="control-button" id="btn-fullscreen" title="Fullscreen"><i>⛶</i></button>
    `;
    
    // Create FPS counter
    const fpsCounter = document.createElement('div');
    fpsCounter.className = 'fps-counter';
    fpsCounter.textContent = 'FPS: 0';
    
    // Add event handlers for control buttons
    let isMenuVisible = false;
    let isPaused = false;
    let isFullscreen = false;
    
    // Add UI elements to container
    container.appendChild(sceneSelector);
    container.appendChild(controlBar);
    container.appendChild(fpsCounter);
    
    // Event handlers
    const btnMenu = document.getElementById('btn-menu');
    btnMenu.addEventListener('click', () => {
        isMenuVisible = !isMenuVisible;
        sceneSelector.style.opacity = isMenuVisible ? '1' : '0';
        sceneSelector.style.transform = isMenuVisible ? 'translateX(0)' : 'translateX(-20px)';
        btnMenu.classList.toggle('active', isMenuVisible);
    });
    
    const btnPause = document.getElementById('btn-pause');
    btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        btnPause.innerHTML = isPaused ? '<i>▶</i>' : '<i>⏸</i>';
        btnPause.classList.toggle('active', isPaused);
        
        if (isPaused) {
            app.pause();
        } else {
            app.resume();
        }
    });
    
    const btnReset = document.getElementById('btn-reset');
    btnReset.addEventListener('click', () => {
        const currentSceneId = app.currentScene.id;
        app.changeScene(currentSceneId);
    });
    
    const btnRecord = document.getElementById('btn-record');
    btnRecord.addEventListener('click', () => {
        if (app.videoController) {
            app.videoController.handleRecordClick();
            btnRecord.classList.toggle('active', app.videoController.isRecording);
        }
    });
    
    const btnFullscreen = document.getElementById('btn-fullscreen');
    btnFullscreen.addEventListener('click', () => {
        isFullscreen = !isFullscreen;
        
        if (isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        
        btnFullscreen.classList.toggle('active', isFullscreen);
    });
    
    // Listen for fullscreen change
    document.addEventListener('fullscreenchange', () => {
        isFullscreen = !!document.fullscreenElement;
        btnFullscreen.classList.toggle('active', isFullscreen);
    });
    
    // Update FPS counter
    app.emitter.on('frameUpdate', (info) => {
        fpsCounter.textContent = `FPS: ${app.fpsCounter.value}`;
    });
    
    // Update active scene in selector
    app.emitter.on('sceneChange', (info) => {
        document.querySelectorAll('.scene-item').forEach(item => {
            item.classList.toggle('active', item.dataset.sceneId === info.current);
        });
    });
}

/**
 * Display an error message to the user
 * @param {Error} error - The error object
 */
function showErrorMessage(error) {
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '0';
    errorContainer.style.left = '0';
    errorContainer.style.width = '100%';
    errorContainer.style.height = '100%';
    errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    errorContainer.style.color = 'white';
    errorContainer.style.display = 'flex';
    errorContainer.style.flexDirection = 'column';
    errorContainer.style.justifyContent = 'center';
    errorContainer.style.alignItems = 'center';
    errorContainer.style.padding = '20px';
    errorContainer.style.zIndex = '1000';
    
    errorContainer.innerHTML = `
        <h2 style="color: #ff5555; margin-bottom: 20px;">Application Error</h2>
        <p style="margin-bottom: 10px;">${error.message}</p>
        <pre style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; overflow: auto; max-width: 80vw;">${error.stack}</pre>
        <button id="error-dismiss" style="margin-top: 20px; padding: 10px 20px; background: #ff5555; border: none; color: white; cursor: pointer; border-radius: 5px;">Dismiss</button>
    `;
    
    document.body.appendChild(errorContainer);
    
    document.getElementById('error-dismiss').addEventListener('click', () => {
        errorContainer.parentNode.removeChild(errorContainer);
    });
}

export { initializeApp };