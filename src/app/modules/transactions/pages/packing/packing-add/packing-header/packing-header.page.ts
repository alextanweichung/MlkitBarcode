import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, IonSegment, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { SalesOrderHeaderForWD, SalesOrderLineForWD } from 'src/app/modules/transactions/models/packing';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-packing-header',
   templateUrl: './packing-header.page.html',
   styleUrls: ['./packing-header.page.scss'],
})
export class PackingHeaderPage implements OnInit, OnDestroy, ViewWillEnter, ViewDidEnter {

   objectForm: FormGroup;
   warehouseAgentId: number
   isMobile: boolean = true;
   isButtonVisible: boolean = true;

   constructor(
      public objectService: PackingService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private formBuilder: FormBuilder,
   ) {
      this.newObjectForm();
   }

   ionViewWillEnter(): void {
      this.isMobile = Capacitor.getPlatform() !== "web";
      if (this.objectService.header && this.objectService.header.multiPackingId > 0) {
         this.isWithType = this.objectService.header?.isWithSo ? "SO" : "NONE";
         this.objectForm.patchValue(this.objectService.object.header);
         this.loadExisitingSO(this.objectService.object.outstandingPackList.flatMap(r => r.salesOrderNum));
      } else {
         this.setDefaultValue();
      }
   }

   ngOnDestroy(): void {
      Keyboard.removeAllListeners();
   }

   @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
   ionViewDidEnter(): void {
      try {
         if (this.isWithType === "SO" || this.isWithType === "B2B") {
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
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[];
   configSOSelectionEnforceSameOrigin: boolean = true;
   configSOSelectionEnforceSameDestination: boolean = true;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let config = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameOrigin");
         if (config != undefined) {
            if (config.ctrlValue.toUpperCase() == "Y") {
               this.configSOSelectionEnforceSameOrigin = true;
            } else {
               this.configSOSelectionEnforceSameOrigin = false;
            }
         }
         let config2 = this.moduleControl.find(x => x.ctrlName === "SOSelectionEnforceSameDestination");
         if (config2 != undefined) {
            if (config2.ctrlValue.toUpperCase() == "Y") {
               this.configSOSelectionEnforceSameDestination = true;
            } else {
               this.configSOSelectionEnforceSameDestination = false;
            }
         }
      })
   }

