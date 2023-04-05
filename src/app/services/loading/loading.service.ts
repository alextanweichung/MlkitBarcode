import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading: HTMLIonLoadingElement;

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
    await this.loading.present();
  }

  async dismissLoading() {
    // at least show 1.5 second
    setTimeout(async () => {
      if (this.loading) {
        this.loading.dismiss();
      }
    }, 1500);
  }

}
