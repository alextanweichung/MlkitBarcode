import { Component } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private navController: NavController
  ) {}

  // Select action
  async selectAction() {

    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Quotation',
          icon: 'wallet',
          handler: () => {
            let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
            if (salesAgentId === 0 || salesAgentId === undefined) {
              this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1500);
            } else {
              this.navController.navigateForward('/transactions/quotation/quotation-customer');
            }
          }
        },
        {
          text: 'Add Sales Order',
          icon: 'swap-horizontal-outline',
          handler: () => {
            let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
            if (salesAgentId === 0 || salesAgentId === undefined) {
              this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1500);
            } else {
              this.navController.navigateForward('/transactions/sales-order/sales-order-customer');
            }
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }]
    });
    await actionSheet.present();
  }
}
