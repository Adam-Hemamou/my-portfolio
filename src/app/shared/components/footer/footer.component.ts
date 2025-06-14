import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  constructor(private bandNav: BandNavigationService) {}

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
  }

  checkScreen() {
    this.isDesktopNav = window.innerWidth >= 1024;
  }

  goToBand(route: string) {
    this.bandNav.goToBand(route);
  }
}
