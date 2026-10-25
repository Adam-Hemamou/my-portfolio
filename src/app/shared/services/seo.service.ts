import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SEOData } from '../types/seo.type';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  updateSEO(data: SEOData) {
    // Title
    this.titleService.setTitle(data.title);

    // Description
    this.metaService.updateTag({
      name: 'description',
      content: data.description,
    });

    // Indexation : remise à « index, follow » sur chaque page, sauf demande
    // contraire (page 404)
    this.metaService.updateTag({
      name: 'robots',
      content: data.robots ?? 'index, follow',
    });

    // Canonical URL (retirée si la page n'en a pas, comme la 404)
    if (data.url) {
      this.updateCanonical(data.url);
    } else {
      this.document.head
        .querySelector('link[rel="canonical"]')
        ?.remove();
    }

    // Open Graph (pour partages)
    this.metaService.updateTag({
      property: 'og:title',
      content: data.title,
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: data.description,
    });

    if (data.url) {
      this.metaService.updateTag({
        property: 'og:url',
        content: data.url,
      });
    }

    // Twitter Cards
    this.metaService.updateTag({
      name: 'twitter:title',
      content: data.title,
    });

    this.metaService.updateTag({
      name: 'twitter:description',
      content: data.description,
    });
  }

  private updateCanonical(url: string) {
    let link = this.document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
