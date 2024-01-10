import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../../../shared/services/common.service';
import { PickingService } from '../../services/picking.service';
import { FilterPage } from '../filter/filter.page';
import { ConfigService } from 'src/app/services/config/config.service';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MultiPickingList } from '../../models/picking';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
   selector: 'app-picking',
   templateUrl: './picking.page.html',
   styleUrls: ['./picking.page.scss'],
})
export class PickingPage implements OnInit, ViewWillEnter {

   objects: MultiPickingList[] = [];

   startDate: Date;
   endDate: Date;

   uniqueGrouping: Date[] = [];

   constructor(
      private objectService: PickingService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
   ) {
      // reload all masterlist whenever user enter listing
   }

   async ionViewWillEnter(): Promise<void> {
      try {
         if (!this.startDate) {
            this.startDate = this.commonService.getFirstDayOfTodayMonth();
         }
         if (!this.endDate) {
            this.endDate = this.commonService.getTodayDate();
         }
         await this.objectService.loadRequiredMaster();
         await this.loadObjects();
      } catch (e) {
         console.error(e);
      }
   }

   ngOnInit() {

   }

   /* #region  crud */

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListByDate(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
            this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
            await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
         }, async error => {
            console.error(error);
            await this.loadingService.dismissLoading();
         })
      } catch (error) {
         console.error(error);
         await this.loadingService.dismissLoading();
      } finally {         
         await this.loadingService.dismissLoading();
      }
   }

   getObjects(date: Date) {
      return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   }

   /* #endregion */

   /* #region add goods picking */

   async addObject() {
      try {
         // if (this.objectService.hasWarehouseAgent()) {
         this.navController.navigateForward("/transactions/picking/picking-header");
         // } else {
         //   this.toastService.presentToast("", "Warehouse Agent not set.", "top", "danger", 1000);
         // }
      } catch (e) {
         console.error(e);
      }
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Picking",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Cancel",
                  icon: "close",
                  role: "cancel"
               }]
         });
         await actionSheet.present();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.startDate,
               endDate: this.endDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.startDate = new Date(data.startDate);
            this.endDate = new Date(data.endDate);
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   goToDetail(objectId: number) {
      try {
         let navigationExtras: NavigationExtras = {
            queryParams: {
               objectId: objectId
            }
         }
         this.navController.navigateForward("/transactions/picking/picking-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

}
