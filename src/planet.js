import GLObject from './gl-object'
import perlin from './perlin-noise'
import './vector-arithmetic'

// class Triangle {
//     constructor(x, y, z) {
//         this.x = x;
//         this.y = y;
//         this.z = z;

//         this.isLeaf = true;
//         this.children = null;
//     }

//     subdivide() {
//         this.isLeaf = false;
//         this.children = [];

//         // get corners
//         const indexA = triangle[0];
//         const indexB = triangle[1];
//         const indexC = triangle[2];
//         const a = this.vertices[indexA];
//         const b = this.vertices[indexB];
//         const c = this.vertices[indexC];

//         const threshold = distance(a, b) / 4;
//         const vertices = this.vertices, adj = this.adj;
//         function getIndex(x) {
//             let index = vertices.findIndex(y => {
//                 return distance(x, y) < threshold;
//             });
//             if (index == -1) {
//                 index = vertices.length;
//                 vertices.push(x);
//                 adj.push(new Set());
//             }
//             return index;
//         }

//         // get midpoints
//         let ab = midpoint(a, b);
//         let bc = midpoint(b, c);
//         let ac = midpoint(c, a);

//         // scale points to radius 1
//         ab = normalize(ab);
//         bc = normalize(bc);
//         ac = normalize(ac);

//         // // scale to 1 + noise
//         // ab = scale(ab, 1 + 0.1 * perlin.noise3D(ab[0], ab[1], ab[2]));
//         // bc = scale(bc, 1 + 0.1 * perlin.noise3D(bc[0], bc[1], bc[2]));
//         // ac = scale(ac, 1 + 0.1 * perlin.noise3D(ac[0], ac[1], ac[2]));

//         // get indices and add to vertex-list if necessary
//         let indexAb = getIndex(ab);
//         let indexBc = getIndex(bc);
//         let indexAc = getIndex(ac);

//         // remove neighbors from graph representation
//         this.adj[indexA].delete(indexB);
//         this.adj[indexA].delete(indexC);
//         this.adj[indexB].delete(indexA);
//         this.adj[indexB].delete(indexC);
//         this.adj[indexC].delete(indexA);
//         this.adj[indexC].delete(indexB);

//         // add new faces to faces-list, add appropriate neighbors
//         const faceA = [indexA, indexAb, indexAc];
//         const faceB = [indexB, indexBc, indexAb];
//         const faceC = [indexC, indexAc, indexBc];
//         const faceMiddle = [indexAb, indexBc, indexAc];

//         this.addTriangle(faceA);
//         this.addTriangle(faceB);
//         this.addTriangle(faceC);
//         this.addTriangle(faceMiddle);

//         // apply recursion
//         this.subdivide(faceA, detail - 1);
//         this.subdivide(faceB, detail - 1);
//         this.subdivide(faceC, detail - 1);
//         this.subdivide(faceMiddle, detail - 1);
//     }

//     getTriangleList() {
//         if (this.isLeaf) return [x, y, z];
//         else {
//             return this.children.map(child => child.getTriangleList()).flat();
//         }
//     }
// }

export default class Planet extends GLObject {
    constructor(gl, scene, detail) {
        super(gl, scene);

        this.fillColor = [1.0, 1.0, 1.0, 1.0];
        this.strokeColor = [0.0, 0.0, 0.0, 1.0];

        this.initGeometry(detail);
        this.initBuffers();
    }

