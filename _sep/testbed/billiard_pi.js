function simulatePi(digits) {
  const m1 = 1; // small mass
  const m2 = Math.pow(100, digits); // large mass
  let x1 = 1;  // small mass position
  let x2 = 3;  // large mass position to the right
  let v1 = 0;  // small at rest
  let v2 = -1; // large moving left
  let count = 0;

  while (true) {
    // Time until small block hits wall
    const tWall = v1 < 0 ? -x1 / v1 : Infinity;

    // Time until blocks collide
    const tBlock = v1 > v2 ? (x2 - x1) / (v1 - v2) : Infinity;

    if (tWall === Infinity && tBlock === Infinity) break;
    const t = Math.min(tWall, tBlock);

    x1 += v1 * t;
    x2 += v2 * t;

    if (t === tWall) {
      v1 = -v1;
      count++;
    } else {
      const newV1 = ( (m1 - m2)*v1 + 2*m2*v2 ) / (m1 + m2);
      const newV2 = ( (m2 - m1)*v2 + 2*m1*v1 ) / (m1 + m2);
      v1 = newV1;
      v2 = newV2;
      count++;
    }

    if (v1 > v2 && x1 < x2) continue; // still colliding scenario
    if (v2 > v1 && x2 > x1) break;
  }

  return count;
}

if (require.main === module) {
  const n = parseInt(process.argv[2] || '1');
  console.log(simulatePi(n));
}
module.exports = simulatePi;
