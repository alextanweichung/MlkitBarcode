import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController } from '@ionic/angular';
import { ConsignmentSalesHeader, ConsignmentSalesRoot, ConsignmentSalesSummary } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-sales-item-add',
  templateUrl: './consignment-sales-item-add.page.html',
  styleUrls: ['./consignment-sales-item-add.page.scss'],
  providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemAddPage implements OnInit {

  objectHeader: ConsignmentSalesHeader;
  objectDetail: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  allowModifyItemInfo: boolean = true;
  useTax: boolean = true;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;

  constructor(
    private consignmentSalesService: ConsignmentSalesService,
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService,
    private navController: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.objectHeader = this.consignmentSalesService.header;
    if (!this.objectHeader) {
      this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
    }
    this.loadMasterList();
    this.loadModuleControl();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
      if (SystemWideActivateTaxControl != undefined) {
        this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    })
    this.authService.precisionList$.subscribe(precision => {
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      this.maxPrecision = this.precisionSales.localMax;
      this.maxPrecisionTax = this.precisionTax.localMax;
    })
  }

  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.consignmentSalesService.getMasterList().subscribe(response => {
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.discountGroupMasterList = response.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  /* #region  barcode & check so */

  async validateBarcode(barcode: string) {
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
  }

  onItemAdd(event: TransactionDetail) {
    this.addItemToLine(event);
  }

  async addItemToLine(trxLine: TransactionDetail) {
    if (this.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
      this.objectDetail[0].qtyRequest++;
    } else {
      this.objectDetail.forEach(r => r.sequence += 1);
      trxLine.qtyRequest = 1;
      trxLine.locationId = this.objectHeader.toLocationId;
      trxLine.sequence = 0;
      trxLine = this.assignLineUnitPrice(trxLine);
      await this.objectDetail.unshift(trxLine);
      await this.computeAllAmount(this.objectDetail[0]);
    }
  }

  async deleteLine(index) {
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
  }

  /* #endregion */

  /* #region  barcode scanner */

  scanActive: boolean = false;
  async startScanning() {
    const allowed = await this.checkPermission();
    if (allowed) {
      this.scanActive = true;
      document.body.style.background = "transparent";
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        let barcode = result.content;
        this.scanActive = false;
        await this.validateBarcode(barcode);
      }
    }
  }

  async checkPermission() {
    return new Promise(async (resolve) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const alert = await this.alertController.create({
          header: "No permission",
          message: "Please allow camera access in your setting",
          buttons: [
            {
              text: "No",
              role: "cancel"
            },
            {
              text: "Open Settings",
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              }
            }
          ]
        })
        await alert.present();
      } else {
        resolve(false);
      }
    });
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  /* #endregion */

  discountGroupCodeChanged(line: TransactionDetail) {
    if (line.discountGroupCode) {
      let lookupValue = this.discountGroupMasterList.find(r => r.code === line.discountGroupCode);
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
    trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision);
  }

  assignLineUnitPrice(trxLine: TransactionDetail) {
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
  }

  /* #endregion */

  /* #region  modal to edit line detail */  

  selectedItem: TransactionDetail;
  async showLineDetails(trxLine: TransactionDetail) {
    this.selectedItem = trxLine;
    await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
    this.showItemModal();
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
              await this.insertConsignmentSales();
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
  }

  insertConsignmentSales() {    
    let trxDto: ConsignmentSalesRoot = {
      header: this.objectHeader,
      details: this.objectDetail      
    }
    this.consignmentSalesService.insertObject(trxDto).subscribe(response => {
      let css: ConsignmentSalesSummary = {
        consignmentSalesNum: response.body["header"]["consignmentSalesNum"],
        customerId: response.body["header"]["customerId"],
        toLocationId: response.body["header"]["toLocationId"],
        trxDate: response.body["header"]["trxDate"]
      }
      this.consignmentSalesService.setSummary(css);
      this.toastService.presentToast('Insert Complete', 'New Consignment Sales has been added', 'top', 'success', 1000);
      this.navController.navigateRoot('/transactions/consignment-sales/consignment-sales-summary');
    }, error => {
      console.log(error);
    });
  }

  previousStep() {
    this.navController.navigateBack('/transactions/consignment-sales/consignment-sales-header-add');
  }


}
