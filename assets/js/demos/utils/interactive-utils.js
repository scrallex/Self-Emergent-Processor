/**
 * Interactive Utilities
 * Provides enhanced interactive components and behaviors for the SEP demo framework
 */

import MathLib from './math-lib.js';

class InteractiveUtils {
    constructor(eventManager, stateManager, renderPipeline) {
        // Dependencies
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.renderPipeline = renderPipeline;
        this.math = new MathLib();
        
        // UI components storage
        this.components = new Map();
        
        // Interactive element tracking
        this.hoveredElement = null;
        this.activeElement = null;
        this.draggingElement = null;
        
        // Default styles
        this.styles = {
            primary: '#00d4ff',
            secondary: '#ffaa00',
            accent: '#00ff88',
            background: 'rgba(10, 10, 10, 0.7)',
            text: '#ffffff',
            disabled: '#666666',
            hover: 'rgba(255, 255, 255, 0.2)',
            active: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 5,
            fontSize: 14
        };
        
        // Gesture state tracking
        this.gestures = {
            dragStartX: 0,
            dragStartY: 0,
            isDragging: false,
            pinchStartDistance: 0,
            isPinching: false,
            rotateStartAngle: 0,
            isRotating: false
        };
        
        // Animation properties
        this.animations = new Map();
        this.animationFrame = 0;
        
        // Tooltip state
        this.tooltip = {
            active: false,
            text: '',
            x: 0,
            y: 0,
            delay: 500,
            timeout: null
        };
        
        // Bind methods to maintain 'this' context
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseDown = this.handleGlobalMouseDown.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
        this.handleGlobalTouchStart = this.handleGlobalTouchStart.bind(this);
        this.handleGlobalTouchMove = this.handleGlobalTouchMove.bind(this);
        this.handleGlobalTouchEnd = this.handleGlobalTouchEnd.bind(this);
        
        // Register global event handlers
        this.registerGlobalEventHandlers();
    }
    
    /**
     * Register global event handlers
     */
    registerGlobalEventHandlers() {
        this.eventManager.on('mouse', 'move', this.handleGlobalMouseMove);
        this.eventManager.on('mouse', 'down', this.handleGlobalMouseDown);
        this.eventManager.on('mouse', 'up', this.handleGlobalMouseUp);
        this.eventManager.on('touch', 'start', this.handleGlobalTouchStart);
        this.eventManager.on('touch', 'move', this.handleGlobalTouchMove);
        this.eventManager.on('touch', 'end', this.handleGlobalTouchEnd);
    }
    
    /**
     * Handle global mouse move for hover effects and dragging
     * @param {Object} data - Event data
     */
    handleGlobalMouseMove(data) {
        const { x, y } = data;
        
        // Update tooltip position
        this.tooltip.x = x + 15;
        this.tooltip.y = y + 15;
        
        // Handle dragging
        if (this.gestures.isDragging && this.draggingElement) {
            const dx = x - this.gestures.dragStartX;
            const dy = y - this.gestures.dragStartY;
            
            if (this.draggingElement.onDrag) {
                this.draggingElement.onDrag(dx, dy, x, y);
            }
            
            return;
        }
        
        // Check for hover on interactive elements
        let newHoveredElement = null;
        
        for (const component of this.components.values()) {
            if (component.visible && this.isPointInComponent(x, y, component)) {
                newHoveredElement = component;
                break;
            }
        }
        
        // Handle hover state changes
        if (newHoveredElement !== this.hoveredElement) {
            // Exit hover for previous element
            if (this.hoveredElement && this.hoveredElement.onHoverExit) {
                this.hoveredElement.onHoverExit();
            }
            
            // Enter hover for new element
            if (newHoveredElement && newHoveredElement.onHoverEnter) {
                newHoveredElement.onHoverEnter();
                
                // Show tooltip if component has one
                if (newHoveredElement.tooltip) {
                    this.showTooltip(newHoveredElement.tooltip);
                }
            } else {
                this.hideTooltip();
            }
            
            this.hoveredElement = newHoveredElement;
        }
    }
    
