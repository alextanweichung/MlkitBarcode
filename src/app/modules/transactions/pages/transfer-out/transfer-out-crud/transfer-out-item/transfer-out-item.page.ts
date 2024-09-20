import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { TransferOutLine, TransferOutRoot } from 'src/app/modules/transactions/models/transfer-out';
import { TransferOutService } from 'src/app/modules/transactions/services/transfer-out.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-transfer-out-item',
   templateUrl: './transfer-out-item.page.html',
   styleUrls: ['./transfer-out-item.page.scss'],
})
export class TransferOutItemPage implements OnInit, ViewWillEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage

   constructor(
      public objectService: TransferOutService,
      public authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController,
   ) { }

   ionViewWillEnter(): void {

   }

   ngOnInit() {

   }

   /* #region camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      try {
         this.scanActive = event;
         if (this.scanActive) {
            document.body.style.background = "transparent";
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onDoneScanning(event) {
      try {
         if (event) {
            await this.barcodescaninput.validateBarcode(event);
            if (this.objectService.configMobileScanItemContinuous) {
               await this.barcodescaninput.startScanning();
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   /* #region barcode & check so */

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (event) {
            event.forEach(async r => {
               let outputData: TransferOutLine = {
                  id: 0,
                  uuid: uuidv4(),
                  transferOutId: this.objectService.objectHeader.transferOutId,
                  sequence: 0,
                  itemId: r.itemId,
                  itemCode: r.itemCode,
                  itemSku: r.itemSku,
                  itemDesc: r.description,
                  xId: r.itemVariationXId,
                  xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.code,
                  xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
                  yId: r.itemVariationYId,
                  yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.code,
                  yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
                  barcode: r.itemBarcode,
                  lineQty: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  qtyRequest: (r.qtyRequest && r.qtyRequest) > 0 ? r.qtyRequest : 1,
                  isDeleted: false,
                  unitPrice: r.itemPricing?.unitPrice,
                  unitPriceExTax: r.itemPricing?.unitPrice,
                  discountGroupCode: r.itemPricing?.discountGroupCode,
                  discountExpression: r.itemPricing?.discountExpression,
                  containerNum: null
               }
               if (this.objectService.configTransferOutActivateContainerNum) {
                  outputData.containerNum = this.objectService.pageNum;
               }
               await this.commonService.computeDiscTaxAmount(outputData, false, false, false, 2); // todo : use tax??
               this.insertIntoLine(outputData);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async qtyInputBlur(event, rowIndex) {
      if (rowIndex === null || rowIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
      } else {
         this.objectService.objectDetail[rowIndex].qtyRequest = this.objectService.objectDetail[rowIndex].lineQty;
         await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[rowIndex], false, false, false, 2);
      }
   }

   async insertIntoLine(event: TransferOutLine) {
      if (event) {
         if (this.objectService.objectDetail !== null && this.objectService.objectDetail.length > 0) {
            if (this.objectService.objectDetail[0].itemSku === event.itemSku && this.objectService.objectDetail[0].containerNum === event.containerNum) {
               this.objectService.objectDetail[0].lineQty += event.lineQty;
               this.objectService.objectDetail[0].qtyRequest = this.objectService.objectDetail[0].lineQty;
               await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[0], false, false, false, 2);
            } else {
               this.objectService.objectDetail.unshift(event);
            }
         } else {
            this.objectService.objectDetail.unshift(event);
         }
      }
   }

   async deleteLine(rowIndex: number, event: TransferOutLine) {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "Are you sure to delete?",
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "danger",
               handler: async () => {
                  this.objectService.objectDetail.splice(rowIndex, 1);
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               handler: () => {

               }
            },
         ],
      });
      await alert.present();
   }

   /* #region  misc */

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   /* #endregion */

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/transfer-out/transfer-out-header");
      } catch (e) {
         console.error(e);
      }
   }

   isCountingTimer: boolean = true;
   async nextStep() {
      if (this.isCountingTimer) {
         this.isCountingTimer = false;
         const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
                  cssClass: "success",
                  handler: async () => {
                     await this.saveObject();
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      }
      setTimeout(() => {
         this.isCountingTimer = true;
      }, 1000);
   }

   async saveObject() {
      let object: TransferOutRoot;
      object = this.objectService.objectHeader;
      object.line = this.objectService.objectDetail;
      if (object.line.filter(r => r.qtyRequest === null || r.qtyRequest === undefined || r.qtyRequest <= 0).length > 0) {
         await this.removeInvalidLine(object);
         return;
      }
      if (object.line !== null && object.line.length > 0) {
         if (this.objectService.objectHeader.transferOutId > 0) {
            this.objectService.updateObject(object).subscribe(response => {
               if (response.status === 204) {
                  this.toastService.presentToast("", "Transfer Out updated", "top", "success", 1000);
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: this.objectService.objectHeader.transferOutId
                     }
                  }
                  this.objectService.resetVariables();
                  this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
               }
            }, error => {
               console.error(error);
            })
         } else {
            this.objectService.insertObject(object).subscribe(response => {
               if (response.status === 201) {
                  this.toastService.presentToast("", "Transfer Out created", "top", "success", 1000);
                  let objectId = (response.body as TransferOutRoot).transferOutId;
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: objectId
                     }
                  }
                  this.objectService.resetVariables();
                  this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
               }
            }, error => {
               console.error(error);
            })
         }
      } else {
         this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
      }
   }
   
   async removeInvalidLine(object: TransferOutRoot) {
      let itemCodeString = object.line.filter(r => r.qtyRequest === null || r.qtyRequest === undefined || r.qtyRequest <= 0).flatMap(r => r.itemCode + ` [Ctr. ${r.containerNum}]`).join(", ");
      const alert = await this.alertController.create({
         header: "Do you want to remove invalid lines and save?",
         subHeader: itemCodeString,
         cssClass: "custom-action-sheet",
         buttons: [
            {
               text: "Yes",
               role: "confirm",
               cssClass: "success",
               handler: async () => {
                  this.objectService.objectDetail = this.objectService.objectDetail.filter(r => r.qtyRequest > 0);
                  await this.saveObject();
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               handler: () => {

               }
            },
         ],
      });
      await alert.present();
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

   modifyPageNum(typeCode: string) {
      if (typeCode == 'A') {
         this.objectService.pageNum++;
         this.objectService.objectHeader.totalCarton = this.objectService.pageNum;
      } else {
         if (this.objectService.pageNum != 1) {
            this.objectService.pageNum--;
         }
      }
   }

	sendForDebug() {
      let object: TransferOutRoot;
      object = this.objectService.objectHeader;      
      object.line = this.objectService.objectDetail;
		let jsonObjectString = JSON.stringify(object);
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

}