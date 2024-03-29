import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MultiPackingList } from '../../models/packing';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { PackingService } from '../../services/packing.service';
import { ActionSheetController, AlertController, IonSearchbar, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { format } from 'date-fns';
import { FilterPage } from '../filter/filter.page';
import { NavigationExtras } from '@angular/router';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
   selector: 'app-packing',
   templateUrl: './packing.page.html',
   styleUrls: ['./packing.page.scss'],
})
export class PackingPage implements OnInit, OnDestroy, ViewWillEnter {

   objects: MultiPackingList[] = [];

   startDate: Date;
   endDate: Date;

   // uniqueGrouping: Date[] = [];

   currentPage: number = 1;
   itemsPerPage: number = 12;

   constructor(
      private objectService: PackingService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private navController: NavController,
   ) {
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

   ngOnDestroy(): void {
      this.objectService.stopListening();
   }

   /* #region  crud */

   async loadObjects() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectListByDate(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
            this.objects = response;
            this.resetFilteredObj();
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

   // getObjects(date: Date) {
   //    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
   // }

   /* #endregion */

   /* #region add goods packing */

   async addObject() {
      try {
         this.navController.navigateForward("/transactions/packing/packing-header");
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
                  text: "Add Packing",
                  icon: "document-outline",
                  handler: () => {
                     this.addObject();
                  }
               },
               {
                  text: "Scan Packing Num.",
                  icon: "camera-outline",
                  handler: () => {
                     this.startScanning();
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

   /* #region scanner */

   @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;
   async startScanning() {
      const allowed = await this.checkPermission();
      if (allowed) {
         // this.scanActive = true;
         this.onCameraStatusChanged(true);
         const result = await BarcodeScanner.startScan();
         if (result.hasContent) {
            let barcode = result.content;
            // this.scanActive = false;
            this.onCameraStatusChanged(false);
            await this.searchbar.setFocus();
            this.itemSearchText = barcode;
            await this.search(barcode, true);
         }
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

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

   async checkPermission() {
      return new Promise(async (resolve) => {
         const status = await BarcodeScanner.checkPermission({ force: true });
         if (status.granted) {
            resolve(true);
         } else if (status.denied) {
            const alert = await this.alertController.create({
               header: 'No permission',
               message: 'Please allow camera access in your setting',
               buttons: [
                  {
                     text: 'Open Settings',
                     handler: () => {
                        BarcodeScanner.openAppSettings();
                        resolve(false);
                     },
                  },
                  {
                     text: 'No',
                     role: 'cancel',
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
         this.navController.navigateForward("/transactions/packing/packing-detail", navigationExtras);
      } catch (e) {
         console.error(e);
      }
   }

   highlight(event) {
      event.getInputElement().then(r => {
         r.select();
      })
   }

   async onKeyDown(event, searchText) {
      if (event.keyCode === 13) {
         await this.search(searchText, true);
      }
   }

   itemSearchText: string;
   filteredObj: MultiPackingList[] = [];
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
               r.multiPackingNum.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationCode.toUpperCase().includes(searchText.toUpperCase()) ||
               r.locationDescription.toUpperCase().includes(searchText.toUpperCase()) ||
               r.warehouseAgentName.toUpperCase().includes(searchText.toUpperCase())
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

}
