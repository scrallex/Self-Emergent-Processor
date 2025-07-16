/**
 * Event Emitter
 * Simple implementation of the publish-subscribe pattern
 */

class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        
        this.events.get(event).add(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    /**
     * Subscribe to an event for a single execution
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     * @returns {Function} - Unsubscribe function
     */
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        
        return this.on(event, onceWrapper);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     */
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        if (callback) {
            this.events.get(event).delete(callback);
            
            // Clean up if no listeners remain
            if (this.events.get(event).size === 0) {
                this.events.delete(event);
            }
        } else {
            // Remove all listeners for this event
            this.events.delete(event);
        }
    }
    
    /**
     * Emit an event
     * @param {string} event - The event name
     * @param {...any} args - Arguments to pass to the callbacks
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return;
        
        for (const callback of this.events.get(event)) {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        }
    }
    
    /**
     * Check if an event has listeners
     * @param {string} event - The event name
     * @returns {boolean} - Whether the event has listeners
     */
    hasListeners(event) {
        return this.events.has(event) && this.events.get(event).size > 0;
    }
    
    /**
     * Get the number of listeners for an event
     * @param {string} event - The event name
     * @returns {number} - The number of listeners
     */
    listenerCount(event) {
        if (!this.events.has(event)) return 0;
        return this.events.get(event).size;
    }
    
    /**
     * Clear all event listeners
     */
    clear() {
        this.events.clear();
    }
}

export default EventEmitter;