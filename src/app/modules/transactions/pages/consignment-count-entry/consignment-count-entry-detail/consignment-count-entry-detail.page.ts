import { Component, OnInit, ViewChild } from '@angular/core';
import { ConsignmentCountEntryService } from '../../../services/consignment-count-entry.service';
import { ActivatedRoute } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { ViewWillEnter, NavController, AlertController, IonPopover } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Keyboard } from '@capacitor/keyboard';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
   selector: 'app-consignment-count-entry-detail',
   templateUrl: './consignment-count-entry-detail.page.html',
   styleUrls: ['./consignment-count-entry-detail.page.scss'],
})
export class ConsignmentCountEntryDetailPage implements OnInit, ViewWillEnter {

   objectId: number;
   isLocal: boolean = false;
   guid: string = null;
   currentPage: number = 1;
   itemsPerPage: number = 20;

   constructor(
      public objectService: ConsignmentCountEntryService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private route: ActivatedRoute,
      private navController: NavController,
      private alertController: AlertController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      if ((await Network.getStatus()).connected) {
         await this.objectService.loadRequiredMaster();
      }
      this.route.queryParams.subscribe(async params => {         
         this.objectId = params["objectId"];
         if (this.objectId) {
            await this.loadObject();
         }
      })
   }

   ngOnInit() {

   }

   async loadObject() {
      try {
         await this.loadingService.showLoading();
         this.objectService.getObjectById(this.objectId).subscribe(async response => {
            let object = response;
            object.details.forEach(r => {
               r.guid = uuidv4();
            })
            this.objectService.setObject(object);
            await this.resetFilteredObj();
         }, async error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   edit() {
      this.navController.navigateRoot("/transactions/consignment-count-entry/consignment-count-entry-header");
   }

   previousStep() {
      this.objectService.resetVariables();
      this.navController.navigateBack("/transactions/consignment-count-entry");
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

   /* #region line search bar */

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
   filteredObj: TransactionDetail[] = [];
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
            this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object.details.filter(r =>
               r.itemCode?.toUpperCase().includes(searchText.toUpperCase())
               || r.itemBarcode?.toUpperCase().includes(searchText.toUpperCase())
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
      this.filteredObj = JSON.parse(JSON.stringify(this.objectService.object.details));
   }

   /* #endregion */

   filter(details: InnerVariationDetail[]) {
      try {
         return details.filter(r => r.qtyRequest > 0);
      } catch (e) {
         console.error(e);
      }
   }

   /* #region show variaton dialog */

   selectedItem: TransactionDetail;
   showDetails(item: TransactionDetail) {
      this.filteredObj.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
   }

   /* #endregion */

}
