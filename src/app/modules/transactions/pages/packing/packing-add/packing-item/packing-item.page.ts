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
      if ((soLine.qtyPacked + soLine.qtyPackedCurrent) > soLine.qtyPicked) {
        this.toastService.presentToast('Not allow to add item more than PICKED quantity.', '', 'bottom', 'medium', 1000);
        soLine.qtyPackedCurrent = soLine.qtyPicked - soLine.qtyPacked;
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
    if (this.packingDtoHeader.isWithSo && (soLine.qtyPacked + soLine.qtyPackedCurrent + 1) <= soLine.qtyPicked) {
      soLine.qtyPackedCurrent++;
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
      }
      // either go online find or toast local db no item master/barcodes here
    }
    this.barcodeInput.value = '';
    this.barcodeInput.setFocus();
  }

  async addItemToSo(sku: string) {    
    if (this.packingDtoHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      let itemExists = this.selectedSo.details.find(r => r.itemSku === sku);
      if (itemExists) {
        this.selectedSoDetail = itemExists;
        this.selectedSoDetail.qtyPackedCurrent++;
        this.openModal();
      } else {
        this.toastService.presentToast('Item not found in this SO', '', 'bottom', 'medium', 1000);
      }
    } 
  
    if (!this.packingDtoHeader.isWithSo) {
      let b = this.configService.item_Barcodes.find(r => r.sku === sku);
      let m = this.configService.item_Masters.find(r => r.id === b.itemId);
      if (this.packingSalesOrders && this.packingSalesOrders.length === 0) {
        this.packingSalesOrders.push({
          header: null,
          details: [],
          pickingHistory: []
        })
      }
      if (this.packingSalesOrders[0].details.findIndex(r => r.itemSku === sku) > -1) { // already in
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

  /* #endregion */

  /* #region  modal to input qty */

  isModalOpen: boolean = false;
  @ViewChild('inputNumModal', { static: false }) inputNumModal: IonInput;
  selectedSoDetail: PackingSalesOrderDetail;
  openModal() {
    if (this.selectedSoDetail) {      
      this.isModalOpen = true;
    } else {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
    }
  }

  hideModal() {
    this.selectedSoDetail = null;
    this.isModalOpen = false;
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
