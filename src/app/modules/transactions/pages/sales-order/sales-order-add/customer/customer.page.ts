import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  objectForm: UntypedFormGroup;

  moduleControl: ModuleControl[] = [];

  transactionShowDetailHeader: boolean = true;

  constructor(
    private authService: AuthService,
    private salesOrderService: SalesOrderService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private modalController: ModalController
  ) {
    this.newForm();
  }

  ngOnInit() {
    this.loadCustomerList();
    this.loadMasterList();
    this.loadModuleControl();
  }
  
  customers: Customer[] = [];
  selectedCustomer: Customer;
  customerSearchDropdownList: SearchDropdownList[] = [];
  loadCustomerList() {
    this.salesOrderService.getCustomerList().subscribe(response => {
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

  locationMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  countryMasterList: MasterListDetails[] = [];
  termPeriodMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.salesOrderService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.currencyMasterList = response.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.countryMasterList = response.filter(x => x.objectName == 'Country').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.termPeriodMasterList = response.filter(x => x.objectName == 'TermPeriod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.salesAgentMasterList = response.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.setDefaultValue();
      this.mapSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let transactionShowDetailHeader = this.moduleControl.find(r => r.ctrlName === "TransactionShowDetailHeader")?.ctrlValue;
      if (transactionShowDetailHeader) {
        this.transactionShowDetailHeader = transactionShowDetailHeader === '1' ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  newForm() {
    this.objectForm = this.formBuilder.group({
      locationId: [null],
      customerId: [null, [Validators.required]],
      currencyId: [null],
      exchangeRate: [null],
      countryId: [null],
      termPeriodId: [null],
      salesAgentId: [null],
      typeCode: [null],
      businessModelType: [null]
    });
  }

  setDefaultValue() {
    let defaultLocation = this.locationMasterList.find(item => item.isPrimary)?.id;
    if (defaultLocation) {
      this.objectForm.patchValue({ locationId: defaultLocation });
    }

    let defaultCurrency = this.currencyMasterList.find(item => item.isPrimary)
    if (defaultCurrency) {
      this.objectForm.patchValue({ currencyId: defaultCurrency.id });
      this.objectForm.patchValue({ exchangeRate: parseFloat(defaultCurrency.attribute1) });
    }

    let defaultCountry = this.countryMasterList.find(item => item.isPrimary)?.id;
    if (defaultCountry) {
      this.objectForm.patchValue({ countryId: defaultCountry });
    }

    let defaultTermPeriod = this.termPeriodMasterList.find(item => item.isPrimary)?.id;
    if (defaultTermPeriod) {
      this.objectForm.patchValue({ termPeriodId: defaultTermPeriod });
    }

    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    this.objectForm.patchValue({ salesAgentId: salesAgentId });
  }

  locationSearchDropdownList: SearchDropdownList[] = [];
  mapSearchDropdownList() {
    this.locationMasterList.forEach(r => {
      this.locationSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  async showLocationSearchDropdown() {
    let dropdownlist: SearchDropdownList[] = [];
    // change source
    this.locationMasterList.forEach(r => {
      dropdownlist.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
    const modal = await this.modalController.create({
      component: SearchDropdownPage,
      componentProps: {
        searchDropdownList: dropdownlist
      },
      canDismiss: true
    });
    await modal.present();
    let { data } = await modal.onWillDismiss();
    if (data) {
      this.objectForm.patchValue({ locationId: data.id });
    }
  }

  locationChanged(event) {
    this.objectForm.patchValue({ locationId: event.id });
  }

  onCustomerSelected(event) {
    if (event && event !== undefined) {
      var lookupValue = this.customers.find(r => r.customerId === event.id);
      this.selectedCustomer = lookupValue;
      // Auto map object type code
      this.objectForm.patchValue({ customerId: event.id });
      this.objectForm.patchValue({ businessModelType: lookupValue.businessModelType });
      if (lookupValue.businessModelType == "T" || lookupValue.businessModelType == "F") {
        this.objectForm.patchValue({ typeCode: 'S' });
      } else {
        this.objectForm.patchValue({ typeCode: 'T' });
      }
    }
  }

  currencyChanged(event) {
    var lookupValue = this.currencyMasterList?.find(e => e.id == event.detail.value);
    // Auto map object type code
    this.objectForm.patchValue({ exchangeRate: parseFloat(lookupValue.attribute1) });
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
      this.salesOrderService.resetVariables();
      this.navController.navigateBack('/transactions/sales-order');
    }
  }

  nextStep() {
    if (this.objectForm.valid) {
      this.salesOrderService.setChoosenCustomer(this.objectForm.value);
      this.salesOrderService.removeItems();
      this.navController.navigateForward('/transactions/sales-order/sales-order-item');
    } else {
      this.toastService.presentToast('Error', 'Please select customer to continue', 'bottom', 'danger', 1000);
    }
  }

}
