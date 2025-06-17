import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init();
registerSwiperElements();
bootstrapApplication(AppComponent, appConfig);
