import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
} from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Goutte : centre (x, y, z), demi-longueur dans l'axe de la goutte
// (direction centre de la masse → centre de la goutte), demi-largeur
// transverse, et évasement : > 0, la goutte s'élargit vers sa pointe et
// s'affine à sa base (un « cou » qui creuse le raccord avec la masse).
type Lobe = [
  x: number,
  y: number,
  z: number,
  along: number,
  across: number,
  flare: number,
];

// 14 volumes autour d'un petit noyau : plusieurs grosses gouttes trapues
// (longueur ≈ 1,05 à 1,2 × largeur), quelques moyennes et trois petites
// excroissances. Les gros volumes sont groupés en haut à droite et en bas à
// gauche, les petits ailleurs : la silhouette reste irrégulière et
// asymétrique, sans pointes en étoile.
const LOBES: Lobe[] = [
  [0.0, 0.0, 0.0, 0.33, 0.31, 0],
  [0.5, 0.14, 0.04, 0.37, 0.33, 0.1],
  [0.2, 0.54, -0.1, 0.34, 0.3, 0.12],
  [-0.32, 0.44, 0.12, 0.28, 0.24, 0.12],
  [-0.56, 0.06, 0.2, 0.26, 0.23, 0.1],
  [-0.44, -0.2, -0.3, 0.25, 0.22, 0.08],
  [-0.3, -0.46, 0.14, 0.35, 0.31, 0.08],
  [0.1, -0.54, 0.0, 0.29, 0.25, 0.12],
  [0.46, -0.38, -0.14, 0.3, 0.27, 0.1],
  [0.14, 0.06, 0.48, 0.31, 0.28, 0.06],
  [-0.06, 0.02, -0.5, 0.3, 0.26, 0.08],
  [0.38, 0.4, 0.34, 0.19, 0.17, 0.12],
  [-0.26, -0.22, 0.46, 0.17, 0.15, 0.12],
  [0.6, -0.12, -0.36, 0.2, 0.18, 0.12],
];

// Rayon de fusion : assez large pour des raccords lisses, assez court pour
// garder des creux marqués entre les gouttes
const BLEND = 0.13;
// La masse doit tenir dans la grille [-1, 1]³ du marching cubes
const SCALE = 0.84;
const AO_STEP = 0.045;
const AO_SAMPLES = 5;
const COARSE_STEP = 4;

type PreparedLobe = {
  cx: number;
  cy: number;
  cz: number;
  dx: number;
  dy: number;
  dz: number;
  invAlong: number;
  invAcross: number;
  minRadius: number;
  flare: number;
};

const PREPARED: PreparedLobe[] = LOBES.map(([x, y, z, along, across, flare]) => {
  const length = Math.hypot(x, y, z);
  // Le noyau (centre à l'origine) prend un axe vertical arbitraire
  const [dx, dy, dz] = length ? [x / length, y / length, z / length] : [0, 1, 0];
  return {
    cx: x * SCALE,
    cy: y * SCALE,
    cz: z * SCALE,
    dx,
    dy,
    dz,
    invAlong: 1 / (along * SCALE),
    invAcross: 1 / (across * SCALE),
    minRadius: Math.min(along, across) * SCALE,
    flare,
  };
});

// Union lisse polynomiale : fusionne deux volumes en creusant le raccord
function smoothMin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// Distance signée (approchée) à la sculpture : négative à l'intérieur
export function sculptureDistance(px: number, py: number, pz: number): number {
  // Légère torsion du domaine : casse la régularité des ellipsoïdes
  const x = px + 0.035 * Math.sin(3.1 * py + 1.3) + 0.02 * Math.sin(5.7 * pz);
  const y = py + 0.035 * Math.sin(2.7 * pz + 0.4) + 0.02 * Math.sin(6.1 * px);
  const z = pz + 0.035 * Math.sin(3.3 * px + 2.1) + 0.02 * Math.sin(5.3 * py);

  let distance = Infinity;
  for (const lobe of PREPARED) {
    const rx = x - lobe.cx;
    const ry = y - lobe.cy;
    const rz = z - lobe.cz;
    const along = rx * lobe.dx + ry * lobe.dy + rz * lobe.dz;
    const ax = rx - along * lobe.dx;
    const ay = ry - along * lobe.dy;
    const az = rz - along * lobe.dz;
    const a = along * lobe.invAlong;
    // Largeur variable le long de la goutte : base fine, pointe renflée
    const width = 1 + lobe.flare * Math.min(Math.max(a, -1), 1);
    const b =
      (Math.sqrt(ax * ax + ay * ay + az * az) * lobe.invAcross) / width;
    const lobeDistance = (Math.sqrt(a * a + b * b) - 1) * lobe.minRadius;
    distance =
      distance === Infinity
        ? lobeDistance
        : smoothMin(distance, lobeDistance, BLEND);
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
  return geometry;
}
