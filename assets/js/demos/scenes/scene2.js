// Scene 2: Coherence Wave Patterns

export default class Scene2 {
    constructor(canvas, ctx, settings) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.settings = settings;

      this.angle = 45;
      this.targetAngle = 45;
      this.isAnimating = false;
      this.lastTimestamp = 0;

      // Bindings
        this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseClick = this.handleMouseClick.bind(this);
    }

  init() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleMouseClick);
    this.updateSettings(this.settings);
        return Promise.resolve();
    }

  handleMouseMove(e) {
    if (this.isAnimating) return;
        const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.canvas.width / 2;
      const y = e.clientY - rect.top - this.canvas.height / 2;
      let rad = Math.atan2(y, x);
      if (rad < 0) rad += 2 * Math.PI;
      this.targetAngle = Math.min(180, rad * 180 / Math.PI);
    }

  handleMouseClick() {
    this.isAnimating = !this.isAnimating;
    }

  animate(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (this.isAnimating) {
      this.angle = (this.angle + (deltaTime / 20) * this.settings.speed) % 180;
      this.targetAngle = this.angle;
    } else {
      // Frame-rate independent easing
      const easing = 1 - Math.exp(-0.005 * deltaTime);
      this.angle += (this.targetAngle - this.angle) * easing;
    }

    this.draw();
    }

  draw() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;

    // Draw coordinate system
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(this.canvas.width, centerY);
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, this.canvas.height);
    this.ctx.stroke();

    // Draw angle
    const angleRad = this.angle * Math.PI / 180;
    let color, type;
    if (Math.abs(this.angle - 90) < 0.5) {
      color = '#ffaa00'; // Right
      type = 'Right';
    } else if (this.angle < 90) {
      color = '#00d4ff'; // Acute
      type = 'Acute';
    } else {
      color = '#7c3aed'; // Obtuse
      type = 'Obtuse';
    }

    // Arc
        this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius / 2, 0, angleRad, false);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
        this.ctx.stroke();

    // Lines
        this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX + radius * Math.cos(angleRad), centerY + radius * Math.sin(angleRad));
        this.ctx.stroke();
        
    if (!this.settings.videoMode) {
      this.drawInfo(type, angleRad);
    }
    }
    
  drawInfo(type, angleRad) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 250, 100);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Coherence Wave Patterns', 20, 35);

    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText(`Angle: ${this.angle.toFixed(1)}°`, 20, 60);
    this.ctx.fillText(`Type: ${type}`, 20, 80);
    this.ctx.fillText(`Cosine: ${Math.cos(angleRad).toFixed(3)}`, 20, 100);
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
      if (!this.isAnimating) {
        this.targetAngle = this.settings.intensity * 1.8; // 0-100 -> 0-180
      }
    }

  cleanup() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleMouseClick);
    }
}