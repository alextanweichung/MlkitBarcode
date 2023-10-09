import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
  selector: 'app-consignment-sales-item',
  templateUrl: './consignment-sales-item.page.html',
  styleUrls: ['./consignment-sales-item.page.scss'],
  providers: [BarcodeScanInputService, SearchItemService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemPage implements OnInit, ViewWillEnter {

  objectId: number;

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
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectId && this.objectId > 0) {
      this.loadObject();
    }
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadRestrictColumms();
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
      let restrictedObject = {};
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

  loadObject() {
    if (this.objectId && this.objectId > 0) {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.objectService.setHeader(response.header);
        this.objectService.setDetail(response.details);
        if (this.objectService.header.isHomeCurrency) {
          this.objectService.header.maxPrecision = this.precisionSales.localMax;
          this.objectService.header.maxPrecisionTax = this.precisionTax.localMax
        } else {
          this.objectService.header.maxPrecision = this.precisionSales.foreignMax;
          this.objectService.header.maxPrecisionTax = this.precisionTax.foreignMax;
        }
      }, error => {
        console.error(error);
      });
    }
  }

  /* #region  barcode & check so */

  async validateBarcode(barcode: string) {
    try {
      if (barcode) {
        if (barcode && barcode.length > 12) {
          barcode = barcode.substring(0, 12);
        }
        if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
          let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
          if (found_barcode) {
            let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
            let outputData: TransactionDetail = {
              itemId: found_item_master.id,
              itemCode: found_item_master.code,
              description: found_item_master.itemDesc,
              variationTypeCode: found_item_master.varCd,
              discountGroupCode: found_item_master.discCd,
              discountExpression: (found_item_master.discPct??"0") + '%',
              taxId: found_item_master.taxId,
              taxCode: found_item_master.taxCd,
              taxPct: found_item_master.taxPct,
              qtyRequest: null,
              itemPricing: {
                itemId: found_item_master.id,
                unitPrice: found_item_master.price,
                discountGroupCode: found_item_master.discCd,
                discountExpression: (found_item_master.discPct??"0") + '%',
                discountPercent: found_item_master.discPct??0,
                discountGroupId: null,
                unitPriceMin: null,
                currencyId: null
              },
              itemVariationXId: found_barcode.xId,
              itemVariationYId: found_barcode.yId,
              itemSku: found_barcode.sku,
              itemBarcode: found_barcode.barcode,
              itemBrandId: found_item_master?.brandId,
              itemGroupId: found_item_master?.groupId,
              itemCategoryId: found_item_master?.catId,
              itemDepartmentId: found_item_master?.deptId,
              itemBarcodeTagId: found_barcode.id,
              newItemId: found_item_master.newId,
              newItemEffectiveDate: found_item_master.newDate
            }
            this.addItemToLine(outputData);
          } else {
            this.toastService.presentToast("", "", "top", "danger", 1000);
          }
        } else {

        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onItemAdd(event: TransactionDetail[]) {
    if (event && event.length > 0) {
      event.forEach(async r => {
        await this.addItemToLine(r);
      })
    }
  }

  async addItemToLine(trxLine: TransactionDetail) {
    if (this.consignmentSalesActivateMarginCalculation) {
      if (!this.objectService.header.marginMode) {
        this.toastService.presentToast("Control Validation", "Unable to proceed. Please setup location margin mode.", "top", "warning", 1000);
        return;
      }
    }
    if (this.objectService.detail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) {
      this.objectService.detail[0].qtyRequest += 1;
      this.computeAllAmount(this.objectService.detail[0]);
    } else {
      let isBlock: boolean = false;
      isBlock = this.validateNewItemConversion(trxLine);
      if (!isBlock) {
        this.objectService.detail.forEach(r => r.sequence += 1);
        trxLine.qtyRequest = 1;
        trxLine.locationId = this.objectService.header.toLocationId;
        trxLine.sequence = 0;
        trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.header.trxDate, this.objectService.header.toLocationId);
        await this.assignTrxItemToDataLine(trxLine);
      }
    }
  }

  validateNewItemConversion(trxLine: TransactionDetail): boolean {
    if (trxLine.newItemId && trxLine.newItemEffectiveDate && new Date(trxLine.newItemEffectiveDate) <= new Date(this.objectService.header.trxDate)) {
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
      if (this.objectService.header.isItemPriceTaxInclusive) {
        item.unitPrice = item.itemPricing.unitPrice;
        item.unitPriceExTax = this.commonService.computeAmtExclTax(item.itemPricing.unitPrice, item.taxPct);
      } else {
        item.unitPrice = this.commonService.computeAmtInclTax(item.itemPricing.unitPrice, item.taxPct);
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

    if (this.consignmentSalesActivateMarginCalculation) {
      if (item.marginPct) {
        this.objectService.detail.unshift(item);
        await this.computeAllAmount(this.objectService.detail[0]);
      }
      else {
        if (this.consignmentSalesBlockItemWithoutMargin !== "0") {
          this.toastService.presentToast("", `Margin unavailable for code ${item.itemCode}`, "top", "warning", 1000);
          if (this.consignmentSalesBlockItemWithoutMargin === "1") {
            this.objectService.detail.unshift(item);
            await this.computeAllAmount(this.objectService.detail[0]);
          }
        } else {
          this.objectService.detail.unshift(item);
          await this.computeAllAmount(this.objectService.detail[0]);
        }
      }
    } else {
      this.objectService.detail.unshift(item);
      await this.computeAllAmount(this.objectService.detail[0]);
    }
  }

  async deleteLine(index) {
    try {
      if (this.objectService.detail[index]) {
        const alert = await this.alertController.create({
          cssClass: "custom-alert",
          header: "Delete this line?",
          message: "This action cannot be undone.",
          buttons: [
            {
              text: "Delete item",
              cssClass: "danger",
              handler: async () => {
                this.objectService.detail.splice(index, 1);
                this.toastService.presentToast("Line removed.", "", "top", "success", 1000);
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
        this.toastService.presentToast("Something went wrong!", "", "top", "danger", 1000);
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

  async onDoneScanning(event) {
    if (event) {
      await this.validateBarcode(event);
    }
  }

  /* #endregion */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
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

  computeUnitPriceExTax(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPrice = parseFloat(parseFloat(stringValue).toFixed(2));
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPriceExTax = parseFloat(parseFloat(stringValue).toFixed(2));
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.maxPrecision);
      if (this.consignmentSalesActivateMarginCalculation) {
        this.computeMarginAmount(trxLine);
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeMarginAmount(trxLine: TransactionDetail) {
    trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectService.header, true);
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
        trxLine = await this.commonService.getMarginPct(trxLine, this.objectService.header.trxDate, this.objectService.header.toLocationId);
        this.computeAllAmount(trxLine);
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeAllAmount(data: TransactionDetail) {
    data.qtyRequest = parseFloat(data.qtyRequest.toFixed(0));
    try {
      this.computeDiscTaxAmount(data);
      if (this.consignmentSalesActivateMarginCalculation) {
        this.computeMarginAmount(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  modal to edit line detail */

  // selectedItem: TransactionDetail;
  // async showLineDetails(trxLine: TransactionDetail) {
  //   try {
  //     this.selectedItem = JSON.parse(JSON.stringify(data));
  //     await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.maxPrecision);
  //     this.showEditModal();
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  selectedIndex: number;
  showEditModal(data: TransactionDetail, rowIndex: number) {
    this.selectedItem = JSON.parse(JSON.stringify(data));
    // this.selectedItem = data;
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

  saveChanges() {
    if (this.selectedIndex === null || this.selectedIndex === undefined) {
      this.toastService.presentToast("System Error", "Please contact Administrator.", "top", "danger", 1000);
      return;
    } else {
      if ((this.selectedItem.qtyRequest ?? 0) <= 0) {
        this.toastService.presentToast("Invalid Qty", "", "top", "warning", 1000);
      } else {
        this.objectService.detail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
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
    try {
      if (this.objectService.detail.length > 0) {
        const alert = await this.alertController.create({
          header: "Are you sure to proceed?",
          cssClass: "custom-alert",
          buttons: [
            {
              text: "OK",
              cssClass: "success",
              role: "confirm",
              handler: async () => {
                if (this.objectId && this.objectId > 0) {
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
        this.toastService.presentToast("Error!", "Please add at least 1 item to continue", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  insertObject() {
    try {
      let trxDto: ConsignmentSalesRoot = {
        header: this.objectService.header,
        details: this.objectService.detail
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
          this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
        }
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  updateObject() {
    try {
      let trxDto: ConsignmentSalesRoot = {
        header: this.objectService.header,
        details: this.objectService.detail
      }
      this.objectService.updateObject(trxDto).subscribe(response => {
        if (response.status === 204) {
          this.toastService.presentToast("", "Update Complete", "top", "success", 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
        }
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    if (this.objectId && this.objectId > 0) {
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
        this.objectService.resetVariables();
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
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
      header: this.objectService.header,
      details: this.objectService.detail
    }
    let jsonObjectString = JSON.stringify(trxDto);
    let debugObject: JsonDebug = {
      jsonDebugId: 0,
      jsonData: jsonObjectString
    };

    this.objectService.sendDebug(debugObject).subscribe(response => {
      if (response.status == 200) {
        this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
        // this.messageService.add({ severity: 'success', summary: 'Debugging successful', detail: "Data has been sent for debugging" });
      }
    }, error => {
      this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
      // this.messageService.add({ severity: 'error', summary: 'Debugging failure', detail: "Data failed to send for debugging" });
      console.log(error);
    });
  }

}
