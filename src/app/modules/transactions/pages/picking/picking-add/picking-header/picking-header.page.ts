import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonSegment, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { MultiPickingOutstandingPickList, MultiPickingSORequest, MultiPickingSalesOrder } from 'src/app/modules/transactions/models/picking';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { Keyboard } from '@capacitor/keyboard';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-picking-header',
  templateUrl: './picking-header.page.html',
  styleUrls: ['./picking-header.page.scss']
})
export class PickingHeaderPage implements OnInit, OnDestroy, ViewDidEnter {

  objectForm: FormGroup;
  loginUser: any;
  warehouseAgentId: number

  isButtonVisible: boolean = true;

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

  ngOnDestroy(): void {
    Keyboard.removeAllListeners();
  }

  @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
  ionViewDidEnter(): void {
    try {
      if (this.isWithSo) {
        this.barcodeInput?.nativeElement.focus();
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  showKeyboard(event) {
    event.preventDefault();
    this.barcodeInput.nativeElement.focus();
    setTimeout(async () => {
      await Keyboard.show();
    }, 100);
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

    if (this.objectService.header && this.objectService.header.multiPickingId > 0) {
      this.objectForm.patchValue(this.objectService.object.header);
      this.loadExisitingSO(this.objectService.object.outstandingPickList.flatMap(r => r.salesOrderNum));
    }
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

  loadExisitingSO(salesOrderNums: string[]) {
    let request: MultiPickingSORequest = {
      salesOrderNums: salesOrderNums,
      warehouseAgentId: this.warehouseAgentId
    }
    this.objectService.getSOHeader(request).subscribe(response => {
      if (response.status === 200) {
        let so = response.body[0] as MultiPickingSalesOrder;
        if (so === undefined) {
          this.toastService.presentToast("", "Sales Order not found.", "top", "warning", 1000);
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
        // this.objectService.multiPickingObject.outstandingPickList = [...this.objectService.multiPickingObject.outstandingPickList, ...(response.body as MultiPickingSalesOrder[]).flatMap(x => x.line)];
        this.uniqueSo = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
        this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
        this.uniqueSku = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(rr => rr.itemSku))];
        this.uniqueSku.forEach(r => {
          this.uniqueItemSkuAndCode.set(r, this.objectService.multiPickingObject.outstandingPickList.find(rr => rr.itemSku === r).itemCode);
        })
      }
    }, error => {
      console.error(error);
    });
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
      e.preventDefault();
      this.barcodeInput.nativeElement.focus();
      this.validateSalesOrder(this.itemSearchValue);
    }
  }

  /* #endregion */

  /* #region handle SO */

  selectedSalesOrders: MultiPickingSalesOrder[] = [];
  // outstandingPickList: MultiPickingOutstandingPickList[] = [];
  uniqueSo: string[] = [];
  uniqueItemCode: string[] = [];
  uniqueSku: string[] = [];
  uniqueItemSkuAndCode: Map<string, string> = new Map([]);
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
              this.toastService.presentToast("", "Sales Order not found.", "top", "warning", 1000);
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
            this.objectService.multiPickingObject.outstandingPickList.forEach(r => {
              if (r.multiPickingOutstandingId === null) r.multiPickingOutstandingId = 0;
              r.multiPickingId = this.objectForm.controls.multiPickingId.value;
            })
            this.uniqueSo = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.salesOrderNum))];
            this.uniqueItemCode = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(r => r.itemCode))];
            this.uniqueSku = [...new Set(this.objectService.multiPickingObject.outstandingPickList.flatMap(rr => rr.itemSku))];
            this.uniqueSku.forEach(r => {
              this.uniqueItemSkuAndCode.set(r, this.objectService.multiPickingObject.outstandingPickList.find(rr => rr.itemSku === r).itemCode);
            })
          }
        }, error => {
          console.error(error);
        });
      }
    } else {
      this.toastService.presentToast("", "Sales Order not found.", "top", "warning", 1000);
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

  getSoLineByItemCode(itemCode: string): MultiPickingOutstandingPickList[] {
    let ret: MultiPickingOutstandingPickList[] = [];
    let l = this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode);
    if (l && l.length > 0) {
      l.forEach(r => {
        let y = [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.itemSku))];
        y.forEach(rr => {
          let t: MultiPickingOutstandingPickList = {
            itemId: r.itemId,
            itemCode: r.itemCode,
            itemSku: r.itemSku,
            description: r.description,
            variationTypeCode: r.variationTypeCode,
            itemVariationXId: r.itemVariationXId,
            itemVariationXDescription: r.itemVariationXDescription,
            itemVariationYId: r.itemVariationYId,
            itemVariationYDescription: r.itemVariationYDescription,
            qtyRequest: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyRequest).reduce((a, c) => Number(a) + Number(c), 0),
            qtyCurrent: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyCurrent).reduce((a, c) => Number(a) + Number(c), 0),
            qtyPicked: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyPicked).reduce((a, c) => Number(a) + Number(c), 0)
          }
          if (ret.findIndex(rr => rr.itemSku === t.itemSku) === -1) {
            ret.push(t);
          }
        })
      })
    }
    return ret;
  }

  getSoNumByItemCode(itemCode: string) {
    return [...new Set(this.objectService.multiPickingObject.outstandingPickList.filter(r => r.itemCode === itemCode).flatMap(r => r.salesOrderNum))].join(', ');
  }

  getSoQtyBySoItemCode(salesOrderNum: string, itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
  }

  getCurrentBySoItemCode(salesOrderNum: string, itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
  }

  getPickedBySoItemCode(salesOrderNum: string, itemCode: string) {
    return this.objectService.multiPickingObject.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
  }

  /* #endregion */

  /* #region detail modal */

  async showDetail() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    this.navController.navigateForward("/transactions/picking/picking-item");
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
        multiPickingId: [0],
        multiPickingNum: [null],
        trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
        locationId: [null, [Validators.required]],
        toLocationId: [null],
        customerId: [null, [Validators.required]],
        typeCode: [null],
        warehouseAgentId: [JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId],
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

  onDoneScanning(event) {
    try {
      if (event) {
        this.barcodeInput.nativeElement.focus();
        this.validateSalesOrder(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    // this.scanActive = false;
    this.onCameraStatusChanged(false);
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
      this.navController.navigateForward("/transactions/picking/picking-item");
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
