import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonInput, NavController } from '@ionic/angular';
import { InventoryCountBatchCriteria, StockCountDetail, StockCountHeader } from 'src/app/modules/others/models/stock-count';
import { StockCountService } from 'src/app/modules/others/services/stock-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-stock-count-item',
  templateUrl: './stock-count-item.page.html',
  styleUrls: ['./stock-count-item.page.scss'],
})
export class StockCountItemPage implements OnInit {

  inventoryCountId: number;
  stockCountHeader: StockCountHeader;
  stockCountDetail: StockCountDetail[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navController: NavController,
    private alertController: AlertController,
    private configService: ConfigService,
    private toastService: ToastService,
    private stockCountService: StockCountService
    
  ) {
    this.route.queryParams.subscribe(params => {
      this.inventoryCountId = params['inventoryCountId'];
    })
  }

  ngOnInit() {
    this.stockCountHeader = this.stockCountService.stockCountHeader;
    this.stockCountDetail = this.stockCountService.stockCountLines;
    if (!this.stockCountHeader || this.stockCountHeader === undefined) {
      this.navController.navigateBack('/others/stock-count');
    }
    this.loadMasterList();
    // this.loadModuleControl();    
    this.loadImage = this.configService.sys_parameter.loadImage;
    this.loadInventoryCountBatchCriteria();
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
  loadImage: boolean = true;
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

  inventoryCountBatchCriteria: InventoryCountBatchCriteria
  loadInventoryCountBatchCriteria() {
    this.stockCountService.getInventoryCountBatchCriteria(this.stockCountHeader.inventoryCountBatchId).subscribe(response => {
      this.inventoryCountBatchCriteria = response;
    }, error => {
      console.log(error);
    })
  }

  itemSearchValue: string;
  @ViewChild('barcodeInput', { static: false }) barcodeInput: IonInput;
  async validateBarcode(barcode: string) {
    if (barcode) {
      this.itemSearchValue = '';
      if (barcode && barcode.length > 12) {
        barcode = barcode.substring(0, 12);
      }
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
        if (found) {
          if (found.sku) {
            this.toastService.presentToast('Barcode found!', barcode, 'bottom', 'success', 1000);
            this.addItemToLine(found.sku);
          }
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'bottom', 'danger', 1000);
        }
      } else {
        this.stockCountService.getItemInfoByBarcode(barcode).subscribe(response => {
          if (response) {
            this.addItemToLine(response.itemSku, response);
          }
        }, error => {
          console.log(error);
        })
      }
    }
    this.barcodeInput.value = '';
    this.barcodeInput.setFocus();
  }

  onItemAdd(event: any) {
    let sku = event.sku;
    let itemInfo = event.itemInfo;
    if (itemInfo) {
      this.addItemToLine(sku, itemInfo)
    } else {
      this.addItemToLine(sku);
    }
  }

  async addItemToLine(sku: string, itemInfo?: ItemBarcodeModel) {
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
        varCd: itemInfo.variationTypeCode,
        brandId: itemInfo.itemBrandId,
        groupId: itemInfo.itemGroupId,
        catId: itemInfo.itemCategoryId
      }
      b = {
        id: itemInfo.itemBarcodeTagId,
        barcode: itemInfo.itemBarcode,        
        xId: itemInfo.itemVariationLineXId,
        yId: itemInfo.itemVariationLineYId,
        xDesc: itemInfo.itemVariationLineXDescription,
        yDesc: itemInfo.itemVariationLineYDescription
      }
    }

    switch (this.inventoryCountBatchCriteria.randomCountType) {
      case "Item":
        break;
      case "Brand":
        if (m) {
          if (!this.inventoryCountBatchCriteria.keyId.includes(m.brandId)) {
            this.toastService.presentToast('Item Brand not match', '', 'bottom', 'danger', 1000);
            return;
          }
        }
        break;
      case "Group":
        if (m) {
          if (!this.inventoryCountBatchCriteria.keyId.includes(m.groupId)) {
            this.toastService.presentToast('Item Group not match', '', 'bottom', 'danger', 1000);
            return;
          }
        }
        break;
      case "Category":
        if (m) {
          if (!this.inventoryCountBatchCriteria.keyId.includes(m.catId)) {
            this.toastService.presentToast('Item Category not match', '', 'bottom', 'danger', 1000);
            return;
          }
        }
        break;
    }

    if (this.stockCountDetail.findIndex(r => r.itemSku === sku) === 0) { // already in and first one
      this.stockCountDetail.find(r => r.itemSku === sku).qtyRequest++;
    } else {
      let d: StockCountDetail = {
        inventoryCountLineId: 0,
        inventoryCountId: this.stockCountHeader.inventoryCountId,
        locationId: this.stockCountHeader.locationId,
        itemId: m.id,
        itemCode: m.code,
        description: m.itemDesc,
        itemVariationXId: b.xId,
        itemVariationYId: b.yId,
        itemSku: sku,
        itemBarcode: b.barcode,
        itemBarcodeTagId: b.id,
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
              this.toastService.presentToast('Line removed.', '', 'bottom', 'success', 1000);
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
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
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

  previousStep() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inventoryCountId: this.inventoryCountId
      }
    }
    this.navController.navigateBack('/others/stock-count/stock-count-edit/stock-count-header', navigationExtras);
  }

  nextStep() {
    this.stockCountService.updateInventoryCount({header: this.stockCountHeader, details: this.stockCountDetail, barcodeTag: []}).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast('Stock Count updated', '', 'bottom', 'success', 1000);
        this.navController.navigateRoot('/others/stock-count/stock-count-edit/stock-count-summary');
      }
    }, error => {
      console.log(error);
    })
  }

}
