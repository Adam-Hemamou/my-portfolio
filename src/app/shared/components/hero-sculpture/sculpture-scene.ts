import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { createBlobGeometry } from './blob-geometry';
import {
  applySculptureShaders,
  type SculptureUniforms,
} from './sculpture-shaders';

export type SculptureScene = {
  canvas: HTMLCanvasElement;
  // Taille CSS du cadre (fractionnaire) et taille exacte en pixels de l'écran
  resize(
    width: number,
    height: number,
    pixelWidth: number,
    pixelHeight: number,
  ): void;
  // Position du pointeur normalisée entre -1 et 1
  setPointer(x: number, y: number): void;
  // Avance l'animation de `delta` secondes puis dessine (0 = image fixe)
  render(delta: number): void;
  dispose(): void;
};

const COOL_WHITE = 0xdfe8ff;
const FOV = 26;
// Marge de cadrage autour de la masse : déformation du vertex shader comprise
const FIT_MARGIN = 0.1;
const BASE_TILT_X = 0.32;
const BASE_TILT_Y = -0.5;
const BASE_TILT_Z = -0.18;
// Lent balancement : la matière bouge, la sculpture ne tourne pas sur elle-même
const SWAY_SPEED = 0.11;
const SWAY_AMPLITUDE = 0.22;
const POINTER_EASING = 2.5;
const POINTER_TILT_X = 0.12;
const POINTER_TILT_Y = 0.22;
// Densité des courbes de niveau : au moins ~4,5 pixels physiques par ligne
// pour qu'elles restent nettes, quelle que soit la taille du canvas
const LINE_PERIOD_PX = 4.5;
const LINE_FREQUENCY_MIN = 24;
const LINE_FREQUENCY_MAX = 96;
// Densité maximale du canvas (pixels du canvas par pixel CSS). Sur ordinateur,
// 2 comme auparavant. Sur mobile, le cadre ne mesure qu'une centaine de pixels
// CSS : on suit l'écran jusqu'à 3 (iPhone, Android haut de gamme) pour éviter
// que le navigateur agrandisse un canvas trop petit, ce qui rendait le rendu
// flou. Un budget de pixels borne le coût sur les grandes tablettes.
const MAX_DENSITY = 2;
const MAX_DENSITY_LOW_POWER = 3;
const PIXEL_BUDGET_LOW_POWER = 1_200_000;

// Studio de réflexion généré en code (aucune image) pour un noir satiné : fond
// anthracite, plaques noires et bandes blanches d'intensité modérée.
function createEnvironment(renderer: WebGLRenderer): WebGLRenderTarget {
  const scene = new Scene();
  const box = new BoxGeometry(1, 1, 1);
  const materials: Material[] = [];

  const add = (
    color: number,
    intensity: number,
    position: [number, number, number],
    scale: [number, number, number],
    inside = false,
  ) => {
    const material = new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(intensity),
    });
    if (inside) material.side = BackSide;
    materials.push(material);
    const mesh = new Mesh(box, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    scene.add(mesh);
  };

  // Fond presque noir : la matière, métallique, le reflète tel quel, d'où
  // le noir profond des flancs et des creux
  add(0x14151a, 1, [0, 0, 0], [24, 24, 24], true);
  add(0x000000, 1, [0, -11, 0], [22, 0.5, 22]);
  // Grande plaque noire sur un côté : zones noires profondes
  add(0x000000, 1, [9, 2, 8], [0.5, 12, 10]);
  // Grand panneau lumineux au plafond, avancé vers l'observateur : reflets
  // blanc argenté sur le dessus de chaque lobe
  add(0xffffff, 4, [-1, 11, 4], [14, 0.5, 12]);
  // Panneau en haut à gauche : prolonge ces reflets sur les flancs tournés
  // vers la gauche
  add(0xffffff, 2.5, [-10, 7, 3], [0.5, 6, 10]);
  // Bandes plus nettes : reflets francs qui soulignent les arrondis
  add(0xffffff, 6, [-11, 4, 4], [0.5, 8, 3]);
  add(COOL_WHITE, 3, [11, -1, 1], [0.5, 1.2, 12]);
  add(0xffffff, 1.2, [3, 3, 11], [6, 4, 0.5]);
  // Deux spots : points de brillance sur les sommets
  add(0xffffff, 12, [-4, 8, 8], [1.6, 1.6, 0.5]);
  add(COOL_WHITE, 8, [7, 6, -6], [1.4, 1.4, 0.5]);

  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  box.dispose();
  materials.forEach((material) => material.dispose());
  return target;
}

