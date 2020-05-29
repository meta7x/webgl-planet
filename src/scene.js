import { mat4, vec3 } from 'gl-matrix';

function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width != displayWidth ||
        canvas.height != displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

export default class Scene {
    constructor(gl) {
        this.gl = gl;
        this.objects = [];
    }

    setProgramInfo(programInfo) {
        this.programInfo = programInfo;
    }

    setCamera(camera) {
        this.camera = camera;
    }

    cameraPosition() {
        return this.camera.getPosition();
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index >= 0) this.objects.splice(index, 1);
    }

    getViewMatrix() {
        return this.camera.getViewMatrix();
    }

    draw() {
        const gl = this.gl;
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.1, 0.15, 0.2, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(this.programInfo.program);

        gl.uniform3f(
            this.programInfo.uniformLocations.globalLightDirection,
            -1.0, 1.0, 0.5
        );

        const projectionMatrix = mat4.create();
        mat4.perspective(
            projectionMatrix,
            Math.PI / 4,                                    // FOV
            gl.canvas.clientWidth / gl.canvas.clientHeight, // aspect
            0.1,                                            // zNear
            100.0                                           // zFar
        )

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix
        );

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.viewMatrix,
            false,
            this.camera.getViewMatrix()
        );
        
        for (let object of this.objects) {
            gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelMatrix,
                false,
                object.modelMatrix
            );

            object.draw(this.programInfo.attribLocations)
        }

    }

    update(dt) {
        this.camera.update(dt);

        for (let object of this.objects) {
            if (object.update) object.update(dt);
        }
    }
}