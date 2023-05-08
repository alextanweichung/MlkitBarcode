import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, AlertController, NavController, ViewWillEnter } from '@ionic/angular';
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
export class ConsignmentSalesItemEditPage implements OnInit, ViewWillEnter {

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
    public objectService: ConsignmentSalesService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    if (this.objectId) {
      this.loadObject();
    } else {
      this.toastService.presentToast('Something went wrong!', 'Invalid Object', 'top', 'danger', 1000);
    }
  }

  ionViewWillEnter(): void {
    if (this.objectId) {
      this.loadObject();
    } else {
      this.toastService.presentToast('Something went wrong!', 'Invalid Object', 'top', 'danger', 1000);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[] = [];
  useTax: boolean = true;
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
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

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }  

  onItemAdd(event: TransactionDetail) {
    this.addItemToDetails(event);
  }

  async addItemToDetails(trxLine: TransactionDetail) {
    try {
      if (this.object.details.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.object.details[0].qtyRequest++;
      } else {
        this.object.details.forEach(r => r.sequence += 1);
        trxLine.lineId = 0;
        trxLine.headerId = this.object.header.consignmentSalesId;
        trxLine.qtyRequest = 1;
        trxLine.locationId = this.object.header.toLocationId;
        trxLine.sequence = 0;
        trxLine = this.assignTrxItemToDataLine(trxLine);
        await this.object.details.unshift(trxLine);
        await this.computeAllAmount(this.object.details[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async validateBarcode(barcode: string) {
    try {
      if (barcode) {
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
            this.toastService.presentToast('Invalid Barcode', '', 'top', 'danger', 1000);
          }
        } else {
  
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async deleteLine(index) {
    try {
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

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.maxPrecision);
    } catch (e) {
      console.error(e);
    }
  }

  assignTrxItemToDataLine(trxLine: TransactionDetail) {
    try {
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

  /* #region  modal to edit line detail */  

  selectedItem: TransactionDetail;
  async showLineDetails(trxLine: TransactionDetail) {
    try {
      this.selectedItem = trxLine;
      await this.commonService.computeDiscTaxAmount(this.selectedItem, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.maxPrecision);
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

  async previousStep() {
    try {
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
        this.objectService.resetVariables();
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
        this.navController.navigateBack('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.object.details.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          cssClass: 'custom-alert',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.updateObject();
              },
            },
            {
              cssClass: 'cancel',
              text: 'Cancel',
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

  updateObject() {
    try {
      this.objectService.updateObject(this.object).subscribe(response => {
        if (response.status === 204) {
          this.toastService.presentToast('Update Complete', 'Consignment Sales Updated', 'top', 'success', 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
        } else {
          this.toastService.presentToast('Update Fail', '', 'top', 'danger', 1000);
        }
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

}
