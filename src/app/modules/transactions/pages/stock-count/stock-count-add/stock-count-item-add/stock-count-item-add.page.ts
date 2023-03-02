import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController, ViewDidEnter } from '@ionic/angular';
import { StockCountHeader, StockCountDetail, InventoryCountBatchCriteria, StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';

@Component({
  selector: 'app-stock-count-item-add',
  templateUrl: './stock-count-item-add.page.html',
  styleUrls: ['./stock-count-item-add.page.scss'],
  providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'MobileInventoryCount' }]
})
export class StockCountItemAddPage implements OnInit, ViewDidEnter {
  @ViewChild('barcodeScanInput', { static: false }) barcodeScanInput: BarcodeScanInputPage;

  stockCountHeader: StockCountHeader;
  stockCountDetail: StockCountDetail[] = [];
  systemWideEAN13IgnoreCheckDigit: boolean = false;

  constructor(
    private authService: AuthService,
    private stockCountService: StockCountService,
    private navController: NavController,
    private alertController: AlertController,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ionViewDidEnter(): void {
    this.barcodeScanInput.barcodeInput.nativeElement.focus();
  }

  ngOnInit() {
    this.stockCountHeader = this.stockCountService.stockCountHeader;
    this.stockCountDetail = [];
    if (this.stockCountHeader === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'top', 'danger', 1000);
      this.navController.navigateBack('/transactions/stock-count/stock-count-add/stock-count-header');
    } else {
      this.loadInventoryCountBatchCriteria();
    }
    this.loadMasterList();
    this.loadModuleControl();
  }

  itemBrandMasterList: MasterListDetails[] = [];
  itemGroupMasterList: MasterListDetails[] = [];
  itemCategoryMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.stockCountService.getMasterList().subscribe(response => {
      this.itemBrandMasterList = response.filter(x => x.objectName == 'ItemBrand').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemGroupMasterList = response.filter(x => x.objectName == 'ItemCategory').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemCategoryMasterList = response.filter(x => x.objectName == 'ItemGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  moduleControl: ModuleControl[] = [];
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
      if (ignoreCheckdigit != undefined) {
        this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  inventoryCountBatchCriteria: InventoryCountBatchCriteria
  loadInventoryCountBatchCriteria() {
    this.stockCountService.getInventoryCountBatchCriteria(this.stockCountHeader.inventoryCountBatchId).subscribe(response => {
      this.inventoryCountBatchCriteria = response;
    }, error => {
      console.log(error);
    })
  }

  async validateBarcode(barcode: string) {
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
  }

  onItemAdd(event: TransactionDetail) {
    this.addItemToLine(event);
  }

  async addItemToLine(trxLine: TransactionDetail) {
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

    if (this.stockCountDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
      this.stockCountDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest++;
    } else {
      let d: StockCountDetail = {
        inventoryCountLineId: 0,
        inventoryCountId: 0,
        locationId: this.stockCountHeader.locationId,
        itemId: trxLine.itemId,
        itemCode: trxLine.itemCode,
        description: trxLine.description,
        itemVariationXId: trxLine.itemVariationXId,
        itemVariationYId: trxLine.itemVariationYId,
        itemSku: trxLine.itemSku,
        itemBarcode: trxLine.itemBarcode,
        itemBarcodeTagId: trxLine.itemBarcodeTagId,
        qtyRequest: 1,
        sequence: this.stockCountDetail.length
      }      
      await this.stockCountDetail.length > 0 ? this.stockCountDetail.unshift(d) : this.stockCountDetail.push(d);
    }
  }

  /* #region  manual amend qty */

  setFocus(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  async decreaseQty(line: StockCountDetail, index: number) {
    if (line.qtyRequest - 1 < 0) {
      line.qtyRequest = 0;
    } else {
      line.qtyRequest--;
    }
    if (line.qtyRequest === 0) {      
      await this.deleteLine(index);
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
    if (this.stockCountDetail[index]) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Delete this item?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            text: 'Delete item',
            cssClass: 'danger',
            handler: async () => {
              this.stockCountDetail.splice(index, 1);
              this.toastService.presentToast('Line removed.', '', 'top', 'success', 1000);
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'cancel',
            handler: async () => {
              this.stockCountDetail[index].qtyRequest === 0 ? this.stockCountDetail[index].qtyRequest++ : 1;
            }
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
    this.navController.navigateBack('/transactions/stock-count/stock-count-add/stock-count-header');
  }

  async nextStep() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Are you sure to proceed?',
      buttons: [
        {
          text: 'Confirm',
          cssClass: 'success',
          handler: async () => {
            this.insertObject();
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
  }

  insertObject() {
    this.stockCountService.insertInventoryCount({header: this.stockCountHeader, details: this.stockCountDetail, barcodeTag: []}).subscribe(response => {
      if (response.status === 201) {
        let object = response.body as StockCountRoot;
        this.stockCountService.resetVariables();
        this.toastService.presentToast('Stock Count added', '', 'top', 'success', 1000);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: object.header.inventoryCountId
          }
        }
        this.navController.navigateForward('/transactions/stock-count/stock-count-detail', navigationExtras);
      }
    }, error => {
      console.log(error);
    })
  }

}
