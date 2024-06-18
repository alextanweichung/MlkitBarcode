import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonDatetime, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-consignment-sales-header',
   templateUrl: './consignment-sales-header.page.html',
   styleUrls: ['./consignment-sales-header.page.scss'],
})
export class ConsignmentSalesHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

   @ViewChild("locationDropdown", { static: false }) locationDropdown: SearchDropdownPage;

   objectForm: FormGroup;

   constructor(
      public objectService: ConsignmentSalesService,
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private navController: NavController,
      private actionSheetController: ActionSheetController,
      private alertController: AlertController,
      private formBuilder: FormBuilder
   ) {
      this.setFormattedDateString();
      this.newObjectForm();
   }

   async ionViewWillEnter(): Promise<void> {
      
   }

   ionViewDidEnter(): void {

   }

   newObjectForm() {
      this.objectForm = this.formBuilder.group({
         consignmentSalesId: [0],
         consignmentSalesNum: [null],
         trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
         customerId: [null],
         locationId: [null],
         toLocationId: [this.configService.selected_location ?? 0, [Validators.required]],
         toLocationCode: [null, [Validators.required]],
         currencyId: [null],
         currencyRate: [null],
         salesAgentId: [null],
         isHomeCurrency: [null],
         isItemPriceTaxInclusive: [null],
         isDisplayTaxInclusive: [null],
         maxPrecision: [null],
         maxPrecisionTax: [null],
         sourceType: ["M"],
         typeCode: ["S"],
         businessModelType: [null],
         isBearPromo: [null],
         marginMode: [null],
         uuid: [null]
      })
      if (this.configService.selected_location) {
         let findLocation = this.objectService.locationMasterList.find(r => r.id === this.configService.selected_location);
         this.objectForm.patchValue({
            toLocationId: findLocation.id,
            toLocationCode: findLocation.code,
            isBearPromo: findLocation.attribute6 === "1" ? true : false,
            marginMode: findLocation.attribute8
         })
         let customerId = Number(this.objectService.locationMasterList.find(r => r.id === this.configService.selected_location)?.attribute13);
         if (customerId) {
            this.onCustomerChanged(customerId)
         }
      }
   }

   ngOnInit() {
      this.loadModuleControl();
      // this.bindLocationList();
      this.bindMasterList();
   }

   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   loadModuleControl() {
      try {
         this.authService.precisionList$.subscribe(precision => {
            if (precision) {
               this.precisionSales = precision.find(x => x.precisionCode === "SALES");
               this.precisionTax = precision.find(x => x.precisionCode === "TAX");
            }
         })
      } catch (e) {
         console.error(e);
      }
   }

   // locationSearchDropdownList: SearchDropdownList[] = [];
   // bindLocationList() {
   //   try {
   //     this.objectService.locationMasterList.forEach(r => {
   //       this.locationSearchDropdownList.push({
   //         id: r.id,
   //         code: r.code,
   //         description: r.description
   //       })
   //     })
   //   } catch (e) {
   //     console.error(e);
   //   }
   // }

   customerSearchDropdownList: SearchDropdownList[] = [];
   salesAgentSearchDropdownList: SearchDropdownList[] = [];
   bindMasterList() {
      try {
         this.objectService.customerMasterList.forEach(r => {
            this.customerSearchDropdownList.push({
               id: r.id,
               code: r.code,
               description: r.description
            })
         })
         this.objectService.salesAgentMasterList.forEach(r => {
            this.salesAgentSearchDropdownList.push({
               id: r.id,
               code: r.code,
               description: r.description
            })
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region calendar handle here */

   formattedDateString: string = "";
   dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
   maxDate = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
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

   onCustomerChanged(customerId: number) {
      try {
         if (customerId) {
            let lookupValue = this.objectService.customerMasterList.find(r => r.id === customerId);
            if (lookupValue) {
               this.objectForm.patchValue({ customerId: lookupValue.id });
               this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
               this.objectForm.patchValue({
                  salesAgentId: parseFloat(lookupValue.attribute1),
                  currencyId: parseFloat(lookupValue.attribute4),
                  isItemPriceTaxInclusive: lookupValue.attribute8 === "1" ? true : false,
                  isDisplayTaxInclusive: lookupValue.attribute9 === "1" ? true : false
               });
               this.onCurrencySelected(lookupValue.attribute4);
               if (lookupValue.attribute5 === "T") {
                  this.objectForm.controls.toLocationId.clearValidators();
                  this.objectForm.controls.toLocationId.updateValueAndValidity();
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   onCurrencySelected(event) {
      try {
         if (event) {
            var lookupValue = this.objectService.currencyMasterList?.find(e => e.id === event);
            if (lookupValue != undefined) {
               this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
               if (lookupValue.attribute2 === "Y") {
                  this.objectForm.patchValue({ isHomeCurrency: true });
                  this.objectForm.patchValue({ maxPrecision: this.precisionSales.localMax });
                  this.objectForm.patchValue({ maxPrecisionTax: this.precisionTax.localMax });
               } else {
                  this.objectForm.patchValue({ isHomeCurrency: false });
                  this.objectForm.patchValue({ maxPrecision: this.precisionSales.foreignMax });
                  this.objectForm.patchValue({ maxPrecisionTax: this.precisionTax.foreignMax });
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onLocationChanged(event) {
      if (event) {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to change?",
            subHeader: "Changing location required to sync price.",
            buttons: [{
               text: "Proceed",
               cssClass: "success",
               handler: async () => {
                  let customerId = Number(this.objectService.locationMasterList.find(r => r.id === event.id)?.attribute13);
                  if (customerId) {
                     this.onCustomerChanged(customerId)
                  }
                  this.objectForm.patchValue({ toLocationId: event.id, toLocationCode: event.code });
                  let findLocation = this.objectService.locationMasterList.find(r => r.id === event.id);
                  this.objectForm.patchValue({
                     isBearPromo: findLocation.attribute6 === "1" ? true : false,
                     marginMode: findLocation.attribute8
                  })
               },
            },
            {
               text: "Cancel",
               role: "cancel",
               cssClass: "cancel",
               handler: () => {
                  this.locationDropdown.selectedId = this.objectForm.controls.toLocationId.value;
                  this.locationDropdown.selected = this.locationDropdown.searchDropdownList.find(r => r.id === this.locationDropdown.selectedId);
               }
            }]
         });
         await alert.present();
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
            this.objectService.resetVariables();
            this.navController.navigateBack("/transactions/consignment-sales");
         }
      } catch (e) {
         console.error(e);
      }
   }

   async nextStep() {
      try {
         if (this.objectForm.valid) {
            // this.objectService.getExistingObject(format(new Date(this.objectForm.controls.trxDate.value), "yyyy-MM-dd"), this.objectForm.controls.toLocationId.value).subscribe(response => {
            //   if (response) {
            //     let navigationExtras: NavigationExtras = {
            //       queryParams: {
            //         objectId: response.header.consignmentSalesId
            //       }
            //     }
            //     this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-item", navigationExtras);
            //   } else {
            this.objectService.setHeader(this.objectForm.getRawValue());
            this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-item");
            //   }
            // }, error => {
            //   console.error(error);
            // })
         }
      } catch (e) {
         console.error(e);
      }
   }

}
