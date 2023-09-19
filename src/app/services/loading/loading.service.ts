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
    if (!this.isShowing && (this.loading === undefined || this.loading === null)) {
      this.isShowing = true;
      this.loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: `<p>${message}...</p><span>Please be patient.</span>`,
        spinner: 'crescent',
        backdropDismiss: true 
      });
      await this.loading.present();
    } else {
      // If loader is showing, only change text, won't create a new loader.
      this.isShowing = true;
      if (this.loading) {
        this.loading.message = `<p>${message}...</p><span>Please be patient.</span>`;
      }
    }
  }

  dismissLoading() {    
    this.isShowing = false;
    this.loading?.dismiss();
  }

}
