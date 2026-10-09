import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BandNavigationService } from '../../services/band-navigation.service';
import { DoNotClickService } from '../../services/do-not-click.service';
import { DoNotClickTriggerComponent } from '../do-not-click/do-not-click-trigger.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DoNotClickTriggerComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  isOpen = false;
  isDesktopNav = window.innerWidth >= 1024;

  menuItems = [
    { label: 'Accueil', link: '/' },
    { label: 'À propos', link: '/about' },
    { label: 'Projets', link: '/project' },
    { label: 'Contact', link: '/contact' },
  ];

  constructor(
    private bandNav: BandNavigationService,
    private doNotClick: DoNotClickService
  ) {
    window.addEventListener('resize', () => {
      this.isDesktopNav = window.innerWidth >= 1024;
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  openDoNotClick() {
    this.closeMenu();
    this.doNotClick.open();
  }

  onMenuItemClick() {
    this.bandNav.goToBand('');
  }
}
