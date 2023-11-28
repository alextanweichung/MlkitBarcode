import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, NavController, IonPopover, ViewWillEnter, ViewDidEnter } from '@ionic/angular';
import { TransferBinGroupList, TransferBinRoot } from 'src/app/modules/transactions/models/transfer-bin';
import { TransferBinService } from 'src/app/modules/transactions/services/transfer-bin.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
   selector: 'app-transfer-bin-item',
   templateUrl: './transfer-bin-item.page.html',
   styleUrls: ['./transfer-bin-item.page.scss'],
})
export class TransferBinItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: TransferBinService,
      private configService: ConfigService,
      private authService: AuthService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private alertController: AlertController,
      private navController: NavController
   ) { }

   ionViewWillEnter(): void {

   }

   async ionViewDidEnter(): Promise<void> {
      try {
         if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-header");
         }
         if (this.objectService.objectDetail && this.objectService.objectDetail.length === 0) {
            await this.addNewObjectDetail();
         }
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[] = [];
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   addNewObjectDetail() {
      this.objectService.objectDetail.unshift({
         fromBinCode: null,
         fromPalletCode: null,
         groupList: [],
         toBinCode: null,
         toPalletCode: null,
         typeCode: "I"
      });
   }

   /* #region item line */

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(r => {
            this.addItemToLine(r);
         })
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
            if (this.objectService.objectDetail[this.selectedIndex].groupList.findIndex(r => r.itemId === trxLine.itemId) === 0) { // already in and first one
               this.objectService.objectDetail[this.selectedIndex].groupList.find(r => r.itemId === trxLine.itemId).qtyRequest += 1;
            } else {
               let newLine: TransferBinGroupList = {
                  transferBinLineId: 0,
                  transferBinId: this.objectService.objectHeader.transferBinId,
                  itemId: trxLine.itemId,
                  itemCode: trxLine.itemCode,
                  description: trxLine.description,
                  qtyRequest: 1,
                  deactivated: false
               }
               await this.objectService.objectDetail[this.selectedIndex].groupList.unshift(newLine);
            }
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteLine(index) {
      try {
         if (this.objectService.objectDetail[index]) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this item?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete item",
                     cssClass: "danger",
                     handler: async () => {
                        await this.objectService.objectDetail.splice(index, 1);
                        this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                        let data: TransferBinRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {
                        // this.objectService.objectDetail[index].qty = 1;
                        let data: TransferBinRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                     }
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region detail modal */

   selectedIndex: number = null;
   detailModal: boolean = false;
   async showModal(rowIndex: number) {
      this.selectedIndex = rowIndex;
      this.detailModal = true;
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   hideModal() {
      this.selectedIndex = null;
      this.detailModal = false;
   }

   async onFromBinCodeChanged(event) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            this.objectService.objectDetail[this.selectedIndex].fromBinCode = event.code;
         } else {
            this.objectService.objectDetail[this.selectedIndex].fromBinCode = null;
         }
         await this.validateBinPair("From");
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   async onToBinCodeChanged(event) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            this.objectService.objectDetail[this.selectedIndex].toBinCode = event.code;
         } else {
            this.objectService.objectDetail[this.selectedIndex].toBinCode = null;
         }
         await this.validateBinPair("To");
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   validateBinPair(direction: string) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (this.objectService.objectDetail[this.selectedIndex].fromBinCode && this.objectService.objectDetail[this.selectedIndex].toBinCode) {
            if (this.objectService.objectDetail[this.selectedIndex].fromBinCode === this.objectService.objectDetail[this.selectedIndex].toBinCode) {
               if (direction === "From") {
                  this.objectService.objectDetail[this.selectedIndex].fromBinCode = null;
                  this.toastService.presentToast("Control Error", `${direction} Bin canont be the same as To Bin`, "top", "warning", 1000);
               } else {
                  this.objectService.objectDetail[this.selectedIndex].toBinCode = null;
                  this.toastService.presentToast("Control Error", `${direction} Bin canont be the same as From Bin`, "top", "warning", 1000);
               }
            }
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   async onFromPalletCodeChanged(event) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         if (event) {
            this.objectService.objectDetail[this.selectedIndex].fromPalletCode = event.code;
         } else {
            this.objectService.objectDetail[this.selectedIndex].fromPalletCode = null;
         }
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   deleteItemLine(rowIndex) {
      if (!(this.selectedIndex === null || this.selectedIndex === undefined) && this.objectService.objectDetail[this.selectedIndex]) {
         this.objectService.objectDetail[this.selectedIndex].groupList.splice(rowIndex, 1);
      } else {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      }
   }

   /* #endregion */

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(barcode: string) {
      if (barcode) {
         await this.barcodescaninput.validateBarcode(barcode);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region steps */

   previousStep() {
      this.navController.navigateBack("/transactions/transfer-bin/transfer-bin-header");
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     if (this.objectService.objectHeader.transferBinId > 0) {
                        this.updateObject();
                     } else {
                        this.insertObject();
                     }
                  }
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "cancel",
                  handler: async () => {
                     this.submit_attempt = false;
                  }
               }
            ]
         });
         await alert.present();
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
      } finally {
         this.submit_attempt = false;
      }
   }

   async insertObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.insertObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as TransferBinRoot;
               this.toastService.presentToast("", "Transfer Bin added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.transferBinId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
            }
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.updateObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Transfer Bin updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.transferBinId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/transfer-bin/transfer-bin-detail", navigationExtras);
            }
         }, async error => {
            this.submit_attempt = false;
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
