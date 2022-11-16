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
              this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1000);
            } else {
              this.navController.navigateForward('/transactions/quotation/quotation-header');
            }
          }
        },
        {
          text: 'Add Sales Order',
          icon: 'swap-horizontal-outline',
          handler: () => {
            let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
            if (salesAgentId === 0 || salesAgentId === undefined) {
              this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1000);
            } else {
              this.navController.navigateForward('/transactions/sales-order/sales-order-customer');
            }
          }
        },
        {
          text: 'Add Picking',
          icon: 'swap-vertical-outline',
          handler: () => {
            let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
            if (warehouseAgentId === 0 || warehouseAgentId === undefined) {
              this.toastService.presentToast('Error', 'Warehouse Agent not set', 'bottom', 'danger', 1000);
            } else {
              this.navController.navigateForward('/transactions/picking/picking-sales-order');
            }
          }
        },
        {
          text: 'Add Packing',
          icon: 'swap-vertical-outline',
          handler: () => {
            let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
            if (warehouseAgentId === 0 || warehouseAgentId === undefined) {
              this.toastService.presentToast('Error', 'Warehouse Agent not set', 'bottom', 'danger', 1000);
            } else {
              this.navController.navigateForward('/transactions/packing/packing-sales-order');
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
