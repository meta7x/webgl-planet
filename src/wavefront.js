import GLObject from './gl-object';

export default class Wavefront extends GLObject {
    constructor(gl) {
        super(gl);
        this.nVertices = 0;
        this.nFaces = 0;
        this.loaded = false;
    }

    async loadFromFile(path) {
        if (!path.endsWith('.obj')) throw new Error('Unsupported file: ' + path);
        const gl = this.gl;

        const response = await fetch(path);
        const data = await response.text();
        const lines = data.split('\n');

        const positions = [], textureCoords = [], normals = [];
        const indices = [];
        for (let next of lines) {
            
            if (next.startsWith('v ')) {
                const coords = next.split(/\s+/).slice(1).map(string => parseFloat(string));
                positions.push(...coords);
            }
            if (next.startsWith('vt ')) {
                const coords = next.split(/\s+/).slice(1).map(string => parseFloat(string));
                textureCoords.push(...coords);
            }
            if (next.startsWith('vn ')) {
                const coords = next.split(/\s+/).slice(1).map(string => parseFloat(string));
                normals.push(...coords);
            }
            if (next.startsWith('f ')) {
                const ind = next.split(/\s+/).slice(1, 4).map(string => parseInt(string) - 1);
                indices.push(...ind);
            }
        }

        const colors = [];
        for (let i = 0; i < positions.length; i += 3) {
            colors.push(1.0, 1.0, 1.0, 1.0);
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

        this.nVertices = positions.length / 3;
        this.nFaces = indices.length / 3;

        this.buffers = {
            positions: positionBuffer,
            colors: colorBuffer,
            indices: indexBuffer
        }
        this.loaded = true;
    }

    draw(attribLocations) {
        const gl = this.gl;

        // add position data
        {
            const numComponents = 3;  // pull out 3 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
            gl.vertexAttribPointer(
                attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(attribLocations.vertexPosition);
        }

        // add color data
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
            gl.vertexAttribPointer(
                attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(attribLocations.vertexColor);
        }

        // draw triangles
        {
            const vertexCount = 60;
            const offset = 0;
            const type = gl.UNSIGNED_SHORT;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }
}