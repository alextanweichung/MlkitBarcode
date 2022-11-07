import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, IonAccordionGroup, IonInput, NavController } from '@ionic/angular';
import { GoodsPicking } from 'src/app/modules/transactions/models/picking';
import { PickingSalesOrderDetail, PickingSalesOrderRoot } from 'src/app/modules/transactions/models/picking-sales-order';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-picking-item',
  templateUrl: './picking-item.page.html',
  styleUrls: ['./picking-item.page.scss'],
})
export class PickingItemPage implements OnInit {

  pickingDtoHeader: GoodsPicking;
  pickingSalesOrders: PickingSalesOrderRoot[] = [];
  moduleControl: ModuleControl[] = [];
  loadImage: boolean = true;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private pickingService: PickingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.pickingDtoHeader = this.pickingService.pickingDtoHeader;
    if (this.pickingDtoHeader === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/picking/picking-sales-order');
    }
    this.pickingSalesOrders = this.pickingService.selectedSalesOrders;
    if (this.pickingSalesOrders && this.pickingSalesOrders.length > 0) {
      this.pickingSalesOrders.flatMap(r => r.details).flatMap(r => r.qtyPickedCurrent = 0);
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
    if (soLine.qtyPickedCurrent - 1 < 0) {
      soLine.qtyPickedCurrent = 0;
    } else {
      soLine.qtyPickedCurrent--;
    }
  }
  
	clonedDetails: { [s: string]: PickingSalesOrderDetail; } = {};
  backupQty(soLine, event) {
    event.getInputElement().then(r => {
      r.select();
    })    
    this.clonedDetails[soLine.itemSku] = { ...soLine };
  }

  updateQty(soLine) {
    if (this.pickingDtoHeader.isWithSo) {
      if ((soLine.qtyPicked + soLine.qtyPickedCurrent) > soLine.qtyRequest) {
        this.toastService.presentToast('Not allow to add item more than SO quantity.', '', 'bottom', 'medium', 1000);
        soLine.qtyPickedCurrent = soLine.qtyRequest - soLine.qtyPicked;
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
    if (soLine.qtyPickedCurrent === undefined) {
      soLine.qtyPickedCurrent = 0;
    }
    if (this.pickingDtoHeader.isWithSo && (soLine.qtyPicked + soLine.qtyPickedCurrent + 1) <= soLine.qtyRequest) {
      soLine.qtyPickedCurrent++;
    }
    if (!this.pickingDtoHeader.isWithSo) {
      soLine.qtyPickedCurrent++;
    }
  }

  /* #endregion */

  /* #region  sales order */

  @ViewChild('accordianGroup1', { static: false }) accordianGroup1: IonAccordionGroup; // use accordion value to determine if selectedSo 
  selectedSo: PickingSalesOrderRoot;
  setSelectedSo(so) {
    this.selectedSo = so;
  }

  /* #endregion */

  /* #region  barcode & check so */

  manualBarcodeInput: string;
  checkValidBarcode(barcode: string): string {
    if (barcode && barcode.length > 12) {
      barcode = barcode.substring(0, 12);
    }
    if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
      let found = this.configService.item_Barcodes.find(r => r.barcode === barcode);
      if (found) {
        if (found.sku) {
          this.toastService.presentToast('Barcode found!', barcode, 'bottom', 'success', 1000);
          this.addItemToSo(found.sku);
        }
      } else {
        this.toastService.presentToast('Invalid Barcode', '', 'bottom', 'danger', 1000);
        return;
      }
    }
    this.manualBarcodeInput = '';
    // either go online find or toast local db no item master/barcodes here
    return;
  }

  async addItemToSo(sku: string) {    
    if (this.pickingDtoHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      let itemExists = this.selectedSo.details.find(r => r.itemSku === sku);
      if (itemExists) {
        this.selectedSoDetail = itemExists;
        this.selectedSoDetail.qtyPickedCurrent++;
        this.openModal();
      } else {
        this.toastService.presentToast('Item not found in this SO', '', 'bottom', 'medium', 1000);
      }
    } 
  
    if (!this.pickingDtoHeader.isWithSo) {
      let b = this.configService.item_Barcodes.find(r => r.sku === sku);
      let m = this.configService.item_Masters.find(r => r.id === b.itemId);
      if (this.pickingSalesOrders && this.pickingSalesOrders.length === 0) {
        this.pickingSalesOrders.push({
          header: null,
          details: [],
          pickingHistory: []
        })
      }
      if (this.pickingSalesOrders[0].details.findIndex(r => r.itemSku === sku) > -1) { // already in
        this.selectedSoDetail = this.pickingSalesOrders[0].details.find(r => r.itemSku === sku);
        this.selectedSoDetail.qtyPickedCurrent++;
      } else {
        let d: PickingSalesOrderDetail = {
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
          qtyPickedCurrent: 1,
          qtyPacked: 0
        }
        await this.pickingSalesOrders[0].details.length > 0 ? this.pickingSalesOrders[0].details.unshift(d) : this.pickingSalesOrders[0].details.push(d);
        // this.selectedSoDetail = this.pickingSalesOrders[0].details[0];
      }
      // this.openModal();
    }
  }

  /* #endregion */

  /* #region  modal to input qty */

  isModalOpen: boolean = false;
  @ViewChild('inputNumModal', { static: false }) inputNumModal: IonInput;
  selectedSoDetail: PickingSalesOrderDetail;
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
    if (this.pickingDtoHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
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
    } else if (this.pickingDtoHeader.isWithSo && !this.selectedSo && this.accordianGroup1.value === undefined) {
      this.toastService.presentToast('Please select 1 SO', '', 'bottom', 'medium', 1000);
    }

    if (!this.pickingDtoHeader.isWithSo) {
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
    let soLines: PickingSalesOrderDetail[] = this.pickingSalesOrders.flatMap(r => r.details).filter(r => r.qtyPickedCurrent > 0);
    this.pickingService.setChooseSalesOrderLines(soLines);
    this.navController.navigateForward('/transactions/picking/picking-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/picking/picking-sales-order');
  }

}
