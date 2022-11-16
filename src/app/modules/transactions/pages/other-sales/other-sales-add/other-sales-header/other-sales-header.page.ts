import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController } from '@ionic/angular';
import { id } from 'date-fns/locale';
import { OtherSalesService } from 'src/app/modules/transactions/services/other-sales.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';

@Component({
  selector: 'app-other-sales-header',
  templateUrl: './other-sales-header.page.html',
  styleUrls: ['./other-sales-header.page.scss'],
})
export class OtherSalesHeaderPage implements OnInit {

  objectForm: FormGroup;

  constructor(
    private otherSalesService: OtherSalesService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder
  ) {
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      otherSalesId: [0],
      otherSalesNum: [null],
      trxDate: [null, [Validators.required]],
      typeCode: [null, [Validators.required]],
      salesAgentId: [null],
      customerId: [null, [Validators.required]],
      businessModelType: [null, [Validators.required]],
      termPeriodId: [null],
      countryId: [null],
      currencyId: [null],
      isItemPriceTaxInclusive: [null],
      isDisplayTaxInclusive: [null],
      locationId: [null],
      toLocationId: [null, [Validators.required]],
      sourceType: ['M'],
    })
  }

  ngOnInit() {
    this.loadMasterList();
    this.loadStaticLov();
  }

  salesAgentMasterList: MasterListDetails[] = [];
  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.otherSalesService.getMasterList().subscribe(response => {
      this.salesAgentMasterList = response.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.attribute5 != "T").filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.mapMasterListSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  otherSalesTypeMasterList: MasterListDetails[] = [];
  loadStaticLov() {
    this.otherSalesService.getStaticLov().subscribe(response => {
      this.otherSalesTypeMasterList = response.filter(x => x.objectName == 'OtherSalesType').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.mapStaticLovSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  customerSearchDropdownList: SearchDropdownList[] = [];
  locationSearchDropdownList: SearchDropdownList[] = [];
  salesAgentSearchDropdownList: SearchDropdownList[] = [];
  mapMasterListSearchDropdownList() {
    this.customerMasterList.forEach(r => {
      this.customerSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
    this.salesAgentMasterList.forEach(r => {
      this.salesAgentSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  otherSalesTypeSearchDropdownList: SearchDropdownList[] = [];
  mapStaticLovSearchDropdownList() {
    this.otherSalesTypeMasterList.forEach(r => {
      this.otherSalesTypeSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  onTrxDateSelected(event: Date) {
    if (event) {
      this.objectForm.patchValue({ trxDate: event });
    }
  }

  onOtherSalesTypeChanged(event) {
    if (event) {
      this.objectForm.patchValue({ typeCode: event.code });
    }
  }

  onCustomerChanged(event) {
    if (event) {
      let lookupValue = this.customerMasterList.find(r => r.id === event.id);
      if (lookupValue) {
        this.objectForm.patchValue({ customerId: lookupValue.id });
        this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
        let selectedCustomerLocationList: MasterListDetails[] = [];
        if (lookupValue.attributeArray1.length > 0) {
          selectedCustomerLocationList = this.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
        }
        this.objectForm.patchValue({
          salesAgentId: parseFloat(lookupValue.attribute1),
          termPeriodId: parseFloat(lookupValue.attribute2),
          countryId: parseFloat(lookupValue.attribute3),
          currencyId: parseFloat(lookupValue.attribute4),
          toLocationId: null,
          isItemPriceTaxInclusive: lookupValue.attribute8 == '1' ? true : false,
          isDisplayTaxInclusive: lookupValue.attribute9 == '1' ? true : false
        });
        if (lookupValue.attribute5 == "T") {
          this.objectForm.controls.toLocationId.clearValidators();
          this.objectForm.controls.toLocationId.updateValueAndValidity();
        }
        if (lookupValue.attributeArray1.length == 1) {
          this.objectForm.patchValue({ toLocationId: selectedCustomerLocationList[0].id });
        }
        this.locationSearchDropdownList = [];
        selectedCustomerLocationList.forEach(r => {
          this.locationSearchDropdownList.push({
            id: r.id,
            code: r.code,
            description: r.description
          })
        })
      }
    }
  }

  onLocationChanged(event) {
    if (event) {
      this.objectForm.patchValue({ toLocationId: event.id });
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
      // this.otherSalesService.resetVariables();
      this.navController.navigateBack('/transactions/other-sales');
    }
  }

  nextStep() {
    // this.stockCountService.setHeader(this.objectForm.getRawValue());
    // this.stockCountService.removeLines();
    this.navController.navigateForward('/transactions/other-sales/other-sales-add/other-sales-item');
  }

}
