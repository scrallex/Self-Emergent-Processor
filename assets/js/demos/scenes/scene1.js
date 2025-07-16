/**
 * Scene 1: SEP Introduction - Wave Interference
 *
 * This scene demonstrates basic wave interference patterns, adapting the logic
 * from the original monolithic demo file into the new modular framework.
 * It uses the framework's generic 'speed' and 'intensity' controls.
 */
export default class Scene1 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
      this.settings = settings; // Live settings object from the framework

      // Scene-specific state
        this.time = 0;
      this.frequency = 3; // This was a slider in the old demo, now hardcoded for simplicity.
      // A more advanced implementation could have scenes add their own controls to the panel.
    }

  /**
   * The main animation loop called by the framework.
   * @param {number} timestamp - The current timestamp from requestAnimationFrame.
   */
    animate(timestamp) {
      const { ctx, canvas, settings } = this;

      // Use generic settings from the framework's control panel
      const amplitude = settings.intensity || 50;
      const speed = settings.speed || 1.0;

      // Clear canvas with a dark background
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw a subtle grid for reference
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw three individual waves with slight phase offsets
      for (let wave = 0; wave < 3; wave++) {
        ctx.strokeStyle = `hsl(${240 + wave * 30}, 70%, 60%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + amplitude * Math.sin((x + this.time * 2) * this.frequency * 0.01 + wave * Math.PI / 3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw the resulting interference pattern (sum of the waves)
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 4; // Make it stand out
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        let ySum = canvas.height / 2;
        for (let wave = 0; wave < 3; wave++) {
          ySum += (amplitude / 3) * Math.sin((x + this.time * 2) * this.frequency * 0.01 + wave * Math.PI / 3);
        }
          if (x === 0) ctx.moveTo(x, ySum);
          else ctx.lineTo(x, ySum);
        }
      ctx.stroke();

      // Increment time based on the framework's speed control
      this.time += speed;
    }
}