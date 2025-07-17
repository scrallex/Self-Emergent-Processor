import Scene10 from './scene10_fluid.js';

const canvas = {
  width: 100,
  height: 100,
  addEventListener() {},
  removeEventListener() {}
};
const ctx = {
  fillStyle: '',
  fillRect() {},
  beginPath() {},
  arc() {},
  fill() {}
};

const scene = new Scene10(canvas, ctx, { speed: 1 });
await scene.init();
scene.animate(0);
scene.animate(16);
scene.cleanup();
console.log('scene10 fluid basic test passed');
