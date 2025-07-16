// Scene 4: Conscious Touch Interaction

export default class Scene4 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

      this.angle = 45; // in degrees
      this.isAnimating = false;
      this.lastTime = 0;
        
      this.handleMouseClick = this.handleMouseClick.bind(this);
    }

    init() {
      this.canvas.addEventListener('click', this.handleMouseClick);
      this.updateSettings(this.settings);
        return Promise.resolve();
    }

  handleMouseClick() {
    this.isAnimating = !this.isAnimating;
  }

  animate(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.isAnimating) {
      // Animate angle up to the "explosion" point
      this.angle = (this.angle + (deltaTime / 50) * this.settings.speed);
      this.angle %= 90; // Keep the angle within 0-90 degrees
    } else {
      // Lerp towards angle set by intensity
      const targetAngle = this.settings.intensity * 0.899; // map 0-100 to 0-89.9
      const easing = 1 - Math.exp(-0.005 * deltaTime);
      this.angle += (targetAngle - this.angle) * easing;
    }

    this.draw();
    }

  draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const rad = this.angle * Math.PI / 180;
        
    const centerX = this.canvas.width * 0.25;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(this.canvas.height * 0.4, 150);

    // Draw unit circle and angle lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    const x = centerX + radius * Math.cos(rad);
    const y = centerY - radius * Math.sin(rad);

    // Radius line
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // Sine line (vertical)
    this.ctx.strokeStyle = '#00d4ff';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, centerY);
    this.ctx.stroke();
        
    // Cosine line (horizontal)
    this.ctx.strokeStyle = '#7c3aed';
        this.ctx.beginPath();
    this.ctx.moveTo(x, centerY);
    this.ctx.lineTo(centerX, centerY);
    this.ctx.stroke();

    // Tangent line at boundary
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 3;
    const tan_y = centerY - radius * Math.tan(rad);
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + radius, centerY);
    this.ctx.lineTo(centerX + radius, tan_y);
    this.ctx.stroke();

    if (!this.settings.videoMode) {
      this.drawInfo(rad);
        }
    }

  drawInfo(rad) {
    const sine = Math.sin(rad);
    const cosine = Math.cos(rad);
    const tangent = Math.tan(rad);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 240, 10, 230, 120);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Conscious Touch Interaction', this.canvas.width - 230, 35);

        this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, this.canvas.width - 230, 60);

    this.ctx.fillStyle = '#00d4ff';
    this.ctx.fillText(`Sine: ${sine.toFixed(3)}`, this.canvas.width - 230, 80);
        
    this.ctx.fillStyle = '#7c3aed';
    this.ctx.fillText(`Cosine: ${cosine.toFixed(3)}`, this.canvas.width - 230, 100);
        
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillText(`Tangent: ${tangent.toFixed(3)}`, this.canvas.width - 230, 120);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
      // Intensity is used directly in animate() loop for target angle
    }

    cleanup() {
      this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}