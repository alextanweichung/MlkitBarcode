import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, NavController } from '@ionic/angular';
import { ConsignmentSalesHeader } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-sales-item',
  templateUrl: './consignment-sales-item.page.html',
  styleUrls: ['./consignment-sales-item.page.scss'],
  providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobileConsignmentSales' }]
})
export class ConsignmentSalesItemPage implements OnInit {

  objectHeader: ConsignmentSalesHeader;
  objectDetail: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  allowModifyItemInfo: boolean = true;
  useTax: boolean = true;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;

  constructor(
    private consignmentSalesService: ConsignmentSalesService,
    private authService: AuthService,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService,
    private navController: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.objectHeader = this.consignmentSalesService.header;
    if (!this.objectHeader) {
      this.navController.navigateBack("/transactions/consignment-sales/consignment-sales-header");
    }
    this.loadMasterList();
    this.loadModuleControl();
  }
  
  loadModuleControl() {    
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
      if (SystemWideActivateTaxControl != undefined) {
        this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    })
    this.authService.precisionList$.subscribe(precision =>{
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

  /* #region  barcode & check so */

  async validateBarcode(barcode: string) {
    if (barcode) {
      if (barcode && barcode.length > 12) {
        barcode = barcode.substring(0, 12);
      }
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
        if (found) {
          if (found.sku) {
            this.toastService.presentToast('Barcode found!', barcode, 'middle', 'success', 1000);
            this.addItemToDetails(found.sku);
          }
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'middle', 'danger', 1000);
        }
      } else {
        // this.pickingService.getItemInfoByBarcode(barcode).subscribe(response => {
        //   if (response) {
        //     this.addItemToSo(response.itemSku, response);
        //   }
        // }, error => {
        //   console.log(error);
        // })
      }
    }
  }

  onItemAdd(event: any) {
    console.log("🚀 ~ file: consignment-sales-item.page.ts:116 ~ ConsignmentSalesItemPage ~ onItemAdd ~ event", event)
    // let sku = event.sku;
    // let itemInfo = event.itemInfo;
    // if (itemInfo) {
    //   this.addItemToDetails(sku, itemInfo)
    // } else {
    //   this.addItemToDetails(sku);
    // }
  }

  async addItemToDetails(sku: string, itemInfo?: ItemBarcodeModel) {
    // change online offline here?
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
        price: itemInfo.unitPrice
      }
      b = {
        barcode: itemInfo.itemBarcode,
        xId: itemInfo.itemVariationLineXId,
        yId: itemInfo.itemVariationLineYId,
        xDesc: itemInfo.itemVariationLineXDescription,
        yDesc: itemInfo.itemVariationLineYDescription
      }
    }
    if (this.objectDetail.findIndex(r => r.itemSku === sku) === 0) { // already in and first one
      this.objectDetail[0].qtyRequest++;
    } else {
      let d: TransactionDetail = {
        lineId: 0,
        headerId: 0,
        locationId: this.objectHeader.toLocationId,
        itemId: m.id,
        itemCode: m.code,
        description: m.itemDesc,
        itemVariationXId: b.xId,
        itemVariationYId: b.yId,
        itemSku: sku,
        itemBarcode: b.barcode,
        variationTypeCode: m.varCd,
        qtyRequest: 1,
        unitPrice: m.price
      }
      await this.objectDetail.unshift(d);
    }
  }

  async deleteLine(index) {
    if (this.objectDetail[index]) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Delete this line?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            text: 'Delete item',
            cssClass: 'danger',
            handler: async () => {
              this.objectDetail.splice(index, 1);
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

  computeAllAmount(line: TransactionDetail) {
    this.computeDiscTaxAmount(line);
  }

  computeDiscTaxAmount(line: TransactionDetail) {
    line = this.commonService.computeDiscTaxAmount(line, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
  }

  setSelect(event) {
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

  nextStep() {
    // let soLines: PickingSalesOrderDetail[] = this.pickingSalesOrders.flatMap(r => r.details).filter(r => r.qtyPickedCurrent > 0);
    // this.pickingService.setChooseSalesOrderLines(soLines);
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/consignment-sales/consignment-sales-header');
  }

}
