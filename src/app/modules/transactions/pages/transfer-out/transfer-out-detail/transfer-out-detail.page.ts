import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferOutLine } from '../../../models/transfer-out';
import { TransferOutService } from '../../../services/transfer-out.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-transfer-out-detail',
   templateUrl: './transfer-out-detail.page.html',
   styleUrls: ['./transfer-out-detail.page.scss'],
})
export class TransferOutDetailPage implements OnInit, ViewWillEnter {

   objectId: number;

   constructor(
      public objectService: TransferOutService,
      private authService: AuthService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private route: ActivatedRoute,
   ) { }

   ionViewWillEnter(): void {
      try {
         this.route.queryParams.subscribe(params => {
            this.objectId = params["objectId"];
            if (this.objectId && this.objectId > 0) {
               this.loadObject();
            } else {
               this.toastService.presentToast("", "Invalid Transfer Out", "top", "warning", 1000);
               this.navController.navigateBack("/transactions/transfer-out");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   // precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   // precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   // loadModuleControl() {
   //   try {
   //     this.authService.precisionList$.subscribe(precision => {
   //       this.precisionSales = precision.find(x => x.precisionCode == "SALES");
   //       this.precisionTax = precision.find(x => x.precisionCode == "TAX");
   //     })
   //   } catch (e) {
   //     console.error(e);
   //     this.toastService.presentToast("Error loading module control", "", "top", "danger", 1000);
   //   }
   // }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object = this.commonService.convertObjectAllDateType(object);
            await this.objectService.setHeader(object);
            await this.objectService.setLine(object.line);
            await this.loadingService.dismissLoading();
         }, async error => {
            await this.loadingService.dismissLoading();
            console.error(error);
         })
      } catch (e) {
         await this.loadingService.dismissLoading();
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   isCountingTimer: boolean = true;
   async completeObjectAlert() {
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
                     this.completeObject();
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  cssClass: "cancel",
               },
            ],
         });
         await alert.present();
      }
      setTimeout(() => {
         this.isCountingTimer = true;
      }, 1000);
   }

   completeObject() {
      this.objectService.completeObject(this.objectId).subscribe(response => {
         if (response.status === 204) {
            this.toastService.presentToast("", "Inter Transfer generated", "top", "success", 1000);
            this.loadObject();
         }
      }, error => {
         console.error(error);
      })
   }

   editObject() {
      this.navController.navigateRoot("/transactions/transfer-out/transfer-out-add");
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

   filter(details: TransferOutLine[]) {
      try {
         return details.filter(r => r.lineQty > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region download pdf */

   async presentAlertViewPdf() {
      try {
         const alert = await this.alertController.create({
            header: "Download PDF?",
            message: "",
            buttons: [
               {
                  text: "OK",
                  cssClass: "success",
                  role: "confirm",
                  handler: async () => {
                     await this.downloadPdf();
                  },
               },
               {
                  cssClass: "cancel",
                  text: "Cancel",
                  role: "cancel"
               },
            ]
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async downloadPdf() {
      try {
         this.objectService.downloadPdf("WDWO003", "pdf", this.objectService.objectHeader.interTransferId, "Inter Transfer").subscribe(response => {
            let filename = this.objectService.objectHeader.interTransferNum + ".pdf";
            this.commonService.commonDownloadPdf(response, filename);
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

}
