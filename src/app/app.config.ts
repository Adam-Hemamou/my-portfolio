import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { ProjectService } from './shared/services/project.service';
import {
  provideFileRouter,
  requestContextInterceptor,
  withExtraRoutes,
} from '@analogjs/router';
import { CanMatchFn, Routes } from '@angular/router';
import HomeComponent from './pages/index.page';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ProjectListComponent } from './pages/projects/project-list/project-list.component';
import { ProjectDetailsComponent } from './pages/projects/project-details/project-details.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// /project/:id ne correspond qu'aux projets existants
const projectExists: CanMatchFn = (_route, segments) =>
  !!inject(ProjectService).getProjectById(segments[1]?.path ?? '');

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'project',
    component: ProjectListComponent,
  },
  {
    path: 'project/:id',
    component: ProjectDetailsComponent,
    // Identifiant inconnu : la route ne correspond pas, le routeur passe à
    // « ** » et affiche la page 404 (au lieu d'une page projet vide)
    canMatch: [projectExists],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(withExtraRoutes(routes)),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestContextInterceptor])
    ),
    provideAnimations(),
  ],
};
