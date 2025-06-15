import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BandNavigationService } from '../../services/band-navigation.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  isDesktopNav = false;
  currentRoute = '';

  constructor(private bandNav: BandNavigationService, private router: Router) {}

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url.split('?')[0];
    });
    this.currentRoute = this.router.url.split('?')[0];
  }

  checkScreen() {
    this.isDesktopNav = window.innerWidth >= 1024;
  }

  goToBand(route: string) {
    this.bandNav.goToBand(route);
  }
}
