import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CreditInfo, CreditInfoDetails } from 'src/app/shared/models/credit-info';
import { MasterListDetails, ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-backtoback-order-header',
  templateUrl: './backtoback-order-header.page.html',
  styleUrls: ['./backtoback-order-header.page.scss'],
})
export class BacktobackOrderHeaderPage implements OnInit {

  objectForm: FormGroup;

  customPopoverOptions: any = {
    message: 'Select one',
    cssClass: 'popover-in-modal'
  };

  constructor(
    private authService: AuthService,
    public objectService: BackToBackOrderService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private modalController: ModalController
  ) {
    this.newForm();
  }

  newForm() {
    this.objectForm = this.formBuilder.group({
      backToBackOrderId: [0],
      backToBackOrderNum: [null],
      salesAgentId: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
      typeCode: [null],
      customerId: [null],
      shipAddress: [null, [Validators.maxLength(500)]],
      shipPostCode: [null],
      shipPhone: [null],
      shipEmail: [null, [Validators.email]],
      shipFax: [null],
      shipAreaId: [null],
      shipStateId: [null],
      shipMethodId: [null],
      attention: [null],
      termPeriodId: [null],
      locationId: [null],
      toLocationId: [null],
      countryId: [null],
      currencyId: [null],
      currencyRate: [null],
      backToBackOrderUDField1: [null],
      backToBackOrderUDField2: [null],
      backToBackOrderUDField3: [null],
      backToBackOrderUDOption1: [null],
      backToBackOrderUDOption2: [null],
      backToBackOrderUDOption3: [null],
      deactivated: [null],
      workFlowTransactionId: [null],
      masterUDGroup1: [null],
      masterUDGroup2: [null],
      masterUDGroup3: [null],
      isItemPriceTaxInclusive: [null],
      isDisplayTaxInclusive: [null],
      businessModelType: [null],
      remark: [null],
      isHomeCurrency: [null],
      maxPrecision: [null],
      maxPrecisionTax: [null],
      status: [null],
      isCompleted: [null],
      posLocationId: [null],
      posLocationCode: [null],
      sourceType: ['M']
    });
  }

  ngOnInit() {
    this.loadModuleControl();
    this.setDefaultValue();
  }

  selectedCustomer: Customer;
  
