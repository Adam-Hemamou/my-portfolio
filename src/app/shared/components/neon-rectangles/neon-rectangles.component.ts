import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

// Compositions reprises à l'identique des anciens SVG statiques
// (carre-noneon.svg et carre-blck-noneom.svg) : [x, y, largeur, hauteur]
type RectData = [number, number, number, number];

type Composition = {
  width: number;
  height: number;
  strokeOpacity: number;
  rects: RectData[];
  // Rectangles parcourus par une bande lumineuse, par ordre de priorité.
  // reverse : sens anti-horaire.
  bands: { rect: number; reverse?: boolean }[];
};

const COMPOSITIONS = {
  // Pages Projets et Contact
  tall: {
    width: 605,
    height: 712,
    strokeOpacity: 1,
    rects: [
      [53.5, 368.5, 342, 316],
      [20.5, 367.5, 342, 318],
      [23.5, 8.5, 342, 317],
      [0.5, 238.5, 272, 301],
      [142.5, 395.5, 342, 316],
      [252.5, 338.5, 342, 315],
      [102.5, 0.5, 342, 318],
      [191.5, 44.5, 343, 319],
      [262.5, 98.5, 342, 318],
    ],
    bands: [
      { rect: 2 },
      { rect: 5, reverse: true },
      { rect: 3 },
      { rect: 7, reverse: true },
      { rect: 4 },
    ],
  },
  // Page de détail d'un projet
  wide: {
    width: 545,
    height: 398,
    strokeOpacity: 0.8,
    rects: [
      [123.5, 96.5, 267, 157],
      [40.5, 10.5, 267, 158],
      [15.5, 101.5, 265, 157],
      [183.5, 129.5, 266, 157],
      [248.5, 80.5, 266, 157],
      [123.5, 143.5, 267, 235],
      [10.5, 0.5, 267, 236],
      [0.5, 151.5, 265, 234],
      [193.5, 162.5, 266, 235],
      [278.5, 119.5, 266, 235],
    ],
    bands: [
      { rect: 1 },
      { rect: 9, reverse: true },
      { rect: 7 },
      { rect: 4, reverse: true },
      { rect: 5 },
    ],
  },
} satisfies Record<string, Composition>;

// Cadres autour de la photo de la page À propos : reprend exactement les deux
// anciens pseudo-éléments CSS (bordure de 1,5 px, le second décalé de 16 px).
// Leur taille dépend du conteneur, d'où un calcul à partir de sa mesure.
const PHOTO_OFFSET = 16;
const PHOTO_BORDER = 1.5;
function photoFrame(width: number, height: number): Composition {
  const edge = PHOTO_BORDER / 2; // le trait est centré sur le bord du rectangle
  const w = width - PHOTO_BORDER;
  const h = height - PHOTO_BORDER;
  return {
    width,
    height,
    strokeOpacity: 1,
    rects: [
      [edge, edge, w, h],
      [PHOTO_OFFSET + edge, PHOTO_OFFSET + edge, w, h],
    ],
    bands: [{ rect: 0 }, { rect: 1, reverse: true }],
  };
}

export type NeonComposition = keyof typeof COMPOSITIONS | 'photo';

// Apparence des contours selon la composition et le fond
type Look = {
  stroke: string;
  strokeWidth: number | null; // null : épaisseur par défaut (1)
  edgeClass: string; // lueur et écho décalé des contours
  unit: number; // échelle des bandes, en unités du viewBox
  lapReference: number; // périmètre parcouru en 9 à 15,5 s
  lapSpeed: number; // accélération des bandes (1 = rythme d'origine)
};

// Palier d'une couche : un tracé pointillé du contour, un seul tiret visible
type BandStep = { style: string; opacity: number };

// Couche de la bande (halo flou, cœur, cœur chaud) : paliers superposés
type BandLayer = { width: number; color: string; opacity: number; steps: BandStep[] };

