import { NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, inject } from '@angular/core';
import emailjs from 'emailjs-com';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ContactData } from '../../types/contact-data.type';

type NotificationType = 'success' | 'error';

@Component({
  selector: 'app-contact-form',
  imports: [NgClass, NgIf, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  templateId: string = 'template_rjkvt2d';
  serviceId: string = 'service_zkwjgre';
  publicKey: string = 'qD_atInEL6hAV19gW';

  // Au moins un caractère autre qu'un espace (refuse les champs « vides »)
  readonly notBlank = '[\\s\\S]*\\S[\\s\\S]*';
  // nom@domaine.ext : pas d'espace, un seul @, un point dans le domaine
  readonly emailPattern = '[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}';

  notification: {
    type: NotificationType;
    message: string;
    active?: boolean;
    leaving?: boolean;
  } | null = null;
  // Texte lu par les lecteurs d'écran (zone role="status" du template)
  announcement = '';
  sending = false;
  honeypot = '';

  formData: ContactData = {
    name: '',
    surname: '',
    phone: '',
    email: '',
    msg: '',
  };

  private timers: ReturnType<typeof setTimeout>[] = [];

  /** Erreur affichée une fois le champ quitté ou après une tentative d'envoi */
  showError(control: NgModel, form: NgForm): boolean {
    return !!control.invalid && (!!control.touched || form.submitted);
  }

  sendEmail(event: Event, formular: NgForm) {
    event.preventDefault();
    if (this.sending) return; // pas de double envoi

    if (formular.invalid) {
      this.showNotification(
        'error',
        'Merci de corriger les champs indiqués.'
      );
      this.focusFirstInvalid();
      return;
    }

    // Piège anti-robots rempli : on fait comme si tout allait bien, sans envoyer
    if (this.honeypot) {
      this.onSuccess(formular);
      return;
    }

    const form = event.target as HTMLFormElement;
    this.sending = true;
    emailjs
      .sendForm(this.serviceId, this.templateId, form, this.publicKey)
      .then(
        () => this.onSuccess(formular),
        () =>
          this.showNotification(
            'error',
            'Un problème est survenu, veuillez essayer ultérieurement.'
          )
      )
      .finally(() => (this.sending = false));
  }

  showNotification(type: NotificationType, message: string) {
    // Une nouvelle notification remplace la précédente et ses minuteries
    this.clearTimers();
    this.notification = { type, message, active: true, leaving: false };
    this.announcement = message;
    // Les erreurs restent un peu plus longtemps pour laisser le temps de lire
    const visibleMs = type === 'error' ? 4000 : 2000;
    this.timers.push(
      setTimeout(() => {
        if (this.notification) this.notification.leaving = true;
        this.timers.push(
          setTimeout(() => {
            this.notification = null;
          }, 500)
        );
      }, visibleMs)
    );
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private onSuccess(formular: NgForm) {
    this.showNotification('success', 'Message bien envoyé !');
    // Vide les champs et efface l'état « soumis » (pas d'erreurs affichées)
    formular.resetForm({
      name: '',
      surname: '',
      phone: '',
      email: '',
      msg: '',
      website: '',
    });
  }

  private focusFirstInvalid() {
    const field = this.host.nativeElement.querySelector<HTMLElement>(
      '.contact-form .ng-invalid:not(form)'
    );
    field?.focus();
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
