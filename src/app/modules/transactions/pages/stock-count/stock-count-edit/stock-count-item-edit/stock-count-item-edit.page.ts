import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { StockCountHeader, StockCountDetail, InventoryCountBatchCriteria } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
  selector: 'app-stock-count-item-edit',
  templateUrl: './stock-count-item-edit.page.html',
  styleUrls: ['./stock-count-item-edit.page.scss'],
})
export class StockCountItemEditPage implements OnInit, ViewWillEnter {
  @ViewChild('barcodeScanInput', { static: false }) barcodeScanInput: BarcodeScanInputPage;

  objectId: number;
  objectHeader: StockCountHeader;
  objectDetail: StockCountDetail[] = [];
  systemWideEAN13IgnoreCheckDigit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navController: NavController,
    private alertController: AlertController,
    private configService: ConfigService,
    private toastService: ToastService,
    public objectService: StockCountService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    this.barcodeScanInput.barcodeInput.nativeElement.focus();
  }

  ngOnInit() {
    this.objectHeader = this.objectService.objectHeader;
    this.objectDetail = this.objectService.objectDetail;
    if (!this.objectHeader || this.objectHeader === undefined) {
      this.navController.navigateBack('/transactions/stock-count');
    }
    this.loadModuleControl();
    this.loadInventoryCountBatchCriteria();
  }

  moduleControl: ModuleControl[] = [];
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
        if (ignoreCheckdigit != undefined) {
          this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
        }
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  inventoryCountBatchCriteria: InventoryCountBatchCriteria
  loadInventoryCountBatchCriteria() {
    try {
      this.objectService.getInventoryCountBatchCriteria(this.objectHeader.inventoryCountBatchId).subscribe(response => {
        this.inventoryCountBatchCriteria = response;
      }, error => {
        throw error;
      })
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
              itemBarcode: found_barcode.barcode,
              itemBrandId: found_item_master.brandId,
              itemGroupId: found_item_master.groupId,
              itemCategoryId: found_item_master.catId,
              itemBarcodeTagId: found_barcode.id
            }
            this.addItemToLine(outputData);
          } else {
            this.toastService.presentToast('Invalid Barcode', '', 'top', 'danger', 1000);
          }
        } else {
          this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onItemAdd(event: TransactionDetail) {
    this.addItemToLine(event);
  }

  async addItemToLine(trxLine: TransactionDetail) {
    try {
      switch (this.inventoryCountBatchCriteria.randomCountType) {
        case "Item":
          break;
        case "Brand":
          if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemBrandId)) {
            this.toastService.presentToast('Item Brand not match', '', 'top', 'danger', 1000);
            return;
          }
          break;
        case "Group":
          if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemGroupId)) {
            this.toastService.presentToast('Item Group not match', '', 'top', 'danger', 1000);
            return;
          }
          break;
        case "Category":
          if (!this.inventoryCountBatchCriteria.keyId.includes(trxLine.itemCategoryId)) {
            this.toastService.presentToast('Item Category not match', '', 'top', 'danger', 1000);
            return;
          }
          break;
      }
  
      if (this.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
      } else {
        let d: StockCountDetail = {
          inventoryCountLineId: 0,
          inventoryCountId: 0,
          locationId: this.objectHeader.locationId,
          itemId: trxLine.itemId,
          itemCode: trxLine.itemCode,
          description: trxLine.description,
          itemVariationXId: trxLine.itemVariationXId,
          itemVariationYId: trxLine.itemVariationYId,
          itemSku: trxLine.itemSku,
          itemBarcode: trxLine.itemBarcode,
          itemBarcodeTagId: trxLine.itemBarcodeTagId,
          qtyRequest: 1,
          sequence: this.objectDetail.length
        }
        await this.objectDetail.length > 0 ? this.objectDetail.unshift(d) : this.objectDetail.push(d);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  manual amend qty */

  setFocus(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  async decreaseQty(line: StockCountDetail, index: number) {
    try {
      if (line.qtyRequest - 1 < 0) {
        line.qtyRequest = 0;
      } else {
        line.qtyRequest--;
      }
      if (line.qtyRequest === 0) {
        await this.deleteLine(index);
      }
    } catch (e) {
      console.error(e);
    }
  }

  eventHandler(keyCode, line) {
    if (keyCode === 13) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
    }
  }

  increaseQty(line: StockCountDetail) {
    line.qtyRequest++;
  }

  async deleteLine(index) {
    try {
      if (this.objectDetail[index]) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          header: 'Delete this item?',
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
              cssClass: 'cancel',
              handler: async () => {
                this.objectDetail[index].qtyRequest === 0 ? this.objectDetail[index].qtyRequest++ : 1;
              }
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

  previousStep() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.objectId
      }
    }
    this.navController.navigateBack('/transactions/stock-count/stock-count-edit/stock-count-header', navigationExtras);
  }

  async nextStep() {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Confirm',
            cssClass: 'success',
            handler: async () => {
              this.updateObject();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'cancel',
            handler: async () => {
  
            }
          }
        ]
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  updateObject() {
    try {
      this.objectService.updateInventoryCount({ header: this.objectHeader, details: this.objectDetail, barcodeTag: [] }).subscribe(response => {
        if (response.status === 204) {
          this.objectService.resetVariables();
          this.toastService.presentToast('Stock Count updated', '', 'top', 'success', 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectHeader.inventoryCountId
            }
          }
          this.navController.navigateForward('/transactions/stock-count/stock-count-detail', navigationExtras);
        }
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

}
