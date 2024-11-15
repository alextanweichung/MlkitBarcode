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

   async showLoading(message: string = "Loading your data", backdropDismiss: boolean = true) {
      const safeMessage = `
        <div class="loading-message-wrapper">
          <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
          <div class="text-content">
            <p class="loading-message">${message}</p>
            <span class="loading-note">Please be patient.</span>
          </div>
        </div>`;
    
      if (!this.isShowing && (this.loading === undefined || this.loading === null)) {
        this.isShowing = true;
        this.loading = await this.loadingController.create({
          cssClass: "custom-loading",
          message: safeMessage, // Custom HTML message
          spinner: null, // Disable default spinner
          backdropDismiss: backdropDismiss,
        });
        await this.loading.present();
      } else {
        this.isShowing = true;
        this.loading = null;
        this.loading = await this.loadingController.create({
          cssClass: "custom-loading",
          message: safeMessage, // Custom HTML message
          spinner: null, // Disable default spinner
          backdropDismiss: backdropDismiss,
        });
        await this.loading.present();
      }
    }
    

   dismissLoading() {
      this.isShowing = false;
      this.loading?.dismiss();
   }

}
