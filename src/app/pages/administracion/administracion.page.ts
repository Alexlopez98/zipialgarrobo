import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.page.html',
  styleUrls: ['./administracion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdministracionPage implements OnInit {

  constructor() {
    addIcons({ addCircleOutline, trashOutline, arrowBackOutline });
  }

  ngOnInit() {
  }

}