   loadExisitingSO(salesOrderNums: string[]) {
      this.objectService.getSOHeader(salesOrderNums).subscribe(response => {
         if (response.status === 200) {
            let doc = response.body[0] as SalesOrderHeaderForWD;
            if (doc === undefined) {
               this.toastService.presentToast("", "Sales Order not found.", "top", "warning", 1000);
               return;
            }
            // checking for packing, refer to base system
            if (this.selectedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.selectedDocs[0].locationId != doc.locationId) {
               this.toastService.presentToast("", "Not allow to combine sales order with different origin location.", "top", "warning", 1000);
               return;
            }
            if (this.selectedDocs.length > 0 && this.selectedDocs[0].customerId != doc.customerId) {
               this.toastService.presentToast("", "Not allow to combine sales order with different customer.", "top", "warning", 1000);
               return;
            }
            this.selectedDocs.unshift(doc);
            if (this.selectedDocs && this.selectedDocs.length === 1) {
               this.onCustomerSelected({ id: this.selectedDocs[0].customerId }, false);
               this.onDestinationChanged({ id: this.selectedDocs[0].toLocationId });
            }
            // this.objectService.multiPackingObject.outstandingPackList = [...this.objectService.multiPackingObject.outstandingPackList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
            this.uniqueDoc = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
            this.uniqueItemCode = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
            this.uniqueSku = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(rr => rr.itemSku))];
            this.uniqueSku.forEach(r => {
               this.uniqueItemSkuAndCode.set(r, this.objectService.multiPackingObject.outstandingPackList.find(rr => rr.itemSku === r).itemCode);
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
         this.onCustomerSelected(defaultCustomer, true);
      }
   }

   /* #region scanner input */

   itemSearchValue: string;
   handleSoKeyDown(e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         this.barcodeInput.nativeElement.focus();
         if (this.isWithType === "SO") {
            this.validateSalesOrder(this.itemSearchValue);
         } else if (this.isWithType === "B2B") {
            this.validateB2B(this.itemSearchValue);
         } else {
            this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         }
      }
   }

   /* #endregion */

   /* #region handle Doc */

   selectedDocs: SalesOrderHeaderForWD[] = [];
   uniqueDoc: string[] = [];
   uniqueItemCode: string[] = [];
   uniqueSku: string[] = [];
   uniqueItemSkuAndCode: Map<string, string> = new Map([]);
   validateSalesOrder(input: string) {
      if (input && input.length > 0) {
         this.itemSearchValue = null;
         if (this.selectedDocs.findIndex(r => r.salesOrderNum.toLowerCase() === input.toLowerCase()) > -1) {
            this.toastService.presentToast("", "Document already selected.", "top", "warning", 1000);
         } else {
            this.objectService.getSOHeader([input]).subscribe(response => {
               if (response.status === 200) {
                  let doc = response.body[0] as SalesOrderHeaderForWD;
                  if (doc === undefined) {
                     this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
                     return;
                  }
                  // checking for packing, refer to base system
                  if (this.selectedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.selectedDocs[0].locationId != doc.locationId) {
                     this.toastService.presentToast("", "Not allow to combine Doc with different origin location.", "top", "warning", 1000);
                     return;
                  }
                  if (this.selectedDocs.length > 0 && this.selectedDocs[0].customerId != doc.customerId) {
                     this.toastService.presentToast("", "Not allow to combine Doc with different customer.", "top", "warning", 1000);
                     return;
                  }
                  this.objectForm.patchValue({ copyFrom: "S" });
                  // doc.line.sort((a, b) => a.itemCode.localeCompare(b.itemCode));
                  this.selectedDocs.unshift(doc);
                  if (this.selectedDocs && this.selectedDocs.length === 1) {
                     this.onCustomerSelected({ id: this.selectedDocs[0].customerId }, false);
                     this.onDestinationChanged({ id: this.selectedDocs[0].toLocationId });
                  }
                  this.objectService.multiPackingObject.outstandingPackList = [...this.objectService.multiPackingObject.outstandingPackList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
                  this.objectService.multiPackingObject.outstandingPackList.forEach(r => {
                     if (r.multiPackingOutstandingId === null) r.multiPackingOutstandingId = 0;
                     r.multiPackingId = this.objectForm.controls.multiPackingId.value;
                  })
                  this.uniqueDoc = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
                  this.uniqueItemCode = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
                  this.uniqueSku = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(rr => rr.itemSku))];
                  this.uniqueSku.forEach(r => {
                     this.uniqueItemSkuAndCode.set(r, this.objectService.multiPackingObject.outstandingPackList.find(rr => rr.itemSku === r).itemCode);
                  })
               }
            }, error => {
               console.error(error);
            });
         }
      } else {
         this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
      }
   }

