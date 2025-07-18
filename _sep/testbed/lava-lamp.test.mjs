import LavaLamp from './lava-lamp.js';

const canvas = {
  width: 200,
  height: 200,
  addEventListener() {},
  removeEventListener() {}
};

const ctx = {
  clearRect() {},
  createRadialGradient() {
    return { addColorStop() {} };
  },
  beginPath() {},
  arc() {},
  fill() {},
  set globalCompositeOperation(val) {}
};

const lamp = new LavaLamp(canvas, ctx, { blobCount: 3 });
await lamp.init();
lamp.animate(0);
lamp.animate(16);
lamp.cleanup();
console.log('lava lamp basic test passed');
