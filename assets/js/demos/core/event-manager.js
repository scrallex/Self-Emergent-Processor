/**
 * Event Manager
 * Handles user interactions and input events for the demo framework
 */

class EventManager {
    constructor(canvas) {
        // Reference to the canvas element
        this.canvas = canvas;
        
        // Event handler storage
        this.handlers = {
            mouse: new Map(),
            keyboard: new Map(),
            touch: new Map(),
            wheel: new Map(),
            resize: new Set(),
            custom: new Map()
        };
        
        // Scene-specific handlers
        this.sceneHandlers = new Map();
        
        // Input state tracking
        this.mouse = {
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: [false, false, false], // left, middle, right
            isDown: false,
            isInCanvas: false
        };
        
        this.keyboard = {
            keys: new Set(),
            modifiers: {
                shift: false,
                ctrl: false,
                alt: false,
                meta: false
            }
        };
        
        this.touch = {
            active: false,
            touches: [],
            lastTap: 0,
            doubleTapDelay: 300
        };
        
        // Pointer lock state
        this.pointerLocked = false;
        
        // Gesture recognition
        this.gestures = {
            lastDistance: 0,
            lastAngle: 0,
            isPinching: false,
            isRotating: false,
            pinchDistance: 0,
            rotationAngle: 0
        };
        
        // Bound handlers to maintain references for removal
        this.boundHandlers = {};
    }
    
    /**
     * Initialize the event manager
     * @returns {Promise} - Resolves when initialization is complete
     */
    async init() {
        console.log('Initializing event manager...');
        
        // Bind event handlers
        this.bindEventHandlers();
        
        return Promise.resolve();
    }
    