    /**
     * Handle global mouse down for interaction with components
     * @param {Object} data - Event data
     */
    handleGlobalMouseDown(data) {
        const { x, y } = data;
        
        // Check if click is on an interactive component
        for (const component of this.components.values()) {
            if (component.visible && this.isPointInComponent(x, y, component)) {
                this.activeElement = component;
                
                // Start drag operation if component is draggable
                if (component.draggable) {
                    this.gestures.isDragging = true;
                    this.gestures.dragStartX = x;
                    this.gestures.dragStartY = y;
                    this.draggingElement = component;
                    
                    if (component.onDragStart) {
                        component.onDragStart(x, y);
                    }
                }
                
                // Trigger click handler
                if (component.onClick) {
                    component.onClick(x, y);
                }
                
                // Record interaction in state manager
                this.stateManager.recordInteraction();
                
                return;
            }
        }
        
        // If click was not on any component, clear active element
        this.activeElement = null;
    }
    
    /**
     * Handle global mouse up to end interactions
     * @param {Object} data - Event data
     */
    handleGlobalMouseUp(data) {
        // End drag operation
        if (this.gestures.isDragging && this.draggingElement) {
            if (this.draggingElement.onDragEnd) {
                this.draggingElement.onDragEnd(data.x, data.y);
            }
            
            this.gestures.isDragging = false;
            this.draggingElement = null;
        }
        
        this.activeElement = null;
    }
    
    /**
     * Handle touch start events
     * @param {Object} data - Event data
     */
    handleGlobalTouchStart(data) {
        const { x, y, touches } = data;
        
        // Single touch - similar to mouse down
        if (touches.length === 1) {
            this.handleGlobalMouseDown({ x, y, button: 0 });
        }
        // Multi-touch - start gesture tracking
        else if (touches.length === 2) {
            this.startMultiTouchGesture(touches);
        }
    }
    
    /**
     * Handle touch move events
     * @param {Object} data - Event data
     */
    handleGlobalTouchMove(data) {
        const { x, y, touches, pinchDistance, rotationAngle } = data;
        
        // Single touch - similar to mouse move
        if (touches.length === 1) {
            this.handleGlobalMouseMove({ x, y });
        }
        // Multi-touch - handle gestures
        else if (touches.length >= 2) {
            this.handleMultiTouchGesture(touches, pinchDistance, rotationAngle);
        }
    }
    
    /**
     * Handle touch end events
     * @param {Object} data - Event data
     */
    handleGlobalTouchEnd(data) {
        // End all gestures
        this.gestures.isDragging = false;
        this.gestures.isPinching = false;
        this.gestures.isRotating = false;
        this.draggingElement = null;
        
        // Similar to mouse up
        this.handleGlobalMouseUp(data);
    }
    