   validateB2B(input: string) {
      if (input && input.length > 0) {
         this.itemSearchValue = null;
         if (this.selectedDocs.findIndex(r => r.salesOrderNum.toLowerCase() === input.toLowerCase()) > -1) {
            this.toastService.presentToast("", "Document already selected.", "top", "warning", 1000);
         } else {
            this.objectService.getB2BHeader([input]).subscribe(response => {
               if (response.status === 200) {
                  let doc = response.body[0] as SalesOrderHeaderForWD;
                  if (doc === undefined) {
                     this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
                     return;
                  }
                  // checking for packing, refer to base system
                  if (this.selectedDocs.length > 0 && this.configSOSelectionEnforceSameOrigin && this.selectedDocs[0].locationId != doc.locationId) {
                     this.toastService.presentToast("", "Not allow to combine Doc with different origin location.", "top", "warning", 1000);
                     return;
                  }
                  if (this.selectedDocs.length > 0 && this.selectedDocs[0].customerId != doc.customerId) {
                     this.toastService.presentToast("", "Not allow to combine sales order with different customer.", "top", "warning", 1000);
                     return;
                  }
                  this.objectForm.patchValue({ copyFrom: "B" });
                  // doc.line.sort((a, b) => a.itemCode.localeCompare(b.itemCode));
                  this.selectedDocs.unshift(doc);
                  if (this.selectedDocs && this.selectedDocs.length === 1) {
                     this.onCustomerSelected({ id: this.selectedDocs[0].customerId }, false);
                     this.onDestinationChanged({ id: this.selectedDocs[0].toLocationId });
                  }
                  this.objectService.multiPackingObject.outstandingPackList = [...this.objectService.multiPackingObject.outstandingPackList, ...(response.body as SalesOrderHeaderForWD[]).flatMap(x => x.line)];
                  this.objectService.multiPackingObject.outstandingPackList.forEach(r => {
                     if (r.multiPackingOutstandingId === null) r.multiPackingOutstandingId = 0;
                     r.multiPackingId = this.objectForm.controls.multiPackingId.value;
                  })
                  this.uniqueDoc = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
                  this.uniqueItemCode = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
                  this.uniqueSku = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(rr => rr.itemSku))];
                  this.uniqueSku.forEach(r => {
                     this.uniqueItemSkuAndCode.set(r, this.objectService.multiPackingObject.outstandingPackList.find(rr => rr.itemSku === r).itemCode);
                  })
               }
            }, error => {
               console.error(error);
            });
         }
      } else {
         this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
      }

   }

   async deleteSo(salesOrderNum) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            subHeader: "Changes made will be discard.",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: async () => {
                     // this.selectedDocs = this.selectedDocs.filter(r => r.salesOrderNum !== salesOrderNum);
                     // this.objectService.multiPackingObject.outstandingPackList = this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum != salesOrderNum);
                     // this.uniqueSo = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.salesOrderNum))];
                     // this.uniqueItemCode = [...new Set(this.objectService.multiPackingObject.outstandingPackList.flatMap(r => r.itemCode))];
                     // if (this.selectedDocs && this.selectedDocs.length === 0) {
                     //   this.setDefaultValue();
                     // }
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
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
      return this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum);
   }

   getUniqueItemBySoNum(salesOrderNum: string) {
      return [...new Set(this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum))];
   }

   getSoLineByItemCode(itemCode: string): SalesOrderLineForWD[] {
      let ret: SalesOrderLineForWD[] = [];
      let l = this.objectService.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode);
      if (l && l.length > 0) {
         l.forEach(r => {
            let y = [...new Set(this.objectService.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.itemSku))];
            y.forEach(rr => {
               let t: SalesOrderLineForWD = {
                  itemId: r.itemId,
                  itemCode: r.itemCode,
                  itemSku: r.itemSku,
                  itemBarcode: r.itemBarcode,
                  description: r.description,
                  variationTypeCode: r.variationTypeCode,
                  itemVariationXId: r.itemVariationXId,
                  itemVariationXDescription: r.itemVariationXDescription,
                  itemVariationYId: r.itemVariationYId,
                  itemVariationYDescription: r.itemVariationYDescription,
                  qtyRequest: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyRequest).reduce((a, c) => Number(a) + Number(c), 0),
                  qtyCurrent: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyCurrent).reduce((a, c) => Number(a) + Number(c), 0),
                  qtyPicked: l.filter(rrr => rrr.itemSku === rr).flatMap(rrr => rrr.qtyPicked).reduce((a, c) => Number(a) + Number(c), 0),
                  isComponentScan: r.isComponentScan,
                  rack: r.rack,
                  subRack: r.subRack
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
      return [...new Set(this.objectService.multiPackingObject.outstandingPackList.filter(r => r.itemCode === itemCode).flatMap(r => r.salesOrderNum))].join(", ");
   }

   getSoQtyBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
   }

   getCurrentBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyCurrent).reduce((a, c) => a + c, 0);
   }

   getPickedBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyPicked).reduce((a, c) => a + c, 0);
   }

   getPackedBySoItemCode(salesOrderNum: string, itemCode: string) {
      return this.objectService.multiPackingObject.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum && r.itemCode === itemCode).flatMap(r => r.qtyPacked).reduce((a, c) => a + c, 0);
   }

   /* #endregion */

   /* #region detail modal */

   async showDetail() {
      this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward("/transactions/packing/packing-item");
   }

   /* #endregion */

   /* #region real header handle here */

   selectedLocationId: number;
   onOriginChanged(event) {
      if (event) {
         this.selectedLocationId = event.id;
         this.objectForm.patchValue({ locationId: this.selectedLocationId });
      } else {
         this.selectedLocationId = null;
         this.objectForm.patchValue({ locationId: this.selectedLocationId });
      }
   }

   onWarehouseAgentSelected(event) {
      if (event) {
         this.objectForm.patchValue({ warehouseAgentId: event.id });
         setTimeout(() => {
            if (this.isWithType === "SO" || this.isWithType === "B2B") {
               this.barcodeInput.nativeElement.focus();
            }
         }, 10);
      } else {
         this.objectForm.patchValue({ warehouseAgentId: null });
      }
   }

   selectedCustomerId: number;
   selectedCustomerLocationList: MasterListDetails[] = [];
   fLocationMasterList: MasterListDetails[] = [];
   onCustomerSelected(event, bindToLocationId: boolean) {
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
               if (bindToLocationId) {
                  this.selectedToLocationId = null;
               }
            }
            if (lookupValue.attribute5 == "T") {
               this.objectForm.controls.toLocationId.clearValidators();
               this.objectForm.controls.toLocationId.updateValueAndValidity();
            }
            if (lookupValue.attributeArray1.length == 1) {
               this.objectForm.patchValue({ toLocationId: this.selectedCustomerLocationList[0].id });
               if (bindToLocationId) {
                  this.selectedToLocationId = this.selectedCustomerLocationList[0].id;
               }
            }

            //Auto map object type code
            if (lookupValue.attribute5 == "T" || lookupValue.attribute5 == "F") {
               this.objectForm.patchValue({ typeCode: "S" });
               this.objectForm.controls["typeCode"].disable();
            } else {
               this.objectForm.patchValue({ typeCode: "T" });
               this.objectForm.controls["typeCode"].disable();
            }

            if (lookupValue.attribute5 === "T") {
               // handle location
               this.fLocationMasterList = this.objectService.locationMasterList.filter(r => r.attribute1 === "W");
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
      if (event) {
         this.selectedToLocationId = event.id;
         this.objectForm.patchValue({ toLocationId: this.selectedToLocationId });
      } else {
         this.selectedToLocationId = null;
         this.objectForm.patchValue({ toLocationId: this.selectedToLocationId });
      }
   }

   @ViewChild("segment", { static: false }) segment: IonSegment;
   isWithType: string = "SO";
   async isWithDocChanged(event) {
      try {
         if (event.detail.value === "SO" || event.detail.value === "B2B") {
            this.objectForm.patchValue({ isWithSo: true });
            setTimeout(() => {
               if (this.isWithType === "SO" || this.isWithType === "B2B") {
                  this.barcodeInput.nativeElement.focus();
               }
            }, 10);
         } else {
            this.objectForm.patchValue({ isWithSo: false });
         }
         this.objectService.multiPackingObject.packingCarton = []; // clear picked when setting changed
      } catch (e) {
         console.error(e);
      }
   }

   groupType: string = "S"; // use S for doc, I for non-doc
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
            multiPackingId: [0],
            multiPackingNum: [null],
            trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
            locationId: [null, [Validators.required]],
            toLocationId: [null],
            customerId: [null, [Validators.required]],
            typeCode: [null],
            warehouseAgentId: [JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId, [Validators.required]],
            deactivated: [null],
            workFlowTransactionId: [null],
            masterUDGroup1: [null],
            masterUDGroup2: [null],
            masterUDGroup3: [null],
            businessModelType: [null],
            isWithSo: [true],
            sourceType: ["M"],
            remark: [null],
            groupType: ["S"],
            copyFrom: [null]
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
            if (this.isWithType === "SO") {
               this.validateSalesOrder(event);
            } else if (this.isWithType === "B2B") {
               this.validateB2B(event);
            } else {
               this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
            }
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
            this.navController.navigateBack("/transactions/packing");
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
         this.navController.navigateForward("/transactions/packing/packing-item");
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   infoModal: boolean = false;
   showInfoModal(docNum: string) {
      this.infoModal = true;

   }

   hideInfoModal() {
      this.infoModal = false;
   }

   onInfoModalHide() {
      
   }

}

