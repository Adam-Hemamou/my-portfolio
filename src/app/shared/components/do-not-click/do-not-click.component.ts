import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DoNotClickService } from '../../services/do-not-click.service';

type Step = 'closed' | 'confirm' | 'captcha' | 'done' | 'final';

type Confirmation = {
  title: string;
  text?: string;
  no: string;
  yes: string;
  // Le bouton « non » a l'air désactivé et disparaît au clic au lieu de fermer
  noVanishes?: boolean;
};

type CaptchaStep = {
  // Consigne : « {prompt} {target}. »
  prompt: string;
  target: string;
  folder: string;
  images: string[];
  correctImages: string[];
  // Message de réussite imposé (sinon tiré au hasard)
  successMessage?: string;
  // Images affichées dans l’ordre du tableau (1 2 3 / 4 5 6 / 7 8 9), sans mélange
  fixedOrder?: boolean;
};

type Tile = {
  file: string;
  src: string;
  selected: boolean;
};

const CAPTCHA_ROOT = '/capcha';
// Photo affichée à la fin du gag de la croix : déposer le fichier à cet emplacement
const FINAL_PHOTO = `${CAPTCHA_ROOT}/final.png`;

const CROSS_SIZE = 40;
const CROSS_MARGIN = 8;

const INCENDIE_IMAGES = [
  '21891-15805441.jpg',
  'Borne-incendie-DECI-article-aquagir.jpg',
  'bouche-a-incendie-americaine-deco-americaine_2-.webp',
  'fire-hy-4-1.jpg',
  'images.jpg',
  'poteau-incendie.jpg',
  'poteaux-bouches-incendies-paris-75-yonne-89.jpg',
  'shutterstock_1079566439-1.jpg',
  'shutterstock_26484661-1.jpg',
];

const SPLIT_IMAGES = Array.from(
  { length: 9 },
  (_, i) => `split_image_${i + 1}.jpg`,
);

@Component({
  selector: 'app-do-not-click',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './do-not-click.component.html',
  styleUrls: ['./do-not-click.component.scss'],
})
export class DoNotClickComponent implements AfterViewChecked {
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;
  @ViewChild('popup') private popup?: ElementRef<HTMLElement>;
  @ViewChild('cross') private cross?: ElementRef<HTMLButtonElement>;
  @ViewChild('yes') private yes?: ElementRef<HTMLButtonElement>;

  step: Step = 'closed';
  confirmStep = 0;
  noGone = false;
  captchaStep = 0;
  tiles: Tile[] = [];
  result: 'idle' | 'wrong' | 'correct' = 'idle';
  feedback = '';

  // Croix : position fixe dans la fenêtre après la première esquive
  crossPosition: { left: number; top: number } | null = null;
  crossMessage: string[] | null = null;
  private crossClicks = 0;

  finalPhoto = FINAL_PHOTO;
  finalPhotoMissing = false;

  private focusTarget: 'panel' | 'popup' | 'cross' | 'yes' | null = null;
  // Élément à refocaliser à la fermeture (bouton desktop ou entrée du menu mobile)
  private opener: HTMLElement | null = null;

  constructor() {
    inject(DoNotClickService)
      .openRequested$.pipe(takeUntilDestroyed())
      .subscribe(() => this.open());
  }

  readonly confirmations: Confirmation[] = [
    { title: 'Êtes-vous sûr ?', no: 'NON', yes: 'OUI' },
    { title: 'Vraiment sûr ?', no: 'NON', yes: 'OUI' },
    {
      title: 'Dernière chance.',
      text: 'Cette décision pourrait avoir des conséquences absolument disproportionnées.',
      no: 'ANNULER',
      yes: "J'ASSUME",
      noVanishes: true,
    },
  ];

