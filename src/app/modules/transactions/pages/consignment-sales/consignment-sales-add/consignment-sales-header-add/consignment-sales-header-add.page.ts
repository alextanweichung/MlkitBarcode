import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-sales-header-add',
  templateUrl: './consignment-sales-header-add.page.html',
  styleUrls: ['./consignment-sales-header-add.page.scss'],
})
export class ConsignmentSalesHeaderAddPage implements OnInit, ViewWillEnter {

  objectForm: FormGroup;
  trxDate: Date = null;

  constructor(
    private authService: AuthService,
    public objectService: ConsignmentSalesService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private formBuilder: FormBuilder
  ) {
    if (!this.trxDate) {
      this.trxDate = this.commonService.getTodayDate();
    }
    this.newObjectForm();
  }

  ionViewWillEnter(): void {
    if (!this.trxDate) {
      this.trxDate = this.commonService.getTodayDate();
    }
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      consignmentSalesId: [0],
      consignmentSalesNum: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
      customerId: [null],
      locationId: [null],
      toLocationId: [this.objectService.locationList.find(r => r.isPrimary)?.locationId, [Validators.required]],
      toLocationCode: [this.objectService.locationList.find(r => r.isPrimary)?.locationCode, [Validators.required]],
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
      businessModelType: [null]
    })
  }

  ngOnInit() {
    this.loadModuleControl();
    this.bindLocationList();
    this.bindMasterList();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
    }
  }

  locationSearchDropdownList: SearchDropdownList[] = [];
  bindLocationList() {
    try {
      this.objectService.locationList.forEach(r => {
        this.locationSearchDropdownList.push({
          id: r.locationId,
          code: r.locationCode,
          description: r.locationDescription
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

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

  onTrxDateSelected(event: Date) {
    if (event) {
      this.objectForm.patchValue({ trxDate: event });
    }
  }

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
            isItemPriceTaxInclusive: lookupValue.attribute8 == "1" ? true : false,
            isDisplayTaxInclusive: lookupValue.attribute9 == "1" ? true : false
          });
          this.onCurrencySelected(lookupValue.attribute4);
          if (lookupValue.attribute5 == "T") {
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
        var lookupValue = this.objectService.currencyMasterList?.find(e => e.id == event);
        if (lookupValue != undefined) {
          this.objectForm.patchValue({ currencyRate: parseFloat(lookupValue.attribute1) });
          if (lookupValue.attribute2 == "Y") {
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
            let customerId = this.objectService.locationList.find(r => r.locationId === event.id)?.customerId;
            if (customerId) {
              this.onCustomerChanged(customerId)
            }
            this.objectForm.patchValue({ toLocationId: event.id, toLocationCode: event.code });
            await this.objectService.refreshLocalDb(event.code);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel"
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
        this.objectService.getExistingObject(format(new Date(this.objectForm.controls.trxDate.value), "yyyy-MM-dd"), this.objectForm.controls.toLocationId.value).subscribe(response => {
          if (response) {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                objectId: response.header.consignmentSalesId
              }
            }
            this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-item-edit", navigationExtras);
          } else {
            this.objectService.setHeader(this.objectForm.value);
            this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-item-add");
          }
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

}
