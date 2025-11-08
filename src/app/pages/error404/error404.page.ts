import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [CommonModule, IonicModule, LottieComponent],
  templateUrl: './error404.page.html',
  styleUrls: ['./error404.page.scss']
})
export class Error404Page {
  constructor(private router: Router) {}

  volverInicio() {
    this.router.navigate(['/login']);
  }
}
