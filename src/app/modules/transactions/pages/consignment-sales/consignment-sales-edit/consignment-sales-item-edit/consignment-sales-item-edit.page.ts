import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-sales-item-edit',
  templateUrl: './consignment-sales-item-edit.page.html',
  styleUrls: ['./consignment-sales-item-edit.page.scss'],
})
export class ConsignmentSalesItemEditPage implements OnInit {

  objectId: number;
  object: ConsignmentSalesRoot;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private commonService: CommonService,
    private configService: ConfigService,
    private consignmentSalesService: ConsignmentSalesService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ngOnInit() {
    this.loadMasterList();
    this.loadModuleControl();
    if (this.objectId) {
      this.loadObject();
    } else {
      this.toastService.presentToast('Something went wrong!', 'Invalid ObjectId', 'middle', 'danger', 1000);
    }
  }

  moduleControl: ModuleControl[] = [];
  useTax: boolean = true;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
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

  loadObject() {
    this.consignmentSalesService.getObjectById(this.objectId).subscribe(response => {
      this.object = response;
    }, error => {
      console.log(error);
    })
  }  

  onItemAdd(event: TransactionDetail) {
    this.addItemToDetails(event);
  }

  async addItemToDetails(trxLine: TransactionDetail) {
    if (this.object.details.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
      this.object.details[0].qtyRequest++;
    } else {
      this.object.details.forEach(r => r.sequence += 1);
      trxLine.lineId = 0;
      trxLine.headerId = this.object.header.otherSalesId;
      trxLine.qtyRequest = 1;
      trxLine.locationId = this.object.header.toLocationId;
      trxLine.sequence = 0;
      trxLine = this.assignLineUnitPrice(trxLine);
      await this.object.details.unshift(trxLine);
      await this.computeAllAmount(this.object.details[0]);
    }
  }

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
          this.addItemToDetails(outputData);
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'middle', 'danger', 1000);
        }
      } else {

      }
    }
  }

  async deleteLine(index) {
    if (this.object.details[index]) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Delete this line?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            text: 'Delete item',
            cssClass: 'danger',
            handler: async () => {
              this.object.details.splice(index, 1);
              this.toastService.presentToast('Line removed.', '', 'middle', 'success', 1000);
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
      this.toastService.presentToast('Something went wrong!', '', 'middle', 'danger', 1000);
    }
  }

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
    trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.maxPrecision);
  }

  assignLineUnitPrice(trxLine: TransactionDetail) {
    if (this.useTax) {
      if (this.object.header.isItemPriceTaxInclusive) {
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
    trxLine.unitPrice = this.commonService.roundToPrecision(trxLine.unitPrice, this.maxPrecision);
    trxLine.unitPriceExTax = this.commonService.roundToPrecision(trxLine.unitPriceExTax, this.maxPrecision);
    return trxLine;
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

  /* #region  modal to edit line detail */  

  selectedItem: TransactionDetail;
  async showLineDetails(trxLine: TransactionDetail) {
    this.selectedItem = trxLine;
    await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.maxPrecision);
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

  async previousStep() {
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
      this.consignmentSalesService.resetVariables();
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: this.objectId
        }
      }
      this.navController.navigateBack('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
    }
  }

  async nextStep() {
    if (this.object.details.length > 0) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.updateObject();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'middle', 'danger', 1000);
    }
  }

  updateObject() {
    this.consignmentSalesService.updateObject(this.object).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast('Update Complete', 'Consignment Sales Updated', 'middle', 'success', 1000);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
        this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
      } else {
        this.toastService.presentToast('Update Fail', '', 'middle', 'danger', 1000);
      }
    }, error => {
      console.log(error);
    });
  }

}
