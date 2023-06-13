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
    
  }

  ionViewWillEnter(): void {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    if (this.objectId) {
      this.loadObject();
    } else {
      this.toastService.presentToast('Something went wrong!', 'Invalid Objectss', 'top', 'danger', 1000);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadRestrictColumms();
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

  onItemAdd(event: TransactionDetail[]) {
    if (event && event.length > 0) {
      event.forEach(r => {
        this.addItemToDetails(r);
      })
    }
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
        this.assignTrxItemToDataLine(trxLine);
        await this.object.details.unshift(trxLine);
        await this.computeAllAmount(this.object.details[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  assignTrxItemToDataLine(item: TransactionDetail) {
    if (this.useTax) {
      if (this.object.header.isItemPriceTaxInclusive) {
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
                discountPercent: found_item_master.discPct,
                discountGroupId: null,
                unitPriceMin: null,
                currencyId: null
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

  /* #region  unit price, tax, discount */

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.object.header.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    try {
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.object.header.maxPrecision);
      this.computeDiscTaxAmount(trxLine);       
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.object.header.isItemPriceTaxInclusive, this.object.header.isDisplayTaxInclusive, this.object.header.maxPrecision);
    } catch (e) {
      console.error(e);
    }
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
        this.object.details[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
        this.hideEditModal();
      }
    }
  }

  async cancelChanges() {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to discard changes?',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'success',
            handler: () => {
              this.isModalOpen = false;
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
          this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
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
