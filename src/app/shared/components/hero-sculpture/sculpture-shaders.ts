import type { Material } from 'three';

export type SculptureUniforms = {
  uTime: { value: number };
  // Nombre de lignes par unité de scène le long de l'axe des courbes de niveau
  uLineFrequency: { value: number };
};

// Bruit simplex 3D (Ashima Arts / Stefan Gustavson, licence MIT)
const SIMPLEX_GLSL = /* glsl */ `
vec3 sculptMod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 sculptMod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 sculptPermute(vec4 x) { return sculptMod289(((x * 34.0) + 1.0) * x); }
vec4 sculptTaylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float sculptNoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = sculptMod289(i);
  vec4 p = sculptPermute(sculptPermute(sculptPermute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = sculptTaylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

// Métal liquide : la surface gonfle et se creuse lentement le long de sa
// normale. Deux octaves de bruit dont le domaine dérive dans le temps :
// les bosses glissent sur la matière au lieu de simplement pulser.
const VERTEX_HEADER = /* glsl */ `
uniform float uTime;
attribute float aOcclusion;
varying vec3 vSculptPosition;
varying float vSculptWarp;
varying float vSculptOcclusion;
${SIMPLEX_GLSL}

float sculptDisplacement(vec3 p) {
  float t = uTime;
  float slow = sculptNoise(p * 1.35 + vec3(0.0, t * 0.11, t * 0.07));
  float detail = sculptNoise(p * 2.9 - vec3(t * 0.09, 0.0, t * 0.13));
  return 0.055 * slow + 0.018 * detail;
}

vec3 sculptDisplace(vec3 p, vec3 n) {
  return p + n * sculptDisplacement(p);
}
`;

// La normale déformée est reconstruite en déplaçant deux voisins pris dans
// le plan tangent (différences finies).
const VERTEX_NORMAL = /* glsl */ `
#include <beginnormal_vertex>
vec3 sculptNormal = normalize(objectNormal);
vec3 sculptHelper = abs(sculptNormal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
vec3 sculptTangent = normalize(cross(sculptNormal, sculptHelper));
vec3 sculptBitangent = cross(sculptNormal, sculptTangent);
const float sculptEpsilon = 0.012;
vec3 sculptPosition = sculptDisplace(position, sculptNormal);
vec3 sculptAlongT = sculptDisplace(position + sculptTangent * sculptEpsilon, sculptNormal);
vec3 sculptAlongB = sculptDisplace(position + sculptBitangent * sculptEpsilon, sculptNormal);
objectNormal = normalize(cross(sculptAlongT - sculptPosition, sculptAlongB - sculptPosition));
`;

const VERTEX_POSITION = /* glsl */ `
#include <begin_vertex>
transformed = sculptPosition;
vSculptPosition = sculptPosition;
vSculptWarp = sculptNoise(sculptPosition * 1.1 + vec3(uTime * 0.025));
vSculptOcclusion = aOcclusion;
`;

const FRAGMENT_HEADER = /* glsl */ `
uniform float uLineFrequency;
varying vec3 vSculptPosition;
varying float vSculptWarp;
varying float vSculptOcclusion;

// Les courbes de niveau sont des tranches parallèles de la sculpture le long
// d'un axe incliné, légèrement ondulées par un bruit lent.
const vec3 SCULPT_LINE_AXIS = vec3(0.28, 0.94, 0.19);
const float SCULPT_LINE_WIDTH = 0.34;
const float SCULPT_LINE_WARP = 0.9;

float sculptLines() {
  float level = dot(vSculptPosition, SCULPT_LINE_AXIS) * uLineFrequency
    + vSculptWarp * SCULPT_LINE_WARP;
  float aa = fwidth(level);
  float distanceToLine = abs(fract(level) - 0.5);
  float halfWidth = SCULPT_LINE_WIDTH * 0.5;
  float line = 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, distanceToLine);
  // Lignes plus serrées que ~3 px : on passe à leur couverture moyenne pour
  // éviter le moiré (silhouettes, petits écrans)
  return mix(line, SCULPT_LINE_WIDTH, smoothstep(0.22, 0.45, aa));
}
`;

// Dans les lignes, la matière prend un albédo noir et devient plus rugueuse
const FRAGMENT_COLOR = /* glsl */ `
#include <color_fragment>
float sculptLine = sculptLines();
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.0), sculptLine);
`;

const FRAGMENT_ROUGHNESS = /* glsl */ `
#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.6, sculptLine);
`;

// Occlusion précalculée depuis la SDF : creux sombres entre les lobes.
// Les lignes éteignent aussi presque tout le spéculaire : la matière n'étant
// plus un métal, un albédo noir ne suffit pas à les rendre noires (le reflet
// d'un diélectrique ne dépend pas de sa couleur).
const FRAGMENT_OCCLUSION = /* glsl */ `
#include <aomap_fragment>
reflectedLight.indirectDiffuse *= vSculptOcclusion;
reflectedLight.indirectSpecular *= vSculptOcclusion;
float sculptGroove = 1.0 - 0.9 * sculptLine;
reflectedLight.directSpecular *= sculptGroove;
reflectedLight.indirectSpecular *= sculptGroove;
`;

export function applySculptureShaders(
  material: Material,
  uniforms: SculptureUniforms,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEADER}`)
      .replace('#include <beginnormal_vertex>', VERTEX_NORMAL)
      .replace('#include <begin_vertex>', VERTEX_POSITION);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_HEADER}`)
      .replace('#include <color_fragment>', FRAGMENT_COLOR)
      .replace('#include <roughnessmap_fragment>', FRAGMENT_ROUGHNESS)
      .replace('#include <aomap_fragment>', FRAGMENT_OCCLUSION);
  };
}
