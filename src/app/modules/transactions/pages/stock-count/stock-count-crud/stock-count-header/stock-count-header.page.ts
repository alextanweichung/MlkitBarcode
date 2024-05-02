import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { InventoryCountBatchList, StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-stock-count-header',
   templateUrl: './stock-count-header.page.html',
   styleUrls: ['./stock-count-header.page.scss'],
})
export class StockCountHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;

   constructor(
      public objectService: StockCountService,
      private configService: ConfigService,
      private commonService: CommonService,
      private actionSheetController: ActionSheetController,
      private navController: NavController,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute
   ) {
      this.newObjectForm();
   }
   
   ionViewWillEnter(): void {
      if (this.objectService.objectHeader) {
         this.bindExistingValue();
      }
      this.setFormattedDateString();
   }

   async ionViewDidEnter(): Promise<void> {
      if (!this.objectForm.controls.locationId.value && this.configService.selected_location) {
         this.objectForm.patchValue({ locationId: this.configService.selected_location });
         console.log("🚀 ~ StockCountHeaderPage ~ ionViewDidEnter ~ this.objectForm:", JSON.stringify(this.objectForm.value))
         await this.onLocationSelected({ id: this.configService.selected_location });
         this.dateValue = format(new Date(this.objectService.objectHeader.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
         this.setFormattedDateString();
      } else {

      }
   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         inventoryCountId: [0],
         inventoryCountNum: [null],
         description: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         locationId: [null, [Validators.required]],
         inventoryCountBatchId: [null, [Validators.required]],
         zoneId: [null],
         rackId: [null],
         inventoryCountUDField1: [null],
         inventoryCountUDField2: [null],
         inventoryCountUDField3: [null],
         inventoryCountUDOption1: [null],
         inventoryCountUDOption2: [null],
         inventoryCountUDOption3: [null],
         remark: [null, [Validators.maxLength(1000)]],
         cartonDesc: [null, [Validators.maxLength(100)]],
         zoneDesc: [null, [Validators.maxLength(100)]],
         rackDesc: [null, [Validators.maxLength(100)]]
      })
   }

   ngOnInit() {

   }

   bindExistingValue() {
      // bind display
      this.objectForm.patchValue(this.objectService.objectHeader);
      console.log("🚀 ~ StockCountHeaderPage ~ ionViewDidEnter ~ this.objectForm:", JSON.stringify(this.objectForm.value))
      this.dateValue = format(new Date(this.objectService.objectHeader.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
      if (this.objectService.objectHeader) {
         this.onLocationSelected({ id: this.objectService.objectHeader.locationId });
      }
   }

   fullInventoryCountBatchList: InventoryCountBatchList[] = [];
   inventoryCountBatchList: InventoryCountBatchList[] = [];
   inventoryCountBatchDdl: SearchDropdownList[] = [];
   @ViewChild("inventoryCountBatchSdd", { static: false }) inventoryCountBatchSdd: SearchDropdownPage;
   onLocationSelected(event: SearchDropdownList) {
      console.log("🚀 ~ StockCountHeaderPage ~ onLocationSelected ~ event:", event)
      try {
         this.objectForm.patchValue({ locationId: null });
         if (this.objectService.objectHeader?.inventoryCountId === null || this.objectService.objectHeader?.inventoryCountId === undefined) {
            this.inventoryCountBatchSdd.clearSelected();
         }
         if (event) {
            this.objectForm.patchValue({ locationId: event.id });
            this.inventoryCountBatchDdl = [];
            this.objectService.getInventoryCountBatchByLocationId(this.objectForm.controls.locationId.value).subscribe(response => {
               this.fullInventoryCountBatchList = response;
               console.log("🚀 ~ StockCountHeaderPage ~ this.objectService.getInventoryCountBatchByLocationId ~ this.inventoryCountBatchList:", JSON.stringify(this.inventoryCountBatchList))
               this.inventoryCountBatchList = this.fullInventoryCountBatchList.filter(r => !r.isCompleted);
               if (this.objectService.objectHeader?.inventoryCountId && this.objectService.objectHeader?.inventoryCountId > 0) {
                  this.objectService.objectHeader.inventoryCountBatchNum = this.fullInventoryCountBatchList?.find(r => r.inventoryCountBatchId === this.objectService.objectHeader.inventoryCountBatchId)?.inventoryCountBatchNum;
                  console.log("🚀 ~ StockCountHeaderPage ~ this.objectService.getInventoryCountBatchByLocationId ~ this.objectService.objectHeader:", JSON.stringify(this.objectService.objectHeader))
                  this.objectService.objectHeader.inventoryCountBatchDescription = this.fullInventoryCountBatchList?.find(r => r.inventoryCountBatchId === this.objectService.objectHeader.inventoryCountBatchId)?.description;
               }
               if (this.inventoryCountBatchList.length > 0) {
                  let temp: SearchDropdownList[] = [];
                  this.inventoryCountBatchList.forEach(r => {
                     temp.push({
                        id: r.inventoryCountBatchId,
                        code: r.inventoryCountBatchNum,
                        description: r.description
                     })
                  })
                  this.inventoryCountBatchDdl = JSON.parse(JSON.stringify(temp));
                  console.log("🚀 ~ StockCountHeaderPage ~ this.objectService.getInventoryCountBatchByLocationId ~ this.inventoryCountBatchDdl:", JSON.stringify(this.inventoryCountBatchDdl))
               }
            }, error => {
               console.error(error);
            })
         }
      } catch (e) {
         console.error(e);
      }
   }

   onInventoryCountBatchChanged(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ inventoryCountBatchId: event.id });
      } else {
         this.objectForm.patchValue({ inventoryCountBatchId: null });
      }
      this.objectService.objectDetail = [];
   }

   onZoneChanged(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ zoneId: event.id });
      } else {
         this.objectForm.patchValue({ zoneId: null });
      }
   }

   onRackChanged(event: SearchDropdownList) {
      if (event) {
         this.objectForm.patchValue({ rackId: event.id });
      } else {
         this.objectForm.patchValue({ rackId: null });
      }
   }

   async cancelInsert() {
      try {
         const actionSheet = await this.actionSheetController.create({
            header: "Are you sure to cancel?",
            subHeader: "Changes made will be discard.",
            cssClass: "custom-action-sheet",
            buttons: [
               {
                  text: "Yes",
                  role: "confirm",
               },
               {
                  text: "No",
                  role: "cancel",
               }]
         });
         await actionSheet.present();

         const { role } = await actionSheet.onWillDismiss();

         if (role === "confirm") {
            await this.objectService.resetVariables();
            if (this.objectService.objectHeader?.inventoryCountId && this.objectService.objectHeader?.inventoryCountId > 0) {
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader?.inventoryCountId
                  }
               }
               this.navController.navigateRoot("/transactions/stock-count/stock-count-detail", navigationExtras);
            } else {
               this.navController.navigateRoot("/transactions/stock-count");
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   nextStep() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/stock-count/stock-count-crud/stock-count-item");
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
   @ViewChild("datetime") datetime: IonDatetime
   setFormattedDateString() {
      this.formattedDateString = format(parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
   }

   onTrxDateSelected(value: any) {
      this.dateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
      this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`) });
   }

   dateDismiss() {
      this.datetime.cancel(true);
   }

   dateSelect() {
      this.datetime.confirm(true);
   }

   /* #endregion */

}
