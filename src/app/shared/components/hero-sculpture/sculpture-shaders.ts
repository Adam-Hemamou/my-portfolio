import type { Material } from 'three';
import {
  FINGER_STRETCH,
  SCULPTURE_CORE,
  SCULPTURE_FINGERS,
} from './blob-geometry';

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

// Doigts animés : chacun s'allonge et se raccourcit (jusqu'à ±18 % de sa
// longueur) et son épaisseur varie légèrement (±5 %). Deux sinus lents de
// périodes différentes par doigt (environ 11 à 17 s et 25 à 40 s) et une
// troisième pour l'épaisseur, avec des phases propres : les doigts bougent
// indépendamment, jamais tous ensemble.
const STRETCH_PERIOD_MAIN = [11, 17];
const STRETCH_PERIOD_SLOW = [25, 40];
const THICKNESS_PERIOD = [15, 24];
const glsl = (value: number) => value.toFixed(4);
const glslVec4 = (values: number[]) => `vec4(${values.map(glsl).join(', ')})`;
const FINGER_COUNT = SCULPTURE_FINGERS.length;
const FINGER_ARRAYS = (() => {
  const bases: string[] = [];
  const knees: string[] = [];
  const tips: string[] = [];
  const motions: string[] = [];
  const thicknesses: string[] = [];
  // Périodes et phases réparties par le nombre d'or : jamais alignées
  const spread = ([min, max]: number[], value: number) =>
    (2 * Math.PI) / (min + (max - min) * (value % 1));
  SCULPTURE_FINGERS.forEach(({ base, knee, tip, radii }, index) => {
    const golden = index * 0.618034;
    bases.push(glslVec4([...base, radii[0]]));
    knees.push(glslVec4([...knee, radii[1]]));
    tips.push(glslVec4([...tip, radii[2]]));
    motions.push(
      glslVec4([
        spread(STRETCH_PERIOD_MAIN, golden),
        index * 2.39996,
        spread(STRETCH_PERIOD_SLOW, golden + 0.37),
        index * 1.71 + 0.8,
      ]),
    );
    thicknesses.push(
      glslVec4([spread(THICKNESS_PERIOD, golden + 0.71), index * 3.1 + 1.9, 0, 0]),
    );
  });
  const array = (name: string, items: string[]) =>
    `const vec4 ${name}[${items.length}] = vec4[${items.length}](\n  ${items.join(',\n  ')}\n);`;
  return [
    array('SCULPT_FINGER_BASE', bases),
    array('SCULPT_FINGER_KNEE', knees),
    array('SCULPT_FINGER_TIP', tips),
    array('SCULPT_FINGER_MOTION', motions),
    array('SCULPT_FINGER_THICKNESS', thicknesses),
    array('SCULPT_CORE', SCULPTURE_CORE.map(glslVec4)),
  ].join('\n');
})();

// Matière visqueuse :
// - Chaque doigt s'étire le long de son axe : un point est déplacé en
//   proportion de sa distance à la base, le long du segment où il se trouve.
//   La base reste soudée à la masse et le bout se déplace sans changer de
//   forme (il reste bombé). L'épaisseur varie le long de la normale.
// - Les points appartiennent en douceur à chaque doigt et au noyau (poids
//   décroissant avec la distance, normalisés) : raccords continus.
// - Un bruit lent dont le domaine dérive : de larges ondulations douces.
// Le mouvement s'installe progressivement pendant les premières secondes.
// Le déplacement ne dépend que de la position : les normales reconstruites
// et les lignes topographiques (tranches de la surface déformée) suivent.
const VERTEX_HEADER = /* glsl */ `
uniform float uTime;
attribute float aOcclusion;
varying vec3 vSculptPosition;
varying float vSculptWarp;
varying float vSculptOcclusion;
${SIMPLEX_GLSL}

${FINGER_ARRAYS}
const float SCULPT_STRETCH = ${glsl(FINGER_STRETCH)};
const float SCULPT_THICKNESS = 0.05;
const float SCULPT_SHARPNESS = 26.0;

vec3 sculptFingers(vec3 p, vec3 n) {
  float ramp = smoothstep(0.0, 6.0, uTime);
  float core = min(
    length(p - SCULPT_CORE[0].xyz) - SCULPT_CORE[0].w,
    length(p - SCULPT_CORE[1].xyz) - SCULPT_CORE[1].w);
  // Le noyau participe aux poids sans bouger
  float weights = exp(-SCULPT_SHARPNESS * core);
  vec3 total = vec3(0.0);
  for (int i = 0; i < ${FINGER_COUNT}; i++) {
    vec4 base = SCULPT_FINGER_BASE[i];
    vec4 knee = SCULPT_FINGER_KNEE[i];
    vec4 tip = SCULPT_FINGER_TIP[i];
    vec4 motion = SCULPT_FINGER_MOTION[i];
    vec4 thickness = SCULPT_FINGER_THICKNESS[i];

    vec3 axis1 = knee.xyz - base.xyz;
    float length1 = length(axis1);
    axis1 /= length1;
    vec3 axis2 = tip.xyz - knee.xyz;
    float length2 = length(axis2);
    axis2 /= length2;
    float along1 = dot(p - base.xyz, axis1);
    float along2 = dot(p - knee.xyz, axis2);
    float h1 = clamp(along1 / length1, 0.0, 1.0);
    float h2 = clamp(along2 / length2, 0.0, 1.0);
    float radius1 = mix(base.w, knee.w, h1);
    float radius2 = mix(knee.w, tip.w, h2);
    float distance1 = length(p - base.xyz - axis1 * length1 * h1) - radius1;
    float distance2 = length(p - knee.xyz - axis2 * length2 * h2) - radius2;
    float weight = exp(-SCULPT_SHARPNESS * min(distance1, distance2));
    // 0 sur le premier segment, 1 sur le second, en douceur au coude
    float side = 1.0 / (1.0 + exp(-30.0 * (distance1 - distance2)));
    float run1 = mix(clamp(along1, 0.0, length1), length1, side);
    float run2 = side * max(along2, 0.0);

    float stretch = SCULPT_STRETCH * ramp * (
      0.7 * sin(uTime * motion.x + motion.y)
      + 0.3 * sin(uTime * motion.z + motion.w));
    float swell = SCULPT_THICKNESS * ramp
      * sin(uTime * thickness.x + thickness.y) * mix(radius1, radius2, side);
    total += weight * (stretch * (run1 * axis1 + run2 * axis2) + n * swell);
    weights += weight;
  }
  return total / weights;
}

vec3 sculptDisplace(vec3 p, vec3 n) {
  float slow = sculptNoise(p * 1.1 + vec3(0.0, uTime * 0.07, uTime * 0.05));
  return p + n * (0.024 * slow) + sculptFingers(p, n);
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
