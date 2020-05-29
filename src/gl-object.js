import { mat4, vec4 } from 'gl-matrix';

export default class GLObject {
    constructor(gl, scene) {
        if (this.draw === undefined) {
            throw new TypeError('Must override draw()-method.');
        }
        this.gl = gl;
        this.scene = scene;
        this.modelMatrix = mat4.create();   // converts model space to world space
        mat4.identity(this.modelMatrix);
    }

    inWorldSpace(x) {
        // TODO: return x in world space coodinates
        return vec4.mul()
    }

    getModelMatrix() {
        return this.modelMatrix;
    }

    applyTransformation(matrix) {
        mat4.mul(this.modelMatrix, matrix, this.modelMatrix);
    }

    setTransformation(matrix) {
        this.modelMatrix = matrix;
    }
}