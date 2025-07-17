export default function sepPathLearningSurface(baseSurface, iterations=5) {
    const res = baseSurface.length;
    const surface = baseSurface.map(row => row.slice());
    for (let it = 0; it < iterations; it++) {
        const copy = surface.map(row => row.slice());
        for (let i = 0; i < res; i++) {
            for (let j = 0; j < res; j++) {
                const current = copy[i][j];
                const left = copy[i > 0 ? i - 1 : i][j];
                const right = copy[i < res - 1 ? i + 1 : i][j];
                const up = copy[i][j > 0 ? j - 1 : j];
                const down = copy[i][j < res - 1 ? j + 1 : j];
                surface[i][j] = 0.6 * current + 0.1 * (left + right + up + down) / 4;
            }
        }
    }
    return surface;
}
