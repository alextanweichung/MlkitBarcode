import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading: HTMLIonLoadingElement;
  isShowing: boolean = false;

  constructor(
    public loadingController: LoadingController
  ) { }

  async showLoading(message: string = 'Loading') {
    this.loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: `<p>${message}...</p><span>Please be patient.</span>`,
      spinner: 'crescent',
      backdropDismiss: true
    });
    if (!this.isShowing) {
      this.isShowing = true;
      await this.loading.present();
    }
  }

  async dismissLoading() {
    this.loading?.dismiss();
    this.isShowing = false;
  }

}
