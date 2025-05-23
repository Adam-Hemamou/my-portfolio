import { Component } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MenuComponent, AnimateBandComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {}
