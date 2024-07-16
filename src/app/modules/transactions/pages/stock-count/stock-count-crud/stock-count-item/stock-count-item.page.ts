import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonInput, IonPopover, NavController, ViewDidEnter, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { StockCountDetail, InventoryCountBatchCriteria, StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { v4 as uuidv4 } from 'uuid';
import { StockCountDetailPage } from '../../stock-count-detail/stock-count-detail.page';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
   selector: 'app-stock-count-item',
   templateUrl: './stock-count-item.page.html',
   styleUrls: ['./stock-count-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'MobileInventoryCount' }]
})
export class StockCountItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

   submit_attempt: boolean = false;
   currentPage: number = 1;
   itemsPerPage: number = 12;

   binDesc: string = "";
   fLocationZoneDetail: MasterListDetails[] = [];

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

   constructor(
      public objectService: StockCountService,
      public authService: AuthService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
   ) { }

   ionViewWillEnter(): void {
      if (this.objectService.locationZoneDetailMasterList && this.objectService.locationZoneDetailMasterList.length > 0) {
         this.fLocationZoneDetail = this.objectService.locationZoneDetailMasterList.filter(r => Number(r.attribute1) === this.objectService.objectHeader.locationId);
      }
   }

   ionViewDidEnter(): void {
      try {
         if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
            this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
            this.navController.navigateBack("/transactions/stock-count/stock-count-crud/stock-count-header");
         } else {
            this.loadInventoryCountBatchCriteria();
         }
         this.barcodescaninput.setFocus();
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   inventoryCountBatchCriteria: InventoryCountBatchCriteria;
   loadInventoryCountBatchCriteria() {
      try {
         this.objectService.getInventoryCountBatchCriteria(this.objectService.objectHeader.inventoryCountBatchId).subscribe(response => {
            this.inventoryCountBatchCriteria = response;
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(r => {
            this.addItemToLine(r);
         })
         try {
            this.barcodescaninput.setFocus();
         } catch (e) {
            console.error(e);
         }
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      try {
         switch (this.inventoryCountBatchCriteria.randomCountType) {
            case "Item":
               break;
            case "Brand":
               if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemBrandId)) {
                  this.toastService.presentToast("", "Item Brand not match", "top", "warning", 1000);
                  return;
               }
               break;
            case "Group":
               if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemGroupId)) {
                  this.toastService.presentToast("", "Item Group not match", "top", "warning", 1000);
                  return;
               }
               break;
            case "Category":
               if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemCategoryId)) {
                  this.toastService.presentToast("", "Item Category not match", "top", "warning", 1000);
                  return;
               }
               break;
         }
         let rowIndex = this.objectService.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku);
         if (rowIndex === 0 && !this.objectService.configInvCountActivateLineWithBin) { // already in and first one
            this.objectService.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
            let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         } else if (rowIndex === 0 && this.objectService.configInvCountActivateLineWithBin) { // already in and first one + same binDesc
            if (this.objectService.objectDetail[rowIndex].binDesc === this.binDesc) {
               this.objectService.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
               let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
               await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            } else {
               let newLine: StockCountDetail = {
                  inventoryCountLineId: 0,
                  inventoryCountId: this.objectService.objectHeader.inventoryCountId,
                  locationId: this.objectService.objectHeader.locationId,
                  itemId: trxLine.itemId,
                  itemVariationXId: trxLine.itemVariationXId,
                  itemVariationYId: trxLine.itemVariationYId,
                  itemSku: trxLine.itemSku,
                  itemBarcodeTagId: trxLine.itemBarcodeTagId,
                  itemBarcode: trxLine.itemBarcode,
                  qtyRequest: (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1,
                  binDesc: this.binDesc,
                  sequence: 0,
                  // for local use
                  itemCode: trxLine.itemCode,
                  itemDescription: trxLine.description,
                  // testing performance
                  guid: uuidv4()
               }
               this.objectService.objectDetail.forEach(r => { r.sequence += 1 });
               await this.objectService.objectDetail.unshift(newLine);
               let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
               await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            }
         } else {
            let newLine: StockCountDetail = {
               inventoryCountLineId: 0,
               inventoryCountId: this.objectService.objectHeader.inventoryCountId,
               locationId: this.objectService.objectHeader.locationId,
               itemId: trxLine.itemId,
               itemVariationXId: trxLine.itemVariationXId,
               itemVariationYId: trxLine.itemVariationYId,
               itemSku: trxLine.itemSku,
               itemBarcodeTagId: trxLine.itemBarcodeTagId,
               itemBarcode: trxLine.itemBarcode,
               qtyRequest: (trxLine.qtyRequest && trxLine.qtyRequest) > 0 ? trxLine.qtyRequest : 1,
               binDesc: this.binDesc,
               sequence: 0,
               // for local use
               itemCode: trxLine.itemCode,
               itemDescription: trxLine.description,
               // testing performance
               guid: uuidv4()
            }
            this.objectService.objectDetail.forEach(r => { r.sequence += 1 });
            await this.objectService.objectDetail.unshift(newLine);
            let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  manual amend qty */

   setFocus(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async decreaseQty(line: StockCountDetail, index: number) {
      try {
         if (line.qtyRequest - 1 < 0) {
            line.qtyRequest = 0;
            let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         } else {
            line.qtyRequest--;
            let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         }
         if (line.qtyRequest === 0) {
            await this.deleteLine(line);
         }
      } catch (e) {
         console.error(e);
      }
   }

   eventHandler(keyCode, line) {
      if (keyCode === 13) {
         if (Capacitor.getPlatform() !== "web") {
            Keyboard.hide();
         }
      }
   }

   onQtyBlur(line: StockCountDetail) {
      line.qtyRequest = Math.floor(line.qtyRequest);
   }

   async increaseQty(line: StockCountDetail) {
      line.qtyRequest += 1;
      let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
      await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
   }

   async deleteLine(rowData: StockCountDetail) {
      try {
         let index = this.objectService.objectDetail.findIndex(r => r.guid === rowData.guid);
         if (index > -1) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this item?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete item",
                     cssClass: "danger",
                     handler: async () => {
                        this.objectService.objectDetail.splice(index, 1);
                        this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                        let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel",
                     handler: async () => {
                        this.objectService.objectDetail[index].qtyRequest = 1;
                        let data: StockCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
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

   onBinDescBlur() {
      this.barcodescaninput.setFocus();
   }

   async updateBinDesc(rowData: StockCountDetail) {
      let index = this.objectService.objectDetail.findIndex(r => r.guid === rowData.guid);
      if (index > -1) {
         try {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               backdropDismiss: false,
               header: "Update Bin Desc.",
               inputs: [
                  {
                     name: "binDesc",
                     type: "text",
                     placeholder: "Enter Bin Desc.",
                     value: this.objectService.objectDetail[index].binDesc,
                  }
               ],
               buttons: [
                  {
                     text: "OK",
                     role: "confirm",
                     cssClass: "success",
                     handler: async (data) => {
                        this.objectService.objectDetail[index].binDesc = data.binDesc;
                     },
                  },
                  {
                     text: "Cancel",
                     role: "cancel"
                  },
               ],
            });
            await alert.present().then(() => {
               const firstInput: any = document.querySelector("ion-alert input");
               setTimeout(() => {
                  firstInput.focus();
               }, 1000);
               return;
            });
         } catch (e) {
            console.error(e);
         }
      } else {
         this.toastService.presentToast("System Error", "Something went wrong, please contact adminstrator.", "top", "danger", 1000);
      }
   }

   /* #endregion */

   /* #region  camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(event) {
      if (event) {
         await this.barcodescaninput.validateBarcode(event);
         if (this.objectService.configMobileScanItemContinuous) {
            await this.barcodescaninput.startScanning();
         }
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   previousStep() {
      this.navController.navigateBack("/transactions/stock-count/stock-count-crud/stock-count-header");
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
                     if (this.objectService.objectHeader.inventoryCountId > 0) {
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
         this.objectService.insertInventoryCount({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 201) {
               this.submit_attempt = false;
               let object = response.body as StockCountRoot;
               this.objectService.resetVariables();
               this.toastService.presentToast("", "Stock Count added", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.inventoryCountId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/stock-count/stock-count-detail", navigationExtras);
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
         this.objectService.updateInventoryCount({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
            if (response.status === 204) {
               this.submit_attempt = false;
               this.toastService.presentToast("", "Stock Count updated", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.inventoryCountId
                  }
               }
               await this.objectService.resetVariables();
               await this.loadingService.dismissLoading();
               this.navController.navigateRoot("/transactions/stock-count/stock-count-detail", navigationExtras);
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

   identify(index, line) {
      return line.guid;
   }

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

   sendForDebug() {
      let trxDto: StockCountRoot = {
         header: this.objectService.objectHeader,
         details: this.objectService.objectDetail
      }
      let jsonObjectString = JSON.stringify(trxDto);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

   /* #region bin desc camera scanning */

   async startScanning() {
      const allowed = await this.checkPermission();
      if (allowed) {
         // this.scanActive = true;
         this.onCameraStatusChanged(true);
         const result = await BarcodeScanner.startScan();
         if (result.hasContent) {
            let value = result.content;
            // this.scanActive = false;
            await this.onCameraStatusChanged(false);
            this.binDesc = value;
            this.barcodescaninput.setFocus();
         }
      }
   }

   async checkPermission() {
      return new Promise(async (resolve) => {
         const status = await BarcodeScanner.checkPermission({ force: true });
         if (status.granted) {
            resolve(true);
         } else if (status.denied) {
            const alert = await this.alertController.create({
               header: "No permission",
               message: "Please allow camera access in your setting",
               buttons: [
                  {
                     text: "Open Settings",
                     handler: () => {
                        BarcodeScanner.openAppSettings();
                        resolve(false);
                     },
                  },
                  {
                     text: "No",
                     role: "cancel",
                  },
               ],
            });
            await alert.present();
         } else {
            resolve(false);
         }
      });
   }

   /* #endregion */

   /* #region bin scan dropdown */

   onBinSelected(event: SearchDropdownList) {
      if (event) {
         let found = this.fLocationZoneDetail.find(r => r.code.toUpperCase() === event.code.toUpperCase());
         if (found) {
            this.binDesc = found.code;
         } else {
            this.binDesc = null;
         }
      } else {
         this.binDesc = null;
      }
   }

   onBinScanCompleted(event: string) { // truck arrangement
      try {
         if (event) {
            let found = this.fLocationZoneDetail.find(r => r.code.toUpperCase() === event.toUpperCase());
            if (found) {
               this.onBinSelected({ id: found.id, code: found.code });
            } else {
               this.toastService.presentToast("", "Invalid Truck Arrangment", "top", "warning", 1000);
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   onBinDoneScanning(event) { // truck arrangement
      try {
         if (event) {
            let found = this.fLocationZoneDetail.find(r => r.code.toUpperCase() === event.toUpperCase());
            if (found) {
               this.onBinSelected({ id: found.id, code: found.code });
            } else {
               this.toastService.presentToast("", "Invalid Truck Arrangment", "top", "warning", 1000);
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
