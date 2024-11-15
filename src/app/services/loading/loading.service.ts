import { Injectable } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { CustomLoadingComponent } from '../../shared/pages/custom-loading-input/cusom-loading.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading: HTMLIonLoadingElement;
  isShowing: boolean = false;
  private loadingModal: HTMLIonModalElement | null = null; // Store modal instance

  constructor(
    public loadingController: LoadingController,
    public modalController: ModalController
  ) {}

  async showLoading(message: string = 'Loading') {
    // Check if a modal is already being shown
    if (this.loadingModal) {
      return;
    }

    // Create and present the modal
    this.loadingModal = await this.modalController.create({
      component: CustomLoadingComponent,
      componentProps: { message },
      cssClass: 'custom-loading-modal',
      backdropDismiss: false,
    });
    await this.loadingModal.present();
  }

  async dismissLoading() {
    // Dismiss the modal if it exists
    if (this.loadingModal) {
      this.isShowing = false;
      await this.loadingModal.dismiss();
      this.loadingModal = null; // Reset the reference
    }
  }
}
