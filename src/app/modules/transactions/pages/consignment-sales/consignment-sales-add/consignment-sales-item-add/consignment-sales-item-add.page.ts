import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { ConsignmentSalesHeader, ConsignmentSalesRoot, ConsignmentSalesSummary } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
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
  }

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
              discountExpression: found_item_master.discPct + '%',
              taxId: found_item_master.taxId,
              taxCode: found_item_master.taxCd,
              taxPct: found_item_master.taxPct,
              qtyRequest: null,
              itemPricing: {
                itemId: found_item_master.id,
                unitPrice: found_item_master.price,
                discountGroupCode: found_item_master.discCd,
                discountExpression: found_item_master.discPct + '%',
                discountPercent: found_item_master.discPct
              },
              itemVariationXId: found_barcode.xId,
              itemVariationYId: found_barcode.yId,
              itemSku: found_barcode.sku,
              itemBarcode: found_barcode.barcode
            }
            this.addItemToLine(outputData);
          } else {
            this.toastService.presentToast('Invalid Barcode', '', 'top', 'danger', 1000);
          }
        } else {
  
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onItemAdd(event: TransactionDetail) {
    this.addItemToLine(event);
  }

  onItemsAdd(event: TransactionDetail[]) {
    if (event && event.length > 0) {
      event.forEach(r => {
        this.addItemToLine(r);
      })
    }
  }

  async addItemToLine(trxLine: TransactionDetail) {
    try {
      if (this.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.objectDetail[0].qtyRequest++;
      } else {
        this.objectDetail.forEach(r => r.sequence += 1);
        trxLine.qtyRequest = 1;
        trxLine.locationId = this.objectHeader.toLocationId;
        trxLine.sequence = 0;
        trxLine = this.assignTrxItemToDataLine(trxLine);
        await this.objectDetail.unshift(trxLine);
        await this.computeAllAmount(this.objectDetail[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async deleteLine(index) {
    try {
      if (this.objectDetail[index]) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          header: 'Delete this line?',
          message: 'This action cannot be undone.',
          buttons: [
            {
              text: 'Delete item',
              cssClass: 'danger',
              handler: async () => {
                this.objectDetail.splice(index, 1);
                this.toastService.presentToast('Line removed.', '', 'top', 'success', 1000);
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'cancel'
            }
          ]
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Something went wrong!', '', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region input mode */

  scanInput: boolean = true;
  toggleInputMode() {
    this.scanInput = !this.scanInput;
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

  discountGroupCodeChanged(line: TransactionDetail) {
    try {
      if (line.discountGroupCode) {
        let lookupValue = this.objectService.discountGroupMasterList.find(r => r.code === line.discountGroupCode);
        if (lookupValue) {
          if (lookupValue.attribute1 === "0") {
            line.discountExpression = null;
          } else {
            line.discountExpression = lookupValue.attribute1 + "%";
          }
        }
      } else {
        line.discountExpression = null;
      }
      this.computeAllAmount(line);      
    } catch (e) {
      console.error(e);
    }
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  eventHandler(keyCode) {
    if (keyCode === 13) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
    }
  }

  /* #region  price, tax, discount handle here */

  promotionEngineApplicable: boolean = true;
  configSalesActivatePromotionEngine: boolean;
  disablePromotionCheckBox: boolean = false;
  async computeAllAmount(trxLine: TransactionDetail) {
    await this.computeDiscTaxAmount(trxLine);
  }

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.maxPrecision);
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

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision);
    } catch (e) {
      console.error(e);
    }
  }

  assignTrxItemToDataLine(trxLine: TransactionDetail) {
    try {
      if (this.useTax) {
        if (this.objectHeader.isItemPriceTaxInclusive) {
          trxLine.unitPrice = trxLine.itemPricing.unitPrice;
          trxLine.unitPriceExTax = this.commonService.computeAmtExclTax(trxLine.itemPricing.unitPrice, trxLine.taxPct);
        } else {
          trxLine.unitPrice = this.commonService.computeAmtInclTax(trxLine.itemPricing.unitPrice, trxLine.taxPct);
          trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
        }
      } else {
        trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
        trxLine.unitPrice = trxLine.itemPricing.unitPrice;
      }
      trxLine.discountGroupCode = trxLine.itemPricing.discountGroupCode;
      trxLine.discountExpression = trxLine.itemPricing.discountExpression;
      trxLine.unitPrice = this.commonService.roundToPrecision(trxLine.unitPrice, this.objectHeader.maxPrecision);
      trxLine.unitPriceExTax = this.commonService.roundToPrecision(trxLine.unitPriceExTax, this.objectHeader.maxPrecision);
      return trxLine;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  modal to edit line detail */

  selectedItem: TransactionDetail;
  async showLineDetails(trxLine: TransactionDetail) {
    try {
      this.selectedItem = trxLine;
      await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
      this.showItemModal();
    } catch (e) {
      console.error(e);
    }
  }

  isModalOpen: boolean = false;
  showItemModal() {
    this.isModalOpen = true;
  }

  hideItemModal() {
    this.isModalOpen = false;
  }

  /* #endregion */

  async nextStep() {
    try {
      if (this.objectDetail.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          cssClass: 'custom-alert',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.insertObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
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
      this.objectService.insertObject(trxDto).subscribe(response => {
        let css: ConsignmentSalesSummary = {
          consignmentSalesNum: response.body["header"]["consignmentSalesNum"],
          customerId: response.body["header"]["customerId"],
          toLocationId: response.body["header"]["toLocationId"],
          trxDate: response.body["header"]["trxDate"]
        }
        this.objectService.setSummary(css);
        this.toastService.presentToast('Insert Complete', 'New Consignment Sales has been added', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/consignment-sales/consignment-sales-summary');
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    this.navController.navigateBack('/transactions/consignment-sales/consignment-sales-header-add');
  }

}