  readonly captchaSteps: CaptchaStep[] = [
    {
      prompt: 'Sélectionnez toutes les images contenant',
      target: 'une orange',
      folder: 'orange',
      images: [
        'couleur.webp',
        'feu-orange.jpg',
        'jus.jpg',
        'orage.jpg',
        'orange.jpg',
        'Orange2.png',
        'pamplemousse.jpg',
        'range.png',
        'serie.jpg',
      ],
      correctImages: ['couleur.webp', 'orange.jpg', 'Orange2.png'],
    },
    {
      prompt: 'Sélectionnez toutes',
      target: 'les bouches à incendie',
      folder: 'incendie',
      images: INCENDIE_IMAGES,
      correctImages: INCENDIE_IMAGES,
    },
    {
      prompt: 'Trouvez',
      target: 'Charly',
      folder: 'charly',
      images: SPLIT_IMAGES,
      correctImages: ['split_image_5.jpg'],
      fixedOrder: true,
      successMessage: "CELLE-LÀ C'EST CHAUD.",
    },
    {
      prompt: 'Sélectionnez toutes les images contenant',
      target: 'un bouton',
      folder: 'bouton',
      images: [
        '515bb8ffc56cfcb5b6575c7a690d236d.jpg',
        'acné.jpg',
        'bouton.avif',
        'bouton-rond.jpg',
        'button-web.jpg',
        'ChatGPT Image 8 oct. 2026, 19_48_52.png',
        'Croutons-a-lail-facile.jpg',
        'mouton.webp',
        'on-off.jpg',
      ],
      correctImages: [
        'bouton-rond.jpg',
        'bouton.avif',
        'button-web.jpg',
        'on-off.jpg',
        'acné.jpg',
      ],
    },
    {
      prompt: 'Sélectionnez toutes les images contenant',
      target: 'un escalier',
      folder: 'escalier',
      images: SPLIT_IMAGES,
      correctImages: SPLIT_IMAGES,
      fixedOrder: true,
    },
  ];

  private readonly wrongMessages = [
    'Non. Mais belle tentative.',
    'Presque. Tes yeux te jouent des tours.',
    'Raté. Le CAPTCHA te juge.',
    'Tu pensais vraiment que ça passerait ?',
  ];

  private readonly correctMessages = [
    'Correct. Suspect, mais correct.',
    'Exact. Ça reste louche.',
    'Validé. Pour l’instant.',
  ];

  // Images de chaque épreuve, préparées (et mélangées sauf ordre fixe) à chaque ouverture
  private shuffled: Tile[][] = [];

  get confirmation(): Confirmation {
    return this.confirmations[this.confirmStep];
  }

  get captcha(): CaptchaStep {
    return this.captchaSteps[this.captchaStep];
  }

  ngAfterViewChecked() {
    if (!this.focusTarget) return;
    const target = {
      panel: this.panel,
      popup: this.popup,
      cross: this.cross,
      yes: this.yes,
    }[this.focusTarget];
    if (target) {
      this.focusTarget = null;
      target.nativeElement.focus();
    }
  }

  open() {
    this.opener = document.activeElement as HTMLElement | null;
    this.confirmStep = 0;
    this.noGone = false;
    this.goTo('confirm');
  }

  close() {
    this.step = 'closed';
    this.crossMessage = null;
    const opener =
      this.opener && this.opener !== document.body
        ? this.opener
        : this.trigger?.nativeElement;
    opener?.focus();
  }

  // Bouton « non » des confirmations
  decline() {
    if (this.confirmation.noVanishes) {
      this.noGone = true;
      this.focusTarget = 'yes';
      return;
    }
    this.close();
  }

  confirm() {
    if (this.confirmStep < this.confirmations.length - 1) {
      this.confirmStep++;
      this.focusTarget = 'panel';
      return;
    }
    this.startCaptcha();
  }

  toggle(tile: Tile) {
    if (this.result === 'correct') return;
    tile.selected = !tile.selected;
    if (this.result === 'wrong') {
      this.result = 'idle';
      this.feedback = '';
    }
  }

  validate() {
    const selected = this.tiles.filter((t) => t.selected).map((t) => t.file);
    const correct = this.captcha.correctImages;
    const isCorrect =
      selected.length === correct.length &&
      selected.every((file) => correct.includes(file));

    if (isCorrect) {
      this.result = 'correct';
      this.feedback =
        this.captcha.successMessage ?? this.pick(this.correctMessages);
      return;
    }
    // Mauvaise réponse : on efface la sélection pour recommencer l'épreuve
    this.result = 'wrong';
    this.feedback = this.pick(this.wrongMessages);
    this.tiles.forEach((tile) => (tile.selected = false));
  }

  next() {
    if (this.captchaStep === this.captchaSteps.length - 1) {
      this.goTo('done');
      return;
    }
    this.captchaStep++;
    this.loadStep();
    this.focusTarget = 'panel';
  }