// Lève une exception si WebGL est indisponible
export function createSculptureScene(
  container: HTMLElement,
  lowPower: boolean,
): SculptureScene {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: lowPower ? 'default' : 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const environment = createEnvironment(renderer);
  const scene = new Scene();
  scene.environment = environment.texture;

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

  const keyLight = new DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(3, 4, 5);
  const rimLight = new DirectionalLight(COOL_WHITE, 0.6);
  rimLight.position.set(-4, -1, 2);
  scene.add(keyLight, rimLight);

  // Grille plus fine sur ordinateur, plus légère sur mobile
  const geometry = createBlobGeometry(lowPower ? 64 : 96);
  const uniforms: SculptureUniforms = {
    uTime: { value: 0 },
    uLineFrequency: { value: LINE_FREQUENCY_MAX },
  };
  const material = new MeshStandardMaterial({
    // Noir brillant presque métallique : la couleur reste sombre là où la
    // matière reflète le studio noir, mais les panneaux lumineux s'y
    // reflètent en blanc argenté (contraste fort, comme du métal liquide)
    color: 0x7c8088,
    metalness: 0.9,
    roughness: 0.25,
  });
  applySculptureShaders(material, uniforms);

  const sway = new Group();
  sway.add(new Mesh(geometry, material));
  const tilt = new Group();
  tilt.rotation.set(BASE_TILT_X, BASE_TILT_Y, BASE_TILT_Z);
  tilt.add(sway);
  scene.add(tilt);

  const fitRadius = (geometry.boundingSphere?.radius ?? 0.85) + FIT_MARGIN;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let time = 0;

  return {
    canvas: renderer.domElement,

    resize(width, height, pixelWidth, pixelHeight) {
      // Le canvas est dimensionné en pixels de l'écran : affiché à sa taille
      // exacte, il n'est jamais rééchantillonné par le navigateur. On ne le
      // réduit qu'au-delà de la densité maximale ou du budget de pixels.
      const density = pixelWidth / width;
      const scale = Math.min(
        1,
        (lowPower ? MAX_DENSITY_LOW_POWER : MAX_DENSITY) / density,
        lowPower
          ? Math.sqrt(PIXEL_BUDGET_LOW_POWER / (pixelWidth * pixelHeight))
          : 1,
      );
      const bufferWidth = Math.max(1, Math.round(pixelWidth * scale));
      const bufferHeight = Math.max(1, Math.round(pixelHeight * scale));
      renderer.setDrawingBufferSize(bufferWidth, bufferHeight, 1);

      const aspect = width / height;
      const halfFov = Math.tan((FOV * Math.PI) / 360);
      // Pixels du canvas par unité de scène au niveau de la masse : la demi-
      // hauteur visible au centre vaut ~1,12 × le rayon de cadrage
      const pixelsPerUnit =
        Math.min(bufferWidth, bufferHeight) / (2 * fitRadius * (1 + halfFov / 2));
      uniforms.uLineFrequency.value = Math.min(
        Math.max(pixelsPerUnit / LINE_PERIOD_PX, LINE_FREQUENCY_MIN),
        LINE_FREQUENCY_MAX,
      );
      camera.aspect = aspect;
      // La sphère englobante tient dans le plus petit côté du cadre
      camera.position.z =
        fitRadius / (halfFov * Math.min(1, aspect)) + fitRadius * 0.5;
      camera.updateProjectionMatrix();
    },

    setPointer(x, y) {
      pointer.targetX = x;
      pointer.targetY = y;
    },

    render(delta) {
      time += delta;
      uniforms.uTime.value = time;
      const ease = 1 - Math.exp(-delta * POINTER_EASING);
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;

      sway.rotation.y = Math.sin(time * SWAY_SPEED) * SWAY_AMPLITUDE;
      sway.rotation.x = Math.sin(time * SWAY_SPEED * 0.7 + 1.3) * 0.08;
      tilt.rotation.x = BASE_TILT_X + pointer.y * POINTER_TILT_X;
      tilt.rotation.y = BASE_TILT_Y + pointer.x * POINTER_TILT_Y;

      renderer.render(scene, camera);
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
