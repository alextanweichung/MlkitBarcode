import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, IonSegment, NavController } from '@ionic/angular';
import { PackingSalesOrderRoot } from 'src/app/modules/transactions/models/packing-sales-order';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
  selector: 'app-packing-sales-order',
  templateUrl: './packing-sales-order.page.html',
  styleUrls: ['./packing-sales-order.page.scss'],
})
export class PackingSalesOrderPage implements OnInit {

  objectForm: FormGroup;

  constructor(
    private packingService: PackingService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.newObjectForm();
  }

  ngOnInit() {
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  warehouseAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.packingService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemUomMasterList = response.filter(x => x.objectName == 'ItemUom').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.warehouseAgentMasterList = response.filter(x => x.objectName == 'WarehouseAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.mapSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  customerSearchDropdownList: SearchDropdownList[] = [];
  locationSearchDropdownList: SearchDropdownList[] = [];
  selectedCustomerLocationSearchDropdownList: SearchDropdownList[] = [];
  mapSearchDropdownList() {
    this.customerMasterList.forEach(r => {
      this.customerSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
    this.locationMasterList.forEach(r => {
      this.locationSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
    if (this.selectedCustomerLocationList && this.selectedCustomerLocationList.length > 0) {
      this.selectedCustomerLocationList.forEach(r => {
        this.selectedCustomerLocationSearchDropdownList.push({
          id: r.id,
          code: r.code,
          description: r.description
        })
      })
    } else {
      this.selectedCustomerLocationSearchDropdownList = [];
    }
  }

  customerId: number;
  selectedCustomer: MasterListDetails;
  selectedCustomerLocationList: MasterListDetails[] = [];
  onCustomerSelected(event) {
    this.availableSalesOrders = [];
    this.selectedSOs = [];
    this.customerId = event ? event.id : null;
    this.objectForm.patchValue({ customerId: this.customerId });
    if (this.customerId) {
      this.selectedCustomer = this.customerMasterList.find(r => r.id === this.customerId);

      if (this.selectedCustomer) {
        this.objectForm.patchValue({ businessModelType: this.selectedCustomer.attribute5 });

        if (this.objectForm.controls.businessModelType.value === 'R' || this.objectForm.controls.businessModelType.value === 'C') {
          
        } else {
          this.objectForm.patchValue({ isWithSo: true });
        }

        if (this.selectedCustomer.attributeArray1.length > 0) {
          this.selectedCustomerLocationList = this.locationMasterList.filter(value => this.selectedCustomer.attributeArray1.includes(value.id));
        } else {
          this.selectedCustomerLocationList = [];
        }
        this.objectForm.patchValue({ locationId: parseFloat(this.selectedCustomer.attribute6), toLocationId: null });

        if (this.selectedCustomer.attribute5 == "T") {
          this.getSoByCustomer(this.customerId);
          this.objectForm.controls.toLocationId.clearValidators();
          this.objectForm.controls.toLocationId.updateValueAndValidity();
        }
        if (this.selectedCustomer.attributeArray1.length == 1) {
          this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
          this.getSoByCustomerLocation(this.objectForm.controls.customerId.value, this.objectForm.controls.toLocationId.value);
        }

        //Auto map object type code
        if (this.selectedCustomer.attribute5 == "T" || this.selectedCustomer.attribute5 == "F") {
          this.objectForm.patchValue({ typeCode: 'S' });
          this.objectForm.controls['typeCode'].disable();
        } else {
          this.objectForm.patchValue({ typeCode: 'T' });
          this.objectForm.controls['typeCode'].disable();
        }

        if (this.selectedCustomer.attribute5 === "T") {
          // handle location
          // this.fLocationMasterList = this.locationMasterList.filter(r => r.attribute1 === 'W');
          if (this.selectedCustomer !== undefined) {
            this.objectForm.patchValue({ locationId: parseFloat(this.selectedCustomer.attribute6) });
          }
        } else {
          // this.fLocationMasterList = this.locationMasterList;
        }
      }
      // this.loadSalesOrders();
    }
    this.mapSearchDropdownList();
  }

  onCustomerLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ toLocationId: event.id });
      this.getSoByCustomerLocation(this.objectForm.controls.customerId.value, this.objectForm.controls.toLocationId.value);
    }
  }

  @ViewChild('segment', { static: false }) segment: IonSegment;
  async isWithSoChanged(event) {
    if (event.detail.value === 'withSo') {
      this.objectForm.patchValue({ isWithSo: true });
      // await this.onCustomerSelected({ id: this.customerId });
    } else {
      // this.availableSalesOrders = [];
      this.selectedSOs = [];
      this.objectForm.patchValue({ isWithSo: false });
    }
  }

  availableSalesOrders: PackingSalesOrderRoot[] = [];
  getSoByCustomer(customerId: number) {
    this.availableSalesOrders = [];
    this.selectedSOs = [];
    if (customerId) {
      this.packingService.getSoByCustomer(customerId).subscribe(response => {
        this.availableSalesOrders = response;
        this.toastService.presentToast('Search Completed', '', 'top', 'success', 1000);
      }, error => {
        console.log(error);
      })
    } else {
      this.toastService.presentToast('Customer cannot be null', '', 'top', 'danger', 1000);
    }
  }

  getSoByCustomerLocation(customerId: number, locationId: number) {
    this.availableSalesOrders = [];
    this.selectedSOs = [];
    if (customerId && locationId) {
      this.packingService.getSoByCustomerLocation(customerId, locationId).subscribe(response => {
        this.availableSalesOrders = response;
        this.toastService.presentToast('Search Completed', '', 'top', 'success', 1000);
      }, error => {
        console.log(error);
      })
    } else {
      this.toastService.presentToast('Customer & Location cannot be null', '', 'top', 'danger', 1000);
    }
  }

  selectedSOs: PackingSalesOrderRoot[] = [];
  salesOrderChecked(event, salesOrder: PackingSalesOrderRoot) {
    if (event.detail.checked) {
      if (this.selectedSOs.findIndex(r => r.header.salesOrderId === salesOrder.header.salesOrderId) > -1) {
        // already in
      } else {
        this.selectedSOs.push(salesOrder);
      }
    } else {
      this.selectedSOs.splice(this.selectedSOs.findIndex(r => r.header.salesOrderId === salesOrder.header.salesOrderId), 1);
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
      this.packingService.resetVariables();
      this.navController.navigateBack('/transactions/packing');
    }
  }

  nextStep() {
    if (!this.objectForm.valid) {
      this.toastService.presentToast('Something went wrong.', '', 'top', 'danger', 1000);
      return;
    }
    if (this.objectForm.controls.isWithSo.value && this.selectedSOs.length === 0) {
      this.toastService.presentToast('Select at least 1 SO', '', 'top', 'danger', 1000);
      return;
    }
    this.packingService.setHeader(this.objectForm.getRawValue());
    this.packingService.setChoosenSalesOrders(this.selectedSOs);
    this.navController.navigateForward('/transactions/packing/packing-item');
  }

  /* #region  form */

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      packingId: [0],
      packingNum: [null],
      trxDate: [new Date(), [Validators.required]],
      locationId: [null, [Validators.required]],
      toLocationId: [null],
      customerId: [null, [Validators.required]],
      typeCode: [null],
      warehouseAgentId: [JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId],
      packingUDField1: [null],
      packingUDField2: [null],
      packingUDField3: [null],
      packingUDOption1: [null],
      packingUDOption2: [null],
      packingUDOption3: [null],
      deactivated: [null],
      workFlowTransactionId: [null],
      masterUDGroup1: [null],
      masterUDGroup2: [null],
      masterUDGroup3: [null],
      businessModelType: [null],
      isWithSo: [true],
      sourceType: ['M'],
      remark: [null]
    });
  }

  /* #endregion */

}
