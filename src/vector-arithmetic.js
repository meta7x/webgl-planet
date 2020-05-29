window.midpoint = function midpoint(x, y) {
    return [(x[0] + y[0]) / 2, (x[1] + y[1]) / 2, (x[2] + y[2]) / 2];
}

window.distance = function distance(x, y) {
    const d0 = x[0] - y[0], d1 = x[1] - y[1], d2 = x[2] - y[2];
    return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2);
}

window.mag = function mag(x) {
    return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
}

window.normalize = function normalize(x) {
    const magInv = 1 / mag(x);
    return [x[0] * magInv, x[1] * magInv, x[2] * magInv];
}

window.scale = function scale(x, a) {
    return [a * x[0], a * x[1], a * x[2]];
}

window.add = function add(x, y) {
    return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
}

window.sub = function sub(x, y) {
    return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
}

window.dot = function dot(x, y) {
    return x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
}

window.cross = function cross(x, y) {
    return [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
}