
import Simplex from 'simplex-noise'

const simplex = new Simplex('seed');

export default {
    octaves: 5,
    persistence: 0.5,
    noise3D(x, y, z) {
        let freq = 1;
        let amp = 1;
        let maxValue = 0;
        let total = 0;
        for (let i = 0; i < this.octaves; i++) {
            total += amp * simplex.noise3D(freq * x, freq * y, freq * z);
            maxValue += amp;

            freq *= 2;
            amp *= this.persistence;
        }

        return total / maxValue;
    }
}