type RectView = {
  x: number;
  y: number;
  width: number;
  height: number;
  style: string;
  // style : l'unique animation de la bande, dont héritent tous ses tracés
  band?: { d: string; style: string; halo: BandLayer; core: BandLayer; hot: BandLayer };
};

let nextId = 0;

// Générateur pseudo-aléatoire déterministe : même rendu au serveur et au
// navigateur, et d'un chargement à l'autre.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number, digits = 3) => +value.toFixed(digits);

const LIME = '#bff000';
const HOT = '#f6ffd2'; // cœur presque blanc-jaune
const HOT_ON_LIGHT = '#a8d600'; // cœur vert citron soutenu, lisible sur blanc
const BLACK_EDGE = '#3a3a3a'; // néon noir : bords et halo gris anthracite
const BLACK_HOT = '#050505'; // néon noir : cœur presque noir
const ECHO = '#2a2a2a'; // fond clair : cadres d'ombre gris anthracite

// Une bande = trois couches (halo flou, cœur, cœur chaud) qui suivent le
// contour d'un trait continu. Chaque couche est faite de paliers : des tirets
// centrés au même point, de plus en plus courts, très rapprochés (quelques %
// chacun, invisibles à l'œil), qui reproduisent le profil cos(πu/2)^p
// (u : 0 au centre, 1 aux extrémités). Peints du plus long au plus court,
// d'opacité 1/(n - i) : la luminosité couverte par k paliers vaut k/n.
function profileSteps(count: number, power: number) {
  return Array.from({ length: count }, (_, i) => ({
    part: (2 / Math.PI) * Math.acos(Math.pow((i + 0.5) / count, 1 / power)),
    opacity: round(1 / (count - i), 4),
  }));
}
const SOFT_STEPS = profileSteps(16, 1); // cœur : dégradé ample
const HALO_STEPS = profileSteps(10, 1); // halo : même profil, le flou lisse les paliers
const HOT_STEPS = profileSteps(12, 4); // cœur chaud : resserré au centre

// Contour fermé qui commence au milieu du côté haut : quand la bande passe
// par le début du tracé, elle se raccorde sur une ligne droite, jamais dans
// un angle (un <rect> commence au coin haut-gauche, où la bande serait
// coupée en deux morceaux sans jonction d'angle).
function outline(x: number, y: number, width: number, height: number) {
  const r = (v: number) => round(v, 2);
  return (
    `M${r(x + width / 2)} ${r(y)}H${r(x + width)}V${r(y + height)}` +
    `H${r(x)}V${r(y)}Z`
  );
}

