import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MenuComponent, AnimateBandComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {}