    initGeometry(detail) {
        this.vertices = [
            [0, -0.525731, 0.850651],
            [0.850651, 0, 0.525731],
            [0.850651, 0, -0.525731],
            [-0.850651, 0, -0.525731],
            [-0.850651, 0, 0.525731],
            [-0.525731, 0.850651, 0],
            [0.525731, 0.850651, 0],
            [0.525731, -0.850651, 0],
            [-0.525731, -0.850651, 0],
            [0, -0.525731, -0.850651],
            [0, 0.525731, -0.850651],
            [0, 0.525731, 0.850651],
        ];
        
        this.faces = [
            [1, 2, 6],
            [1, 7, 2],
            [3, 4, 5],
            [4, 3, 8],
            [6, 5, 11],
            [5, 6, 10],
            [9, 10, 2],
            [10, 9, 3],
            [7, 8, 9],
            [8, 7, 0],
            [11, 0, 1],
            [0, 11, 4],
            [6, 2, 10],
            [1, 6, 11],
            [3, 5, 10],
            [5, 4, 11],
            [2, 7, 9],
            [7, 1, 0],
            [3, 9, 8],
            [4, 8, 0],
        ]

        this.adj = this.vertices.map(x => new Set());
        for (let face of this.faces) {
            let x = face[0], y = face[1], z = face[2];
            this.adj[x].add(y);
            this.adj[x].add(z);
            this.adj[y].add(x);
            this.adj[y].add(z);
            this.adj[z].add(x);
            this.adj[z].add(y);
        }

        const faces = this.faces.slice();
        for (let triangle of faces) {
            this.subdivide(triangle, 0, detail);
        }

        this.nVertices = this.vertices.length;
        this.nFaces = this.faces.length;

        this.initHeights();

        this.initNormals();
        
    }

    subdivide(triangle, detail, maxDetail) {
        if (detail >= maxDetail) return;
        // remove current triangle
        this.faces.splice(this.faces.indexOf(triangle), 1);
        
        // get corners
        const indexA = triangle[0];
        const indexB = triangle[1];
        const indexC = triangle[2];
        const a = this.vertices[indexA];
        const b = this.vertices[indexB];
        const c = this.vertices[indexC];

        const center = scale(add(a, add(b, c)), 1/3);
        const dist = distance(center, this.scene.cameraPosition())
        if (dist > 40 && detail == 0) return;
        
        const threshold = distance(a, b) / 4;
        const vertices = this.vertices, adj = this.adj;
        function getIndex(x) {
            let index = vertices.findIndex(y => {
                return distance(x, y) < threshold;
            });
            if (index == -1) {
                index = vertices.length;
                vertices.push(x);
                adj.push(new Set());
            }
            return index;
        }

        // get midpoints
        let ab = midpoint(a, b);
        let bc = midpoint(b, c);
        let ac = midpoint(c, a);

        // scale points to radius 1
        ab = normalize(ab);
        bc = normalize(bc);
        ac = normalize(ac);

        // // scale to 1 + noise
        // ab = scale(ab, 1 + 0.1 * perlin.noise3D(ab[0], ab[1], ab[2]));
        // bc = scale(bc, 1 + 0.1 * perlin.noise3D(bc[0], bc[1], bc[2]));
        // ac = scale(ac, 1 + 0.1 * perlin.noise3D(ac[0], ac[1], ac[2]));

        // get indices and add to vertex-list if necessary
        let indexAb = getIndex(ab);
        let indexBc = getIndex(bc);
        let indexAc = getIndex(ac);

        // remove neighbors from graph representation
        this.adj[indexA].delete(indexB);
        this.adj[indexA].delete(indexC);
        this.adj[indexB].delete(indexA);
        this.adj[indexB].delete(indexC);
        this.adj[indexC].delete(indexA);
        this.adj[indexC].delete(indexB);

        // add new faces to faces-list, add appropriate neighbors
        const faceA = [indexA, indexAb, indexAc];
        const faceB = [indexB, indexBc, indexAb];
        const faceC = [indexC, indexAc, indexBc];
        const faceMiddle = [indexAb, indexBc, indexAc];

        this.addTriangle(faceA);
        this.addTriangle(faceB);
        this.addTriangle(faceC);
        this.addTriangle(faceMiddle);

        // apply recursion
        this.subdivide(faceA, detail + 1, maxDetail);
        this.subdivide(faceB, detail + 1, maxDetail);
        this.subdivide(faceC, detail + 1, maxDetail);
        this.subdivide(faceMiddle, detail + 1, maxDetail);
    }

    addTriangle(triangle) {
        this.faces.push(triangle);
        let x = triangle[0], y = triangle[1], z = triangle[2];
        this.adj[x].add(y);
        this.adj[x].add(z);
        this.adj[y].add(x);
        this.adj[y].add(z);
        this.adj[z].add(x);
        this.adj[z].add(y);
    }