@Component({
  selector: 'app-neon-rectangles',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './neon-rectangles.component.html',
  styleUrls: ['./neon-rectangles.component.scss'],
})
export class NeonRectanglesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() composition: NeonComposition = 'tall';
  // Multiplicateur de vitesse (1 = rythme par défaut, 0,5 = deux fois plus lent)
  @Input() speed = 1;
  // Amplitude des mouvements (1 = par défaut, 0 = immobile)
  @Input() amplitude = 1;
  // Nombre de bandes lumineuses (0 à 5)
  @Input() bands = 4;
  // Texte alternatif ; sans texte, la composition est purement décorative
  @Input() label = '';
  // dark : néon sur fond noir. light : contours foncés et accents vert
  // citron, pour un fond blanc.
  @Input() theme: 'dark' | 'light' = 'dark';
  // Couleur des bandes lumineuses : lime (par défaut) ou néon noir
  @Input() bandTone: 'lime' | 'black' = 'lime';

  // Amplitude nulle : rectangles fixes, seules les bandes circulent
  @HostBinding('class.is-still') get still() {
    return this.amplitude <= 0;
  }

  private host: HTMLElement = inject(ElementRef).nativeElement;
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private cdr = inject(ChangeDetectorRef);
  private size = { width: 0, height: 0 };

  private readonly id = nextId++;
  readonly haloFilter = `neon-band-halo-${this.id}`;
  viewBox = '';
  strokeOpacity = 1;
  edgeStroke = '#BFF000';
  strokeWidth: number | null = null;
  edgeClass = 'neon-svg';
  echoStroke: string | null = null; // cadres d'ombre (fond clair)
  rects: RectView[] = [];
  banded: RectView[] = [];
  haloBlur = 1;

  ngOnChanges() {
    this.build();
  }

  ngOnInit() {
    if (!this.rects.length) this.build();
    if (this.composition === 'photo' && typeof ResizeObserver !== 'undefined') {
      // Les cadres suivent la taille du conteneur (elle change selon l'écran)
      this.resizeObserver = new ResizeObserver(([entry]) => {
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        if (width === this.size.width && height === this.size.height) return;
        this.size = { width, height };
        this.build();
        this.cdr.detectChanges();
      });
      this.resizeObserver.observe(this.host);
    }
    if (typeof IntersectionObserver === 'undefined') return;
    // Animation suspendue hors écran pour ne pas consommer de CPU
    this.observer = new IntersectionObserver(([entry]) => {
      this.host.classList.toggle('is-paused', !entry.isIntersecting);
    });
    this.observer.observe(this.host);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
  }

  private build() {
    const photo = this.composition === 'photo';
    if (photo && (this.size.width < 40 || this.size.height < 40)) {
      // Pas encore mesuré (rendu serveur) ou conteneur masqué
      this.rects = [];
      this.banded = [];
      return;
    }
    const comp: Composition = photo
      ? photoFrame(this.size.width, this.size.height)
      : (COMPOSITIONS[this.composition as keyof typeof COMPOSITIONS] ?? COMPOSITIONS.tall);
    const light = this.theme === 'light';
    const look: Look = {
      stroke: light ? '#151515' : photo ? '#c6ff1a' : '#BFF000',
      strokeWidth: photo ? PHOTO_BORDER : null,
      edgeClass: light ? 'nr-edges--light' : photo ? 'nr-edges--photo' : 'neon-svg',
      // Viewbox en pixels pour la photo : bandes à la même taille apparente
      // que sur les autres pages
      unit: photo ? 0.9 : comp.width / 600,
      lapReference: photo ? 830 : 1300,
      // Néon vert : bandes 35 % plus rapides, 38 % autour de la photo ;
      // néon noir : rythme inchangé
      lapSpeed: light ? 1 : photo ? 1.38 : 1.35,
    };
    // Néon noir : bords gris anthracite, cœur presque noir
    const black = this.bandTone === 'black';
    const base = black ? BLACK_EDGE : LIME;
    // Sur fond blanc, un cœur blanc-jaune serait invisible : il reste vert
    const hot = black ? BLACK_HOT : light ? HOT_ON_LIGHT : HOT;
    // Sur blanc, un halo flou ferait des taches : il est plus discret, et le
    // cœur plus épais porte la couleur. Le halo noir, plus fumé, est un peu
    // plus présent pour rester perceptible.
    const glow = black ? 0.75 : light ? 0.45 : 1;
    const random = seeded(this.composition === 'wide' ? 7 : photo ? 11 : 3);
    const between = (min: number, max: number) => min + random() * (max - min);
    const speed = Math.max(0.05, this.speed);
    const amplitude = Math.min(2, Math.max(0, this.amplitude));
    const unit = look.unit;
    const seconds = (value: number) => `${round(value / speed, 2)}s`;
    // Départ à une phase différente pour chaque animation (délai négatif)
    const phase = (duration: number) => `-${round((random() * duration) / speed, 2)}s`;

    const count = Math.round(Math.min(comp.bands.length, Math.max(0, this.bands)));
    const banded = new Map(comp.bands.slice(0, count).map((b) => [b.rect, b]));

    this.viewBox = `0 0 ${comp.width} ${comp.height}`;
    this.strokeOpacity = comp.strokeOpacity;
    this.edgeStroke = look.stroke;
    this.strokeWidth = look.strokeWidth;
    this.edgeClass = look.edgeClass;
    this.echoStroke = light ? ECHO : null;
    // Photo : halo plus large et plus diffus pour que la lumière ressorte
    this.haloBlur = round((photo ? 7 : 5) * unit, 2);

    this.rects = comp.rects.map(([x, y, width, height], index) => {
      const driftX = between(14, 24);
      const driftY = between(12, 22);
      const sway = between(18, 30);
      // Une forme sur deux tourne très légèrement, les autres respirent en taille
      const rotate = index % 2 === 0 ? between(0.24, 0.66) : between(0, 0.18);
      const scale = index % 2 === 1 ? between(0.006, 0.013) : between(0, 0.004);

      const style = [
        `--nr-ax:${round(comp.width * between(0.0105, 0.024) * amplitude, 2)}px`,
        `--nr-ay:${round(comp.width * between(0.009, 0.021) * amplitude, 2)}px`,
        `--nr-rot:${round(rotate * amplitude)}deg`,
        `--nr-scale:${round(1 + scale * amplitude, 4)}`,
        `--nr-dx:${seconds(driftX)}`,
        `--nr-dx-delay:${phase(driftX * 2)}`,
        `--nr-dy:${seconds(driftY)}`,
        `--nr-dy-delay:${phase(driftY * 2)}`,
        `--nr-sw:${seconds(sway)}`,
        `--nr-sw-delay:${phase(sway * 2)}`,
      ].join(';');

      const view: RectView = { x, y, width, height, style };
      const spec = banded.get(index);
      if (spec) {
        const perimeter = 2 * (width + height);
        const length = perimeter * between(0.1, 0.16);
        const lap = (between(9, 15.5) * (perimeter / look.lapReference)) / look.lapSpeed;
        const center = between(0, perimeter);
        const timing = { duration: seconds(lap), delay: phase(lap) };
        // Le dégradé atténue les extrémités : tiret un peu plus long pour
        // garder la même longueur apparente qu'avant
        const span = length * 1.25;
        const layer = (
          steps: { part: number; opacity: number }[],
          strokeWidth: number,
          color: string,
          opacity: number,
        ): BandLayer => ({
          width: round(strokeWidth * unit, 2),
          color,
          opacity,
          steps: steps.map(({ part, opacity: stepOpacity }) => ({
            style: this.dash(span * part, center, perimeter),
            opacity: stepOpacity,
          })),
        });
        // Sens horaire : le décalage diminue d'un périmètre par tour
        const travel = spec.reverse ? -perimeter : perimeter;
        view.band = {
          d: outline(x, y, width, height),
          style: [
            `--nr-travel:${round(travel, 2)}px`,
            `--nr-lap:${timing.duration}`,
            `--nr-lap-delay:${timing.delay}`,
          ].join(';'),
          halo: layer(
            HALO_STEPS,
            photo ? 12 : black ? 10.5 : 9,
            base,
            photo ? 1 : round(0.85 * glow, 3),
          ),
          core: layer(SOFT_STEPS, photo ? 2.8 : light ? 3.2 : 2.4, base, 1),
          hot: layer(HOT_STEPS, light ? 2.4 : photo ? 1.8 : 1.6, hot, black || photo ? 1 : 0.95),
        };
      }
      return view;
    });
    this.banded = this.rects.filter((r) => r.band);
  }

  // Tiret de longueur `length` centré sur `center` au départ. Le motif a
  // pour période exacte le périmètre : un seul tiret visible, et décaler d'un
  // périmètre (--nr-travel, piloté par l'animation de la bande) boucle sans saut.
  private dash(length: number, center: number, perimeter: number): string {
    return [
      `stroke-dasharray:${round(length, 2)} ${round(perimeter - length, 2)}`,
      `--nr-from:${round(length / 2 - center, 2)}px`,
    ].join(';');
  }
}
