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

// ─── Animation des doigts, calculée sur le processeur une fois par image ───
// Pour chaque doigt : une flexion à la base, une flexion au coude, un
// allongement, une épaisseur et la phase d'un renflement qui s'écoule de la
// base vers le bout. Le vertex shader n'a plus qu'à appliquer ces valeurs.
//
// Pour un mouvement liquide plutôt que mécanique :
// - Chaque signal est une somme de trois sinus de fréquences
//   incommensurables (périodes d'environ 8 à 28 s) : lisse, sans pulsation
//   régulière ni répétition visible.
// - Une onde lente traverse la sculpture : chaque doigt la reçoit avec un
//   retard qui dépend de sa position, le mouvement se propage d'une zone à
//   l'autre au lieu d'animer chaque doigt séparément.
// - Le coude reprend la flexion de la base avec retard : inertie, la matière
//   suit le mouvement au lieu de pivoter d'un bloc.
// - Chaque goutte grossit et se rétracte : son rayon varie (fort au bout,
//   faible à la base). Amplitude selon sa taille : les trois plus grosses
//   gouttes gonflent le plus et se relaient (décalées d'un tiers de cycle),
//   les autres suivent leur propre rythme lent. Une « activité » lente laisse
//   certaines gouttes calmes pendant que d'autres se déforment davantage.
// - L'allongement est en partie indépendant du volume : une goutte peut
//   s'allonger pendant qu'une autre s'épaissit.
// - Tout s'installe progressivement pendant les premières secondes.
const BEND_BASE = 0.22;
const BEND_KNEE = 0.3;
// Gonflement maximal (part du rayon) : trois plus grosses gouttes,
// moyennes, petites (classées par rayon du bout)
const SWELL_DOMINANT = 0.28;
const SWELL_MEDIUM = 0.22;
const SWELL_SMALL = 0.16;
// Cycle des gouttes dominantes (s) et ralentissement des variations propres
// de volume (périodes d'environ 11 à 40 s) : la matière gonfle lentement
const DOMINANT_CYCLE = 22;
const VOLUME_TIME_SCALE = 0.7;
const FLOW_BULGE = 0.06;
const KNEE_LAG = 2.5;
const WAVE_DELAY = 3.5;
const RAMP_SECONDS = 6;
const FREQUENCY_BANDS = [
  [0.22, 0.32],
  [0.37, 0.5],
  [0.6, 0.8],
];

type Vec3 = [number, number, number];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(...a) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};
const combine = (a: Vec3, x: number, b: Vec3, y: number): Vec3 => [
  a[0] * x + b[0] * y,
  a[1] * x + b[1] * y,
  a[2] * x + b[2] * y,
];
// Pseudo-aléatoire déterministe : même animation à chaque chargement
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Signal lisse dans [-1, 1] : trois sinus de poids décroissants
type Signal = { frequencies: number[]; phases: number[] };
const createSignal = (seed: number): Signal => ({
  frequencies: FREQUENCY_BANDS.map(
    ([min, max], band) => min + (max - min) * hash(seed + band * 7.1),
  ),
  phases: FREQUENCY_BANDS.map((_, band) => hash(seed + band * 3.3 + 1) * 6.283),
});
const sample = ({ frequencies, phases }: Signal, t: number) =>
  0.5 * Math.sin(t * frequencies[0] + phases[0]) +
  0.3 * Math.sin(t * frequencies[1] + phases[1]) +
  0.2 * Math.sin(t * frequencies[2] + phases[2]);

const WAVE = createSignal(101);
const WAVE_DIRECTION = normalize([0.6, 0.5, -0.3]);

// Repère de chaque doigt : deux directions perpendiculaires au premier
// segment pour orienter la flexion, axe du second segment pour la reprise
// Classement des gouttes par rayon du bout : trois dominantes, trois petites
const BY_SIZE = SCULPTURE_FINGERS.map(({ radii }, index) => ({ index, size: radii[2] }))
  .sort((a, b) => b.size - a.size)
  .map(({ index }) => index);
const swellAmplitude = (index: number) => {
  const rank = BY_SIZE.indexOf(index);
  if (rank < 3) return SWELL_DOMINANT;
  return rank >= BY_SIZE.length - 3 ? SWELL_SMALL : SWELL_MEDIUM;
};