  // La croix ne réagit qu'au clic (souris, tactile, Entrée ou Espace)
  onCrossClick() {
    this.crossClicks++;
    switch (this.crossClicks) {
      case 5:
        this.dodge();
        this.showCrossMessage(['BIEN ESSAYÉ.']);
        break;
      case 8:
        this.showCrossMessage(['LAISSE-MOI TRANQUILLE.', 'VA VOIR AILLEURS.']);
        break;
      case 10:
        this.showCrossMessage([
          'JE T’AI DIT AILLEURS.',
          'C’EST PAS MOI QUI GÈRE ÇA.',
        ]);
        break;
      case 11:
        this.finalPhotoMissing = false;
        this.goTo('final');
        break;
      default:
        this.dodge();
    }
  }

  closeCrossMessage() {
    this.crossMessage = null;
    this.focusTarget = 'cross';
  }

  onBackdropClick(event: MouseEvent) {
    if (
      event.target === event.currentTarget &&
      (this.step === 'confirm' || this.step === 'done')
    ) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.crossMessage) {
        this.closeCrossMessage();
      } else {
        this.close();
      }
      return;
    }
    if (event.key !== 'Tab') return;

    // Garde le focus dans la fenêtre (ou dans le message de la croix)
    const root = (this.crossMessage ? this.popup : this.panel)?.nativeElement;
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !root.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  // Si la fenêtre est redimensionnée, la croix reste dans la zone visible
  @HostListener('window:resize')
  onResize() {
    if (this.crossPosition) {
      this.crossPosition = {
        left: Math.min(this.crossPosition.left, this.maxCrossLeft()),
        top: Math.min(this.crossPosition.top, this.maxCrossTop()),
      };
    }
  }

  private startCaptcha() {
    this.captchaStep = 0;
    this.crossClicks = 0;
    this.crossPosition = null;
    this.crossMessage = null;
    this.shuffled = this.captchaSteps.map((step) =>
      (step.fixedOrder ? step.images : this.shuffle(step.images)).map(
        (file) => ({
          file,
          // encodeURI : garde les virgules telles quelles (sinon fichier introuvable)
          src: `${CAPTCHA_ROOT}/${step.folder}/${encodeURI(file)}`,
          selected: false,
        }),
      ),
    );
    this.loadStep();
    this.goTo('captcha');
  }

  private loadStep() {
    this.tiles = this.shuffled[this.captchaStep];
    this.result = 'idle';
    this.feedback = '';
  }

  private showCrossMessage(lines: string[]) {
    this.crossMessage = lines;
    this.focusTarget = 'popup';
  }

  // Nouvelle position aléatoire, entièrement dans la fenêtre, loin de la
  // position actuelle et jamais sur « quitter » ni sur le bouton de validation
  private dodge() {
    const panel = this.panel?.nativeElement;
    const current = this.cross?.nativeElement.getBoundingClientRect();
    const protectedZones = Array.from(
      panel?.querySelectorAll('.dnc-quit, .dnc-validate') ?? [],
    ).map((el) => el.getBoundingClientRect());

    let candidate = { left: CROSS_MARGIN, top: CROSS_MARGIN };
    for (let attempt = 0; attempt < 30; attempt++) {
      candidate = {
        left: this.random(CROSS_MARGIN, this.maxCrossLeft()),
        top: this.random(CROSS_MARGIN, this.maxCrossTop()),
      };
      const farEnough =
        !current ||
        Math.hypot(candidate.left - current.left, candidate.top - current.top) >
          90;
      const overlapsProtected = protectedZones.some(
        (zone) =>
          candidate.left < zone.right + CROSS_MARGIN &&
          candidate.left + CROSS_SIZE > zone.left - CROSS_MARGIN &&
          candidate.top < zone.bottom + CROSS_MARGIN &&
          candidate.top + CROSS_SIZE > zone.top - CROSS_MARGIN,
      );
      if (farEnough && !overlapsProtected) break;
    }
    this.crossPosition = candidate;
  }

  private maxCrossLeft(): number {
    return Math.max(
      CROSS_MARGIN,
      document.documentElement.clientWidth - CROSS_SIZE - CROSS_MARGIN,
    );
  }

  private maxCrossTop(): number {
    return Math.max(
      CROSS_MARGIN,
      window.innerHeight - CROSS_SIZE - CROSS_MARGIN,
    );
  }

  private goTo(step: Step) {
    this.step = step;
    this.focusTarget = 'panel';
  }

  private random(min: number, max: number): number {
    return Math.round(min + Math.random() * (max - min));
  }

  private pick(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
