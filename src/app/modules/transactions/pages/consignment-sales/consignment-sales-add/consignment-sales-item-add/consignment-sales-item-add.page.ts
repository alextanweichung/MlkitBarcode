import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ConsignmentSalesHeader, ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
  selector: 'app-consignment-sales-item-add',
  templateUrl: './consignment-sales-item-add.page.html',
  styleUrls: ['./consignment-sales-item-add.page.scss'],
  providers: [BarcodeScanInputService, SearchItemService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemAddPage implements OnInit, ViewWillEnter {

  objectHeader: ConsignmentSalesHeader;
  objectDetail: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  allowModifyItemInfo: boolean = true;
  useTax: boolean = true;
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;

  constructor(
    public objectService: ConsignmentSalesService,
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService,
    private navController: NavController,
    private alertController: AlertController
  ) {
    this.objectHeader = this.objectService.header;
    console.log("🚀 ~ file: consignment-sales-item-add.page.ts:48 ~ ConsignmentSalesItemAddPage ~ this.objectHeader:", JSON.stringify(this.objectHeader))
    if (!this.objectHeader) {
      this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
    }
  }

  ionViewWillEnter(): void {
    this.objectHeader = this.objectService.header;
    if (!this.objectHeader) {
      this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
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
        console.log("🚀 ~ file: consignment-sales-item-add.page.ts:97 ~ ConsignmentSalesItemAddPage ~ loadModuleControl ~ this.precisionSales:", JSON.stringify(this.precisionSales))
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
              discountExpression: found_item_master.discPct + "%",
              taxId: found_item_master.taxId,
              taxCode: found_item_master.taxCd,
              taxPct: found_item_master.taxPct,
              qtyRequest: null,
              itemPricing: {
                itemId: found_item_master.id,
                unitPrice: found_item_master.price,
                discountGroupCode: found_item_master.discCd,
                discountExpression: found_item_master.discPct + "%",
                discountPercent: found_item_master.discPct,
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
    console.log("🚀 ~ file: consignment-sales-item-add.page.ts:185 ~ ConsignmentSalesItemAddPage ~ onItemAdd ~ event:", JSON.stringify(event))
    if (event && event.length > 0) {
      event.forEach(async r => {
        await this.addItemToLine(r);
      })
    }
  }

  async addItemToLine(trxLine: TransactionDetail) {
    if (this.consignmentSalesActivateMarginCalculation) {
      if (!this.objectHeader.marginMode) {
        this.toastService.presentToast("Control Validation", "Unable to proceed. Please setup location margin mode.", "top", "warning", 1000);
        return;
      }
    }
    if (this.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) {
      this.objectDetail[0].qtyRequest += 1;
      this.computeAllAmount(this.objectDetail[0]);
    } else {      
      let isBlock: boolean = false;
      isBlock = this.validateNewItemConversion(trxLine);
      if (!isBlock) {
        this.objectDetail.forEach(r => r.sequence += 1);
        trxLine.qtyRequest = 1;
        trxLine.locationId = this.objectHeader.toLocationId;
        trxLine.sequence = 0;
        trxLine = await this.commonService.getMarginPct(trxLine, this.objectHeader.trxDate, this.objectHeader.toLocationId);
        await this.assignTrxItemToDataLine(trxLine);
      }
    }
  }

  validateNewItemConversion(trxLine: TransactionDetail): boolean {
    if (trxLine.newItemId && trxLine.newItemEffectiveDate && new Date(trxLine.newItemEffectiveDate) <= new Date(this.objectHeader.trxDate)) {
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
      if (this.objectHeader.isItemPriceTaxInclusive) {
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
        this.objectDetail.unshift(item);
        await this.computeAllAmount(this.objectDetail[0]);
      }
      else {
        if (this.consignmentSalesBlockItemWithoutMargin !== "0") {
          this.toastService.presentToast("", `Margin unavailable for code ${item.itemCode}`, "top", "warning", 1000)
        }
      }
    } else {
      this.objectDetail.unshift(item);
      await this.computeAllAmount(this.objectDetail[0]);
    }
  }

  async deleteLine(index) {
    try {
      if (this.objectDetail[index]) {
        const alert = await this.alertController.create({
          cssClass: "custom-alert",
          header: "Delete this line?",
          message: "This action cannot be undone.",
          buttons: [
            {
              text: "Delete item",
              cssClass: "danger",
              handler: async () => {
                this.objectDetail.splice(index, 1);
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

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    try {
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
      this.computeDiscTaxAmount(trxLine);       
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
      console.log("🚀 ~ file: consignment-sales-item-add.page.ts:356 ~ ConsignmentSalesItemAddPage ~ computeDiscTaxAmount ~ trxLine:", JSON.stringify(trxLine))
      if (this.consignmentSalesActivateMarginCalculation) {
        this.computeMarginAmount(trxLine);
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeMarginAmount(trxLine: TransactionDetail) {
    trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectHeader, true);
  }  

  onDiscCodeChanged(trxLine: TransactionDetail, event: any) {
    try {
      let discPct = this.objectService.discountGroupMasterList.find(x => x.code === event.detail.value).attribute1
      if (discPct) {
        if (discPct == "0") {
          trxLine.discountExpression = null;
        } else {
          trxLine.discountExpression = discPct + "%";
        }
        this.computeAllAmount(trxLine);
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeAllAmount(data: TransactionDetail) {
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
        this.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
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
      if (this.objectDetail.length > 0) {
        const alert = await this.alertController.create({
          header: "Are you sure to proceed?",
          cssClass: "custom-alert",
          buttons: [
            {
              text: "OK",
              cssClass: "success",
              role: "confirm",
              handler: async () => {
                await this.insertObject();
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
        header: this.objectHeader,
        details: this.objectDetail
      }
      console.log("🚀 ~ file: consignment-sales-item-add.page.ts:512 ~ ConsignmentSalesItemAddPage ~ insertObject ~ trxDto:", JSON.stringify(trxDto))
      this.objectService.insertObject(trxDto).subscribe(response => {
        let object = response.body as ConsignmentSalesRoot;
        this.toastService.presentToast("Insert Complete", "", "top", "success", 1000);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: object.header.consignmentSalesId
          }
        }
        this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header-add");
  }

}