    initHeights() {
        this.heights = this.vertices.map(x => {
            return 1 + 0.1 * perlin.noise3D(x[0], x[1], x[2]);
        });

    }

    initNormals() {
        this.normals = [];

        for (let i = 0; i < this.vertices.length; i++) {
            let x = scale(this.vertices[i], this.heights[i]);
            let normal = [0, 0, 0];

            // identify faces around x
            let faces = [];
            let neighbors = Array.from(this.adj[i].values());
            for (let j = 0; j < neighbors.length; j++) {
                const n = neighbors[j];
                for (let k = j + 1; k < neighbors.length; k++) {
                    const m = neighbors[k];
                    if (this.adj[n].has(m)) {
                        const y = scale(this.vertices[n], this.heights[n]);
                        const z = scale(this.vertices[m], this.heights[m]);
                        faces.push([sub(y, x), sub(z, x)]);
                    }
                }
            }
            
            // compute normals for each face, sum all and normalize
            for (let face of faces) {
                let n = cross(face[0], face[1]);
                // if the vector points the wrong way, flip it
                if (mag(add(x, n)) < mag(sub(x, n))) n = scale(n, -1);
                normal = add(normal, normalize(n));
            }
            normal = normalize(normal);

            this.normals.push(normalize(normal));
        }
    }

    createAndFillBuffer(bufferType, data) {
        const gl = this.gl, buffer = gl.createBuffer();
        gl.bindBuffer(bufferType, buffer);
        gl.bufferData(bufferType, data, gl.STATIC_DRAW);
        return buffer;
    }

    initBuffers() {
        this.buffers = {};
        this.initTrianglesBuffers();
        this.initWireframeBuffers();
    }

    initTrianglesBuffers() {
        const gl = this.gl;

        const positions = this.vertices.flat();
        const normals = this.normals.flat();
        const indices = this.faces.flat();
        const colors = this.faces.map(face => this.fillColor).flat();

        const positionBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(positions));
        const normalBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(normals));
        const heightBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(this.heights));
        const colorBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(colors));
        const indexBuffer = this.createAndFillBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

        this.buffers.triangles = {
            position: positionBuffer,
            normal: normalBuffer,
            height: heightBuffer,
            color: colorBuffer,
            indices: indexBuffer
        };
    }

    initWireframeBuffers() {
        const gl = this.gl;

        const positions = this.vertices.flat();
        const normals = this.normals.flat();
        const indices = this.faces.map(face => {
            return [face[0], face[1], face[1], face[2], face[2], face[0]];
        }).flat();
        const colors = this.faces.map(face => {
            return [...this.strokeColor, ...this.strokeColor, ...this.strokeColor];
        }).flat();

        const positionBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(positions));
        const normalBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(normals));
        const colorBuffer = this.createAndFillBuffer(gl.ARRAY_BUFFER, new Float32Array(colors));
        const indexBuffer = this.createAndFillBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

        this.buffers.wireframe = {
            position: positionBuffer,
            normal: normalBuffer,
            color: colorBuffer,
            indices: indexBuffer
        };
    }

    bindBuffers(attribLocations, buffers) {
        const gl = this.gl;

        // add position data
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocations.vertexPosition);

        // add normal data
        if (buffers.normal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
            gl.vertexAttribPointer(attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attribLocations.vertexNormal);
        }

        // console.log(this.vertices.length, this.heights.length);
        if (buffers.height) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.height)
            gl.vertexAttribPointer(attribLocations.vertexHeight, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attribLocations.vertexHeight);
        }

        // add color data
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocations.vertexColor);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }

    draw(attribLocations) {
        const gl = this.gl;

        
        // draw triangles
        this.bindBuffers(attribLocations, this.buffers.triangles);
        let vertexCount = this.nFaces * 3;
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

        this.bindBuffers(attribLocations, this.buffers.wireframe);
        vertexCount = this.nFaces * 6;
        // gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.black);
        // gl.vertexAttribPointer(
        //     attribLocations.vertexColor,
        //     4,              // numComponents
        //     gl.FLOAT,       // type
        //     false,          // normalize
        //     0,              // stride
        //     0               // offset
        // );
        // gl.enableVertexAttribArray(attribLocations.vertexColor);
        // gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}