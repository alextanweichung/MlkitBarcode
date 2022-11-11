import { Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { NavController, AlertController, IonAccordionGroup, IonInput } from '@ionic/angular';
import { GoodsPacking } from 'src/app/modules/transactions/models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from 'src/app/modules/transactions/models/packing-sales-order';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-packing-item',
  templateUrl: './packing-item.page.html',
  styleUrls: ['./packing-item.page.scss'],
})
export class PackingItemPage implements OnInit {

  packingDtoHeader: GoodsPacking;
  packingSalesOrders: PackingSalesOrderRoot[] = [];
  moduleControl: ModuleControl[] = [];
  loadImage: boolean = true;
  packingQtyControl: string = "0";

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private packingService: PackingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.packingDtoHeader = this.packingService.packingDtoHeader;
    if (this.packingDtoHeader === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/packing/packing-sales-order');
    }
    this.packingSalesOrders = this.packingService.selectedSalesOrders;
    if (this.packingSalesOrders && this.packingSalesOrders.length > 0) {
      this.packingSalesOrders.flatMap(r => r.details).flatMap(r => r.qtyPackedCurrent = 0);
    }
    this.loadModuleControl();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let loadImage = this.moduleControl.find(r => r.ctrlName === "LoadImage")?.ctrlValue;
      if (loadImage) {
        this.loadImage = loadImage === '1' ? true : false;
      }
      let packingControl = this.moduleControl.find(x => x.ctrlName === "PackingQtyControl");
      if (packingControl != undefined) {
        this.packingQtyControl = packingControl.ctrlValue;
      }
    }, error => {
      console.log(error);
    })
  }

  /* #region  manual amend qty */

  decreaseQty(soLine) {
    if (soLine.qtyPackedCurrent - 1 < 0) {
      soLine.qtyPackedCurrent = 0;
    } else {
      soLine.qtyPackedCurrent--;
    }
  }

  clonedDetails: { [s: string]: PackingSalesOrderDetail; } = {};
  backupQty(soLine, event) {
    event.getInputElement().then(r => {
      r.select();
    })
    this.clonedDetails[soLine.itemSku] = { ...soLine };
  }

  updateQty(soLine) {
    if (this.packingDtoHeader.isWithSo) {
      switch (this.packingQtyControl) {
        // No control
        case "0":
          break;
        // Not allow pack quantity more than SO quantity
        case "1":
          if (soLine.qtyRequest < (soLine.qtyPacked + soLine.qtyPackedCurrent)) {
            soLine.qtyPackedCurrent = soLine.qtyRequest - soLine.qtyPacked;
            this.toastService.presentToast('Item is already fully packed', '', 'bottom', 'medium', 1000);
          }
          break;
        // Not allow pack quantity more than pick quantity
        case "2":
          if ((soLine.qtyPacked + soLine.qtyPackedCurrent) > soLine.qtyPicked) {
            soLine.qtyPackedCurrent = soLine.qtyPicked - soLine.qtyPacked;
            this.toastService.presentToast('Pack quantity cannot exceed pick quantity', '', 'bottom', 'medium', 1000);
          }
          break;
      }
    }
    delete this.clonedDetails[soLine.itemSku];
  }

  eventHandler(keyCode, soLine) {
    if (keyCode === 13) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      this.updateQty(soLine);
    }
  }

  increaseQty(soLine) {
    if (soLine.qtyPackedCurrent === undefined) {
      soLine.qtyPackedCurrent = 0;
    }
    if (this.packingDtoHeader.isWithSo) {
      switch (this.packingQtyControl) {
        // No control
        case "0":
          soLine.qtyPackedCurrent++;
          break;
        // Not allow pack quantity more than SO quantity
        case "1":
          if (soLine.qtyRequest < (soLine.qtyPacked + soLine.qtyPackedCurrent + 1)) {
            soLine.qtyPackedCurrent = soLine.qtyRequest - soLine.qtyPacked;
            this.toastService.presentToast('Item is already fully packed', '', 'bottom', 'medium', 1000);
          } else {
            soLine.qtyPackedCurrent++;
          }
          break;
        // Not allow pack quantity more than pick quantity
        case "2":
          if ((soLine.qtyPacked + soLine.qtyPackedCurrent + 1) > soLine.qtyPicked) {
            soLine.qtyPackedCurrent = soLine.qtyPicked - soLine.qtyPacked;
            this.toastService.presentToast('Pack quantity cannot exceed pick quantity', '', 'bottom', 'medium', 1000);
          } else {
            soLine.qtyPackedCurrent++;
          }
          break;
      }
    }
    if (!this.packingDtoHeader.isWithSo) {
      soLine.qtyPackedCurrent++;
    }
  }

  /* #endregion */

  /* #region  sales order */

  @ViewChild('accordianGroup1', { static: false }) accordianGroup1: IonAccordionGroup; // use accordion value to determine if selectedSo 
  selectedSo: PackingSalesOrderRoot;
  setSelectedSo(so) {
    this.selectedSo = so;
    this.barcodeInput.setFocus();
  }

  /* #endregion */

  /* #region  barcode & check so */

  manualBarcodeInput: string;
  @ViewChild('barcodeInput', { static: false }) barcodeInput: IonInput;
  async checkValidBarcode(barcode: string) {
    if (barcode) {
      this.manualBarcodeInput = '';
      if (barcode && barcode.length > 12) {
        barcode = barcode.substring(0, 12);
      }
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
        if (found) {
          if (found.sku) {
            this.toastService.presentToast('Barcode found!', barcode, 'bottom', 'success', 1000);
            this.addItemToSo(found.sku);
          }
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'bottom', 'danger', 1000);
        }
      } else {
        this.packingService.getItemInfoByBarcode(barcode).subscribe(response => {
          if (response) {
            this.addItemToSo(response.itemSku, response);
          }
        }, error => {
          console.log(error);
        })
      }
    }
    this.barcodeInput.value = '';
    this.barcodeInput.setFocus();
  }

  selectedSoDetail: PackingSalesOrderDetail;
  async addItemToSo(sku: string, itemInfo?: ItemBarcodeModel) {
    if (this.packingDtoHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      let itemExists = this.selectedSo.details.find(r => r.itemSku === sku);
      if (itemExists) {
        this.selectedSoDetail = itemExists;
        this.updateQty(this.selectedSoDetail);
      } else {
        this.toastService.presentToast('Item not found in this SO', '', 'bottom', 'medium', 1000);
      }
    }

    if (!this.packingDtoHeader.isWithSo) {
      let b: any;
      let m: any;
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0 && this.configService.item_Masters && this.configService.item_Barcodes.length > 0) {
        b = this.configService.item_Barcodes.find(r => r.sku === sku);
        m = this.configService.item_Masters.find(r => r.id === b.itemId);
      } else {
        m = {
          id: itemInfo.itemId,
          code: itemInfo.itemCode,
          itemDesc: itemInfo.description,
          varCd: itemInfo.variationTypeCode
        }
        b = {
          xId: itemInfo.itemVariationLineXId,
          yId: itemInfo.itemVariationLineYId,
          xDesc: itemInfo.itemVariationLineXDescription,
          yDesc: itemInfo.itemVariationLineYDescription
        }
      }
      if (this.packingSalesOrders && this.packingSalesOrders.length === 0) {
        this.packingSalesOrders.push({
          header: null,
          details: [],
          pickingHistory: []
        })
      }
      if (this.packingSalesOrders[0].details.findIndex(r => r.itemSku === sku) === 0) { // already in and first one
        this.selectedSoDetail = this.packingSalesOrders[0].details.find(r => r.itemSku === sku);
        this.selectedSoDetail.qtyPackedCurrent++;
      } else {
        let d: PackingSalesOrderDetail = {
          salesOrderId: null,
          itemId: m.id,
          description: m.itemDesc,
          itemVariationXId: b.xId,
          itemVariationYId: b.yId,
          itemSku: sku,
          itemVariationTypeCode: m.varCd,
          itemCode: m.code,
          itemVariationXDescription: b.xDesc,
          itemVariationYDescription: b.yDesc,
          itemUomId: null,
          itemUomDescription: null,
          rack: null,
          subRack: null,
          qtyRequest: 0,
          qtyCommit: 0,
          qtyBalance: 0,
          qtyPicked: 0,
          qtyPackedCurrent: 1,
          qtyPacked: 0
        }
        await this.packingSalesOrders[0].details.length > 0 ? this.packingSalesOrders[0].details.unshift(d) : this.packingSalesOrders[0].details.push(d);
      }
    }
  }

  async deleteSoLine(index) {
    if (this.packingSalesOrders[0]?.details[index]) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Delete this item?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            text: 'Delete item',
            cssClass: 'danger',
            handler: async () => {
              this.packingSalesOrders[0].details.splice(index, 1);
              this.toastService.presentToast('Item removed.', '', 'bottom', 'success', 1000);
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
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
    }
  }

  /* #endregion */

  /* #region  barcode scanner */

  scanActive: boolean = false;
  async startScanning() {
    if (this.packingDtoHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      const allowed = await this.checkPermission();
      if (allowed) {
        this.scanActive = true;
        document.body.style.background = "transparent";
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          let barcode = result.content;
          this.scanActive = false;
          await this.checkValidBarcode(barcode);
        }
      }
    } else if (this.packingDtoHeader.isWithSo && !this.selectedSo && this.accordianGroup1.value === undefined) {
      this.toastService.presentToast('Please select 1 SO', '', 'bottom', 'medium', 1000);
    }

    if (!this.packingDtoHeader.isWithSo) {
      const allowed = await this.checkPermission();
      if (allowed) {
        this.scanActive = true;
        document.body.style.background = "transparent";
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          let barcode = result.content;
          this.scanActive = false;
          await this.checkValidBarcode(barcode);
        }
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

  nextStep() {
    let soLines: PackingSalesOrderDetail[] = this.packingSalesOrders.flatMap(r => r.details).filter(r => r.qtyPackedCurrent > 0);
    this.packingService.setChooseSalesOrderLines(soLines);
    this.navController.navigateForward('/transactions/packing/packing-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/packing/packing-sales-order');
  }

}
