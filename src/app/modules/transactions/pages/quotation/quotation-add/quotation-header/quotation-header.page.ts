import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
  selector: 'app-quotation-header',
  templateUrl: './quotation-header.page.html',
  styleUrls: ['./quotation-header.page.scss'],
})
export class QuotationHeaderPage implements OnInit {

  objectForm: FormGroup;

  customPopoverOptions: any = {
    message: 'Select one',
    cssClass: 'popover-in-modal'
  };

  constructor(
    private authService: AuthService,
    private quotationService: QuotationService,
    private navController: NavController,
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController) {
    this.newForm();
  }

  newForm() {
    this.objectForm = this.formBuilder.group({
      quotationId: [0],
      quotationNum: [null],
      salesAgentId: [null],
      trxDate: [new Date()],
      typeCode: [null],
      customerId: [null, [Validators.required]],
      shipAddress: [null, [Validators.maxLength(500)]],
      shipPostCode: [null],
      shipPhone: [null],
      shipEmail: [null, [Validators.email]],
      shipFax: [null],
      shipAreaId: [null],
      shipMethodId: [null],
      attention: [null],
      termPeriodId: [null],
      locationId: [null],
      toLocationId: [null],
      countryId: [null],
      currencyId: [null],
      currencyRate: [null],
      quotationUDField1: [null],
      quotationUDField2: [null],
      quotationUDField3: [null],
      quotationUDOption1: [null],
      quotationUDOption2: [null],
      quotationUDOption3: [null],
      deactivated: [null],
      workFlowTransactionId: [null],
      masterUDGroup1: [null],
      masterUDGroup2: [null],
      masterUDGroup3: [null],
      isItemPriceTaxInclusive: [null],
      isDisplayTaxInclusive: [null],
      sourceType: ['M'],
      businessModelType: [null],
      remark: [null],
      isHomeCurrency: [null],
      maxPrecision: [null],
      maxPrecisionTax: [null]
    });
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadCustomerList();
    this.loadMasterList();
  }
  
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {    
    this.authService.precisionList$.subscribe(precision =>{
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
    })
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.quotationService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.currencyMasterList = response.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  customers: Customer[] = [];
  selectedCustomer: Customer;
  customerSearchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
    this.quotationService.getCustomerList().subscribe(response => {
      this.customers = response;
      this.customers = this.customers.filter(r => r.businessModelType === 'T');
      this.customers.forEach(r => {
        this.customerSearchDropdownList.push({
          id: r.customerId,
          code: r.customerCode,
          description: r.name
        })
      })
    }, error => {
      console.log(error);
    })
  }

  selectedCustomerLocationList: MasterListDetails[] = [];
  onCustomerSelected(event) {
    if (event && event !== undefined) {
      var lookupValue = this.customerMasterList?.find(e => e.id === event.id);
      if (lookupValue != undefined) {
        this.quotationService.removeItems();
        this.objectForm.patchValue({ customerId: lookupValue.id });
        this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
        if (lookupValue.attributeArray1.length > 0) {
          this.selectedCustomerLocationList = this.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
        } else {
          this.selectedCustomerLocationList = [];
        }
        this.objectForm.patchValue({ 
          salesAgentId: parseFloat(lookupValue.attribute1), 
          termPeriodId: parseFloat(lookupValue.attribute2), 
          countryId: parseFloat(lookupValue.attribute3), 
          currencyId: parseFloat(lookupValue.attribute4), 
          locationId: parseFloat(lookupValue.attribute6), 
          toLocationId: null, 
          isItemPriceTaxInclusive: lookupValue.attribute8 == '1' ? true : false, 
          isDisplayTaxInclusive: lookupValue.attribute9 == '1' ? true : false 
        });
        this.onCurrencySelected(lookupValue.attribute4);
        if (lookupValue.attribute5 == "T") {
          this.objectForm.controls.toLocationId.clearValidators();
          this.objectForm.controls.toLocationId.updateValueAndValidity();
        }
        if (lookupValue.attributeArray1.length == 1) {
          this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
        }
        //Auto map object type code
        if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
          this.objectForm.patchValue({ typeCode: 'S' });
        } else {
          this.objectForm.patchValue({ typeCode: 'T' });
        }
      }
    }
  }

  onCurrencySelected(event: any) {
    if (event) {
      var lookupValue = this.currencyMasterList?.find(e => e.id == event);
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
  }

  async cancelInsert() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Are you sure to cancel?',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    if (role === 'confirm') {
      this.quotationService.resetVariables();
      this.navController.navigateBack('/transactions/quotation');
    }
  }

  async nextStep() {
    await this.quotationService.setHeader(this.objectForm.value);
    this.navController.navigateForward('/transactions/quotation/quotation-item');    
  }

}
