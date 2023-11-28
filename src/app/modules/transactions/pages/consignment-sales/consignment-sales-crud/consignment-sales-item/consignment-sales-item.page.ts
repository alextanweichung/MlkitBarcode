import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import Decimal from 'decimal.js';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
   selector: 'app-consignment-sales-item',
   templateUrl: './consignment-sales-item.page.html',
   styleUrls: ['./consignment-sales-item.page.scss'],
   providers: [BarcodeScanInputService, SearchItemService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemPage implements OnInit, ViewWillEnter {

   max: number = 10;

   moduleControl: ModuleControl[] = [];
   allowModifyItemInfo: boolean = true;
   useTax: boolean = true;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   maxPrecision: number = 2;
   maxPrecisionTax: number = 2;

   inputType: string = "number";

   constructor(
      public objectService: ConsignmentSalesService,
      private authService: AuthService,
      private commonService: CommonService,
      private configService: ConfigService,
      private toastService: ToastService,
      private navController: NavController,
      private alertController: AlertController,
      private route: ActivatedRoute,
      private actionSheetController: ActionSheetController
   ) {
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ionViewWillEnter(): Promise<void> {
      this.loadModuleControl();
      this.loadRestrictColumms();
      await this.barcodescaninput.setFocus();
   }

   ngOnInit() {

   }

   consignmentSalesActivateMarginCalculation: boolean = false;
   consignmentSalesBlockItemWithoutMargin: string = "0";
   systemWideBlockConvertedCode: boolean;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
            if (SystemWideActivateTaxControl != undefined) {
               this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
            }
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
            }
            let activateMargin = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesActivateMarginCalculation");
            if (activateMargin && activateMargin.ctrlValue.toUpperCase() == 'Y') {
               this.consignmentSalesActivateMarginCalculation = true;
            }
            let consignmentBlockNoMarginItem = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesBlockItemWithoutMargin");
            if (consignmentBlockNoMarginItem) {
               this.consignmentSalesBlockItemWithoutMargin = consignmentBlockNoMarginItem.ctrlValue;
            }
            let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
            if (blockConvertedCode) {
               this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
            } else {
               this.systemWideBlockConvertedCode = false;
            }
         })
         this.authService.precisionList$.subscribe(precision => {
            this.precisionSales = precision.find(x => x.precisionCode == "SALES");
            this.precisionTax = precision.find(x => x.precisionCode == "TAX");
            this.maxPrecision = this.precisionSales.localMax;
            this.maxPrecisionTax = this.precisionTax.localMax;
         })
      } catch (e) {
         console.error(e);
      }
   }

   restrictTrxFields: any = {};
   loadRestrictColumms() {
      try {
         let restrictedTrx = {};
         this.authService.restrictedColumn$.subscribe(obj => {
            let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "ConsignmentSalesLine").map(y => y.fieldName);
            trxDataColumns.forEach(element => {
               restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
            });
            this.restrictTrxFields = restrictedTrx;
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  barcode & check so */

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   async onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         event.forEach(async r => {
            await this.addItemToLine(r);
         })
         await this.barcodescaninput.setFocus();
      }
   }

   async addItemToLine(trxLine: TransactionDetail) {
      if (this.consignmentSalesActivateMarginCalculation) {
         if (!this.objectService.objectHeader.marginMode) {
            this.toastService.presentToast("Control Validation", "Unable to proceed. Please setup location margin mode.", "top", "warning", 1000);
            return;
         }
      }
      let isBlock: boolean = false;
      isBlock = this.validateNewItemConversion(trxLine);
      if (!isBlock) {
         this.objectService.objectDetail.forEach(r => r.sequence += 1);
         trxLine.qtyRequest = 1;
         trxLine.locationId = this.objectService.objectHeader.toLocationId;
         trxLine.sequence = 0;
         trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.objectHeader.trxDate, this.objectService.objectHeader.toLocationId);
         await this.assignTrxItemToDataLine(trxLine);
         let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         this.max = 10;
      }
   }

   validateNewItemConversion(trxLine: TransactionDetail): boolean {
      if (trxLine.newItemId && trxLine.newItemEffectiveDate && new Date(trxLine.newItemEffectiveDate) <= new Date(this.objectService.objectHeader.trxDate)) {
         let newItemCode = this.configService.item_Masters.find(r => r.id === trxLine.itemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${trxLine.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(trxLine.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.systemWideBlockConvertedCode) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   async assignTrxItemToDataLine(item: TransactionDetail) {
      if (this.useTax) {
         if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
            item.unitPrice = item.itemPricing.unitPrice;
            item.unitPriceExTax = this.commonService.computeAmtExclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
         } else {
            item.unitPrice = this.commonService.computeAmtInclTax(new Decimal(item.itemPricing.unitPrice ? item.itemPricing.unitPrice : 0), item.taxPct).toNumber();
            item.unitPriceExTax = item.itemPricing.unitPrice;
         }
      } else {
         item.unitPrice = item.itemPricing.unitPrice;
         item.unitPriceExTax = item.itemPricing.unitPrice;
      }
      item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.maxPrecision);
      item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.maxPrecision);
      item.oriUnitPrice = item.unitPrice;
      item.oriUnitPriceExTax = item.unitPriceExTax;

      // testing performance
      item.guid = uuidv4()

      if (this.consignmentSalesActivateMarginCalculation) {
         if (item.marginPct) {
            this.objectService.objectDetail.unshift(item);
            await this.computeAllAmount(this.objectService.objectDetail[0]);
         }
         else {
            if (this.consignmentSalesBlockItemWithoutMargin !== "0") {
               this.toastService.presentToast("", `Margin unavailable for code ${item.itemCode}`, "top", "warning", 1000);
               if (this.consignmentSalesBlockItemWithoutMargin === "1") {
                  this.objectService.objectDetail.unshift(item);
                  await this.computeAllAmount(this.objectService.objectDetail[0]);
               }
            } else {
               this.objectService.objectDetail.unshift(item);
               await this.computeAllAmount(this.objectService.objectDetail[0]);
            }
         }
      } else {
         this.objectService.objectDetail.unshift(item);
         await this.computeAllAmount(this.objectService.objectDetail[0]);
      }
   }

   async deleteLine(index) {
      try {
         if (this.objectService.objectDetail[index]) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Delete this line?",
               message: "This action cannot be undone.",
               buttons: [
                  {
                     text: "Delete item",
                     cssClass: "danger",
                     handler: async () => {
                        await this.objectService.objectDetail.splice(index, 1);
                        let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
                        this.toastService.presentToast("", "Line removed", "top", "success", 1000);
                     }
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     cssClass: "cancel"
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast("System Error", "Index not found", "top", "danger", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(barcode) {
      if (barcode) {
         await this.barcodescaninput.validateBarcode(barcode);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   highlight(event) {
      event.getInputElement().then(r => {
         r.setFocus();
      })
   }

   eventHandler(keyCode) {
      if (keyCode === 13) {
         if (Capacitor.getPlatform() !== "web") {
            Keyboard.hide();
         }
      }
   }

   /* #region  unit price, tax, discount */

   async computeUnitPriceExTax(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
      try {
         trxLine.unitPrice = parseFloat(parseFloat(stringValue).toFixed(2));
         trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.maxPrecision);
         await this.computeDiscTaxAmount(trxLine);
         let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } catch (e) {
         console.error(e);
      }
   }

   async computeUnitPrice(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
      try {
         trxLine.unitPriceExTax = parseFloat(parseFloat(stringValue).toFixed(2));
         trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
         await this.computeDiscTaxAmount(trxLine);
         let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
         await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } catch (e) {
         console.error(e);
      }
   }

   async computeDiscTaxAmount(trxLine: TransactionDetail) {
      try {
         trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
         if (this.consignmentSalesActivateMarginCalculation) {
            await this.computeMarginAmount(trxLine);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async computeMarginAmount(trxLine: TransactionDetail) {
      trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectService.objectHeader, true);
      let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
      await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
   }

   async onDiscCodeChanged(trxLine: TransactionDetail, event: any) {
      try {
         let discPct = this.objectService.discountGroupMasterList.find(x => x.code === event.detail.value).attribute1
         if (discPct) {
            if (discPct == "0") {
               trxLine.discountExpression = null;
            } else {
               trxLine.discountExpression = discPct + "%";
            }
            trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.objectHeader.trxDate, this.objectService.objectHeader.toLocationId);
            await this.computeAllAmount(trxLine);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async computeAllAmount(line: TransactionDetail) {
      if (line.qtyRequest === null || line.qtyRequest === undefined || isNaN(Number(line.qtyRequest))) {
         this.toastService.presentToast("", "Invalid Qty", "top", "warning", 1000);
         return;
      } else {
         line.qtyRequest = parseFloat(line.qtyRequest.toFixed(0));
         try {
            await this.computeDiscTaxAmount(line);
            if (this.consignmentSalesActivateMarginCalculation) {
               await this.computeMarginAmount(line);
            }
            let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
         } catch (e) {
            console.error(e);
         }
      }
   }

   /* #endregion */

   /* #region  modal to edit line detail */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   selectedIndex: number;
   showEditModal(data: TransactionDetail, rowIndex: number) {
      this.selectedItem = JSON.parse(JSON.stringify(data));
      this.selectedIndex = rowIndex;
      this.isModalOpen = true;
   }

   hideEditModal() {
      this.isModalOpen = false;
   }

   onModalHide() {
      this.selectedIndex = null;
      this.selectedItem = null;
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact Administrator", "top", "danger", 1000);
         return;
      } else {
         if (this.selectedItem.unitPrice === null || this.selectedItem.unitPrice === undefined || isNaN(Number(this.selectedItem.unitPrice))) {
            this.toastService.presentToast("", "Invalid Unit Price", "top", "warning", 1000);
         } else {
            this.objectService.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
            let data: ConsignmentSalesRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
            await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
            this.hideEditModal();
         }
      }
   }

   async cancelChanges() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.isModalOpen = false;
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

   async nextStep() {
      let lineError = false;
      this.objectService.objectDetail.forEach(r => {
         if (r.qtyRequest === null || r.qtyRequest === undefined || isNaN(Number(r.qtyRequest))) {
            lineError = true;
         }
      })
      if (lineError) {
         this.toastService.presentToast("Unable to proceed", "Invalid Qty", "top", "warning", 1000);
      } else {
         try {
            if (this.objectService.objectDetail.length > 0) {
               const alert = await this.alertController.create({
                  header: "Are you sure to proceed?",
                  cssClass: "custom-alert",
                  buttons: [
                     {
                        text: "OK",
                        cssClass: "success",
                        role: "confirm",
                        handler: async () => {
                           if (this.objectService.objectHeader?.consignmentSalesId && this.objectService.objectHeader.consignmentSalesId > 0) {
                              await this.updateObject();
                           } else {
                              await this.insertObject();
                           }
                        },
                     },
                     {
                        text: "Cancel",
                        cssClass: "cancel",
                        role: "cancel"
                     },
                  ],
               });
               await alert.present();
            } else {
               this.toastService.presentToast("Control Error", "Detail is empty", "top", "warning", 1000);
            }
         } catch (e) {
            console.error(e);
         }
      }
   }

   insertObject() {
      try {
         let trxDto: ConsignmentSalesRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         this.objectService.insertObject(trxDto).subscribe(response => {
            if (response.status === 201) {
               let object = response.body as ConsignmentSalesRoot;
               this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.consignmentSalesId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   updateObject() {
      try {
         let trxDto: ConsignmentSalesRoot = {
            header: this.objectService.objectHeader,
            details: this.objectService.objectDetail
         }
         this.objectService.updateObject(trxDto).subscribe(response => {
            if (response.status === 204) {
               this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: this.objectService.objectHeader.consignmentSalesId
                  }
               }
               this.objectService.resetVariables();
               this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      if (this.objectService.objectHeader?.consignmentSalesId && this.objectService.objectHeader.consignmentSalesId > 0) {
         this.cancelUpdate();
      } else {
         this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
      }
   }

   async cancelUpdate() {
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
            let navigationExtras: NavigationExtras = {
               queryParams: {
                  objectId: this.objectService.objectHeader.consignmentSalesId
               }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region more action popover */

   isPopoverOpen: boolean = false;
   @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
   showPopover(event) {
      try {
         this.popoverMenu.event = event;
         this.isPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   sendForDebug() {
      let trxDto: ConsignmentSalesRoot = {
         header: this.objectService.objectHeader,
         details: this.objectService.objectDetail
      }
      let jsonObjectString = JSON.stringify(trxDto);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };

      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

   identify(index, line) {
      return line.guid;
   }

   async loadALl() {
      this.max += (this.objectService.objectDetail.length ?? 0)
   }

}
