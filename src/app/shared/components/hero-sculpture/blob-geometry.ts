import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
} from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Vec3 = [number, number, number];

// Doigt courbé : deux segments (base → coude → bout), chacun un cône
// arrondi dont le rayon varie d'une extrémité à l'autre. Le bout est un peu
// plus large que le coude : extrémité bombée.
type Finger = [
  bx: number, by: number, bz: number,
  kx: number, ky: number, kz: number,
  tx: number, ty: number, tz: number,
  baseRadius: number, kneeRadius: number, tipRadius: number,
];

// Petit noyau (deux sphères décalées, irrégulier) : la masse est surtout
// faite des doigts eux-mêmes, comme sur la référence.
const CORE: [x: number, y: number, z: number, radius: number][] = [
  [0.0, 0.0, 0.0, 0.26],
  [0.05, -0.07, -0.11, 0.24],
];

// 11 doigts épais de longueurs différentes, orientés librement et
// courbés au coude. Composés dans le repère de la caméra puis ramenés dans
// celui de l'objet (inclinaison de la scène) : en vue de face, un gros lobe
// à droite qui retombe, deux doigts qui se recourbent vers le haut, une
// pile de doigts plus petits à gauche, trois doigts courts vers le bas, un vers
// l'avant et un vers l'arrière.
// Profil en goutte : base rétrécie qui rejoint la masse, corps un peu plus
// large, bout bombé plus volumineux. Hiérarchie : trois gouttes dominantes
// (gros lobe de droite, lobe bas-gauche, doigt bas-droite : bout ×1,15),
// cinq moyennes (×1,10) et trois petites (×1,05). Le bout est reculé du gain
// de rayon : la portée et le cadrage ne changent pas.
const FINGERS: Finger[] = [
  [0.07, 0.06, -0.06, 0.32, 0.21, -0.19, 0.46, 0.095, -0.248, 0.197, 0.236, 0.311],
  [-0.03, 0.09, -0.03, -0.1, 0.35, -0.18, -0.301, 0.423, -0.171, 0.164, 0.189, 0.23],
  [-0.14, 0.09, 0.09, -0.34, 0.3, 0.16, -0.369, 0.472, 0.122, 0.139, 0.154, 0.189],
  [-0.03, 0.06, -0.13, 0, 0.3, -0.4, 0.09, 0.345, -0.535, 0.148, 0.178, 0.208],
  [-0.06, 0.02, 0.11, -0.26, 0.11, 0.31, -0.365, 0.072, 0.425, 0.123, 0.133, 0.168],
  [-0.11, -0.1, -0.02, -0.38, -0.15, 0.01, -0.515, -0.256, 0.097, 0.123, 0.133, 0.168],
  [-0.03, -0.09, 0.12, -0.19, -0.29, 0.35, -0.313, -0.233, 0.391, 0.164, 0.193, 0.241],
  [0.03, -0.09, 0.03, 0.15, -0.31, 0.17, 0.123, -0.454, 0.269, 0.156, 0.178, 0.219],
  [0.16, -0.07, -0.04, 0.39, -0.26, 0, 0.433, -0.431, 0.009, 0.148, 0.182, 0.23],
  [0.04, 0.04, 0.08, 0.27, 0.09, 0.26, 0.422, 0.099, 0.251, 0.148, 0.168, 0.208],
  [-0.04, -0.04, -0.08, -0.31, -0.08, -0.27, -0.484, -0.016, -0.316, 0.139, 0.157, 0.197],
];

// Fusion des doigts avec la masse : courte, pour creuser des plis profonds
const BLEND = 0.075;
// Fusion des deux segments d'un même doigt : adoucit le coude
const KNEE_BLEND = 0.07;
// La masse doit tenir dans la grille [-1, 1]³ du marching cubes
const SCALE = 0.84;
// Allongement maximal des doigts animés par le vertex shader (part de leur
// longueur) : sert ici à agrandir la sphère englobante, donc le cadrage
export const FINGER_STRETCH = 0.18;
const ANIMATION_MARGIN = 0.02;
const AO_STEP = 0.045;
const AO_SAMPLES = 5;
const COARSE_STEP = 4;

// Cône arrondi précalculé (formule d'Inigo Quilez)
type RoundCone = {
  ax: number;
  ay: number;
  az: number;
  bax: number;
  bay: number;
  baz: number;
  l2: number;
  rr: number;
  a2: number;
  il2: number;
  r1: number;
  r2: number;
};

const scaled = (x: number, y: number, z: number): Vec3 => [
  x * SCALE,
  y * SCALE,
  z * SCALE,
];

