import { mat4 } from 'gl-matrix'

export default class Camera {
    constructor(gl, x, y, z, rotX, rotY, rotZ, horizontalSpeed, verticalSpeed) {
        this.gl = gl;
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.rotX = rotX || 0;
        this.rotY = rotY || 0;
        this.rotZ = rotZ || 0;
        this.horizontalSpeed = horizontalSpeed || 10;
        this.verticalSpeed = verticalSpeed || 10;

        
        let dragging = false, lastX, lastY;
        window.onmousedown = e => {
            dragging = true;
            lastX = e.x;
            lastY = e.y;
        };
        window.onmouseup = e => {
            dragging = false;
        };
        window.onmousemove = e => {
            if (dragging) {
                const dx = e.x - lastX;
                const dy = e.y - lastY;
                lastX = e.x;
                lastY = e.y;
                this.rotateCamera(dy, dx);
            }
        };

        window.onwheel = (e) => {
            if (!dragging) this.rotateCamera(-e.deltaY, -e.deltaX)
        };

        window.addEventListener('keydown', event => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.moveForward = true; break;
                case 'a':
                    this.moveLeft = true; break;
                case 's':
                    this.moveBackward = true; break;
                case 'd':
                    this.moveRight = true; break;
                case ' ':
                    this.moveUp = true; break;
                case 'shift':
                    this.moveDown = true; break;
            }
        });

        window.addEventListener('keyup', event => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.moveForward = false; break;
                case 'a':
                    this.moveLeft = false; break;
                case 's':
                    this.moveBackward = false; break;
                case 'd':
                    this.moveRight = false; break;
                case ' ':
                    this.moveUp = false; break;
                case 'shift':
                    this.moveDown = false; break;
            }
        });
    }

    rotateCamera(dx, dy) {
        this.rotX += 0.003 * dx;
        this.rotY += 0.003 * dy;
        // clip camera to [-90deg, 90deg]
        if (this.rotX > Math.PI/2) this.rotX = Math.PI/2;
        if (this.rotX < -Math.PI/2) this.rotX = -Math.PI/2;
    }

    getPosition() {
        return [this.x, this.y, this.z];
    }

    getViewMatrix() {
        const viewMatrix = mat4.create();
        mat4.rotateX(viewMatrix, viewMatrix, this.rotX);
        mat4.rotateY(viewMatrix, viewMatrix, this.rotY);
        mat4.translate(viewMatrix, viewMatrix, [this.x, this.y, this.z]);
        return viewMatrix;
    }

    update(dt) {
        const distSin = Math.sin(this.rotY) * this.horizontalSpeed * dt;
        const distCos = Math.cos(this.rotY) * this.horizontalSpeed * dt;

        if (this.moveForward) {
            this.x -= distSin;
            this.z += distCos;
        }
        if (this.moveBackward) {
            this.x += distSin;
            this.z -= distCos;
        }
        if (this.moveLeft) {
            this.x += distCos;
            this.z += distSin;
        }
        if (this.moveRight) {
            this.x -= distCos;
            this.z -= distSin;
        }

        if (this.moveDown) {
            this.y += this.verticalSpeed * dt;
        }
        if (this.moveUp) {
            this.y -= this.verticalSpeed * dt;
        }
    }
}