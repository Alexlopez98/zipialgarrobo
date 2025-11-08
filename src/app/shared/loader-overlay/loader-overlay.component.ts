import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './loader-overlay.component.html',
  styleUrls: ['./loader-overlay.component.scss']
})
export class LoaderOverlayComponent {
  @Input() visible = false;
  @Input() message = 'Cargando...';
}