function roundCone(a: Vec3, b: Vec3, r1: number, r2: number): RoundCone {
  const [bax, bay, baz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  return {
    ax: a[0],
    ay: a[1],
    az: a[2],
    bax,
    bay,
    baz,
    l2,
    rr,
    a2: l2 - rr * rr,
    il2: 1 / l2,
    r1,
    r2,
  };
}

function roundConeDistance(c: RoundCone, x: number, y: number, z: number) {
  const pax = x - c.ax;
  const pay = y - c.ay;
  const paz = z - c.az;
  const py = pax * c.bax + pay * c.bay + paz * c.baz;
  const pz = py - c.l2;
  const qx = pax * c.l2 - c.bax * py;
  const qy = pay * c.l2 - c.bay * py;
  const qz = paz * c.l2 - c.baz * py;
  const x2 = qx * qx + qy * qy + qz * qz;
  const y2 = py * py * c.l2;
  const z2 = pz * pz * c.l2;
  const k = Math.sign(c.rr) * c.rr * c.rr * x2;
  if (Math.sign(pz) * c.a2 * z2 > k) return Math.sqrt(x2 + z2) * c.il2 - c.r2;
  if (Math.sign(py) * c.a2 * y2 < k) return Math.sqrt(x2 + y2) * c.il2 - c.r1;
  return (Math.sqrt(x2 * c.a2 * c.il2) + py * c.rr) * c.il2 - c.r1;
}

// Doigts dans l'espace du maillage : partagés avec le vertex shader, qui
// anime l'allongement et l'épaisseur de chacun
export type SculptureFinger = {
  base: Vec3;
  knee: Vec3;
  tip: Vec3;
  radii: Vec3;
};

export const SCULPTURE_FINGERS: SculptureFinger[] = FINGERS.map(
  ([bx, by, bz, kx, ky, kz, tx, ty, tz, rb, rk, rt]) => ({
    base: scaled(bx, by, bz),
    knee: scaled(kx, ky, kz),
    tip: scaled(tx, ty, tz),
    radii: [rb * SCALE, rk * SCALE, rt * SCALE],
  }),
);

export const SCULPTURE_CORE = CORE.map(
  ([x, y, z, r]): [number, number, number, number] => [
    ...scaled(x, y, z),
    r * SCALE,
  ],
);

const PREPARED: [RoundCone, RoundCone][] = SCULPTURE_FINGERS.map(
  ({ base, knee, tip, radii: [rb, rk, rt] }) => [
    roundCone(base, knee, rb, rk),
    roundCone(knee, tip, rk, rt),
  ],
);

// Union lisse polynomiale : fusionne deux volumes en creusant le raccord
function smoothMin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// Distance signée (approchée) à la sculpture : négative à l'intérieur
export function sculptureDistance(px: number, py: number, pz: number): number {
  // Légère torsion du domaine : casse la régularité des volumes
  const x = px + 0.035 * Math.sin(3.1 * py + 1.3) + 0.02 * Math.sin(5.7 * pz);
  const y = py + 0.035 * Math.sin(2.7 * pz + 0.4) + 0.02 * Math.sin(6.1 * px);
  const z = pz + 0.035 * Math.sin(3.3 * px + 2.1) + 0.02 * Math.sin(5.3 * py);

  let distance = Infinity;
  for (const [cx, cy, cz, r] of SCULPTURE_CORE) {
    const sphere = Math.hypot(x - cx, y - cy, z - cz) - r;
    distance =
      distance === Infinity ? sphere : smoothMin(distance, sphere, BLEND);
  }
  for (const [first, second] of PREPARED) {
    const finger = smoothMin(
      roundConeDistance(first, x, y, z),
      roundConeDistance(second, x, y, z),
      KNEE_BLEND,
    );
    distance = smoothMin(distance, finger, BLEND);
  }
  return distance;
}

// Remplit la grille du marching cubes (positive à l'intérieur : on stocke
// -SDF). Une grille grossière est évaluée d'abord : loin de la surface, seul
// le signe compte et la valeur grossière suffit, ce qui évite l'essentiel des
// évaluations fines.
function fillField(field: Float32Array, resolution: number) {
  const half = resolution / 2;
  const coarseSize = Math.ceil(resolution / COARSE_STEP) + 1;
  const coarse = new Float32Array(coarseSize ** 3);
  for (let k = 0; k < coarseSize; k++) {
    for (let j = 0; j < coarseSize; j++) {
      for (let i = 0; i < coarseSize; i++) {
        coarse[(k * coarseSize + j) * coarseSize + i] = sculptureDistance(
          (i * COARSE_STEP - half) / half,
          (j * COARSE_STEP - half) / half,
          (k * COARSE_STEP - half) / half,
        );
      }
    }
  }

  // Au-delà de cette distance, la surface ne peut pas passer entre le voxel
  // et son nœud grossier le plus proche (marge pour une SDF approchée)
  const safeDistance = (COARSE_STEP * 1.6 * 2) / resolution;
  const nearest = (index: number) =>
    Math.min(Math.round(index / COARSE_STEP), coarseSize - 1);

  for (let k = 0; k < resolution; k++) {
    const z = (k - half) / half;
    const ck = nearest(k);
    for (let j = 0; j < resolution; j++) {
      const y = (j - half) / half;
      const cj = nearest(j);
      const row = (k * resolution + j) * resolution;
      for (let i = 0; i < resolution; i++) {
        const approx = coarse[(ck * coarseSize + cj) * coarseSize + nearest(i)];
        field[row + i] =
          Math.abs(approx) > safeDistance
            ? -approx
            : -sculptureDistance((i - half) / half, y, z);
      }
    }
  }
}

// Maillage lisse de la sculpture : la distance signée est échantillonnée dans
// la grille du marching cubes de Three.js, polygonisée une seule fois, puis
// soudée. Normales et occlusion ambiante sont calculées depuis la SDF.
export function createBlobGeometry(resolution: number): BufferGeometry {
  // Le marching cubes est un Mesh : il exige un matériau, jamais affiché ici
  const placeholder = new MeshBasicMaterial();
  // Budget de triangles : la surface croît avec le carré de la résolution
  const cubes = new MarchingCubes(
    resolution,
    placeholder,
    false,
    false,
    resolution * resolution * 10,
  );
  cubes.isolation = 0;

  fillField(cubes.field, resolution);
  cubes.update();

  const soup = new BufferGeometry();
  soup.setAttribute(
    'position',
    new Float32BufferAttribute(cubes.positionArray.slice(0, cubes.count * 3), 3),
  );
  cubes.geometry.dispose();
  placeholder.dispose();

  const geometry = mergeVertices(soup, 1e-5);
  soup.dispose();

  const positions = geometry.getAttribute('position');
  const count = positions.count;
  const normals = new Float32Array(count * 3);
  const occlusion = new Float32Array(count);
  const e = 1e-3;

  for (let v = 0; v < count; v++) {
    const x = positions.getX(v);
    const y = positions.getY(v);
    const z = positions.getZ(v);

    // Normale = gradient de la SDF : bien plus lisse que celle des facettes
    let nx =
      sculptureDistance(x + e, y, z) - sculptureDistance(x - e, y, z);
    let ny =
      sculptureDistance(x, y + e, z) - sculptureDistance(x, y - e, z);
    let nz =
      sculptureDistance(x, y, z + e) - sculptureDistance(x, y, z - e);
    const length = Math.hypot(nx, ny, nz) || 1;
    nx /= length;
    ny /= length;
    nz /= length;
    normals[v * 3] = nx;
    normals[v * 3 + 1] = ny;
    normals[v * 3 + 2] = nz;

    // Occlusion ambiante : plus la matière est proche le long de la normale,
    // plus le point est enfoncé dans un creux entre deux lobes
    let shadow = 0;
    let weight = 1;
    for (let s = 1; s <= AO_SAMPLES; s++) {
      const step = s * AO_STEP;
      const d = sculptureDistance(x + nx * step, y + ny * step, z + nz * step);
      shadow += (step - d) * weight;
      weight *= 0.6;
    }
    occlusion[v] = Math.min(Math.max(1 - shadow * 3.2, 0.12), 1);
  }

  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('aOcclusion', new Float32BufferAttribute(occlusion, 1));
  geometry.computeBoundingSphere();
  // La scène cadre la sculpture sur cette sphère : on l'agrandit pour qu'elle
  // contienne aussi chaque doigt à son allongement maximal (bout repoussé
  // de FINGER_STRETCH × sa longueur dans la direction du dernier segment)
  const sphere = geometry.boundingSphere!;
  for (const { base, knee, tip, radii } of SCULPTURE_FINGERS) {
    const length =
      Math.hypot(knee[0] - base[0], knee[1] - base[1], knee[2] - base[2]) +
      Math.hypot(tip[0] - knee[0], tip[1] - knee[1], tip[2] - knee[2]);
    const tipLength = Math.hypot(
      tip[0] - knee[0],
      tip[1] - knee[1],
      tip[2] - knee[2],
    );
    const reach = (FINGER_STRETCH * length) / tipLength;
    const extended = [0, 1, 2].map(
      (axis) => tip[axis] + (tip[axis] - knee[axis]) * reach,
    );
    sphere.radius = Math.max(
      sphere.radius,
      Math.hypot(
        extended[0] - sphere.center.x,
        extended[1] - sphere.center.y,
        extended[2] - sphere.center.z,
      ) + radii[2],
    );
  }
  // Champ de déplacement global et ondes de surface du vertex shader : au-delà
  // de la marge de cadrage de la scène, la surface peut s'écarter un peu plus
  sphere.radius += ANIMATION_MARGIN;
  return geometry;
}
