import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { DefectRequestDetail, DefectRequestRoot } from 'src/app/modules/transactions/models/defect-request';
import { DefectRequestService } from 'src/app/modules/transactions/services/defect-request.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
   selector: 'app-defect-request-cart',
   templateUrl: './defect-request-cart.page.html',
   styleUrls: ['./defect-request-cart.page.scss'],
})
export class DefectRequestCartPage implements OnInit {

   submit_attempt = false;

   constructor(
      public objectService: DefectRequestService,
      public configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private alertController: AlertController
   ) { }

   ngOnInit() {
   }

   /* #region  modal to edit each item */

   isModalOpen: boolean = false;
   selectedItem: DefectRequestDetail;
   selectedIndex: number;
   showEditModal(rowData: DefectRequestDetail, rowIndex: number) {
      this.selectedItem = JSON.parse(JSON.stringify(rowData)) as DefectRequestDetail;
      this.selectedIndex = rowIndex;
      this.isModalOpen = true;
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         return;
      } else {
         let hasQtyError: boolean = false;
         let totalQty: number = 0;
         if (this.selectedItem.variationTypeCode === "0") {
            hasQtyError = (this.selectedItem.qtyRequest ?? 0) <= 0;
         } else {
            this.selectedItem.variationDetails.forEach(r => {
               r.details.forEach(rr => {
                  totalQty += (rr.qtyRequest ?? 0)
               })
            })
            hasQtyError = totalQty <= 0;
         }
         if (hasQtyError) {
            this.toastService.presentToast("Controll Error", "Invalid quantity", "top", "warning", 1000);
         } else {
            if (this.objectService.object.details[this.selectedIndex]) {
               this.objectService.object.details[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
            } else {
               this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
            }
            this.hideEditModal();
         }
      }
   }

   async cancelChanges() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.isModalOpen = false;
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
      } catch (e) {
         console.error(e);
      }
   }

   hideEditModal() {
      this.isModalOpen = false;
   }

   async onModalHide() {
      this.selectedIndex = null;
      this.selectedItem = null;
   }

   /* #endregion */

   /* #region remove line */


   async presentDeleteItemAlert(rowData: DefectRequestDetail, index: number) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: () => {
                     this.removeItem(rowData, index);
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
      } catch (e) {
         console.error(e);
      }
   }

   async removeItem(rowData: DefectRequestDetail, index: number) {
      try {
         await this.objectService.object?.details?.splice(index, 1);
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   onUomChanged(rowData: DefectRequestDetail, event: any, ignoreGetPricing: boolean) {
      if (!rowData.baseRatio) {
         this.toastService.presentToast("Computation Error", "Base UOM ratio is undefined. Please contact system administrator.", "top", "warning", 1000);
         return;
      }
      let findUom = rowData.uomMaster.find(x => x.itemUomId == event.detail.value);
      rowData.uomRatio = findUom.ratio;
      let checkRemainder = rowData.uomRatio % rowData.baseRatio;
      if (checkRemainder == 0) {
         let computeRatio = rowData.uomRatio / rowData.baseRatio;
         rowData.ratioExpr = computeRatio.toString();
      } else {
         rowData.ratioExpr = rowData.uomRatio.toString() + "/" + rowData.baseRatio.toString();
      }
   }

   /* #region  edit qty */

   computeQty() {
      try {
         if (this.selectedItem.variationTypeCode === "1" || this.selectedItem.variationTypeCode === "2") {
            var totalQty = 0;
            if (this.selectedItem.variationDetails) {
               this.selectedItem.variationDetails.forEach(x => {
                  x.details.forEach(y => {
                     if (y.qtyRequest && y.qtyRequest < 0) {
                        this.toastService.presentToast("Control Error", "Invalid quantity", "top", "warning", 1000);
                     }
                     totalQty = totalQty + y.qtyRequest;
                  });
               })
            }
            this.selectedItem.qtyRequest = totalQty;
         }
      } catch (e) {
         console.error(e);
      }
   }

   increaseVariationQty(data: InnerVariationDetail) {
      try {
         data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         this.computeQty();
      } catch (e) {
         console.error(e);
      }
   }

   decreaseVariationQty(data: InnerVariationDetail) {
      try {
         if ((data.qtyRequest - 1) < 0) {
            data.qtyRequest = 0;
         } else {
            data.qtyRequest -= 1;
         }
         this.computeQty();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  step */

   previousStep() {
      try {
         this.navController.navigateBack("/transactions/defect-request/defect-request-item");
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         this.submit_attempt = true;
         const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     if (this.objectService.object?.header?.defectRequestId > 0) {
                        await this.updateObject();
                     } else {
                        await this.insertObject();
                     }
                  },
               },
               {
                  text: "Cancel",
                  cssClass: "cancel",
                  role: "cancel",
                  handler: async () => {
                     this.submit_attempt = false;
                  }
               },
            ],
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
         this.objectService.insertObject(this.objectService.object).subscribe({
            next: (response) => {
               if (response.status === 201) {
                  this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
                  let body = response.body as DefectRequestRoot;
                  this.objectService.resetVariables();
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: body.header.defectRequestId
                     }
                  }
                  this.navController.navigateRoot("/transactions/defect-request/defect-request-detail", navigationExtras);
               }
            },
            error: async (error) => {
               this.submit_attempt = false;
               console.error(error);
               await this.loadingService.dismissLoading();
            }
         })
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
         await this.loadingService.dismissLoading();
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   async updateObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.updateObject(this.objectService.object).subscribe({
            next: (response) => {
               if (response.status === 204) {
                  let navigationExtras: NavigationExtras = {
                     queryParams: {
                        objectId: this.objectService.object.header.defectRequestId
                     }
                  }
                  this.objectService.resetVariables();
                  this.navController.navigateRoot("/transactions/defect-request/defect-request-detail", navigationExtras);
               }
            },
            error: async (error) => {
               this.submit_attempt = false;
               console.error(error);
               await this.loadingService.dismissLoading();
            }
         })
      } catch (e) {
         this.submit_attempt = false;
         console.error(e);
         await this.loadingService.dismissLoading();
      } finally {
         this.submit_attempt = false;
         await this.loadingService.dismissLoading();
      }
   }

   /* #endregion */

}