const FINGER_RIGS = SCULPTURE_FINGERS.map(({ base, knee, tip }, index) => {
  const axis1 = normalize(sub(knee, base));
  const axis2 = normalize(sub(tip, knee));
  const helper: Vec3 = Math.abs(axis1[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const side1 = normalize(cross(axis1, helper));
  const side2 = cross(axis1, side1);
  const seed = index * 17.3;
  return {
    axis2,
    side1,
    side2,
    // Les doigts orientés dans le sens de l'onde la reçoivent plus tard
    delay: WAVE_DELAY * (1 + dot(normalize(tip), WAVE_DIRECTION)),
    stretch: createSignal(seed + 1),
    bendX: createSignal(seed + 2),
    bendY: createSignal(seed + 3),
    volume: createSignal(seed + 4),
    activity: createSignal(seed + 6),
    swell: swellAmplitude(index),
    // Rang parmi les trois dominantes (−1 pour les autres)
    turn: BY_SIZE.indexOf(index) < 3 ? BY_SIZE.indexOf(index) : -1,
    flowSpeed: 0.45 + 0.25 * hash(seed + 5),
  };
});

const FINGER_COUNT = SCULPTURE_FINGERS.length;
// Par doigt : axe et angle de flexion de la base, idem au coude (exprimé
// avant la flexion de la base), cosinus et sinus de ces deux angles, puis
// allongement, gonflement, phase et amplitude du renflement qui s'écoule
const fingerBendBase = new Float32Array(FINGER_COUNT * 4);
const fingerBendKnee = new Float32Array(FINGER_COUNT * 4);
const fingerTrig = new Float32Array(FINGER_COUNT * 4);
const fingerState = new Float32Array(FINGER_COUNT * 4);

function writeRotation(target: Float32Array, index: number, rotation: Vec3) {
  const angle = Math.hypot(...rotation);
  const axis: Vec3 = angle > 1e-6 ? normalize(rotation) : [1, 0, 0];
  target.set([...axis, angle], index * 4);
  return angle;
}

function updateFingers(t: number) {
  const ramp = Math.min(Math.max(t / RAMP_SECONDS, 0), 1);
  const ease = ramp * ramp * (3 - 2 * ramp);
  FINGER_RIGS.forEach((rig, i) => {
    const wave = sample(WAVE, t - rig.delay);
    // Volume dans [-1, 1] : les dominantes se relaient, les autres suivent
    // leur propre rythme lent
    const own = sample(rig.volume, t * VOLUME_TIME_SCALE);
    const volume =
      rig.turn >= 0
        ? 0.65 *
            Math.sin(
              (2 * Math.PI * t) / DOMINANT_CYCLE + (2 * Math.PI * rig.turn) / 3,
            ) +
          0.35 * own
        : own;
    // Activité lente entre 0,45 et 1 : par moments une goutte reste calme
    const activity = 0.725 + 0.275 * sample(rig.activity, t * 0.4);
    // Allongement en partie indépendant du volume
    const stretch =
      FINGER_STRETCH *
      ease *
      (0.3 * volume + 0.35 * wave + 0.35 * sample(rig.stretch, t));
    // Flexion de la base, en partie entraînée par l'onde qui traverse la masse
    const bend = (time: number) =>
      combine(
        rig.side1,
        0.6 * sample(rig.bendX, time) +
          0.4 * sample(WAVE, time - rig.delay - 1.3),
        rig.side2,
        sample(rig.bendY, time),
      );
    const base = bend(t).map((v) => v * BEND_BASE * ease) as Vec3;
    // Le coude reprend la flexion de la base avec du retard (inertie), autour
    // d'un axe perpendiculaire au second segment
    const lagged = bend(t - KNEE_LAG).map((v) => v * BEND_KNEE * ease) as Vec3;
    const knee = combine(lagged, 1, rig.axis2, -dot(lagged, rig.axis2));

    const angleBase = writeRotation(fingerBendBase, i, base);
    const angleKnee = writeRotation(fingerBendKnee, i, knee);
    fingerTrig.set(
      [
        Math.cos(angleBase),
        Math.sin(angleBase),
        Math.cos(angleKnee),
        Math.sin(angleKnee),
      ],
      i * 4,
    );
    fingerState.set(
      [
        stretch,
        ease * rig.swell * activity * volume,
        t * rig.flowSpeed,
        ease * FLOW_BULGE,
      ],
      i * 4,
    );
  });
}
updateFingers(0);

const glsl = (value: number) => value.toFixed(4);
const glslVec4 = (values: number[]) => `vec4(${values.map(glsl).join(', ')})`;
const FINGER_ARRAYS = (() => {
  const array = (name: string, items: string[]) =>
    `const vec4 ${name}[${items.length}] = vec4[${items.length}](\n  ${items.join(',\n  ')}\n);`;
  return [
    array(
      'SCULPT_FINGER_BASE',
      SCULPTURE_FINGERS.map(({ base, radii }) => glslVec4([...base, radii[0]])),
    ),
    array(
      'SCULPT_FINGER_KNEE',
      SCULPTURE_FINGERS.map(({ knee, radii }) => glslVec4([...knee, radii[1]])),
    ),
    array(
      'SCULPT_FINGER_TIP',
      SCULPTURE_FINGERS.map(({ tip, radii }) => glslVec4([...tip, radii[2]])),
    ),
    array('SCULPT_CORE', SCULPTURE_CORE.map(glslVec4)),
  ].join('\n');
})();

// ─── Déformation dans le vertex shader (le maillage n'est jamais recalculé) ───
// A. Chaque doigt est un squelette souple : le premier segment pivote autour
//    de la base, le second pivote en plus autour du coude, puis le doigt
//    s'étire le long de ses segments. La flexion s'installe progressivement
//    au départ de chaque segment : la base et le coude plient en douceur.
// B. Gonflement : chaque goutte se dilate ou se contracte autour de son axe
//    (faible à la base, fort sur le corps et le bout), avec des poids plus
//    doux que ceux de la flexion : les raccords suivent sans pli. Renflement
//    léger qui glisse vers le bout.
// C. Un champ de déplacement 3D très lent (bruit vectoriel à grande échelle)
//    déplace toute la masse : les volumes se réorganisent les uns par rapport
//    aux autres en restant fusionnés, les creux se déplacent.
// D. Les points appartiennent en douceur à chaque doigt et au noyau (poids
//    normalisés) : les déformations se transmettent sans couture, en
//    particulier à la base des doigts.
// E. Deux ondes de surface, dont une qui se déplace à travers la matière,
//    modifient réellement le contour.
// Le déplacement ne dépend que de la position au repos : les normales
// reconstruites restent justes.
const VERTEX_HEADER = /* glsl */ `
uniform float uTime;
uniform vec4 uFingerBendBase[${FINGER_COUNT}];
uniform vec4 uFingerBendKnee[${FINGER_COUNT}];
uniform vec4 uFingerTrig[${FINGER_COUNT}];
uniform vec4 uFingerState[${FINGER_COUNT}];
attribute float aOcclusion;
varying vec3 vSculptPosition;
varying float vSculptWarp;
varying float vSculptOcclusion;
${SIMPLEX_GLSL}

${FINGER_ARRAYS}
const float SCULPT_SHARPNESS = 26.0;
const float SCULPT_SWELL_SHARPNESS = 14.0;

// Rotation de v autour de l'axe unitaire k (cosinus et sinus de l'angle)
vec3 sculptRotate(vec3 v, vec3 k, float c, float s) {
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}

vec3 sculptFingers(vec3 p, vec3 n) {
  float core = min(
    length(p - SCULPT_CORE[0].xyz) - SCULPT_CORE[0].w,
    length(p - SCULPT_CORE[1].xyz) - SCULPT_CORE[1].w);
  // Le noyau participe aux poids sans bouger
  float weights = exp(-SCULPT_SHARPNESS * core);
  vec3 total = vec3(0.0);
  // Gonflement : poids plus doux, pour que deux gouttes voisines qui
  // gonflent ensemble se rejoignent sans créer de pli
  float swellWeights = exp(-SCULPT_SWELL_SHARPNESS * core);
  vec3 swellTotal = vec3(0.0);
  for (int i = 0; i < ${FINGER_COUNT}; i++) {
    vec4 base = SCULPT_FINGER_BASE[i];
    vec4 knee = SCULPT_FINGER_KNEE[i];
    vec4 tip = SCULPT_FINGER_TIP[i];
    vec4 bendBase = uFingerBendBase[i];
    vec4 bendKnee = uFingerBendKnee[i];
    vec4 trig = uFingerTrig[i];
    vec4 state = uFingerState[i];

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
    float stretch = state.x;

    // Premier segment : pivote autour de la base et s'étire
    vec3 axis1Bent = sculptRotate(axis1, bendBase.xyz, trig.x, trig.y);
    float flex1 = bendBase.w * smoothstep(-0.03, 0.12, along1);
    vec3 image1 = base.xyz
      + sculptRotate(p - base.xyz, bendBase.xyz, cos(flex1), sin(flex1))
      + stretch * clamp(along1, 0.0, length1) * axis1Bent;

    // Second segment : suit le coude déplacé, puis pivote autour de lui
    vec3 kneeMoved = base.xyz
      + sculptRotate(knee.xyz - base.xyz, bendBase.xyz, trig.x, trig.y)
      + stretch * length1 * axis1Bent;
    vec3 kneeAxis = sculptRotate(bendKnee.xyz, bendBase.xyz, trig.x, trig.y);
    float flex2 = bendKnee.w * smoothstep(-0.05, 0.08, along2);
    vec3 local2 = sculptRotate(
      sculptRotate(p - knee.xyz, bendBase.xyz, trig.x, trig.y),
      kneeAxis, cos(flex2), sin(flex2));
    vec3 axis2Bent = sculptRotate(
      sculptRotate(axis2, bendBase.xyz, trig.x, trig.y),
      kneeAxis, trig.z, trig.w);
    vec3 image2 = kneeMoved + local2 + stretch * max(along2, 0.0) * axis2Bent;

    vec3 moved = mix(image1, image2, side) - p;

    float run = mix(clamp(along1, 0.0, length1), length1 + max(along2, 0.0), side);
    float u = run / (length1 + length2);

    // Gonflement de la goutte : chaque point s'éloigne (ou se rapproche) du
    // point le plus proche de l'axe, comme si les rayons de la goutte
    // changeaient. Faible à la base, fort sur le corps et le bout.
    vec3 axisPoint1 = base.xyz + axis1 * clamp(along1, 0.0, length1);
    vec3 axisPoint2 = knee.xyz + axis2 * clamp(along2, 0.0, length2);
    vec3 fromAxis = p - mix(axisPoint1, axisPoint2, side);
    // Sur l'extrémité, le bulbe s'élargit surtout : vers l'avant, seulement
    // 35 % (l'allongement s'en charge), ce qui garde le cadrage
    float forward = max(along2 - length2, 0.0) * side;
    fromAxis -= axis2 * forward * 0.65;
    float profile = mix(0.15, 1.0, smoothstep(0.1, 0.8, u));
    vec3 inflate = fromAxis * state.y * profile;
    // Le gonflement suit l'orientation fléchie de la goutte
    inflate = sculptRotate(inflate, bendBase.xyz, trig.x, trig.y);
    inflate = mix(inflate, sculptRotate(inflate, kneeAxis, trig.z, trig.w), side);
    float swellWeight = exp(-SCULPT_SWELL_SHARPNESS * min(distance1, distance2));
    swellTotal += swellWeight * inflate;
    swellWeights += swellWeight;

    // Renflement léger qui s'écoule de la base vers le bout
    float bulge = state.w * sin(7.0 * u - state.z) * smoothstep(0.05, 0.3, u);
    moved += n * bulge * mix(radius1, radius2, side);

    total += weight * moved;
    weights += weight;
  }
  return total / weights + swellTotal / swellWeights;
}

// Champ de déplacement lent et cohérent : réorganise toute la masse
vec3 sculptFlow(vec3 p) {
  vec3 q = p * 0.85;
  float t = uTime * 0.05;
  return vec3(
    sculptNoise(q + vec3(0.0, t, 3.1)),
    sculptNoise(q + vec3(5.2, 1.3, t)),
    sculptNoise(q + vec3(t, 7.7, 2.4)));
}

vec3 sculptDisplace(vec3 p, vec3 n) {
  float ramp = smoothstep(0.0, ${glsl(RAMP_SECONDS)}, uTime);
  // Ondulation lente sur place et onde qui traverse la surface
  float swell = sculptNoise(p * 1.1 + vec3(0.0, uTime * 0.07, uTime * 0.05));
  float wave = sculptNoise(p * 1.9 - vec3(0.6, 0.3, -0.4) * uTime * 0.12);
  return p
    + n * (0.026 * swell + 0.016 * ramp * wave)
    + 0.04 * ramp * sculptFlow(p)
    + sculptFingers(p, n);
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
// Les lignes sont calculées sur la matière au repos puis déformées avec
// elle : imprimées sur la surface, elles ne glissent pas quand elle bouge
vSculptPosition = position;
vSculptWarp = sculptNoise(position * 1.1 + vec3(1.7));
vSculptOcclusion = aOcclusion;
`;

const FRAGMENT_HEADER = /* glsl */ `
uniform float uLineFrequency;
varying vec3 vSculptPosition;
varying float vSculptWarp;
varying float vSculptOcclusion;

// Les courbes de niveau sont des tranches parallèles de la sculpture au
// repos le long d'un axe incliné, légèrement ondulées par un bruit fixe.
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
  // État des doigts recalculé juste avant chaque rendu, à partir du temps de
  // la scène (aucune modification de la boucle d'animation nécessaire)
  material.onBeforeRender = () => updateFingers(uniforms.uTime.value);
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, {
      uFingerBendBase: { value: fingerBendBase },
      uFingerBendKnee: { value: fingerBendKnee },
      uFingerTrig: { value: fingerTrig },
      uFingerState: { value: fingerState },
    });
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
