import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  @Output() welcomeCompleted = new EventEmitter<void>();

  fadeOut = false;
  private gifDuration = 5500; // Durée de ton GIF

  ngOnInit() {
    // Navigation automatique après la durée du GIF
    setTimeout(() => {
      this.completeWelcome();
    }, this.gifDuration);
  }

  private completeWelcome() {
    this.fadeOut = true;
    setTimeout(() => {
      this.welcomeCompleted.emit();
    }, 500);
  }
}
