import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  objectForm: FormGroup;

  constructor(
    private salesOrderService: SalesOrderService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.newForm();
  }

  ngOnInit() {
    this.loadMasterList();
  }
  
  locationMasterList: MasterListDetails[] = [];
  customerMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  countryMasterList: MasterListDetails[] = [];
  termPeriodMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.salesOrderService.getMasterList().subscribe(response => {
      console.log("🚀 ~ file: customer.page.ts ~ line 46 ~ CustomerPage ~ this.salesOrderService.getMasterList ~ response", response)
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.currencyMasterList = response.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.countryMasterList = response.filter(x => x.objectName == 'Country').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.termPeriodMasterList = response.filter(x => x.objectName == 'TermPeriod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.salesAgentMasterList = response.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.setDefaultValue();
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

    let defaultCustomer = this.customerMasterList.find(item => item.isPrimary)?.id;
    if (defaultCustomer) {
      this.objectForm.patchValue({ customerId: defaultCustomer });
    }

    let defaultCurrency = this.currencyMasterList.find(item => item.isPrimary)
    if (defaultCurrency) {
      this.objectForm.patchValue({ currencyId: defaultCurrency.id });
    }

    let defaultCountry = this.countryMasterList.find(item => item.isPrimary)?.id;
    if (defaultCountry) {
      this.objectForm.patchValue({ countryId: defaultCountry });
    }

    let defaultTermPeriod = this.termPeriodMasterList.find(item => item.isPrimary)?.id;
    if (defaultTermPeriod) {
      this.objectForm.patchValue({ termPeriodId: defaultTermPeriod });
    }

    let defaultAgent = this.salesAgentMasterList.find(item => item.isPrimary)?.id;
    if (defaultAgent) {
      this.objectForm.patchValue({ salesAgentId: defaultAgent });
    }
  }

  selectedCustomer: MasterListDetails;
  async showCustomerSearchDropdown() {
    let dropdownlist: SearchDropdownList[] = [];
    this.customerMasterList.forEach(r => {
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
      this.selectedCustomer = this.customerMasterList.find(r => r.id === data.id);
      this.objectForm.patchValue({ customerId: this.selectedCustomer.id });
    }
  }

  customerChanged(event) {
    var lookupValue = this.customerMasterList?.find(e => e.id == event.detail.value);
    this.selectedCustomer = lookupValue;
    // Auto map object type code
    this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
    if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
      this.objectForm.patchValue({ typeCode: 'S' });
    } else {
      this.objectForm.patchValue({ typeCode: 'T' });
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
      this.navController.navigateBack('/sales-order');
    }
  }

  nextStep() {
    console.log("🚀 ~ file: customer.page.ts ~ line 159 ~ CustomerPage ~ nextStep ~ this.objectForm.value", this.objectForm.value)
    if (this.objectForm.valid) {
      this.salesOrderService.setChoosenCustomer(this.objectForm.value);
      this.salesOrderService.removeItems();
      this.navController.navigateForward('/sales-order/sales-order-item');
    } else {
      this.toastService.presentToast('Error', 'Please select customer to continue', 'top', 'danger', 1500);
    }
  }

}