    /**
     * Bind all event handlers to the canvas and document
     */
    bindEventHandlers() {
        // Mouse events
        this.boundHandlers.mouseMove = this.handleMouseMove.bind(this);
        this.boundHandlers.mouseDown = this.handleMouseDown.bind(this);
        this.boundHandlers.mouseUp = this.handleMouseUp.bind(this);
        this.boundHandlers.mouseEnter = this.handleMouseEnter.bind(this);
        this.boundHandlers.mouseLeave = this.handleMouseLeave.bind(this);
        this.boundHandlers.mouseWheel = this.handleMouseWheel.bind(this);
        this.boundHandlers.contextMenu = this.handleContextMenu.bind(this);
        
        // Touch events
        this.boundHandlers.touchStart = this.handleTouchStart.bind(this);
        this.boundHandlers.touchMove = this.handleTouchMove.bind(this);
        this.boundHandlers.touchEnd = this.handleTouchEnd.bind(this);
        
        // Keyboard events
        this.boundHandlers.keyDown = this.handleKeyDown.bind(this);
        this.boundHandlers.keyUp = this.handleKeyUp.bind(this);
        
        // Window events
        this.boundHandlers.resize = this.handleResize.bind(this);
        this.boundHandlers.blur = this.handleBlur.bind(this);
        this.boundHandlers.focus = this.handleFocus.bind(this);
        
        // Pointer lock events
        this.boundHandlers.pointerLockChange = this.handlePointerLockChange.bind(this);
        this.boundHandlers.pointerLockError = this.handlePointerLockError.bind(this);
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.boundHandlers.mouseMove, { passive: true });
        this.canvas.addEventListener('mousedown', this.boundHandlers.mouseDown);
        this.canvas.addEventListener('mouseup', this.boundHandlers.mouseUp);
        this.canvas.addEventListener('mouseenter', this.boundHandlers.mouseEnter, { passive: true });
        this.canvas.addEventListener('mouseleave', this.boundHandlers.mouseLeave, { passive: true });
        this.canvas.addEventListener('wheel', this.boundHandlers.mouseWheel, { passive: false });
        this.canvas.addEventListener('contextmenu', this.boundHandlers.contextMenu);
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.boundHandlers.touchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.boundHandlers.touchEnd, { passive: true });
        this.canvas.addEventListener('touchcancel', this.boundHandlers.touchEnd, { passive: true });
        
        // Keyboard events (document level)
        document.addEventListener('keydown', this.boundHandlers.keyDown);
        document.addEventListener('keyup', this.boundHandlers.keyUp);
        
        // Window events
        window.addEventListener('resize', this.boundHandlers.resize, { passive: true });
        window.addEventListener('blur', this.boundHandlers.blur, { passive: true });
        window.addEventListener('focus', this.boundHandlers.focus, { passive: true });
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', this.boundHandlers.pointerLockChange, { passive: true });
        document.addEventListener('mozpointerlockchange', this.boundHandlers.pointerLockChange, { passive: true });
        document.addEventListener('webkitpointerlockchange', this.boundHandlers.pointerLockChange, { passive: true });
        
        document.addEventListener('pointerlockerror', this.boundHandlers.pointerLockError, { passive: true });
        document.addEventListener('mozpointerlockerror', this.boundHandlers.pointerLockError, { passive: true });
        document.addEventListener('webkitpointerlockerror', this.boundHandlers.pointerLockError, { passive: true });
    }
    
    /**
     * Remove all event handlers
     */
    removeEventHandlers() {
        // Mouse events
        this.canvas.removeEventListener('mousemove', this.boundHandlers.mouseMove);
        this.canvas.removeEventListener('mousedown', this.boundHandlers.mouseDown);
        this.canvas.removeEventListener('mouseup', this.boundHandlers.mouseUp);
        this.canvas.removeEventListener('mouseenter', this.boundHandlers.mouseEnter);
        this.canvas.removeEventListener('mouseleave', this.boundHandlers.mouseLeave);
        this.canvas.removeEventListener('wheel', this.boundHandlers.mouseWheel);
        this.canvas.removeEventListener('contextmenu', this.boundHandlers.contextMenu);
        
        // Touch events
        this.canvas.removeEventListener('touchstart', this.boundHandlers.touchStart);
        this.canvas.removeEventListener('touchmove', this.boundHandlers.touchMove);
        this.canvas.removeEventListener('touchend', this.boundHandlers.touchEnd);
        this.canvas.removeEventListener('touchcancel', this.boundHandlers.touchEnd);
        
        // Keyboard events
        document.removeEventListener('keydown', this.boundHandlers.keyDown);
        document.removeEventListener('keyup', this.boundHandlers.keyUp);
        
        // Window events
        window.removeEventListener('resize', this.boundHandlers.resize);
        window.removeEventListener('blur', this.boundHandlers.blur);
        window.removeEventListener('focus', this.boundHandlers.focus);
        
        // Pointer lock events
        document.removeEventListener('pointerlockchange', this.boundHandlers.pointerLockChange);
        document.removeEventListener('mozpointerlockchange', this.boundHandlers.pointerLockChange);
        document.removeEventListener('webkitpointerlockchange', this.boundHandlers.pointerLockChange);
        
        document.removeEventListener('pointerlockerror', this.boundHandlers.pointerLockError);
        document.removeEventListener('mozpointerlockerror', this.boundHandlers.pointerLockError);
        document.removeEventListener('webkitpointerlockerror', this.boundHandlers.pointerLockError);
    }
    
    /**
     * Get the canvas-relative coordinates from a mouse or touch event
     * @param {Event} event - The mouse or touch event
     * @returns {Object} - The { x, y } coordinates relative to the canvas
     */
    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Handle mouse and touch events differently
        if (event.changedTouches) {
            // Touch event
            const touch = event.changedTouches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
        } else {
            // Mouse event
            return {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY
            };
        }
    }
    
    /**
     * Handle mouse move events
     * @param {MouseEvent} event - The mouse move event
     */
    handleMouseMove(event) {
        // Save previous position
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        
        // Get new position
        const coords = this.getCanvasCoordinates(event);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        
        // Calculate delta
        this.mouse.deltaX = this.mouse.x - this.mouse.prevX;
        this.mouse.deltaY = this.mouse.y - this.mouse.prevY;
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'move', {
            x: this.mouse.x,
            y: this.mouse.y,
            deltaX: this.mouse.deltaX,
            deltaY: this.mouse.deltaY,
            buttons: this.mouse.buttons,
            isDown: this.mouse.isDown,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse down events
     * @param {MouseEvent} event - The mouse down event
     */
    handleMouseDown(event) {
        // Prevent default only for canvas interactions
        if (event.target === this.canvas) {
            event.preventDefault();
        }
        
        // Update button state
        this.mouse.buttons[event.button] = true;
        this.mouse.isDown = true;
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'down', {
            x: this.mouse.x,
            y: this.mouse.y,
            button: event.button,
            buttons: this.mouse.buttons,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse up events
     * @param {MouseEvent} event - The mouse up event
     */
    handleMouseUp(event) {
        // Update button state
        this.mouse.buttons[event.button] = false;
        this.mouse.isDown = this.mouse.buttons.some(button => button);
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'up', {
            x: this.mouse.x,
            y: this.mouse.y,
            button: event.button,
            buttons: this.mouse.buttons,
            originalEvent: event
        });
        
        // Also trigger click event
        this.triggerHandlers('mouse', 'click', {
            x: this.mouse.x,
            y: this.mouse.y,
            button: event.button,
            buttons: this.mouse.buttons,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse enter events
     * @param {MouseEvent} event - The mouse enter event
     */
    handleMouseEnter(event) {
        this.mouse.isInCanvas = true;
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'enter', {
            x: this.mouse.x,
            y: this.mouse.y,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse leave events
     * @param {MouseEvent} event - The mouse leave event
     */
    handleMouseLeave(event) {
        this.mouse.isInCanvas = false;
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'leave', {
            x: this.mouse.x,
            y: this.mouse.y,
            originalEvent: event
        });
    }
    
    /**
     * Handle mouse wheel events
     * @param {WheelEvent} event - The wheel event
     */
    handleMouseWheel(event) {
        // Prevent default scrolling behavior
        event.preventDefault();
        
        // Get normalized delta (different browsers handle this differently)
        const deltaX = event.deltaX || 0;
        const deltaY = event.deltaY || 0;
        const deltaZ = event.deltaZ || 0;
        
        // Call registered handlers
        this.triggerHandlers('wheel', 'wheel', {
            x: this.mouse.x,
            y: this.mouse.y,
            deltaX,
            deltaY,
            deltaZ,
            originalEvent: event
        });
    }
    
    /**
     * Handle context menu events (right click)
     * @param {MouseEvent} event - The context menu event
     */
    handleContextMenu(event) {
        // Prevent the context menu from appearing
        event.preventDefault();
        
        // Call registered handlers
        this.triggerHandlers('mouse', 'contextmenu', {
            x: this.mouse.x,
            y: this.mouse.y,
            originalEvent: event
        });
    }
    
    /**
     * Handle touch start events
     * @param {TouchEvent} event - The touch start event
     */
    handleTouchStart(event) {
        // Prevent default only for canvas interactions
        if (event.target === this.canvas) {
            event.preventDefault();
        }
        
        // Update touch state
        this.touch.active = true;
        this.touch.touches = Array.from(event.touches);
        
        // Get coordinates of the first touch
        const coords = this.getCanvasCoordinates(event);
        this.mouse.x = coords.x; // We update mouse coords too for compatibility
        this.mouse.y = coords.y;
        this.mouse.isDown = true;
        
        // Detect double tap
        const now = Date.now();
        const doubleTap = now - this.touch.lastTap < this.touch.doubleTapDelay;
        this.touch.lastTap = now;
        
        // Start gesture detection if multiple touches
        if (event.touches.length >= 2) {
            this.startGestureDetection(event);
        }
        
        // Call registered handlers
        this.triggerHandlers('touch', 'start', {
            x: coords.x,
            y: coords.y,
            touches: this.touch.touches,
            doubleTap,
            originalEvent: event
        });
    }
    
    /**
     * Handle touch move events
     * @param {TouchEvent} event - The touch move event
     */
    handleTouchMove(event) {
        // Prevent default to avoid scrolling
        event.preventDefault();
        
        // Update touch state
        this.touch.touches = Array.from(event.touches);
        
        // Get coordinates of the first touch
        const coords = this.getCanvasCoordinates(event);
        
        // Save previous position
        this.mouse.prevX = this.mouse.x;
        this.mouse.prevY = this.mouse.y;
        
        // Update mouse coordinates for compatibility
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        this.mouse.deltaX = this.mouse.x - this.mouse.prevX;
        this.mouse.deltaY = this.mouse.y - this.mouse.prevY;
        
        // Update gesture detection if multiple touches
        if (event.touches.length >= 2) {
            this.updateGestureDetection(event);
        }
        
        // Call registered handlers
        this.triggerHandlers('touch', 'move', {
            x: coords.x,
            y: coords.y,
            deltaX: this.mouse.deltaX,
            deltaY: this.mouse.deltaY,
            touches: this.touch.touches,
            pinchDistance: this.gestures.pinchDistance,
            rotationAngle: this.gestures.rotationAngle,
            isPinching: this.gestures.isPinching,
            isRotating: this.gestures.isRotating,
            originalEvent: event
        });
    }
    
    /**
     * Handle touch end events
     * @param {TouchEvent} event - The touch end event
     */
    handleTouchEnd(event) {
        // Update touch state
        this.touch.touches = Array.from(event.touches);
        
        // End gesture detection if less than two touches
        if (event.touches.length < 2) {
            this.endGestureDetection();
        }
        
        // Update mouse state for compatibility
        if (event.touches.length === 0) {
            this.touch.active = false;
            this.mouse.isDown = false;
        }
        
        // Get coordinates of the first changed touch
        const coords = this.getCanvasCoordinates(event);
        
        // Call registered handlers
        this.triggerHandlers('touch', 'end', {
            x: coords.x,
            y: coords.y,
            touches: this.touch.touches,
            originalEvent: event
        });
        
        // Also trigger tap event (similar to click)
        this.triggerHandlers('touch', 'tap', {
            x: coords.x,
            y: coords.y,
            touches: this.touch.touches,
            originalEvent: event
        });
    }
    
    /**
     * Start gesture detection for multi-touch
     * @param {TouchEvent} event - The touch event
     */
    startGestureDetection(event) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        // Calculate distance and angle between touches
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        
        this.gestures.lastDistance = Math.sqrt(dx * dx + dy * dy);
        this.gestures.lastAngle = Math.atan2(dy, dx);
        
        this.gestures.isPinching = false;
        this.gestures.isRotating = false;
        this.gestures.pinchDistance = 0;
        this.gestures.rotationAngle = 0;
    }
    
    /**
     * Update gesture detection for multi-touch
     * @param {TouchEvent} event - The touch event
     */
    updateGestureDetection(event) {
        if (event.touches.length < 2) return;
        
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        // Calculate distance and angle between touches
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Calculate changes
        const deltaDistance = distance - this.gestures.lastDistance;
        let deltaAngle = angle - this.gestures.lastAngle;
        
        // Normalize angle change to be between -PI and PI
        while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        
        // Detect pinch
        if (Math.abs(deltaDistance) > 1) {
            this.gestures.isPinching = true;
            this.gestures.pinchDistance = deltaDistance;
        }
        
        // Detect rotation
        if (Math.abs(deltaAngle) > 0.05) {
            this.gestures.isRotating = true;
            this.gestures.rotationAngle = deltaAngle;
        }
        
        // Save current values
        this.gestures.lastDistance = distance;
        this.gestures.lastAngle = angle;
    }
    
    /**
     * End gesture detection
     */
    endGestureDetection() {
        this.gestures.isPinching = false;
        this.gestures.isRotating = false;
        this.gestures.pinchDistance = 0;
        this.gestures.rotationAngle = 0;
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - The key down event
     */
    handleKeyDown(event) {
        // Update key state
        this.keyboard.keys.add(event.key.toLowerCase());
        
        // Update modifier state
        this.keyboard.modifiers.shift = event.shiftKey;
        this.keyboard.modifiers.ctrl = event.ctrlKey;
        this.keyboard.modifiers.alt = event.altKey;
        this.keyboard.modifiers.meta = event.metaKey;
        
        // Call registered handlers
        this.triggerHandlers('keyboard', 'down', {
            key: event.key.toLowerCase(),
            code: event.code,
            modifiers: { ...this.keyboard.modifiers },
            originalEvent: event
        });
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - The key up event
     */
    handleKeyUp(event) {
        // Update key state
        this.keyboard.keys.delete(event.key.toLowerCase());
        
        // Update modifier state
        this.keyboard.modifiers.shift = event.shiftKey;
        this.keyboard.modifiers.ctrl = event.ctrlKey;
        this.keyboard.modifiers.alt = event.altKey;
        this.keyboard.modifiers.meta = event.metaKey;
        
        // Call registered handlers
        this.triggerHandlers('keyboard', 'up', {
            key: event.key.toLowerCase(),
            code: event.code,
            modifiers: { ...this.keyboard.modifiers },
            originalEvent: event
        });
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Call registered handlers
        this.triggerHandlers('resize', 'resize', {
            width: window.innerWidth,
            height: window.innerHeight,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        });
    }
    
    /**
     * Handle window blur events
     */
    handleBlur() {
        // Reset all input states
        this.mouse.isDown = false;
        this.mouse.buttons = [false, false, false];
        this.keyboard.keys.clear();
        this.keyboard.modifiers.shift = false;
        this.keyboard.modifiers.ctrl = false;
        this.keyboard.modifiers.alt = false;
        this.keyboard.modifiers.meta = false;
        
        // Call registered handlers
        this.triggerHandlers('custom', 'blur', {
            timestamp: Date.now()
        });
    }
    
    /**
     * Handle window focus events
     */
    handleFocus() {
        // Call registered handlers
        this.triggerHandlers('custom', 'focus', {
            timestamp: Date.now()
        });
    }
    
    /**
     * Handle pointer lock change events
     */
    handlePointerLockChange() {
        this.pointerLocked = document.pointerLockElement === this.canvas ||
                           document.mozPointerLockElement === this.canvas ||
                           document.webkitPointerLockElement === this.canvas;
        
        // Call registered handlers
        this.triggerHandlers('custom', 'pointerlock', {
            locked: this.pointerLocked
        });
    }
    
    /**
     * Handle pointer lock error events
     */
    handlePointerLockError() {
        this.pointerLocked = false;
        
        // Call registered handlers
        this.triggerHandlers('custom', 'pointerlockerror', {
            timestamp: Date.now()
        });
    }
    
    /**
     * Request pointer lock on the canvas
     */
    requestPointerLock() {
        if (!this.canvas) return;
        
        this.canvas.requestPointerLock = 
            this.canvas.requestPointerLock ||
            this.canvas.mozRequestPointerLock ||
            this.canvas.webkitRequestPointerLock;
            
        if (this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
        }
    }
    
    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        document.exitPointerLock = 
            document.exitPointerLock ||
            document.mozExitPointerLock ||
            document.webkitExitPointerLock;
            
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Trigger handlers for a specific event
     * @param {string} type - The event type
     * @param {string} event - The event name
     * @param {Object} data - The event data
     */
    triggerHandlers(type, event, data) {
        // Get the map of handlers for this type
        const handlerMap = this.handlers[type];
        
        // If no handlers exist for this type, return
        if (!handlerMap) return;
        
        // Get handlers for this specific event
        const eventHandlers = handlerMap.get(event);
        
        // If handlers exist, call them
        if (eventHandlers) {
            eventHandlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${type}.${event} handler:`, error);
                }
            });
        }
        
        // Trigger scene-specific handlers
        this.triggerSceneHandlers(type, event, data);
    }
    
    /**
     * Trigger scene-specific handlers
     * @param {string} type - The event type
     * @param {string} event - The event name
     * @param {Object} data - The event data
     */
    triggerSceneHandlers(type, event, data) {
        // For each scene that has registered handlers
        this.sceneHandlers.forEach((sceneMap, sceneId) => {
            // Get type map for this scene
            const typeMap = sceneMap.get(type);
            if (!typeMap) return;
            
            // Get event handlers for this type
            const eventHandlers = typeMap.get(event);
            if (!eventHandlers) return;
            
            // Call each handler
            eventHandlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in scene ${sceneId} ${type}.${event} handler:`, error);
                }
            });
        });
    }
    
    /**
     * Register a handler for a specific event
     * @param {string} type - The event type (mouse, keyboard, touch, wheel, resize, custom)
     * @param {string} event - The event name (move, down, up, etc.)
     * @param {Function} handler - The handler function
     * @returns {Function} - Unregister function
     */
    on(type, event, handler) {
        // Get the map of handlers for this type
        const handlerMap = this.handlers[type];
        
        // If no map exists for this type, return
        if (!handlerMap) {
            console.error(`Unknown event type: ${type}`);
            return () => {};
        }
        
        // If no handlers exist for this event, create a new set
        if (!handlerMap.has(event)) {
            handlerMap.set(event, new Set());
        }
        
        // Add the handler
        handlerMap.get(event).add(handler);
        
        // Return a function to remove the handler
        return () => {
            if (handlerMap.has(event)) {
                handlerMap.get(event).delete(handler);
            }
        };
    }
    
    /**
     * Register a scene-specific handler
     * @param {number} sceneId - The scene ID
     * @param {string} type - The event type
     * @param {string} event - The event name
     * @param {Function} handler - The handler function
     * @returns {Function} - Unregister function
     */
    onScene(sceneId, type, event, handler) {
        // If no map exists for this scene, create one
        if (!this.sceneHandlers.has(sceneId)) {
            this.sceneHandlers.set(sceneId, new Map());
        }
        
        const sceneMap = this.sceneHandlers.get(sceneId);
        
        // If no map exists for this type, create one
        if (!sceneMap.has(type)) {
            sceneMap.set(type, new Map());
        }
        
        const typeMap = sceneMap.get(type);
        
        // If no handlers exist for this event, create a new set
        if (!typeMap.has(event)) {
            typeMap.set(event, new Set());
        }
        
        // Add the handler
        typeMap.get(event).add(handler);
        
        // Return a function to remove the handler
        return () => {
            if (this.sceneHandlers.has(sceneId) &&
                sceneMap.has(type) &&
                typeMap.has(event)) {
                typeMap.get(event).delete(handler);
            }
        };
    }
    
    /**
     * Clear all handlers for a specific scene
     * @param {number} sceneId - The scene ID
     */
    clearSceneHandlers(sceneId) {
        if (sceneId) {
            // Clear handlers for a specific scene
            this.sceneHandlers.delete(sceneId);
        } else {
            // Clear all scene handlers
            this.sceneHandlers.clear();
        }
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - The key to check
     * @returns {boolean} - Whether the key is pressed
     */
    isKeyDown(key) {
        return this.keyboard.keys.has(key.toLowerCase());
    }
    
    /**
     * Check if a mouse button is currently pressed
     * @param {number} button - The button to check (0=left, 1=middle, 2=right)
     * @returns {boolean} - Whether the button is pressed
     */
    isMouseButtonDown(button) {
        return this.mouse.buttons[button] || false;
    }
    
    /**
     * Check if any mouse button is currently pressed
     * @returns {boolean} - Whether any button is pressed
     */
    isMouseDown() {
        return this.mouse.isDown;
    }
    
    /**
     * Check if the mouse is currently in the canvas
     * @returns {boolean} - Whether the mouse is in the canvas
     */
    isMouseInCanvas() {
        return this.mouse.isInCanvas;
    }
    
    /**
     * Check if touch is currently active
     * @returns {boolean} - Whether touch is active
     */
    isTouchActive() {
        return this.touch.active;
    }
    
    /**
     * Get the current mouse position
     * @returns {Object} - The { x, y } coordinates
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    /**
     * Get the current touch positions
     * @returns {Array} - Array of touch positions
     */
    getTouchPositions() {
        return this.touch.touches;
    }
    
    /**
     * Check if a keyboard modifier is currently pressed
     * @param {string} modifier - The modifier to check (shift, ctrl, alt, meta)
     * @returns {boolean} - Whether the modifier is pressed
     */
    isModifierDown(modifier) {
        return this.keyboard.modifiers[modifier] || false;
    }
    
    /**
     * Cleanup and release resources
     */
    cleanup() {
        this.removeEventHandlers();
        this.handlers.mouse.clear();
        this.handlers.keyboard.clear();
        this.handlers.touch.clear();
        this.handlers.wheel.clear();
        this.handlers.resize.clear();
        this.handlers.custom.clear();
        this.sceneHandlers.clear();
    }
}

export default EventManager;