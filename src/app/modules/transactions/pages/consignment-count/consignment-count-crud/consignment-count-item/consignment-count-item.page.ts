import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, ViewDidEnter } from '@ionic/angular';
import { ConsignmentCountHeader, ConsignmentCountRoot } from 'src/app/modules/transactions/models/consignment-count';
import { ConsignmentCountService } from 'src/app/modules/transactions/services/consignment-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';

@Component({
  selector: 'app-consignment-count-item',
  templateUrl: './consignment-count-item.page.html',
  styleUrls: ['./consignment-count-item.page.scss'],
  providers: [BarcodeScanInputService, { provide: "apiObject", useValue: "MobileConsignmentCount" }]
})
export class ConsignmentCountItemPage implements OnInit, ViewDidEnter {

  @ViewChild('barcodescaninput', { static: false }) barcodescaninput: BarcodeScanInputPage;

  objectHeader: ConsignmentCountHeader;
  objectDetail: TransactionDetail[] = [];

  constructor(
    public objectService: ConsignmentCountService,
    private configService: ConfigService,
    private authService: AuthService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ionViewDidEnter(): void {
    try {
      this.barcodescaninput.setFocus();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.objectHeader = this.objectService.objectHeader;
    if (this.objectHeader.consignmentCountId === 0) {
      this.objectDetail = [];
    } else {
      this.objectDetail = this.objectService.objectDetail;
    }

    if (this.objectHeader === null || this.objectHeader === undefined) {
      this.toastService.presentToast("", "Something went wrong!", "top", "danger", 1000);
      this.navController.navigateBack('/transactions/consignment-count/consignment-count-header');
    }
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[] = [];
  systemWideEAN13IgnoreCheckDigit: boolean = false;
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

  /* #region item line */  

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
              itemBrandId: found_item_master.brandId,
              itemGroupId: found_item_master.groupId,
              itemCategoryId: found_item_master.catId,
              itemBarcodeTagId: found_barcode.id
            }
            this.addItemToLine(outputData);
          } else {
            this.toastService.presentToast('', 'Barcode not found.', 'top', 'danger', 1000);
          }
        } else {
          this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onItemAdd(event: TransactionDetail[]) {
    if (event && event.length > 0) {
      event.forEach(r => {
        this.addItemToLine(r);
      })
    }
  }

  async addItemToLine(trxLine: TransactionDetail) {
    try {
      if (this.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
      } else {
        let d: TransactionDetail = {
          lineId: 0,
          headerId: this.objectHeader.consignmentCountId,
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

  /* #endregion */

  /* #region  manual amend qty */

  setFocus(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  async decreaseQty(line: TransactionDetail, index: number) {
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

  increaseQty(line: TransactionDetail) {
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

  /* #region steps */

  previousStep() {
    this.navController.navigateBack('/transactions/consignment-count/consignment-count-header');
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
              if (this.objectHeader.consignmentCountId > 0) {
                this.updateObject();
              } else {
                this.insertObject();
              }
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

  insertObject() {
    try {
      this.objectService.insertObject({ header: this.objectHeader, details: this.objectDetail }).subscribe(response => {
        if (response.status === 201) {
          let object = response.body as ConsignmentCountRoot;
          this.objectService.resetVariables();
          this.toastService.presentToast('', 'Consignment Count added', 'top', 'success', 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.consignmentCountId
            }
          }
          this.navController.navigateForward('/transactions/consignment-count/consignment-count-detail', navigationExtras);
        }
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  updateObject() {
    try {
      this.objectService.updateObject({ header: this.objectHeader, details: this.objectDetail }).subscribe(response => {
        if (response.status === 201) {
          let object = response.body as ConsignmentCountRoot;
          this.objectService.resetVariables();
          this.toastService.presentToast('', 'Consignment Count updated', 'top', 'success', 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.consignmentCountId
            }
          }
          this.navController.navigateForward('/transactions/consignment-count/consignment-count-detail', navigationExtras);
        }
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}