  moduleControl: ModuleControl[];
  allowDocumentWithEmptyLine: string = "N";
  systemWideDisableDocumentNumber: boolean = false;
  configSalesActivatePromotionEngine: boolean;
  workflowEnablePrintAfterApproved: boolean;
  disableTradeTransactionGenerateGL: boolean;
  BoDoSiDisplayPosLocationCode: boolean = false;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionCurrency: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
      if (config != undefined) {
        this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
      }
      let config2 = this.moduleControl.find(x => x.ctrlName === "WorkflowEnablePrintAfterApproved")?.ctrlValue;
      if (config2 && config2.toUpperCase() == "Y") {
        this.workflowEnablePrintAfterApproved = true;
      } else {
        this.workflowEnablePrintAfterApproved = false;
      }
      let config3 = this.moduleControl.find(x => x.ctrlName === "DisableTradeTransactionGenerateGL")?.ctrlValue;
      if (config3 && config3.toUpperCase() == "Y") {
        this.disableTradeTransactionGenerateGL = true;
      } else {
        this.disableTradeTransactionGenerateGL = false;
      }
      let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine")?.ctrlValue;
      if (salesActivatePromotionEngine && salesActivatePromotionEngine.toUpperCase() == "Y") {
        this.configSalesActivatePromotionEngine = true;
      } else {
        this.configSalesActivatePromotionEngine = false;
      }
      let restrictDocnum = this.moduleControl.find(x => x.ctrlName === "SystemWideDisableDocumentNumber");
      if (restrictDocnum && restrictDocnum.ctrlValue.toUpperCase() == 'Y') {
        this.systemWideDisableDocumentNumber = true;
      }
      let displayPosLocation = this.moduleControl.find(x => x.ctrlName === "BoDoSiDisplayPosLocationCode");
      if (displayPosLocation && displayPosLocation.ctrlValue.toUpperCase() == 'Y') {
        this.BoDoSiDisplayPosLocationCode = true;
      }
      this.loadRestrictColumms();
    })
    this.authService.precisionList$.subscribe(precision => {
      this.precisionCurrency = precision.find(x => x.precisionCode == "CURRENCY");
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
    })
  }
  
  restrictFields: any = {};
  restrictTrxFields: any = {};
  loadRestrictColumms() {
    let restrictedObject = {};
    let restrictedTrx = {};
    this.authService.restrictedColumn$.subscribe(obj => {
      let apiData = obj.filter(x => x.moduleName == "SM" && x.objectName == "BackToBackOrder").map(y => y.fieldName);
      apiData.forEach(element => {
        Object.keys(this.objectForm.controls).forEach(ctrl => {
          if (element.toUpperCase() === ctrl.toUpperCase()) {
            restrictedObject[ctrl] = true;
          }
        });
      });
      if (!this.authService.isAdmin && this.systemWideDisableDocumentNumber) {
        restrictedObject['backToBackOrderNum'] = true;
      }
      this.restrictFields = restrictedObject;
      let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "BackToBackOrderLine").map(y => y.fieldName);
      trxDataColumns.forEach(element => {
        restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
      });
      this.restrictTrxFields = restrictedTrx;
    })
  }

  setDefaultValue() {
    let defaultTermPeriod = this.objectService.termPeriodMasterList.find(item => item.isPrimary)?.id;
    if (defaultTermPeriod) {
      this.objectForm.patchValue({ termPeriodId: defaultTermPeriod });
    }
    let defaultLocation = this.objectService.locationMasterList.find(item => item.isPrimary)?.id;
    if (defaultLocation) {
      this.objectForm.patchValue({ locationId: defaultLocation });
    }
    let defaultAgent = this.objectService.salesAgentMasterList.find(item => item.isPrimary)?.id;
    if (defaultAgent) {
      this.objectForm.patchValue({ salesAgentId: defaultAgent });
    }
    let defaultCountry = this.objectService.countryMasterList.find(item => item.isPrimary)?.id;
    if (defaultCountry) {
      this.objectForm.patchValue({ countryId: defaultCountry });
    }
    let defaultCurrency = this.objectService.currencyMasterList.find(item => item.isPrimary)
    if (defaultCurrency) {
      this.objectForm.patchValue({ currencyId: defaultCurrency.id });
      this.onCurrencySelected(defaultCurrency.id);
    }
    let defaultTypeCode = this.objectService.salesTypeList.find(item => item.isPrimary)?.code;
    if (defaultTypeCode) {
      this.objectForm.patchValue({ typeCode: defaultTypeCode });
    }
    let defaultShipMethod = this.objectService.shipMethodMasterList.find(r => r.isPrimary);
    if (defaultShipMethod) {
      this.objectForm.patchValue({ shipMethodId: defaultShipMethod.id });
    }
  }

  selectedCustomerLocationList: MasterListDetails[] = [];
  availableAddress: ShippingInfo[] = [];
  creditInfo: CreditInfo = { creditLimit: null, creditTerms: null, isCheckCreditLimit: null, isCheckCreditTerm: null, utilizedLimit: null, pendingOrderAmount: null, outstandingAmount: null, availableLimit: null, overdueAmount: null, pending: [], outstanding: [], overdue: [] };
  onCustomerSelected(event: any, ignoreCurrencyRate?: boolean) {
    var lookupValue = this.objectService.customerMasterList?.find(e => e.id === event.id);
    if (lookupValue != undefined) {
      this.objectService.removeItems();
      this.objectForm.patchValue({ customerId: lookupValue.id });
      this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
      if (lookupValue.attributeArray1.length > 0) {
        this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
      } else {
        this.selectedCustomerLocationList = [];
      }
      this.objectForm.patchValue({ salesAgentId: parseFloat(lookupValue.attribute1), termPeriodId: parseFloat(lookupValue.attribute2), countryId: parseFloat(lookupValue.attribute3), locationId: parseFloat(lookupValue.attribute6), toLocationId: null, isItemPriceTaxInclusive: lookupValue.attribute8 == '1' ? true : false, isDisplayTaxInclusive: lookupValue.attribute9 == '1' ? true : false });
      // this.commonService.lookUpSalesAgent(this.objectForm, this.objectService.customerMasterList);
      if (!ignoreCurrencyRate) {
        this.objectForm.patchValue({ currencyId: parseFloat(lookupValue.attribute4) });
      }
      this.onCurrencySelected(this.objectForm.controls.currencyId.value);
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
        this.objectForm.controls['typeCode'].disable();
      } else {
        this.objectForm.patchValue({ typeCode: 'T' });
        this.objectForm.controls['typeCode'].disable();
      }
      this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectForm.controls['customerId'].value).flatMap(r => r.shippingInfo);// handle location
    }
    if (!this.disableTradeTransactionGenerateGL) {
      this.objectService.getCreditInfo(this.objectForm.controls.customerId.value).subscribe(response => {
        if (response) {
          this.creditInfo = response;
        }
      })
    }
    if (this.configSalesActivatePromotionEngine) {
      // this.loadPromotion(this.objectForm.controls.customerId.value);
    }
  }

  onCurrencySelected(event: any) {
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

  displayModal: boolean = false;
  creditInfoType: string = '';
  tableValue: CreditInfoDetails[] = [];
  displayDetails(tableValue: CreditInfoDetails[], infoType: string) {
    try {
      this.displayModal = true;
      this.creditInfoType = infoType;
      this.tableValue = [];
      this.tableValue = [...tableValue];
    } catch (e) {
      console.error(e);
    }
  }

  hideItemModal() {
    this.displayModal = false;
  }

  async cancelInsert() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you sure to cancel?',
        subHeader: 'Changes made will be discard.',
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
        this.objectService.resetVariables();
        this.navController.navigateBack('/transactions/backtoback-order');
      }      
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      await this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward('/transactions/backtoback-order/backtoback-order-item');
    } catch (e) {
      console.error(e);
    }
  }

}
