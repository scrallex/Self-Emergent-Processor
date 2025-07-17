import Scene6 from '../../assets/js/demos/scenes/scene6.js';

// minimal canvas and ctx mocks
const canvas = {
  width: 600,
  height: 400,
  addEventListener() {},
  removeEventListener() {},
  getBoundingClientRect() { return { left: 0, top: 0 }; }
};
const ctx = { fillStyle:'', fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fill(){}, arc(){}, closePath(){}, strokeRect(){}, fillText(){}, textAlign:'', font:'', setLineDash() {} };

global.window = { addEventListener() {}, removeEventListener() {} };

const scene = new Scene6(canvas, ctx, { speed: 1, intensity: 50 });
await scene.init();
scene.handleMouseMove({ clientX: 100, clientY: 160 });
scene.handleMouseClick({ clientX: 100, clientY: 160 });
scene.handleMouseMove({ clientX: 200, clientY: 160 });

if (scene.baseSize <= 30) throw new Error('size slider did not increase block size');
console.log('scene6 block size slider test passed');
