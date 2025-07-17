import { SCENES, STATUS } from "../../assets/js/demos/config/scene-registry.js";
const scene = SCENES[2];
if (scene.status === STATUS.READY) {
  console.log('Scene 2 is ready');
} else {
  console.error('Scene 2 not ready:', scene.status);
  process.exit(1);
}
