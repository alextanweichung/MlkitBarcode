import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonPopover, IonSegment, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { MultiPickingOutstandingPickList, MultiPickingSORequest, MultiPickingSalesOrder } from 'src/app/modules/transactions/models/picking';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { PickingItemPage } from '../picking-item/picking-item.page';

@Component({
  selector: 'app-picking-header',
  templateUrl: './picking-header.page.html',
  styleUrls: ['./picking-header.page.scss'],
})
export class PickingHeaderPage implements OnInit {

  objectForm: FormGroup;
  loginUser: any;
  warehouseAgentId: number

  constructor(
    private authService: AuthService,
    public objectService: PickingService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.newObjectForm();
  }

  ngOnInit() {
    this.loginUser = JSON.parse(localStorage.getItem('loginUser'));
    this.warehouseAgentId = this.loginUser.warehouseAgentId;
    if (this.warehouseAgentId === null || this.warehouseAgentId === undefined) {
      this.toastService.presentToast("System Error", "Warehouse Agent not set.", "top", "danger", 1000);
      this.navController.navigateRoot("/transactions/picking");
    }
    this.loadModuleControl();
    this.setDefaultValue();
  }

  moduleControl: ModuleControl[];
  configSOSelectionEnforceSameOrigin: boolean = true;
  configSOSelectionEnforceSameDestination: boolean = true;
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let config = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameOrigin");
      if (config != undefined) {
        if (config.ctrlValue.toUpperCase() == 'Y') {
          this.configSOSelectionEnforceSameOrigin = true;
        } else {
          this.configSOSelectionEnforceSameOrigin = false;
        }
      }
      let config2 = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameDestination");
      if (config2 != undefined) {
        if (config2.ctrlValue.toUpperCase() == 'Y') {
          this.configSOSelectionEnforceSameDestination = true;
        } else {
          this.configSOSelectionEnforceSameDestination = false;
        }
      }
    })
  }

  setDefaultValue() {
    let defaultLocation = this.objectService.locationMasterList.find(item => item.isPrimary);
    if (defaultLocation) {
      this.objectForm.patchValue({ locationId: defaultLocation?.id });
      this.selectedLocationId = defaultLocation?.id;
    }
    let defaultCustomer = this.objectService.customerMasterList.find(r => r.isPrimary);
    if (defaultCustomer) {
      this.objectForm.patchValue({ customerId: defaultCustomer.id });
      this.onCustomerSelected(defaultCustomer);
    }
  }

  /* #region scanner input */

  itemSearchValue: string;
  handleSoKeyDown(e) {
    if (e.keyCode === 13) {
      this.validateSalesOrder(this.itemSearchValue);
      e.preventDefault();
    }
  }

  /* #endregion */

  /* #region handle SO */

  selectedSalesOrders: MultiPickingSalesOrder[] = [];
  // outstandingPickList: MultiPickingOutstandingPickList[] = [];
  uniqueSo: string[] = [];
  uniqueItemCode: string[] = [];
  validateSalesOrder(input: string) {
    if (input && input.length > 0) {
      this.itemSearchValue = null;
      let request: MultiPickingSORequest = {
        salesOrderNums: [input],
        warehouseAgentId: this.warehouseAgentId
      }
      if (this.selectedSalesOrders.findIndex(r => r.salesOrderNum.toLowerCase() === input.toLowerCase()) > -1) {
        this.toastService.presentToast("Document already selected.", "", "top", "warning", 1000);
      } else {
        this.objectService.getSOHeader(request).subscribe(response => {
          if (response.status === 200) {
            let so = response.body[0] as MultiPickingSalesOrder;
            if (so === undefined) {
              this.toastService.presentToast("", "Invalid Sales Order.", "top", "warning", 1000);
              return;
            }
            // checking for picking, refer to base system
            if (this.selectedSalesOrders.length > 0 && this.configSOSelectionEnforceSameOrigin && this.selectedSalesOrders[0].locationId != so.locationId) {
              this.toastService.presentToast("", "Not allow to combine sales order with different origin location.", "top", "warning", 1000);
              return;
            }
            if (this.selectedSalesOrders.length > 0 && this.selectedSalesOrders[0].customerId != so.customerId) {
              this.toastService.presentToast("", "Not allow to combine sales order with different customer.", "top", "warning", 1000);
              return;
            }
            this.selectedSalesOrders.unshift(so);
            if (this.selectedSalesOrders && this.selectedSalesOrders.length === 1) {
              this.onCustomerSelected({ id: this.selectedSalesOrders[0].customerId });
            }
            this.objectService.multiPickingObject.outstandingPickList = [...this.objectService.multiPickingObject.outstandingPickList, ...(response.body as MultiPickingSalesOrder[]).flatMap(x => x.line)];
            this.uniqueSo = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
            this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
          }
        }, error => {
          console.error(error);
        });
      }
    } else {
      this.toastService.presentToast("", "Invalid Sales Order.", "top", "warning", 1000);
    }
  }

  async deleteSo(salesOrderNum) {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to delete?',
        subHeader: 'Changes made will be discard.',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'danger',
            handler: async () => {
              // this.selectedSalesOrders = this.selectedSalesOrders.filter(r => r.salesOrderNum !== salesOrderNum);
              // this.objectService.multiPickingObject.outstandingPickList = this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum != salesOrderNum);
              // this.uniqueSo = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
              // this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
              // if (this.selectedSalesOrders && this.selectedSalesOrders.length === 0) {
              //   this.setDefaultValue();
              // }
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {

            }
          },
        ],
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region handle display mode */

  getSoLineBySo(salesOrderNum: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum);
  }

  getUniqueItemBySoNum(salesOrderNum: string) {
    return [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum).flatMap(r => r.itemCode))];
  }

  getSoLineByItemCode(itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode);
  }

  getSoNumByItemCode(itemCode: string) {
    return [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.salesOrderNum))].join(', ');
  }

  getSoQtyBySoItemCode(salesOrderNum: string, itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
  }

  getPickedBySoItemCode(salesOrderNum: string, itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyPicked + r.qtyCurrent).reduce((a, c) => a + c, 0);
  }

  /* #endregion */

  /* #region detail modal */

  async showDetail() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    const modal = await this.modalController.create({
      component: PickingItemPage,
      canDismiss: true
    })
    await modal.present();
    let { data } = await modal.onWillDismiss();
    if (data && data !== undefined) {
      console.log("🚀 ~ file: picking-header.page.ts:227 ~ PickingHeaderPage ~ showDetail ~ data:", data)      
    }
  }

  /* #endregion */

  /* #region real header handle here */

  selectedLocationId: number;
  onOriginChanged(event) {
    this.selectedLocationId = event.id;
    this.objectForm.patchValue({ locationId: this.selectedLocationId });
  }

  selectedCustomerId: number;
  selectedCustomerLocationList: MasterListDetails[] = [];
  fLocationMasterList: MasterListDetails[] = [];
  onCustomerSelected(event) {
    try {
      this.selectedCustomerId = event ? event.id : null;
      this.objectForm.patchValue({ customerId: this.selectedCustomerId });
      if (this.selectedCustomerId) {
        var lookupValue = this.objectService.customerMasterList?.find(e => e.id == this.selectedCustomerId);
        if (lookupValue != undefined) {
          this.objectForm.patchValue({ businessModelType: lookupValue.attribute5 });
          if (lookupValue.attributeArray1.length > 0) {
            this.selectedCustomerLocationList = this.objectService.locationMasterList.filter(value => lookupValue.attributeArray1.includes(value.id));
          } else {
            this.selectedCustomerLocationList = [];
          }
          this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6), toLocationId: null });
          this.selectedLocationId = parseFloat(lookupValue.attribute6);
          this.selectedToLocationId = null;
        }
        if (lookupValue.attribute5 == "T") {
          this.objectForm.controls.toLocationId.clearValidators();
          this.objectForm.controls.toLocationId.updateValueAndValidity();
        }
        if (lookupValue.attributeArray1.length == 1) {
          this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
          this.selectedToLocationId = this.selectedCustomerLocationList[0].id;

        }

        //Auto map object type code
        if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
          this.objectForm.patchValue({ typeCode: 'S' });
          this.objectForm.controls['typeCode'].disable();
        } else {
          this.objectForm.patchValue({ typeCode: 'T' });
          this.objectForm.controls['typeCode'].disable();
        }

        if (lookupValue.attribute5 === "T") {
          // handle location
          this.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 === 'W');
          if (lookupValue !== undefined) {
            this.objectForm.patchValue({ locationId: parseFloat(lookupValue.attribute6) });
            this.selectedLocationId = parseFloat(lookupValue.attribute6);
          }
        } else {
          this.fLocationMasterList = this.objectService.locationMasterList;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  selectedToLocationId: number;
  onDestinationChanged(event) {
    this.selectedToLocationId = event.id;
    this.objectForm.patchValue({ toLocationId: this.selectedToLocationId });
  }

  @ViewChild('segment', { static: false }) segment: IonSegment;
  isWithSo: string = 'true';
  async isWithSoChanged(event) {
    try {
      if (event.detail.value === 'true') {
        this.objectForm.patchValue({ isWithSo: true });
      } else {
        this.objectForm.patchValue({ isWithSo: false });
      }
      this.objectService.multiPickingObject.pickingCarton = []; // clear picked when setting changed
    } catch (e) {
      console.error(e);
    }
  }

  groupType: string = "S";
  groupTypeChanged(event) {
    if (event) {
      this.objectForm.patchValue({ groupType: event.detail.value });
    }
  }

  /* #endregion */

  /* #region  form */

  newObjectForm() {
    try {
      this.objectForm = this.formBuilder.group({
        pickingId: [0],
        pickingNum: [null],
        trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
        locationId: [null, [Validators.required]],
        toLocationId: [null],
        customerId: [null, [Validators.required]],
        typeCode: [null],
        warehouseAgentId: [JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId],
        pickingUDField1: [null],
        pickingUDField2: [null],
        pickingUDField3: [null],
        pickingUDOption1: [null],
        pickingUDOption2: [null],
        pickingUDOption3: [null],
        deactivated: [null],
        workFlowTransactionId: [null],
        masterUDGroup1: [null],
        masterUDGroup2: [null],
        masterUDGroup3: [null],
        businessModelType: [null],
        isWithSo: [true],
        sourceType: ['M'],
        remark: [null],
        groupType: ['S']
      });
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region camera scanner */

  scanActive: boolean = false;
  onCameraStatusChanged(event) {
    try {
      this.scanActive = event;
      if (this.scanActive) {
        document.body.style.background = "transparent";
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onDoneScanning(event) {
    try {
      if (event) {
        await this.validateSalesOrder(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region steps */

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
        this.navController.navigateBack("/transactions/picking");
      }
    } catch (e) {
      console.error(e);
    }
  }

  nextStep() {
    try {
      if (!this.objectForm.valid) {
        this.toastService.presentToast("", "Something went wrong!", "top", "danger", 1000);
        return;
      }
      this.objectService.setHeader(this.objectForm.getRawValue());
      // this.objectService.setChoosenSalesOrders(this.selectedSalesOrders);
      // this.objectService.setMultiPickingObject({outstandingPickList: this.outstandingPickList, pickingCarton: this.objectService.multiPickingObject?.pickingCarton??[]});
      this.navController.navigateForward("/transactions/picking/picking-item");
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
