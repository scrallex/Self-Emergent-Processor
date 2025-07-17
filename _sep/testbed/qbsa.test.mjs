import assert from 'assert';
import Scene9 from '../../assets/js/demos/scenes/scene9.js';

function createScene(grid) {
  const canvas = { width: 100, height: 100, addEventListener() {} };
  const ctx = {};
  const scene = new Scene9(canvas, ctx, {});
  scene.stateSize = grid.length;
  scene.cellSize = 1;
  scene.gridCenter = { x: 0, y: 0 };
  scene.stateGrid = grid.map(row => row.map(cell => ({
    x: 0,
    y: 0,
    state: cell.state,
    energy: cell.energy,
    phase: cell.phase,
    rupture: false
  })));
  return scene;
}

function testRupture() {
  const grid = [
    [{ state: 0, energy: 1, phase: 0 }, { state: 1, energy: 1, phase: Math.PI }],
    [{ state: 1, energy: 1, phase: Math.PI }, { state: 0, energy: 1, phase: 0 }]
  ];
  const scene = createScene(grid);
  scene.runQBSA();
  assert(scene.ruptures.length > 0, 'Expected ruptures for opposing states');
}

function testNoRuptureLowEnergy() {
  const grid = [
    [{ state: 0, energy: 0.2, phase: 0 }, { state: 1, energy: 0.2, phase: Math.PI }]
  ];
  const scene = createScene(grid);
  scene.runQBSA();
  assert.strictEqual(scene.ruptures.length, 0, 'Low energy should not trigger rupture');
}

function run() {
  testRupture();
  testNoRuptureLowEnergy();
  console.log('QBSA tests passed');
}

run();
