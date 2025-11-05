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
  private gifDuration = 4700;

  ngOnInit() {
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