    /**
     * Start tracking multi-touch gestures
     * @param {Array} touches - Touch points
     */
    startMultiTouchGesture(touches) {
        if (touches.length < 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate distance for pinch
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        this.gestures.pinchStartDistance = Math.sqrt(dx * dx + dy * dy);
        this.gestures.isPinching = true;
        
        // Calculate angle for rotation
        this.gestures.rotateStartAngle = Math.atan2(dy, dx);
        this.gestures.isRotating = true;
    }
    
    /**
     * Handle ongoing multi-touch gestures
     * @param {Array} touches - Touch points
     * @param {number} pinchDistance - Current pinch distance change
     * @param {number} rotationAngle - Current rotation angle change
     */
    handleMultiTouchGesture(touches, pinchDistance, rotationAngle) {
        // Find component under the center point of the gesture
        if (touches.length < 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Find component under the center point
        let targetComponent = null;
        for (const component of this.components.values()) {
            if (component.visible && this.isPointInComponent(centerX, centerY, component)) {
                targetComponent = component;
                break;
            }
        }
        
        // If no component found or component doesn't support gestures, return
        if (!targetComponent) return;
        
        // Handle pinch gesture
        if (this.gestures.isPinching && targetComponent.onPinch && pinchDistance !== 0) {
            targetComponent.onPinch(pinchDistance);
        }
        
        // Handle rotation gesture
        if (this.gestures.isRotating && targetComponent.onRotate && rotationAngle !== 0) {
            targetComponent.onRotate(rotationAngle);
        }
    }
    
    /**
     * Check if a point is inside a component
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} component - Component to check
     * @returns {boolean} - Whether the point is inside the component
     */
    isPointInComponent(x, y, component) {
        if (!component.bounds) return false;
        
        const { x: bx, y: by, width, height } = component.bounds;
        
        // For circular components
        if (component.shape === 'circle' && component.radius) {
            const dx = x - (bx + width / 2);
            const dy = y - (by + height / 2);
            return (dx * dx + dy * dy) <= component.radius * component.radius;
        }
        
        // For rectangular components (default)
        return x >= bx && x <= bx + width && y >= by && y <= by + height;
    }
    
    /**
     * Create a button component
     * @param {Object} options - Button options
     * @returns {Object} - The button component
     */
    createButton(options) {
        const defaultOptions = {
            id: `button_${Date.now()}`,
            x: 0,
            y: 0,
            width: 120,
            height: 40,
            text: 'Button',
            onClick: null,
            visible: true,
            enabled: true,
            color: this.styles.primary,
            textColor: this.styles.text,
            tooltip: null,
            shape: 'rectangle',
            cornerRadius: this.styles.borderRadius,
            shadow: true
        };
        
        const button = { ...defaultOptions, ...options };
        
        // Set bounds for hit detection
        button.bounds = {
            x: button.x,
            y: button.y,
            width: button.width,
            height: button.height
        };
        
        // Hover state
        button.hovered = false;
        
        // Hover handlers
        button.onHoverEnter = () => {
            button.hovered = true;
        };
        
        button.onHoverExit = () => {
            button.hovered = false;
        };
        
        // Render method
        button.render = (ctx) => {
            if (!button.visible) return;
            
            // Save context state
            ctx.save();
            
            // Apply shadow if enabled
            if (button.shadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            }
            
            // Draw button background
            ctx.fillStyle = button.enabled ? button.color : this.styles.disabled;
            
            // Add hover effect
            if (button.hovered && button.enabled) {
                ctx.fillStyle = this.lightenColor(button.color, 20);
            }
            
            // Draw based on shape
            if (button.shape === 'circle') {
                const centerX = button.x + button.width / 2;
                const centerY = button.y + button.height / 2;
                const radius = Math.min(button.width, button.height) / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Rounded rectangle
                this.drawRoundedRect(
                    ctx, 
                    button.x, 
                    button.y, 
                    button.width, 
                    button.height, 
                    button.cornerRadius
                );
                ctx.fill();
            }
            
            // Draw text
            ctx.fillStyle = button.textColor;
            ctx.font = `${this.styles.fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'transparent'; // Disable shadow for text
            
            const textX = button.x + button.width / 2;
            const textY = button.y + button.height / 2;
            ctx.fillText(button.text, textX, textY);
            
            // Restore context state
            ctx.restore();
        };
        
        // Add to components
        this.components.set(button.id, button);
        
        return button;
    }
    
    /**
     * Create a slider component
     * @param {Object} options - Slider options
     * @returns {Object} - The slider component
     */
    createSlider(options) {
        const defaultOptions = {
            id: `slider_${Date.now()}`,
            x: 0,
            y: 0,
            width: 200,
            height: 30,
            min: 0,
            max: 100,
            value: 50,
            step: 1,
            onChange: null,
            visible: true,
            enabled: true,
            color: this.styles.primary,
            backgroundColor: this.styles.background,
            textColor: this.styles.text,
            labelText: '',
            tooltip: null,
            showValue: true,
            draggable: true
        };
        
        const slider = { ...defaultOptions, ...options };
        
        // Set bounds for hit detection
        slider.bounds = {
            x: slider.x,
            y: slider.y,
            width: slider.width,
            height: slider.height
        };
        
        // Calculate thumb position
        slider.getThumbPosition = () => {
            const valueRange = slider.max - slider.min;
            const percentage = (slider.value - slider.min) / valueRange;
            return slider.x + (slider.width - 20) * percentage + 10;
        };
        
        // Hover state
        slider.hovered = false;
        
        // Hover handlers
        slider.onHoverEnter = () => {
            slider.hovered = true;
        };
        
        slider.onHoverExit = () => {
            slider.hovered = false;
        };
        
        // Drag handlers
        slider.onDragStart = (x, y) => {
            // Already handled by global handler
        };
        
        slider.onDrag = (dx, dy, x, y) => {
            if (!slider.enabled) return;
            
            // Update slider value based on drag position
            const valueRange = slider.max - slider.min;
            const trackWidth = slider.width - 20; // Adjust for thumb width
            const percentage = Math.max(0, Math.min(1, (x - slider.x - 10) / trackWidth));
            
            // Calculate value with step
            let newValue = slider.min + valueRange * percentage;
            
            // Apply step if specified
            if (slider.step > 0) {
                newValue = Math.round(newValue / slider.step) * slider.step;
            }
            
            // Ensure value is within range
            newValue = Math.max(slider.min, Math.min(slider.max, newValue));
            
            // Update value if changed
            if (newValue !== slider.value) {
                slider.value = newValue;
                
                // Call onChange handler if provided
                if (slider.onChange) {
                    slider.onChange(newValue);
                }
            }
        };
        
        slider.onDragEnd = (x, y) => {
            // Already handled by global handler
        };
        
        // Render method
        slider.render = (ctx) => {
            if (!slider.visible) return;
            
            // Save context state
            ctx.save();
            
            // Draw slider track
            ctx.fillStyle = slider.backgroundColor;
            this.drawRoundedRect(
                ctx, 
                slider.x, 
                slider.y + slider.height / 2 - 4, 
                slider.width, 
                8, 
                4
            );
            ctx.fill();
            
            // Draw filled part of track
            const thumbX = slider.getThumbPosition();
            ctx.fillStyle = slider.enabled ? slider.color : this.styles.disabled;
            this.drawRoundedRect(
                ctx, 
                slider.x, 
                slider.y + slider.height / 2 - 4, 
                thumbX - slider.x, 
                8, 
                4
            );
            ctx.fill();
            
            // Draw thumb
            ctx.beginPath();
            const thumbY = slider.y + slider.height / 2;
            const thumbRadius = 10;
            
            // Apply shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Add hover effect
            ctx.fillStyle = slider.enabled 
                ? (slider.hovered ? this.lightenColor(slider.color, 20) : slider.color)
                : this.styles.disabled;
                
            ctx.beginPath();
            ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw label and value
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = slider.textColor;
            ctx.font = `${this.styles.fontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            if (slider.labelText) {
                ctx.fillText(slider.labelText, slider.x, slider.y - 8);
            }
            
            if (slider.showValue) {
                ctx.textAlign = 'right';
                ctx.fillText(slider.value.toFixed(slider.step < 1 ? 2 : 0), slider.x + slider.width, slider.y - 8);
            }
            
            // Restore context state
            ctx.restore();
        };
        
        // Add to components
        this.components.set(slider.id, slider);
        
        return slider;
    }
    
    /**
     * Create a toggle switch component
     * @param {Object} options - Toggle options
     * @returns {Object} - The toggle component
     */
    createToggle(options) {
        const defaultOptions = {
            id: `toggle_${Date.now()}`,
            x: 0,
            y: 0,
            width: 50,
            height: 24,
            value: false,
            onChange: null,
            visible: true,
            enabled: true,
            color: this.styles.primary,
            backgroundColor: this.styles.background,
            textColor: this.styles.text,
            labelText: '',
            tooltip: null
        };
        
        const toggle = { ...defaultOptions, ...options };
        
        // Set bounds for hit detection
        toggle.bounds = {
            x: toggle.x,
            y: toggle.y,
            width: toggle.width,
            height: toggle.height
        };
        
        // Hover state
        toggle.hovered = false;
        
        // Hover handlers
        toggle.onHoverEnter = () => {
            toggle.hovered = true;
        };
        
        toggle.onHoverExit = () => {
            toggle.hovered = false;
        };
        
        // Click handler
        toggle.onClick = (x, y) => {
            if (!toggle.enabled) return;
            
            // Toggle value
            toggle.value = !toggle.value;
            
            // Call onChange handler if provided
            if (toggle.onChange) {
                toggle.onChange(toggle.value);
            }
        };
        
        // Render method
        toggle.render = (ctx) => {
            if (!toggle.visible) return;
            
            // Save context state
            ctx.save();
            
            // Draw toggle track
            ctx.fillStyle = toggle.value 
                ? (toggle.enabled ? toggle.color : this.styles.disabled)
                : toggle.backgroundColor;
                
            this.drawRoundedRect(
                ctx, 
                toggle.x, 
                toggle.y, 
                toggle.width, 
                toggle.height, 
                toggle.height / 2
            );
            ctx.fill();
            
            // Draw toggle thumb
            ctx.fillStyle = this.styles.text;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            const thumbRadius = toggle.height / 2 - 4;
            const thumbX = toggle.x + (toggle.value ? toggle.width - thumbRadius - 4 : thumbRadius + 4);
            const thumbY = toggle.y + toggle.height / 2;
            
            ctx.beginPath();
            ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw label
            if (toggle.labelText) {
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = toggle.textColor;
                ctx.font = `${this.styles.fontSize}px Arial`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(toggle.labelText, toggle.x + toggle.width + 10, toggle.y + toggle.height / 2);
            }
            
            // Restore context state
            ctx.restore();
        };
        
        // Add to components
        this.components.set(toggle.id, toggle);
        
        return toggle;
    }
    
    /**
     * Create a draggable object
     * @param {Object} options - Draggable options
     * @returns {Object} - The draggable component
     */
    createDraggable(options) {
        const defaultOptions = {
            id: `draggable_${Date.now()}`,
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            constrainToCanvas: true,
            onDragStart: null,
            onDrag: null,
            onDragEnd: null,
            visible: true,
            enabled: true,
            color: this.styles.accent,
            shape: 'rectangle',
            text: '',
            tooltip: null,
            draggable: true
        };
        
        const draggable = { ...defaultOptions, ...options };
        
        // Set bounds for hit detection
        draggable.bounds = {
            x: draggable.x,
            y: draggable.y,
            width: draggable.width,
            height: draggable.height
        };
        
        // Hover state
        draggable.hovered = false;
        
        // Hover handlers
        draggable.onHoverEnter = () => {
            draggable.hovered = true;
        };
        
        draggable.onHoverExit = () => {
            draggable.hovered = false;
        };
        
        // Original drag handlers
        const originalDragStart = draggable.onDragStart;
        const originalDrag = draggable.onDrag;
        const originalDragEnd = draggable.onDragEnd;
        
        // Drag handlers with position updates
        draggable.onDragStart = (x, y) => {
            draggable._dragOffsetX = x - draggable.x;
            draggable._dragOffsetY = y - draggable.y;
            
            if (originalDragStart) {
                originalDragStart(x, y);
            }
        };
        
        draggable.onDrag = (dx, dy, x, y) => {
            if (!draggable.enabled) return;
            
            // Update position accounting for the drag offset
            let newX = x - draggable._dragOffsetX;
            let newY = y - draggable._dragOffsetY;
            
            // Apply constraints if enabled
            if (draggable.constrainToCanvas && this.renderPipeline && this.renderPipeline.canvas) {
                const canvas = this.renderPipeline.canvas;
                newX = Math.max(0, Math.min(canvas.width - draggable.width, newX));
                newY = Math.max(0, Math.min(canvas.height - draggable.height, newY));
            }
            
            // Update position
            draggable.x = newX;
            draggable.y = newY;
            
            // Update bounds
            draggable.bounds.x = newX;
            draggable.bounds.y = newY;
            
            if (originalDrag) {
                originalDrag(dx, dy, x, y);
            }
        };
        
        draggable.onDragEnd = (x, y) => {
            if (originalDragEnd) {
                originalDragEnd(x, y);
            }
        };
        
        // Render method
        draggable.render = (ctx) => {
            if (!draggable.visible) return;
            
            // Save context state
            ctx.save();
            
            // Add hover effect
            ctx.fillStyle = draggable.enabled 
                ? (draggable.hovered ? this.lightenColor(draggable.color, 20) : draggable.color)
                : this.styles.disabled;
            
            // Draw shape
            if (draggable.shape === 'circle') {
                const centerX = draggable.x + draggable.width / 2;
                const centerY = draggable.y + draggable.height / 2;
                const radius = Math.min(draggable.width, draggable.height) / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Update radius for hit detection
                draggable.radius = radius;
            } else {
                // Rectangle
                ctx.fillRect(draggable.x, draggable.y, draggable.width, draggable.height);
            }
            
            // Draw text if provided
            if (draggable.text) {
                ctx.fillStyle = this.styles.text;
                ctx.font = `${this.styles.fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    draggable.text, 
                    draggable.x + draggable.width / 2, 
                    draggable.y + draggable.height / 2
                );
            }
            
            // Restore context state
            ctx.restore();
        };
        
        // Add to components
        this.components.set(draggable.id, draggable);
        
        return draggable;
    }
    
    /**
     * Create a panel container for UI components
     * @param {Object} options - Panel options
     * @returns {Object} - The panel component
     */
    createPanel(options) {
        const defaultOptions = {
            id: `panel_${Date.now()}`,
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            padding: 10,
            visible: true,
            color: this.styles.background,
            borderColor: null,
            cornerRadius: this.styles.borderRadius,
            shadow: true,
            children: []
        };
        
        const panel = { ...defaultOptions, ...options };
        
        // Set bounds for hit detection
        panel.bounds = {
            x: panel.x,
            y: panel.y,
            width: panel.width,
            height: panel.height
        };
        
        // Add child component to panel
        panel.addChild = (component) => {
            panel.children.push(component);
        };
        
        // Remove child component from panel
        panel.removeChild = (componentId) => {
            const index = panel.children.findIndex(c => c.id === componentId);
            if (index !== -1) {
                panel.children.splice(index, 1);
            }
        };
        
        // Render method
        panel.render = (ctx) => {
            if (!panel.visible) return;
            
            // Save context state
            ctx.save();
            
            // Apply shadow if enabled
            if (panel.shadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;
            }
            
            // Draw panel background
            ctx.fillStyle = panel.color;
            this.drawRoundedRect(
                ctx, 
                panel.x, 
                panel.y, 
                panel.width, 
                panel.height, 
                panel.cornerRadius
            );
            ctx.fill();
            
            // Draw border if specified
            if (panel.borderColor) {
                ctx.strokeStyle = panel.borderColor;
                ctx.lineWidth = 1;
                this.drawRoundedRect(
                    ctx, 
                    panel.x, 
                    panel.y, 
                    panel.width, 
                    panel.height, 
                    panel.cornerRadius
                );
                ctx.stroke();
            }
            
            // Reset shadow for children
            ctx.shadowColor = 'transparent';
            
            // Render children
            for (const child of panel.children) {
                if (child.render && child.visible) {
                    child.render(ctx);
                }
            }
            
            // Restore context state
            ctx.restore();
        };
        
        // Add to components
        this.components.set(panel.id, panel);
        
        return panel;
    }
    
    /**
     * Draw a tooltip
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    drawTooltip(ctx) {
        if (!this.tooltip.active || !this.tooltip.text) return;
        
        const padding = 8;
        const fontSize = this.styles.fontSize;
        
        // Measure text
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(this.tooltip.text).width;
        const width = textWidth + padding * 2;
        const height = fontSize + padding * 2;
        
        // Position tooltip
        let x = this.tooltip.x;
        let y = this.tooltip.y;
        
        // Ensure tooltip stays within canvas
        if (x + width > ctx.canvas.width) {
            x = ctx.canvas.width - width - 5;
        }
        
        if (y + height > ctx.canvas.height) {
            y = y - height - 15; // Show above cursor
        }
        
        // Draw tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.drawRoundedRect(ctx, x, y, width, height, 4);
        ctx.fill();
        
        // Draw tooltip text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.tooltip.text, x + padding, y + height / 2);
    }
    
    /**
     * Show a tooltip
     * @param {string} text - Tooltip text
     */
    showTooltip(text) {
        // Clear any existing timeout
        if (this.tooltip.timeout) {
            clearTimeout(this.tooltip.timeout);
        }
        
        // Set timeout to show tooltip after delay
        this.tooltip.timeout = setTimeout(() => {
            this.tooltip.active = true;
            this.tooltip.text = text;
        }, this.tooltip.delay);
    }
    
    /**
     * Hide the tooltip
     */
    hideTooltip() {
        // Clear timeout if exists
        if (this.tooltip.timeout) {
            clearTimeout(this.tooltip.timeout);
            this.tooltip.timeout = null;
        }
        
        this.tooltip.active = false;
    }
    
    /**
     * Create a simple animation
     * @param {Object} options - Animation options
     * @returns {Object} - The animation object
     */
    createAnimation(options) {
        const defaultOptions = {
            id: `animation_${Date.now()}`,
            duration: 1000, // ms
            easing: 'easeOutQuad',
            startValue: 0,
            endValue: 1,
            loop: false,
            autoPlay: false,
            onUpdate: null,
            onComplete: null
        };
        
        const animation = { ...defaultOptions, ...options };
        
        // Animation state
        animation.playing = false;
        animation.startTime = 0;
        animation.currentValue = animation.startValue;
        animation.progress = 0;
        
        // Animation methods
        animation.play = () => {
            animation.playing = true;
            animation.startTime = performance.now();
        };
        
        animation.pause = () => {
            animation.playing = false;
        };
        
        animation.stop = () => {
            animation.playing = false;
            animation.progress = 0;
            animation.currentValue = animation.startValue;
        };
        
        animation.reset = () => {
            animation.progress = 0;
            animation.currentValue = animation.startValue;
            animation.startTime = performance.now();
        };
        
        // Auto-play if specified
        if (animation.autoPlay) {
            animation.play();
        }
        
        // Add to animations
        this.animations.set(animation.id, animation);
        
        return animation;
    }
    
    /**
     * Update all animations
     * @param {number} timestamp - Current timestamp
     */
    updateAnimations(timestamp) {
        for (const animation of this.animations.values()) {
            if (!animation.playing) continue;
            
            // Calculate progress
            const elapsed = timestamp - animation.startTime;
            animation.progress = Math.min(1, elapsed / animation.duration);
            
            // Apply easing
            const easedProgress = this.applyEasing(animation.progress, animation.easing);
            
            // Calculate current value
            animation.currentValue = animation.startValue + (animation.endValue - animation.startValue) * easedProgress;
            
            // Call update handler
            if (animation.onUpdate) {
                animation.onUpdate(animation.currentValue, easedProgress);
            }
            
            // Handle completion
            if (animation.progress >= 1) {
                if (animation.loop) {
                    animation.reset();
                } else {
                    animation.playing = false;
                    
                    if (animation.onComplete) {
                        animation.onComplete();
                    }
                }
            }
        }
    }
    
    /**
     * Apply easing function to progress
     * @param {number} progress - Linear progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {number} - Eased progress
     */
    applyEasing(progress, easing) {
        switch (easing) {
            case 'linear':
                return progress;
            case 'easeInQuad':
                return progress * progress;
            case 'easeOutQuad':
                return progress * (2 - progress);
            case 'easeInOutQuad':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : -1 + (4 - 2 * progress) * progress;
            case 'easeInCubic':
                return progress * progress * progress;
            case 'easeOutCubic':
                return (--progress) * progress * progress + 1;
            case 'easeInOutCubic':
                return progress < 0.5 
                    ? 4 * progress * progress * progress 
                    : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            case 'easeInElastic':
                return progress === 0 ? 0 : progress === 1 ? 1 : 
                    -Math.pow(2, 10 * (progress - 1)) * 
                    Math.sin((progress - 1.1) * 5 * Math.PI);
            case 'easeOutElastic':
                return progress === 0 ? 0 : progress === 1 ? 1 : 
                    Math.pow(2, -10 * progress) * 
                    Math.sin((progress - 0.1) * 5 * Math.PI) + 1;
            default:
                return progress;
        }
    }
    
    /**
     * Draw a rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        radius = Math.min(radius, Math.min(width, height) / 2);
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
    
    /**
     * Lighten a color by a percentage
     * @param {string} color - CSS color
     * @param {number} percent - Percentage to lighten (0-100)
     * @returns {string} - Lightened color
     */
    lightenColor(color, percent) {
        // Convert to RGB
        let r, g, b;
        
        if (color.startsWith('#')) {
            // Hex color
            const hex = color.slice(1);
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            // RGB color
            const rgbMatch = color.match(/\d+/g);
            if (rgbMatch) {
                [r, g, b] = rgbMatch.map(Number);
            } else {
                return color;
            }
        } else {
            return color;
        }
        
        // Lighten
        r = Math.min(255, r + (255 - r) * (percent / 100));
        g = Math.min(255, g + (255 - g) * (percent / 100));
        b = Math.min(255, b + (255 - b) * (percent / 100));
        
        // Convert back to hex
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    
    /**
     * Render all components
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {number} timestamp - Current timestamp
     */
    render(ctx, timestamp) {
        // Update animations
        this.updateAnimations(timestamp);
        
        // Render all components
        for (const component of this.components.values()) {
            if (component.render && component.visible) {
                component.render(ctx);
            }
        }
        
        // Draw tooltip if active
        this.drawTooltip(ctx);
    }
    
    /**
     * Remove a component
     * @param {string} id - Component ID
     */
    removeComponent(id) {
        this.components.delete(id);
    }
    
    /**
     * Remove all components
     */
    clearComponents() {
        this.components.clear();
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Remove event handlers
        this.eventManager.on('mouse', 'move', this.handleGlobalMouseMove);
        this.eventManager.on('mouse', 'down', this.handleGlobalMouseDown);
        this.eventManager.on('mouse', 'up', this.handleGlobalMouseUp);
        this.eventManager.on('touch', 'start', this.handleGlobalTouchStart);
        this.eventManager.on('touch', 'move', this.handleGlobalTouchMove);
        this.eventManager.on('touch', 'end', this.handleGlobalTouchEnd);
        
        // Clear animations and components
        this.animations.clear();
        this.components.clear();
    }
}

export default InteractiveUtils;