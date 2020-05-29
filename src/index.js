import * as glm from 'gl-matrix';
const mat4 = glm.mat4;

import vsSource from './shaders/vertex.glsl';
import fsSource from './shaders/fragment.glsl';

import initShaderProgram from './initShaderProgram.js'
import Camera from './camera';
import Scene from './scene';
import Cube from './cube';
import Wavefront from './wavefront';
import Planet from './planet';



(async function() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (gl == null) {
        alert('No WebGL available on this system.');
        return;
    }

    const scene = new Scene(gl);
    const camera = new Camera(gl, 0, 0, -6);
    
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            vertexHeight: gl.getAttribLocation(shaderProgram, 'aVertexHeight'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            globalLightDirection: gl.getUniformLocation(shaderProgram, 'uGlobalLightDirection'),
        },
    }

    console.log(programInfo)
    
    scene.setCamera(camera);
    scene.setProgramInfo(programInfo);
    // scene.addObject(new Cube(gl));

    const cube = new Cube(gl);
    let transform = mat4.create();
    mat4.translate(transform, transform, [6, 0, 0]);
    mat4.rotateY(transform, transform, Math.PI/6);
    cube.applyTransformation(transform);
    // scene.addObject(cube);

    const planet = new Planet(gl, scene, 5);
    transform = mat4.create();
    mat4.translate(transform, transform, [0, 0, -30]);
    mat4.scale(transform, transform, [10, 10, 10]);
    scene.addObject(planet);
    let rotation = mat4.create();
    planet.update = dt => {
        const trans = mat4.create();
        // mat4.rotate(rotation, rotation, dt/8, [0.4, 1, 0]);
        mat4.mul(trans, transform, rotation);
        planet.setTransformation(trans);
    }

    console.log(planet.nVertices, planet.nFaces);

    let lastTime = 0;
    function render(time) {
        time *= 0.001;
        const dt = time - lastTime;
        lastTime = time;

        scene.draw();
        scene.update(dt);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

})()