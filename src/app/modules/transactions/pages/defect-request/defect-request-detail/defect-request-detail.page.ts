import { Component, OnInit, ViewChild } from '@angular/core';
import { DefectRequestService } from '../../../services/defect-request.service';
import { IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { DefectRequestDetail } from '../../../models/defect-request';

@Component({
   selector: 'app-defect-request-detail',
   templateUrl: './defect-request-detail.page.html',
   styleUrls: ['./defect-request-detail.page.scss'],
})
export class DefectRequestDetailPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectId: number;
   showAdditionalInfo: boolean = false;

   constructor(
      public objectService: DefectRequestService,
      private toastService: ToastService,
      private navController: NavController,
      private route: ActivatedRoute
   ) {
      this.route.queryParams.subscribe(params => {
         this.objectId = params["objectId"];
      })
   }

   ngOnInit() {

   }

   ionViewWillEnter(): void {
      if (!this.objectId) {
         this.toastService.presentToast("Something went wrong", "Please contact administrator", "top", "danger", 1000);
         this.navController.navigateRoot("/transactions/defect-request");
      } else {
         this.loadObject();
      }
   }

   ionViewDidEnter(): void {

   }

   loadObject() {
      if (this.objectId) {
         this.objectService.getObjectById(this.objectId).subscribe({
            next: (response) => {
               this.objectService.setObject(response);
            },
            error: (error) => {
               console.error(error);
            }
         })
         
      } else {
         this.toastService.presentToast("Something went wrong", "Please contact administrator", "top", "danger", 1000);
         this.navController.navigateRoot("/transactions/defect-request");
      }
   }

   filter(details: InnerVariationDetail[]) {
      return details.filter(r => r.qtyRequest > 0);
   }

   previousStep() {
      this.objectService.resetVariables();
   }

   editObject() {
      this.navController.navigateRoot("/transactions/defect-request/defect-request-cart");
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

   /* #region show variaton dialog */

   showDetails(rowData: DefectRequestDetail) {
      if (rowData.variationTypeCode === "1" || rowData.variationTypeCode === "2") {
         this.objectService.object.details.filter(r => r.lineId !== rowData.lineId).flatMap(r => r.isSelected = false);
         rowData.isSelected = !rowData.isSelected;
      }
   }

   /* #endregion */

}
