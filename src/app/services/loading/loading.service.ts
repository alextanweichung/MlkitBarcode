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

  async showLoading(message: string = '<p>Loading...</p><span>Please be patient.</span>') {
    this.loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: message,
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  async dismissLoading() {
    // at least show 1.5 second
    setTimeout(async () => {
      this.loading.dismiss();
    }, 1500);
  }

}
