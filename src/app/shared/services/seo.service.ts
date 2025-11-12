import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SEOData } from '../types/seo.type';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  updateSEO(data: SEOData) {
    // Title
    this.titleService.setTitle(data.title);

    // Description
    this.metaService.updateTag({
      name: 'description',
      content: data.description,
    });

    // Canonical URL
    if (data.url) {
      this.metaService.updateTag({
        rel: 'canonical',
        href: data.url,
      });
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
}
