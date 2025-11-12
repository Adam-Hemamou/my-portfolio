import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';
import { SEOService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    MenuComponent,
    AnimateBandComponent,
    ContactFormComponent,
    FooterComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  private seoService = inject(SEOService);

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Contact - Adam Hemamou | Développeur Freelance Disponible',
      description:
        'Contactez Adam Hemamou pour vos projets de développement web. Freelance spécialisé en Angular, React, Node.js. Réponse garantie sous 24h.',
      keywords:
        'contact développeur, freelance disponible, devis gratuit, projet web, Adam Hemamou',
      url: 'https://ton-domaine.com/contact',
    });
  }
}
