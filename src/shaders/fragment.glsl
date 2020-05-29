#ifdef GL_ES
precision mediump float;
#endif


varying vec4 vColor;
varying vec3 vNormal_cameraspace;
varying vec3 vEyeDirection_cameraspace;
varying vec3 vLightDirection_cameraspace;

void main() {
    vec3 normal = normalize(vNormal_cameraspace);
    vec3 light = normalize(vLightDirection_cameraspace);
    vec3 eyes = normalize(vEyeDirection_cameraspace);
    vec3 reflection = reflect(-light, normal);

    vec3 ambientLight = vec3(0.1, 0.1, 0.1);
    vec3 directionalColor = vec3(1.0, 1.0, 0.9);
    vec3 specularColor = vec3(1.0, 0.0, 0.0);

    float directional = clamp(dot(normal, light), 0.0, 1.0);
    float specular = pow(clamp(dot(reflection, eyes), 0.0, 1.0), 10.0);

    vec3 lightColor = ambientLight + directional*directionalColor + specular*specularColor;
    gl_FragColor = vec4(vColor.xyz * lightColor, vColor.a);

}