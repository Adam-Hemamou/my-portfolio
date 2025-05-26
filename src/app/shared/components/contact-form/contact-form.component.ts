import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-form',
  imports: [],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  email: string = import.meta.env['VITE_CONTACT_FORM_EMAIL'];
}
