#ifdef GL_ES
precision mediump float;
#endif


attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute float aVertexHeight;
attribute vec4 aVertexColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uGlobalLightDirection;

varying vec4 vColor;
varying vec3 vNormal_cameraspace;
varying vec3 vEyeDirection_cameraspace;
varying vec3 vLightDirection_cameraspace;

void main() {
    mat4 MV = uViewMatrix * uModelMatrix;
    gl_Position = uProjectionMatrix * MV * vec4(aVertexHeight * aVertexPosition.xyz, 1.0);
    vColor = aVertexColor;

    vNormal_cameraspace = (MV * vec4(aVertexNormal, 0)).xyz;
    vEyeDirection_cameraspace = -(MV * aVertexPosition).xyz;
    vLightDirection_cameraspace = (uViewMatrix * vec4(uGlobalLightDirection, 0)).xyz;
}