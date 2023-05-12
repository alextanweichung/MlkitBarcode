import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    public toastController: ToastController
  ) {
  }

  async presentToast(header: string, message: string, position: any, color: string, duration: number, showSearchResult: boolean = false, icon?: string) {
    if (!icon) {
      switch (color) {
        case 'success':
          icon = 'checkmark-outline';
          break;
        case 'medium':
        case 'warning':
          icon = 'information-circle-outline';
          break;
        case 'danger':
          icon = 'warning-outline';
          break;
      }
    }
    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: duration,
      position: position,
      color: color,
      icon: icon,
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => { toast.dismiss(); }
        }
      ]
    });
    if (!showSearchResult && header === 'Search Complete') {
      
    } else {
      await toast.present();
    }
  }
}