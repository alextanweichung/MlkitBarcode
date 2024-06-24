import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, IonSearchbar, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockCount } from '../../models/stock-count';
import { StockCountService } from '../../services/stock-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-stock-count',
   templateUrl: './stock-count.page.html',
   styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit, ViewWillEnter, ViewDidEnter {

   @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;

   objects: StockCount[] = [];
   uniqueGrouping: Date[] = [];
   currentPage: number = 1;
   itemsPerPage: number = 12;

   constructor(
      public objectService: StockCountService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private navController: NavController,
      private alertController: AlertController,
      private actionSheetController: ActionSheetController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      try {
         if (!this.objectService.filterStartDate) {
            this.objectService.filterStartDate = this.commonService.getFirstDayOfTodayMonth();
         }
         if (!this.objectService.filterEndDate) {
            this.objectService.filterEndDate = this.commonService.getTodayDate();
         }
         this.loadObjects();
      } catch (e) {
         console.error(e);
      }
   }

   async ionViewDidEnter(): Promise<void> {
      // check incomplete trx here
      let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
      if (data) {
         this.promptIncompleteTrxAlert();
      }
   }

   ngOnInit() {

   }

   async promptIncompleteTrxAlert() {
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         header: "You have uncompleted transaction.",
         subHeader: "Do you want to retrieve or discard",
         backdropDismiss: false,
         buttons: [
            {
               text: "Retrieve",
               cssClass: "success",
               handler: async () => {
                  let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
                  await this.objectService.setHeader(data.header);
                  await this.objectService.setLines(data.details);
                  if (this.objectService.objectDetail && this.objectService.objectDetail.length > 0) {
                     this.navController.navigateRoot("/transactions/stock-count/stock-count-crud/stock-count-item");
                  } else {
                     this.navController.navigateRoot("/transactions/stock-count/stock-count-crud/stock-count-header");
                  }
               }
            },
            {
               text: "Discard",
               role: "cancel",
               cssClass: "cancel",
               handler: async () => {
                  await this.configService.removeFromLocalStorage(this.objectService.trxKey);
               }
            }
         ]
      });
      await alert.present();
   }

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getInventoryCountByDate(format(this.objectService.filterStartDate, "yyyy-MM-dd"), format(this.objectService.filterEndDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
            // let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
            // this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
            // await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
            await this.loadingService.dismissLoading();
            this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
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

   getObjects(date: Date) {
      return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   }

   goToDetail(objectId: number) {
      let navigationExtras: NavigationExtras = {
         queryParams: {
            objectId: objectId
         }
      }
      this.navController.navigateForward("/transactions/stock-count/stock-count-detail", navigationExtras);
   }

   // Select action
   async selectAction() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Choose an action",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Add Stock Count",
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

   async addObject() {
      await this.objectService.resetVariables();
      this.navController.navigateForward("/transactions/stock-count/stock-count-crud/stock-count-header");
   }

   async filter() {
      try {
         const modal = await this.modalController.create({
            component: FilterPage,
            componentProps: {
               startDate: this.objectService.filterStartDate,
               endDate: this.objectService.filterEndDate
            },
            canDismiss: true
         })
         await modal.present();
         let { data } = await modal.onWillDismiss();
         if (data && data !== undefined) {
            this.objectService.filterStartDate = new Date(data.startDate);
            this.objectService.filterEndDate = new Date(data.endDate);
            this.loadObjects();
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: StockCount[] = [];
   search(searchText, newSearch: boolean = false) {
      if (newSearch) {
         this.filteredObj = [];
      }
      this.itemSearchText = searchText;
      try {
         if (searchText && searchText.trim().length > 2) {
            if (Capacitor.getPlatform() !== "web") {
               Keyboard.hide();
            }
            this.filteredObj = JSON.parse(JSON.stringify(this.objects.filter(r => 
               r.inventoryCountNum?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationDescription?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.zoneCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.zoneDescription?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.rackCode?.toUpperCase().includes(searchText.toUpperCase()) ||
               r.rackDescription?.toUpperCase().includes(searchText.toUpperCase())
            )));
            this.currentPage = 1;
         } else {
            this.resetFilteredObj();
            this.toastService.presentToast("", "Search with 3 characters and above", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetFilteredObj() {
      this.filteredObj = JSON.parse(JSON.stringify(this.objects));
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

}
