import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import emailjs from 'emailjs-com';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactData } from '../../types/contact-data.type';

@Component({
  selector: 'app-contact-form',
  imports: [NgClass, NgIf, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  templateId: string = import.meta.env['VITE_EMAIL_JS_TEMPLATE_ID'];
  serviceId: string = import.meta.env['VITE_EMAIL_JS_SERVICE_ID'];
  publicKey: string = import.meta.env['VITE_EMAIL_JS_PUBLIC_KEY'];
  notification: {
    type: 'success' | 'error';
    message: string;
    active?: boolean;
    leaving?: boolean;
  } | null = null;

  formData: ContactData = {
    name: '',
    surname: '',
    phone: '',
    email: '',
    msg: '',
  };

  sendEmail(event: Event, formular: NgForm) {
    event.preventDefault();
    if (formular.invalid) {
      this.showNotification(
        'error',
        'Merci de remplir tous les champs obligatoires.'
      );
      return;
    }
    const form = event.target as HTMLFormElement;
    emailjs
      .sendForm(this.serviceId, this.templateId, form, this.publicKey)
      .then(
        () => {
          this.showNotification('success', 'Message bien envoyé !');
          form.reset();
        },
        () => {
          this.showNotification(
            'error',
            'Un problème est survenu, veuillez essayer ultérieurement.'
          );
        }
      );
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { type, message, active: true, leaving: false };
    setTimeout(() => {
      if (this.notification) this.notification.leaving = true;
      setTimeout(() => {
        this.notification = null;
      }, 500);
    }, 2000);
  }
}
