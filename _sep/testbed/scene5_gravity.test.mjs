import Scene5 from '../../assets/js/demos/scenes/scene5.js';

const canvas = {
  width: 100,
  height: 100,
  addEventListener() {},
  removeEventListener() {}
};

function createCtx() {
  const noop = () => {};
  const gradient = { addColorStop: noop };
  return new Proxy({
    createRadialGradient: () => gradient
  }, {
    get(target, prop) {
      if (!(prop in target)) {
        target[prop] = noop;
      }
      return target[prop];
    }
  });
}

const ctx = createCtx();
const scene = new Scene5(canvas, ctx, { speed: 1, intensity: 50 }, null, null, null, null, null);
scene.controller = { updateInfoPanel() {}, render() {} };
scene.reset();
scene.animate(0);
console.log('scene5 gravity basic test passed');
