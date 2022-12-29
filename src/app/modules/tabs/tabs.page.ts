import { Component } from '@angular/core';
import { ActionSheetButton, ActionSheetController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';

const pageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';
const mobilePickingCode: string = 'MATRPI';
const mobilePackingCode: string = 'MATRPA';
const mobileConsignmentSalesCode: string = 'MATRCS';
const inventoryCountCode: string = 'MATRST';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  // showQuotation: boolean = false;
  // showSalesOrder: boolean = false;
  // showPicking: boolean = false;
  // showPacking: boolean = false;
  // showConsignmentSales: boolean = false;
  // showStockCount: boolean = false;

  constructor(
    private authService: AuthService,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private navController: NavController
  ) {
    // this.authService.menuModel$.subscribe(obj => {
    //   let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
    //   if (pageItems) {
    //     this.showQuotation = pageItems.findIndex(r => r.title === mobileQuotationCode) > -1;
    //     this.showSalesOrder = pageItems.findIndex(r => r.title === mobileSalesOrderCode) > -1;
    //     this.showPicking = pageItems.findIndex(r => r.title === mobilePickingCode) > -1;
    //     this.showPacking = pageItems.findIndex(r => r.title === mobilePackingCode) > -1;
    //     this.showConsignmentSales = pageItems.findIndex(r => r.title === mobileConsignmentSalesCode) > -1;
    //     this.showStockCount = pageItems.findIndex(r => r.title === inventoryCountCode) > -1;
    //   }
    // })
  }

  // Select action
  // async selectAction() {
  //   let buttons: ActionSheetButton[] = [];

  //   if (this.showQuotation) {
  //     buttons.push({
  //       text: 'Add Quotation',
  //       icon: 'wallet',
  //       handler: () => {
  //         let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
  //         if (salesAgentId === 0 || salesAgentId === undefined) {
  //           this.toastService.presentToast('Error', 'Sales Agent not set', 'middle', 'danger', 1000);
  //         } else {
  //           this.navController.navigateForward('/transactions/quotation/quotation-header');
  //         }
  //       }
  //     });
  //   }
  //   if (this.showSalesOrder) {
  //     buttons.push({
  //       text: 'Add Sales Order',
  //       icon: 'swap-horizontal-outline',
  //       handler: () => {
  //         let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
  //         if (salesAgentId === 0 || salesAgentId === undefined) {
  //           this.toastService.presentToast('Error', 'Sales Agent not set', 'middle', 'danger', 1000);
  //         } else {
  //           this.navController.navigateForward('/transactions/sales-order/sales-order-header');
  //         }
  //       }
  //     });
  //   }
  //   if (this.showPicking) {
  //     buttons.push({
  //       text: 'Add Picking',
  //       icon: 'swap-vertical-outline',
  //       handler: () => {
  //         let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
  //         if (warehouseAgentId === 0 || warehouseAgentId === undefined) {
  //           this.toastService.presentToast('Error', 'Warehouse Agent not set', 'middle', 'danger', 1000);
  //         } else {
  //           this.navController.navigateForward('/transactions/picking/picking-sales-order');
  //         }
  //       }
  //     });
  //   }
  //   if (this.showPacking) {
  //     buttons.push({
  //       text: 'Add Packing',
  //       icon: 'swap-vertical-outline',
  //       handler: () => {
  //         let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
  //         if (warehouseAgentId === 0 || warehouseAgentId === undefined) {
  //           this.toastService.presentToast('Error', 'Warehouse Agent not set', 'middle', 'danger', 1000);
  //         } else {
  //           this.navController.navigateForward('/transactions/packing/packing-sales-order');
  //         }
  //       }
  //     });
  //   }
  //   if (this.showConsignmentSales) {
  //     buttons.push({
  //       text: 'Add Consignment',
  //       icon: 'swap-vertical-outline',
  //       handler: () => {
  //         this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-header-add');
  //       }
  //     });
  //   }
  //   if (this.showStockCount) {
  //     buttons.push({
  //       text: 'Add Stock Count',
  //       icon: 'swap-vertical-outline',
  //       handler: () => {
  //         this.navController.navigateForward('/transactions/stock-count/stock-count-add/stock-count-header');
  //       }
  //     });
  //   }

  //   buttons.push({
  //     text: 'Cancel',
  //     icon: 'close',
  //     role: 'cancel'
  //   });

  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'Choose an action',
  //     cssClass: 'custom-action-sheet',
  //     buttons: buttons
  //   });
  //   await actionSheet.present();
  // }

}
